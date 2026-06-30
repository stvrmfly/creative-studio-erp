import { cn } from "@/lib/cn";
import { daysUntil, dueLabel, formatDate } from "@/lib/format";

/**
 * Renders a due date with semantic urgency:
 * overdue → --danger, due today/tomorrow → --warning, otherwise --secondary.
 * Emits exactly one color class (clsx doesn't merge Tailwind conflicts), so
 * callers should pass only non-color classes. Pass `done` to neutralize the
 * urgency for finished work.
 */
export function DueDate({
  date,
  done = false,
  className,
}: {
  date: Date | string | null | undefined;
  done?: boolean;
  className?: string;
}) {
  const days = daysUntil(date);
  const overdue = !done && days != null && days < 0;
  const soon = !done && days != null && (days === 0 || days === 1);
  return (
    <span
      title={formatDate(date)}
      className={cn(
        "tabular",
        overdue ? "font-medium text-danger" : soon ? "text-warning" : "text-secondary",
        className
      )}
    >
      {dueLabel(date)}
    </span>
  );
}
