import {
  PageHeaderSkeleton,
  Skeleton,
  StatStripSkeleton,
  TableSkeleton,
} from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-24" />
      <PageHeaderSkeleton action />
      <StatStripSkeleton cells={4} />
      <Skeleton className="mb-4 mt-10 h-5 w-24" />
      <TableSkeleton rows={5} cols={7} />
    </div>
  );
}
