import * as React from "react";
import { cn } from "@/lib/cn";
import { fieldClasses } from "./input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, error, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={ariaInvalid ?? error}
      className={cn(fieldClasses(error), "px-3 py-2", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
