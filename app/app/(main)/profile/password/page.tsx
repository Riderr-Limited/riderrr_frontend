"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Circle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";
import { PasswordInput } from "@/components/app/auth/PasswordInput";
import { Button, Notice } from "@/components/app/ui";
import { errorMessage } from "@/lib/app/api";
import { account } from "@/lib/app/services";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const longEnough = next.length >= 6;
  const matches = next.length > 0 && next === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return setError("Enter your current password.");
    if (!longEnough) return setError("Your new password needs at least 6 characters.");
    if (!matches) return setError("New passwords don't match.");
    if (current === next) return setError("Choose a password different from your current one.");
    setBusy(true);
    setError(null);
    try {
      await account.changePassword(current, next);
      toast.success("Password changed.");
      router.push("/app/profile");
    } catch (err) {
      setError(errorMessage(err, "We couldn't change your password."));
      setBusy(false);
    }
  };

  return (
    <>
      <BackLink href="/app/profile" label="Profile" />
      <PageHeader title="Change password" />
      <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
        <div>
          <label htmlFor="current" className="dash-label">
            Current password
          </label>
          <PasswordInput id="current" value={current} onChange={setCurrent} />
        </div>
        <div>
          <label htmlFor="new" className="dash-label">
            New password
          </label>
          <PasswordInput id="new" value={next} onChange={setNext} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="confirm" className="dash-label">
            Confirm new password
          </label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <ul className="space-y-1 text-[13px]">
          <Requirement met={longEnough}>At least 6 characters</Requirement>
          <Requirement met={matches}>Passwords match</Requirement>
        </ul>
        {error && <Notice tone="danger">{error}</Notice>}
        <Button type="submit" size="lg" loading={busy}>
          Update password
        </Button>
      </form>
    </>
  );
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className={met ? "flex items-center gap-2 text-emerald-700" : "flex items-center gap-2 text-brand-ink-muted"}>
      {met ? <Check aria-hidden className="size-3.5" /> : <Circle aria-hidden className="size-3.5" />}
      {children}
    </li>
  );
}
