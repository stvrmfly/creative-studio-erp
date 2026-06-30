"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { AccountMenu } from "./account-menu";
import { SidebarBrand, SidebarNav } from "./sidebar";

/**
 * Mobile navigation — a hamburger that opens the sidebar as a slide-in drawer.
 * Below 880px the desktop sidebar is hidden, so this is the only way to
 * navigate. Reuses the same brand/nav/account pieces as the desktop sidebar.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Open navigation"
          className="grid h-9 w-9 place-items-center rounded-sm text-secondary transition-colors hover:bg-sunken hover:text-primary min-[881px]:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-40 bg-black/40 min-[881px]:hidden" />
        <Dialog.Content className="drawer-content fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col overflow-y-auto border-r border-line bg-surface px-3 py-4 shadow-[var(--shadow-panel)] outline-none min-[881px]:hidden">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-start justify-between">
            <SidebarBrand />
            <Dialog.Close asChild>
              <button
                aria-label="Close navigation"
                className="mt-1 grid h-8 w-8 place-items-center rounded-sm text-muted transition-colors hover:bg-sunken hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="px-2 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-label text-muted">
            Workspace
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
          <div className="mt-auto border-t border-line pt-2">
            <AccountMenu />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
