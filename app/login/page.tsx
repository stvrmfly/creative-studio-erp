import { EnvNotice } from "@/components/ui/env-notice";
import { hasDbEnv } from "@/lib/prisma";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="brand-mark-gradient mb-4 grid h-12 w-12 place-items-center rounded-md text-2xl font-bold text-accent-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.12)]">
            C
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-primary">Citrus</h1>
          <p className="mt-1 text-sm text-secondary">Sign in to Creative Operations</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-panel)]">
          {hasDbEnv() ? <LoginForm /> : <EnvNotice />}
        </div>
      </div>
    </div>
  );
}
