# CLAUDE.md

Guardrails for this repo. Read this every session before writing code.

## What this is

**Citrus** — a lightweight Creative Studio ERP (course project). Manages
clients, projects, team, and tasks with a role-aware dashboard. Keep it clean
and working, not enterprise-grade.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind, with utilities wired to CSS custom property tokens
- Radix primitives (Dialog, DropdownMenu), cmdk (palette), sonner (toasts),
  lucide-react (icons)
- Prisma + local Postgres (Homebrew). Schema in `prisma/schema.prisma`,
  CLI seed in `prisma/seed.ts`, reusable seed body in `lib/seed.ts`
- No authentication. Current role lives in React state (`RoleContext`),
  switched via the top-bar dropdown. No login, no sessions, no RLS, no
  multi-tenancy.

## Design

The full design system — tokens, type, color, brand pass, badge weights — is
in [`BRANDING.md`](./BRANDING.md). Read it before any visual work.

Hard rules (the rest is in BRANDING.md):

- Never hardcode pixel or color values. Use the CSS custom property tokens in
  `app/globals.css` via the Tailwind utilities wired to them.
- `--accent` is reserved for the brand mark, active nav, primary buttons, and
  focus rings. **Status badges do not use accent** — they use the semantic
  palette (`--success` / `--warning` / `--danger`). Don't spread accent.
- Don't redesign the shell (sidebar / topbar / max-width content) unsolicited.
- Don't introduce new design tokens without a reason; extend the existing
  semantic aliases first.

## Data conventions

- Prisma uses camelCase fields (`companyName`, `clientId`, `dueDate`,
  `assigneeId`). Don't reintroduce snake_case.
- `lib/prisma.ts` exports a singleton `prisma` client (uses `globalThis` for
  HMR). All server code imports from there.
- Server actions live in `app/<entity>/actions.ts`. Each ends with
  `revalidatePath()` for every page it affects.
- Money is a plain `Float?` — no Decimal. `formatCurrency()` in `lib/format.ts`
  handles display.
- All schema changes go through `prisma migrate dev` — don't write raw SQL
  migrations.

## Component conventions

- Small, typed components.
- Status badges: `<StatusBadge status={...} kind={...} />` from
  `components/ui/badge.tsx`. The `kind` picks the semantic visual weight.
- Inline-edit pickers: `<InlinePicker>` from `components/ui/dropdown.tsx`.
  Wire new editable fields the same way; don't open dialogs for single-field
  edits.
- Toasts: `import { toast } from "sonner"`. Fire on every successful mutation.
- Reusable inline-editable rows: `<TaskRow>` in `components/task-row.tsx` is
  shared between `/tasks` and `/projects/[id]`.
- Forms post to server actions via the native `<form action={...}>` pattern.
  Parse `FormData` in the action; throw `Error` for validation, surface in the
  form's local error state.

## Routes

- `/` — role-aware dashboard
- `/clients`, `/clients/[id]` — list + detail
- `/projects`, `/projects/[id]` — list + detail
- `/team` — list (no detail page)
- `/tasks` — list with inline edits (no detail page)
- `/api/search-index` — feeds the ⌘K command palette

## Environment

- `DATABASE_URL` belongs in `.env` (Prisma CLI only reads `.env`, not
  `.env.local`). Both `.env` and `.env.local` are gitignored.
- `npm run db:migrate` to apply pending migrations + run seed.
- `npm run db:reset` to wipe + reapply + reseed.
- `npm run dev` reseeds first (`predev` runs `prisma migrate deploy` + the seed),
  so every start resets the DB to the canonical 5-talent demo dataset in
  `lib/seed.ts`. UI edits don't survive a restart — that's intentional.

## Out of scope (do not build until asked)

Revisions, asset/file uploads, invoices, payments, notifications, auth, RLS,
multi-tenancy, analytics beyond the role-aware dashboard, task detail pages.

## Don'ts

- Don't introduce new dependencies without saying why.
- Don't hardcode colors or pixel values — use the token vars or Tailwind
  utilities wired to them.
- Don't redesign the shell unsolicited (fixed sidebar + sticky top bar +
  max-width content area is set).
- Don't spread `--accent` onto neutral surfaces (see Accent restraint above).
- Don't reintroduce raw SQL files. All schema changes go through Prisma.
- Don't add a README or other docs unless explicitly asked.
