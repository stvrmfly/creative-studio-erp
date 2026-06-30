"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { PageTransition } from "./page-transition";
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login screen renders standalone — no sidebar, topbar, or palette.
  if (pathname === "/login") return <>{children}</>;

  return (
    <>
      <Sidebar />

      {/* Content panel
         Mobile (default): full-bleed, no rounded corners or shadow.
         Desktop (≥881px): floats with a gutter on all sides and between it
                            and the sidebar. Scrolls internally so the panel
                            edges stay put while content flows. */}
      <div
        className="
          fixed inset-0
          flex flex-col overflow-hidden bg-app
          min-[881px]:inset-auto
          min-[881px]:top-[var(--gutter)]
          min-[881px]:right-[var(--gutter)]
          min-[881px]:bottom-[var(--gutter)]
          min-[881px]:left-[calc(var(--sidebar-w)+var(--gutter)*2)]
          min-[881px]:rounded-2xl
          min-[881px]:border
          min-[881px]:border-line
          min-[881px]:shadow-[var(--shadow-panel)]
        "
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-content p-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <CommandPalette />
    </>
  );
}
