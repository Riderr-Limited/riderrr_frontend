"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Notice } from "@/components/app/ui";
import { errorMessage } from "@/lib/app/api";
import { useQueryParam } from "@/lib/app/hooks";
import { useSession } from "@/lib/app/session";

export default function VerifyPage() {
  const router = useRouter();
  const { user, verifyEmail, resendCode } = useSession();
  const emailParam = useQueryParam("email");
  const email = emailParam ?? user?.email ?? "";
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (!email) {
      setError("We lost track of your email. Sign in again to get a new code.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      router.replace("/app");
    } catch (err) {
      setError(errorMessage(err, "That code isn't right. Check it and try again."));
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setError(null);
    setInfo(null);
    try {
      await resendCode(email);
      setInfo("We sent you a new code.");
      setCooldown(30);
    } catch (err) {
      setError(errorMessage(err, "We couldn't resend the code."));
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-1.5 text-sm text-brand-ink-muted">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-brand-ink">{email || "your email"}</span>.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="code" className="dash-label">
            Verification code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="dash-input h-12 text-center text-lg tracking-[0.5em] tabular-nums"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
        {error && <Notice tone="danger">{error}</Notice>}
        {info && <Notice tone="success">{info}</Notice>}
        <Button type="submit" size="lg" block loading={busy}>
          Verify email
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="text-brand-primary hover:underline disabled:cursor-not-allowed disabled:text-brand-ink-faint disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        {user && (
          <Link href="/app" className="text-brand-ink-muted hover:text-brand-ink">
            Do this later
          </Link>
        )}
      </div>
    </>
  );
}
