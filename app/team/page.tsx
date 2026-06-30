import { PageHeader } from "@/components/ui/page-header";
import { EnvNotice } from "@/components/ui/env-notice";
import { hasDbEnv, prisma } from "@/lib/prisma";
import { TeamView } from "./team-view";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  if (!hasDbEnv()) {
    return (
      <div>
        <PageHeader eyebrow="Workspace" title="Team" />
        <EnvNotice />
      </div>
    );
  }

  const members = await prisma.teamMember.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assigned: { where: { status: { not: "completed" } } } },
      },
    },
  });

  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Team" description="Studio members and their open workload." />
      <TeamView members={members} />
    </div>
  );
}
