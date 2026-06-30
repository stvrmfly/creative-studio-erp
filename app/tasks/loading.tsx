import { PageHeaderSkeleton, Skeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="ml-auto h-9 w-28" />
      </div>
      <TableSkeleton rows={6} cols={7} />
    </div>
  );
}
