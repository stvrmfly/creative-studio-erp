import * as React from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-surface p-12 text-center">
      {Icon ? (
        <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full bg-sunken text-muted">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm text-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
