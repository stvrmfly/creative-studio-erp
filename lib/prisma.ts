import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";
import { DEMO_ACCOUNTS } from "./demo-accounts";

/**
 * In-memory "fake backend".
 *
 * This replaces the real Prisma + Postgres client with a tiny store that lives
 * in the server process's memory, seeded on load with the canonical demo data.
 * It implements just the slice of the Prisma Client API the app actually uses
 * (findMany / findUnique / create / update / delete / createMany / deleteMany,
 * with where / orderBy / select / include / _count / take), so every page and
 * server action keeps importing `prisma` and works unchanged.
 *
 * Trade-off: data is not persisted. Mutations last only while the server
 * instance stays warm and reset on restart — which is exactly how this app was
 * always designed to behave (it reseeded on every dev start). The win is zero
 * setup: it deploys anywhere with no database, connection string, or env var.
 */

type Row = Record<string, any>;
type ModelName = "client" | "teamMember" | "project" | "task" | "user";
type Store = Record<ModelName, Row[]>;

type RelDef = {
  model: ModelName;
  many: boolean;
  resolve: (row: Row, db: Store) => Row | Row[] | null;
};

const RELATIONS: Record<ModelName, Record<string, RelDef>> = {
  client: {
    projects: { model: "project", many: true, resolve: (r, db) => db.project.filter((p) => p.clientId === r.id) },
  },
  teamMember: {
    managing: { model: "project", many: true, resolve: (r, db) => db.project.filter((p) => p.managerId === r.id) },
    assigned: { model: "task", many: true, resolve: (r, db) => db.task.filter((t) => t.assigneeId === r.id) },
    users: { model: "user", many: true, resolve: (r, db) => db.user.filter((u) => u.teamMemberId === r.id) },
  },
  project: {
    client: { model: "client", many: false, resolve: (r, db) => db.client.find((c) => c.id === r.clientId) ?? null },
    manager: {
      model: "teamMember",
      many: false,
      resolve: (r, db) => (r.managerId ? db.teamMember.find((m) => m.id === r.managerId) ?? null : null),
    },
    tasks: { model: "task", many: true, resolve: (r, db) => db.task.filter((t) => t.projectId === r.id) },
  },
  task: {
    project: { model: "project", many: false, resolve: (r, db) => db.project.find((p) => p.id === r.projectId) ?? null },
    assignee: {
      model: "teamMember",
      many: false,
      resolve: (r, db) => (r.assigneeId ? db.teamMember.find((m) => m.id === r.assigneeId) ?? null : null),
    },
  },
  user: {
    teamMember: {
      model: "teamMember",
      many: false,
      resolve: (r, db) => (r.teamMemberId ? db.teamMember.find((m) => m.id === r.teamMemberId) ?? null : null),
    },
  },
};

function matchWhere(row: Row, where?: Row): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, cond]) => {
    const v = row[key];
    if (cond && typeof cond === "object" && !(cond instanceof Date)) {
      if ("in" in cond) return (cond.in as any[]).includes(v);
      if ("notIn" in cond) return !(cond.notIn as any[]).includes(v);
      if ("not" in cond) return v !== cond.not;
      return true; // unsupported operator → no constraint
    }
    return v === cond;
  });
}

function cmp(a: any, b: any): number {
  const av = a instanceof Date ? a.getTime() : a;
  const bv = b instanceof Date ? b.getTime() : b;
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

function applyOrderBy(rows: Row[], orderBy?: any): Row[] {
  if (!orderBy) return rows;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((ra, rb) => {
    for (const o of orders) {
      const [key, raw] = Object.entries(o)[0] as [string, any];
      const dir = raw && typeof raw === "object" ? raw.sort : raw;
      const nullsLast = raw && typeof raw === "object" && raw.nulls ? raw.nulls === "last" : true;
      const va = ra[key];
      const vb = rb[key];
      const aNull = va == null;
      const bNull = vb == null;
      if (aNull || bNull) {
        if (aNull && bNull) continue;
        if (aNull) return nullsLast ? 1 : -1;
        return nullsLast ? -1 : 1;
      }
      let c = cmp(va, vb);
      if (dir === "desc") c = -c;
      if (c !== 0) return c;
    }
    return 0;
  });
}

function countRelations(row: Row, model: ModelName, select: Record<string, any>, db: Store): Row {
  const counts: Row = {};
  for (const [relName, cond] of Object.entries(select)) {
    const rel = RELATIONS[model][relName];
    if (!rel) {
      counts[relName] = 0;
      continue;
    }
    let arr = rel.resolve(row, db) as Row[];
    const where = cond && typeof cond === "object" ? cond.where : undefined;
    if (where) arr = arr.filter((r) => matchWhere(r, where));
    counts[relName] = arr.length;
  }
  return counts;
}

/** Shape a row per the query's select/include (relations resolved lazily). */
function projectRow(row: Row, model: ModelName, args: any, db: Store): Row {
  const select = args?.select;
  const include = args?.include;
  if (!select && !include) return { ...row };

  const out: Row = include ? { ...row } : {};
  const spec = select ?? include;
  for (const [key, val] of Object.entries(spec)) {
    if (!val) continue;
    if (key === "_count") {
      out._count = countRelations(row, model, (val as any).select ?? {}, db);
      continue;
    }
    const rel = RELATIONS[model][key];
    if (rel) {
      const nested: any = typeof val === "object" ? val : undefined;
      const related = rel.resolve(row, db);
      if (rel.many) {
        let arr = related as Row[];
        if (nested?.where) arr = arr.filter((r) => matchWhere(r, nested.where));
        if (nested?.orderBy) arr = applyOrderBy(arr, nested.orderBy);
        if (nested?.skip != null) arr = arr.slice(nested.skip);
        if (nested?.take != null) arr = arr.slice(0, nested.take);
        out[key] = arr.map((r) => projectRow(r, rel.model, nested, db));
      } else {
        out[key] = related ? projectRow(related as Row, rel.model, nested, db) : null;
      }
    } else if (select) {
      out[key] = row[key];
    }
  }
  return out;
}

function remove(arr: Row[], row: Row) {
  const i = arr.indexOf(row);
  if (i >= 0) arr.splice(i, 1);
}

/** Mirror the schema's onDelete rules (Cascade for owned rows, SetNull for refs). */
function cascadeDelete(model: ModelName, row: Row, db: Store) {
  if (model === "client") {
    for (const p of db.project.filter((p) => p.clientId === row.id)) cascadeDelete("project", p, db);
    remove(db.client, row);
  } else if (model === "project") {
    for (const t of db.task.filter((t) => t.projectId === row.id)) remove(db.task, t);
    remove(db.project, row);
  } else if (model === "teamMember") {
    for (const p of db.project) if (p.managerId === row.id) p.managerId = null;
    for (const t of db.task) if (t.assigneeId === row.id) t.assigneeId = null;
    for (const u of db.user) if (u.teamMemberId === row.id) u.teamMemberId = null;
    remove(db.teamMember, row);
  } else {
    remove(db[model], row);
  }
}

function makeDelegate(model: ModelName, db: Store) {
  const list = () => db[model];
  const newRow = (data: Row): Row => ({ id: randomUUID(), createdAt: new Date(), ...data });
  return {
    async findMany(args: any = {}) {
      let rows = list().filter((r) => matchWhere(r, args.where));
      rows = applyOrderBy(rows, args.orderBy);
      if (args.skip != null) rows = rows.slice(args.skip);
      if (args.take != null) rows = rows.slice(0, args.take);
      return rows.map((r) => projectRow(r, model, args, db));
    },
    async findUnique(args: any) {
      const row = list().find((r) => matchWhere(r, args.where));
      return row ? projectRow(row, model, args, db) : null;
    },
    async findFirst(args: any = {}) {
      const rows = applyOrderBy(list().filter((r) => matchWhere(r, args.where)), args.orderBy);
      return rows[0] ? projectRow(rows[0], model, args, db) : null;
    },
    async create(args: any) {
      const row = newRow(args.data);
      list().push(row);
      return projectRow(row, model, args, db);
    },
    async createMany(args: any) {
      const data: Row[] = Array.isArray(args.data) ? args.data : [args.data];
      for (const d of data) list().push(newRow(d));
      return { count: data.length };
    },
    async update(args: any) {
      const row = list().find((r) => matchWhere(r, args.where));
      if (!row) throw new Error(`${model} not found`);
      Object.assign(row, args.data);
      return projectRow(row, model, args, db);
    },
    async delete(args: any) {
      const row = list().find((r) => matchWhere(r, args.where));
      if (!row) throw new Error(`${model} not found`);
      const snapshot = { ...row };
      cascadeDelete(model, row, db);
      return snapshot;
    },
    async deleteMany(args: any = {}) {
      const targets = list().filter((r) => matchWhere(r, args.where));
      for (const row of targets) cascadeDelete(model, row, db);
      return { count: targets.length };
    },
    async count(args: any = {}) {
      return list().filter((r) => matchWhere(r, args.where)).length;
    },
  };
}

function seedStore(): Store {
  const db: Store = { client: [], teamMember: [], project: [], task: [], user: [] };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };
  const row = (data: Row): Row => ({ id: randomUUID(), createdAt: new Date(), ...data });

  const lumen = row({
    id: "client-lumen",
    companyName: "Lumen Coffee Co.",
    contactPerson: "Sari Wijaya",
    email: "sari@lumencoffee.id",
    phone: "+62 811 2233 4455",
    industry: "F&B",
    notes: "Specialty roaster, rebrand in progress.",
    status: "active",
  });
  const northwind = row({
    id: "client-northwind",
    companyName: "Northwind Tech",
    contactPerson: "David Tan",
    email: "david@northwind.tech",
    phone: "+62 812 9988 7766",
    industry: "Technology",
    notes: "B2B SaaS launching a product film.",
    status: "active",
  });
  db.client.push(lumen, northwind);

  const hana = row({ id: "tm-hana", name: "Hana Okada", role: "Project Manager", email: "hana@studio.test", status: "active" });
  const alex = row({ id: "tm-alex", name: "Alex Mercer", role: "Creative Director", email: "alex@studio.test", status: "active" });
  const priya = row({ id: "tm-priya", name: "Priya Shah", role: "Senior Designer", email: "priya@studio.test", status: "active" });
  const mateo = row({ id: "tm-mateo", name: "Mateo Reyes", role: "Motion Designer", email: "mateo@studio.test", status: "active" });
  const dina = row({ id: "tm-dina", name: "Dina Larsen", role: "Copywriter", email: "dina@studio.test", status: "active" });
  db.teamMember.push(hana, alex, priya, mateo, dina);

  const aurora = row({
    id: "proj-aurora",
    name: "Aurora Rebrand",
    description: "Full identity refresh: logo, palette, packaging.",
    clientId: lumen.id,
    managerId: hana.id,
    budget: 120_000_000,
    startDate: day(-30),
    dueDate: day(45),
    status: "active",
  });
  const launch = row({
    id: "proj-launch",
    name: "Launch Film",
    description: "90-second hero film for the Q3 product launch.",
    clientId: northwind.id,
    managerId: alex.id,
    budget: 180_000_000,
    startDate: day(-40),
    dueDate: day(20),
    status: "review",
  });
  db.project.push(aurora, launch);

  db.task.push(
    row({
      id: "task-logo",
      name: "Logo direction studies",
      description: "Three directions, six variants each.",
      projectId: aurora.id,
      assigneeId: priya.id,
      dueDate: day(-3),
      priority: "high",
      status: "in_progress",
    }),
    row({
      id: "task-storyboard",
      name: "Storyboard v2",
      description: "Apply director feedback from v1.",
      projectId: launch.id,
      assigneeId: mateo.id,
      dueDate: day(4),
      priority: "high",
      status: "in_progress",
    }),
    row({
      id: "task-tagline",
      name: "Campaign tagline",
      description: "Shortlist of taglines for the rebrand.",
      projectId: aurora.id,
      assigneeId: dina.id,
      dueDate: day(6),
      priority: "medium",
      status: "review",
    })
  );

  const byEmail: Record<string, string> = { [hana.email]: hana.id, [priya.email]: priya.id };
  for (const acc of DEMO_ACCOUNTS) {
    db.user.push(
      row({
        id: `user-${acc.username}`,
        username: acc.username,
        password: acc.password,
        role: acc.role,
        teamMemberId: acc.teamMemberEmail ? byEmail[acc.teamMemberEmail] ?? null : null,
      })
    );
  }

  return db;
}

// Persist across HMR in dev and reuse within a warm serverless instance.
declare global {
  // eslint-disable-next-line no-var
  var fakeDbGlobal: Store | undefined;
}
const db: Store = globalThis.fakeDbGlobal ?? (globalThis.fakeDbGlobal = seedStore());

// The fake client implements the slice of the API the app uses; we cast it to
// the real PrismaClient type so every call site keeps its exact Prisma types.
const fakeClient = {
  client: makeDelegate("client", db),
  teamMember: makeDelegate("teamMember", db),
  project: makeDelegate("project", db),
  task: makeDelegate("task", db),
  user: makeDelegate("user", db),
};
export const prisma = fakeClient as unknown as PrismaClient;

/** Always true now — the in-memory backend needs no database env. */
export function hasDbEnv() {
  return true;
}
