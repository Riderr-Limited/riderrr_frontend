"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Notice } from "@/components/app/ui";
import { PasswordInput, normalizeIdentifier } from "@/components/app/auth/PasswordInput";
import { errorMessage } from "@/lib/app/api";
import { useQueryParam } from "@/lib/app/hooks";
import { OrganizationAccountError, useSession } from "@/lib/app/session";

function safeNext(next: string | null, role: string) {
  if (!next || !next.startsWith("/app") || next.startsWith("//")) return null;
  if (role === "driver" && !next.startsWith("/app/rider") && !/^\/app\/(support|profile|notifications|chat)/.test(next)) return null;
  if (role === "customer" && next.startsWith("/app/rider")) return null;
  return next;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, hydrated, login } = useSession();
  const next = useQueryParam("next");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgAccount, setOrgAccount] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace(user.role === "driver" ? "/app/rider" : "/app");
    // only on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrgAccount(false);
    if (!identifier.trim() || !password) {
      setError("Enter your email or phone number and your password.");
      return;
    }
    setBusy(true);
    try {
      const signedIn = await login(normalizeIdentifier(identifier), password);
      const fallback = signedIn.role === "driver" ? "/app/rider" : "/app";
      router.replace(safeNext(next, signedIn.role) ?? fallback);
    } catch (err) {
      if (err instanceof OrganizationAccountError) setOrgAccount(true);
      else setError(errorMessage(err, "We couldn't sign you in. Check your details and try again."));
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1.5 text-sm text-brand-ink-muted">Use the same account as the Riderr mobile app.</p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="identifier" className="dash-label">
            Email or phone number
          </label>
          <input
            id="identifier"
            className="dash-input h-11"
            autoComplete="username"
            inputMode="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com or 08012345678"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="dash-label">
              Password
            </label>
            <Link href="/app/forgot-password" className="mb-1.5 text-[13px] text-brand-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" value={password} onChange={setPassword} />
        </div>

        {error && <Notice tone="danger">{error}</Notice>}
        {orgAccount && (
          <Notice tone="info">
            This is an organization account.{" "}
            <Link href="/login" className="font-medium text-brand-primary hover:underline">
              Sign in to the organization dashboard
            </Link>
            .
          </Notice>
        )}

        <Button type="submit" size="lg" block loading={busy}>
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-ink-muted">
        New to Riderr?{" "}
        <Link href="/app/signup" className="font-medium text-brand-primary hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-brand-ink-faint">
        Running a logistics company?{" "}
        <Link href="/login" className="hover:underline">
          Organization sign in
        </Link>
      </p>
    </>
  );
}
