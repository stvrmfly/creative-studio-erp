"use client";

import { usePathname } from "next/navigation";

/**
 * Replays a short fade + rise whenever the route changes by re-keying the
 * wrapper on pathname. Smooths the skeleton → content handoff. Query-string
 * changes (e.g. /tasks?filter=…) keep the same pathname, so they don't replay.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
