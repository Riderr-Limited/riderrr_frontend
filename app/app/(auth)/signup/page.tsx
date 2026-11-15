"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Notice } from "@/components/app/ui";
import { PasswordInput } from "@/components/app/auth/PasswordInput";
import { errorMessage } from "@/lib/app/api";
import { useSession } from "@/lib/app/session";

export default function SignupPage() {
  const router = useRouter();
  const { user, hydrated, signup } = useSession();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) router.replace(user.role === "driver" ? "/app/rider" : "/app");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const validate = (): string | null => {
    if (!form.name.trim()) return "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
    if (form.password.length < 6) return "Use at least 6 characters for your password.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    if (!agreed) return "Please accept the terms to continue.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const email = form.email.trim();
      await signup({ name: form.name.trim(), email, phone: form.phone.trim(), password: form.password });
      router.replace(`/app/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(errorMessage(err, "We couldn't create your account. Please try again."));
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-brand-ink-muted">One account works on the web and in the mobile app.</p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="dash-label">
            Full name
          </label>
          <input id="name" className="dash-input h-11" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="dash-label">
            Email
          </label>
          <input id="email" type="email" className="dash-input h-11" autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} />
        </div>
        <div>
          <label htmlFor="phone" className="dash-label">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            className="dash-input h-11"
            autoComplete="tel"
            placeholder="08012345678"
            value={form.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="dash-label">
            Password
          </label>
          <PasswordInput id="password" value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="At least 6 characters" />
        </div>
        <div>
          <label htmlFor="confirm" className="dash-label">
            Confirm password
          </label>
          <PasswordInput id="confirm" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-brand-ink-muted">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-brand-primary"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms-of-service" target="_blank" className="text-brand-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank" className="text-brand-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && <Notice tone="danger">{error}</Notice>}

        <Button type="submit" size="lg" block loading={busy}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-ink-muted">
        Already have an account?{" "}
        <Link href="/app/login" className="font-medium text-brand-primary hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-brand-ink-faint">
        Riders are added by their logistics company and sign in with the details they were given.
      </p>
    </>
  );
}
