import { PageHeaderSkeleton, PanelSkeleton, Skeleton, StatStripSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <StatStripSkeleton />
      <Skeleton className="mb-3 mt-8 h-5 w-40" />
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-[880px]:grid-cols-1">
        <PanelSkeleton rows={3} />
        <PanelSkeleton rows={5} />
      </div>
    </div>
  );
}
