import { PageHeaderSkeleton, Skeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div>
      <PageHeaderSkeleton action />
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="ml-auto h-9 w-28" />
      </div>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
