import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Hairline-divided fact strip — the same `gap-px` over `bg-line` pattern as the
 * dashboard stat strip, so detail-page metadata reads as one cohesive unit.
 */
export function InfoGrid({
  children,
  cols = 4,
}: {
  children: React.ReactNode;
  cols?: 2 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-md border border-line bg-line shadow-sm",
        cols === 4 ? "grid-cols-4 max-[880px]:grid-cols-2" : "grid-cols-2 max-[680px]:grid-cols-1"
      )}
    >
      {children}
    </div>
  );
}

export function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-surface px-4 py-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 text-sm text-primary">{value}</div>
    </div>
  );
}
