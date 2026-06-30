"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { ROLE_META, useRole } from "./role-context";
import { useTheme } from "./theme-toggle";
import { logout } from "@/app/login/actions";

function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-label text-muted">
      {children}
    </div>
  );
}

function MenuItem({
  children,
  onSelect,
  active,
  disabled,
  icon: Icon,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      onSelect={(e) => {
        if (!onSelect) return;
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "data-[highlighted]:bg-sunken data-[highlighted]:text-primary",
        "data-[disabled]:cursor-default data-[disabled]:opacity-50"
      )}
    >
      {Icon ? <Icon className="h-4 w-4 text-muted" /> : null}
      <span className="flex-1">{children}</span>
      {active ? <Check className="h-3.5 w-3.5 text-accent" /> : null}
    </DropdownMenu.Item>
  );
}

function Separator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-line" />;
}

/** Sidebar account block: signed-in identity, theme, and sign out. */
export function AccountMenu() {
  const { role, currentUser } = useRole();
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const meta = ROLE_META[role];
  const displayName = currentUser?.name ?? meta.label;

  async function signOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      // Full reload so middleware redirects to /login with the session gone.
      window.location.assign("/login");
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
          <Avatar name={displayName} initials={currentUser ? undefined : meta.avatar} size={32} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-primary">{displayName}</div>
            <div className="truncate text-xs text-muted">{meta.label}</div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          className="z-50 min-w-[220px] overflow-hidden rounded-md border border-line bg-surface p-1 shadow-md"
        >
          <MenuLabel>Theme</MenuLabel>
          <MenuItem icon={Sun} active={theme === "light"} onSelect={() => setTheme("light")}>
            Light
          </MenuItem>
          <MenuItem icon={Moon} active={theme === "dark"} onSelect={() => setTheme("dark")}>
            Dark
          </MenuItem>

          <Separator />
          <MenuItem icon={LogOut} onSelect={signOut} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </MenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
