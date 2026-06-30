"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { login } from "./actions";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await login(formData);
      // Full reload so middleware + the server layout pick up the new session.
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
      setPending(false);
    }
  }

  function fill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            error={!!error}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={!!error}
          />
        </div>

        {error ? <p className="text-xs text-danger">{error}</p> : null}

        <Button type="submit" loading={pending} className="mt-1 w-full">
          {!pending ? <LogIn className="h-4 w-4" /> : null}
          Sign in
        </Button>
      </form>

      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs font-semibold uppercase tracking-label text-muted">
            Demo accounts
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <p className="mb-3 text-center text-xs text-muted">
          Click an account to fill the form, then Sign in.
        </p>
        <div className="grid gap-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const selected = username === acc.username;
            return (
              <button
                key={acc.username}
                type="button"
                onClick={() => fill(acc.username, acc.password)}
                className={`hover-lift flex items-center justify-between gap-3 rounded-md border bg-surface px-3 py-2 text-left transition-colors ${
                  selected ? "border-accent" : "border-line hover:bg-sunken"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-primary">{acc.label}</div>
                  <div className="truncate text-xs text-muted">{acc.blurb}</div>
                </div>
                <div className="shrink-0 text-right font-mono text-xs text-secondary">
                  <div>{acc.username}</div>
                  <div className="text-muted">{acc.password}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
