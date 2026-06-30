import {
  PageHeaderSkeleton,
  Skeleton,
  StatStripSkeleton,
  TableSkeleton,
} from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-24" />
      <PageHeaderSkeleton action />
      <StatStripSkeleton cells={4} />
      <Skeleton className="mb-4 mt-10 h-5 w-32" />
      <TableSkeleton rows={4} cols={6} />
    </div>
  );
}
