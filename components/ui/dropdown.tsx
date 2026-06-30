"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function InlinePicker<T extends string>({
  value,
  options,
  onChange,
  children,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void | Promise<void>;
  children: React.ReactNode;
  label?: string;
}) {
  const pulseRef = React.useRef<HTMLSpanElement>(null);

  // Restart the accent "saved" pulse once the mutation settles.
  const pulse = React.useCallback(() => {
    const el = pulseRef.current;
    if (!el) return;
    el.classList.remove("flash-saved");
    void el.offsetWidth; // force reflow so the animation can replay
    el.classList.add("flash-saved");
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label={label}
        >
          <span ref={pulseRef} className="inline-flex">
            {children}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[180px] overflow-hidden rounded-md border border-line bg-surface p-1 shadow-md"
        >
          {label ? (
            <div className="px-2 py-1 text-xs font-semibold uppercase tracking-label text-muted">
              {label}
            </div>
          ) : null}
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt.value}
              onSelect={(e) => {
                e.preventDefault();
                if (opt.value !== value) {
                  Promise.resolve(onChange(opt.value)).finally(pulse);
                }
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                "data-[highlighted]:bg-sunken data-[highlighted]:text-primary"
              )}
            >
              <span>{opt.label}</span>
              {opt.value === value ? <Check className="h-3.5 w-3.5 text-accent-fg" /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
