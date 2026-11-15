"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Notice } from "@/components/app/ui";
import { PasswordInput } from "@/components/app/auth/PasswordInput";
import { errorMessage } from "@/lib/app/api";
import { useSession } from "@/lib/app/session";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useSession();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await forgotPassword(email.trim());
      if (step === "reset") setInfo("We sent you a new code.");
      setStep("reset");
    } catch (err) {
      setError(errorMessage(err, "We couldn't send the code."));
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return setError("Enter the code we sent you.");
    if (password.length < 6) return setError("Use at least 6 characters for your new password.");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await resetPassword(email.trim(), otp.trim(), password);
      setStep("done");
    } catch (err) {
      setError(errorMessage(err, "We couldn't reset your password."));
    } finally {
      setBusy(false);
    }
  };

  if (step === "done") {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-1.5 text-sm text-brand-ink-muted">You can now sign in with your new password.</p>
        <Link href="/app/login" className="dash-btn dash-btn-primary mt-8 h-11 w-full text-[15px]">
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1.5 text-sm text-brand-ink-muted">
        {step === "email" ? "We'll email you a code to reset it." : `Enter the code we sent to ${email}.`}
      </p>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="dash-label">
              Email
            </label>
            <input id="email" type="email" autoComplete="email" className="dash-input h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <Notice tone="danger">{error}</Notice>}
          <Button type="submit" size="lg" block loading={busy}>
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={reset} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="otp" className="dash-label">
              Code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="dash-input h-11 tracking-widest tabular-nums"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="dash-label">
              New password
            </label>
            <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 6 characters" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="dash-label">
              Confirm new password
            </label>
            <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          </div>
          {error && <Notice tone="danger">{error}</Notice>}
          {info && <Notice tone="success">{info}</Notice>}
          <Button type="submit" size="lg" block loading={busy}>
            Reset password
          </Button>
          <button type="button" onClick={() => sendCode()} className="w-full text-sm text-brand-primary hover:underline" disabled={busy}>
            Resend code
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-brand-ink-muted">
        <Link href="/app/login" className="hover:text-brand-ink">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
