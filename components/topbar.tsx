"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { MobileNav } from "./mobile-nav";
import { Button } from "./ui/button";
import { openPalette } from "./command-palette";

export function Topbar() {
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header className="flex h-topbar shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-5 min-[881px]:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav />
        <Breadcrumb />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={openPalette}
          className="flex h-9 items-center gap-2 rounded-sm border border-line bg-app px-3 text-sm text-muted transition-colors hover:bg-sunken hover:text-secondary"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden font-mono text-xs text-muted sm:inline">
            {mac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>
        <Button onClick={openPalette} aria-label="Create">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>
    </header>
  );
}
