import * as React from "react";
import { cn } from "@/lib/cn";

/** Shared field styling so input / textarea / select stay consistent. */
export function fieldClasses(error?: boolean) {
  return cn(
    "w-full rounded-sm border bg-surface text-sm text-primary placeholder:text-muted transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
    error
      ? "border-danger-border focus-visible:border-danger focus-visible:ring-danger/25"
      : "border-line-strong focus-visible:border-accent focus-visible:ring-accent/25"
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? error}
      className={cn(fieldClasses(error), "h-9 px-3", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";
