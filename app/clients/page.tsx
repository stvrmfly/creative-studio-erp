import { PageHeader } from "@/components/ui/page-header";
import { EnvNotice } from "@/components/ui/env-notice";
import { hasDbEnv, prisma } from "@/lib/prisma";
import { ClientsView } from "./clients-view";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  if (!hasDbEnv()) {
    return (
      <div>
        <PageHeader eyebrow="Workspace" title="Clients" />
        <EnvNotice />
      </div>
    );
  }

  const clients = await prisma.client.findMany({
    orderBy: { companyName: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Clients"
        description="All studio clients and their current engagement status."
      />
      <ClientsView clients={clients} />
    </div>
  );
}
