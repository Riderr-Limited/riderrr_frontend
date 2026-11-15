"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/primitives";
import { BackLink } from "@/components/app/BackLink";
import { Button, Notice } from "@/components/app/ui";
import { errorMessage } from "@/lib/app/api";
import { account } from "@/lib/app/services";
import { useSession } from "@/lib/app/session";
import { PHONE_HINT, isValidNigerianPhone, normalizeNigerianPhone } from "@/lib/app/format";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshUser, setUser } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Your name needs at least 2 characters.");
    if (phone.trim() && !isValidNigerianPhone(phone)) return setError(PHONE_HINT);
    setBusy(true);
    setError(null);
    try {
      const cleanPhone = phone.trim() ? normalizeNigerianPhone(phone) : "";
      const res = await account.updateProfile({ name: name.trim(), phone: cleanPhone });
      if (res?.success === false) throw new Error(res.message);
      if (user) setUser({ ...user, name: name.trim(), phone: cleanPhone });
      await refreshUser();
      toast.success("Profile updated.");
      router.push("/app/profile");
    } catch (err) {
      setError(errorMessage(err, "We couldn't update your profile."));
      setBusy(false);
    }
  };

  return (
    <>
      <BackLink href="/app/profile" label="Profile" />
      <PageHeader title="Edit profile" />
      <form onSubmit={save} className="max-w-md space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="dash-label">
            Full name
          </label>
          <input id="name" className="dash-input h-11" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="phone" className="dash-label">
            Phone number
          </label>
          <input id="phone" type="tel" className="dash-input h-11" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="dash-label">
            Email
          </label>
          <input id="email" className="dash-input h-11" value={user?.email ?? ""} disabled />
          <p className="mt-1 text-xs text-brand-ink-faint">Contact support to change your email address.</p>
        </div>
        {error && <Notice tone="danger">{error}</Notice>}
        <Button type="submit" size="lg" loading={busy}>
          Save changes
        </Button>
      </form>
    </>
  );
}
