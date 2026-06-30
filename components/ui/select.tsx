import * as React from "react";
import { cn } from "@/lib/cn";
import { fieldClasses } from "./input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={ariaInvalid ?? error}
      className={cn(fieldClasses(error), "h-9 cursor-pointer px-3", className)}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
