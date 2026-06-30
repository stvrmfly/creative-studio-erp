"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, FolderKanban, UsersRound, CheckSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { ROLE_ACCESS, useRole } from "./role-context";
import { AccountMenu } from "./account-menu";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
] as const;

const RAIL_H = 16; // matches h-4 indicator

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-2 pb-5 pt-1">
      <div className="brand-mark-gradient grid h-8 w-8 place-items-center rounded-sm text-base font-bold text-accent-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.12)]">
        C
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-semibold tracking-tight">Citrus</div>
        <div className="truncate text-xs text-muted">Creative Operations</div>
      </div>
    </div>
  );
}

/**
 * Nav list with a single accent rail that slides to the active item. The rail
 * is measured relative to this component's own container, so it works
 * identically in the desktop sidebar and the mobile drawer.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useRole();
  const allowed = ROLE_ACCESS[role].routes;
  const items = NAV.filter((item) => allowed.includes(item.href as (typeof allowed)[number]));

  const navRef = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState<number | null>(null);

  useLayoutEffect(() => {
    const container = navRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]') as HTMLElement | null;
    setRail(active ? active.offsetTop + (active.offsetHeight - RAIL_H) / 2 : null);
  }, [pathname, items.length]);

  return (
    <div ref={navRef} className="relative flex flex-col gap-0.5">
      {rail !== null ? (
        <span
          className="pointer-events-none absolute left-0 top-0 h-4 w-[2px] rounded-full bg-accent transition-transform duration-200 ease-out"
          style={{ transform: `translateY(${rail}px)` }}
        />
      ) : null}
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            data-active={active}
            onClick={onNavigate}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-sunken text-primary" : "text-secondary hover:bg-sunken hover:text-primary"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted")} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      className="
        fixed top-[var(--gutter)] left-[var(--gutter)] bottom-[var(--gutter)] w-sidebar
        flex flex-col overflow-y-auto
        rounded-2xl border border-line bg-surface shadow-[var(--shadow-panel)]
        px-3 py-4
        max-[880px]:hidden
      "
    >
      <SidebarBrand />
      <div className="px-2 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-label text-muted">
        Workspace
      </div>
      <SidebarNav />
      <div className="mt-auto border-t border-line pt-2">
        <AccountMenu />
      </div>
    </aside>
  );
}
