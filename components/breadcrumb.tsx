"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTION: Record<string, string> = {
  clients: "Clients",
  projects: "Projects",
  team: "Team",
  tasks: "Tasks",
};

/** Lightweight page context for the topbar: Citrus / <section>. */
export function Breadcrumb() {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[0];
  const section = seg ? SECTION[seg] ?? seg[0].toUpperCase() + seg.slice(1) : "Dashboard";

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link href="/" className="shrink-0 text-muted transition-colors hover:text-primary">
        Citrus
      </Link>
      <span className="text-muted">/</span>
      <span className="truncate font-medium text-primary">{section}</span>
    </nav>
  );
}
