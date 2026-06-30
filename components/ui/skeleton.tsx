import { cn } from "@/lib/cn";

/** A single shimmering placeholder bar. Uses --bg-sunken so it adapts to theme. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-sm bg-sunken", className)} />;
}

export function PageHeaderSkeleton({ action }: { action?: boolean }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      {action ? <Skeleton className="h-8 w-24" /> : null}
    </div>
  );
}

/** Mirrors the dashboard's hairline-divided stat strip / detail info grid. */
export function StatStripSkeleton({ cells = 4 }: { cells?: number }) {
  return (
    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-line bg-line shadow-sm max-[880px]:grid-cols-2">
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="bg-surface px-4 py-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-10" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
      <div className="flex gap-4 border-b border-line bg-app px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-b-0"
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className={cn("h-4", i === 0 ? "flex-[2]" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
        >
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  );
}
