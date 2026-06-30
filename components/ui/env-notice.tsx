export function EnvNotice() {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-surface p-12 text-center">
      <div className="eyebrow mb-2">Setup needed</div>
      <h2 className="text-lg font-semibold text-primary">Database not configured</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-secondary">
        Copy <code className="font-mono text-xs">.env.example</code> to{" "}
        <code className="font-mono text-xs">.env</code> and set{" "}
        <code className="font-mono text-xs">DATABASE_URL</code>. Then run{" "}
        <code className="font-mono text-xs">npm run db:migrate</code> to create the schema and seed it.
      </p>
    </div>
  );
}
