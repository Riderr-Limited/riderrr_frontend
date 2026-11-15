"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Bike, ChevronRight, KeyRound, LifeBuoy, LogOut, Trash2, UserRound, Wallet, type LucideIcon } from "lucide-react";
import { Button, Modal, Notice, StatusBadge } from "@/components/app/ui";
import { InstallButton } from "@/components/pwa/InstallButton";
import { PasswordInput } from "@/components/app/auth/PasswordInput";
import { errorMessage } from "@/lib/app/api";
import { initials } from "@/lib/app/format";
import { useSession } from "@/lib/app/session";

type Row = { href: string; label: string; icon: LucideIcon };

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, deleteAccount, refreshUser } = useSession();
  const isRider = user?.role === "driver";
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const account: Row[] = [
    { href: "/app/profile/edit", label: "Edit profile", icon: UserRound },
    ...(isRider
      ? [
          { href: "/app/rider/earnings", label: "Earnings", icon: Wallet },
          { href: "/app/rider/vehicle", label: "Vehicle information", icon: Bike },
        ]
      : []),
    { href: "/app/notifications", label: "Notifications", icon: Bell },
  ];
  const settings: Row[] = [
    { href: "/app/profile/password", label: "Change password", icon: KeyRound },
    { href: "/app/support", label: "Help & support", icon: LifeBuoy },
  ];

  const doLogout = async () => {
    setBusy(true);
    await logout();
    router.replace("/app/login");
  };

  const doDelete = async () => {
    if (!password) return setError("Enter your password to confirm.");
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(password);
      router.replace("/app/login");
    } catch (e) {
      setError(errorMessage(e, "We couldn't delete your account."));
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-canvas-soft text-lg font-medium ring-1 ring-brand-hairline ring-inset">
          {initials(user?.name, "U")}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{user?.name}</h1>
          <p className="truncate text-sm text-brand-ink-muted">{user?.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <StatusBadge tone="info">{isRider ? "Rider" : "Customer"}</StatusBadge>
            {user?.isVerified ? (
              <StatusBadge tone="success">Verified</StatusBadge>
            ) : (
              <Link href="/app/verify" className="dash-badge dash-badge-warning hover:underline">
                Verify email
              </Link>
            )}
          </div>
        </div>
      </div>

      <RowGroup title="Account" rows={account} />
      <RowGroup title="Settings" rows={settings} />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">App</h2>
        <div className="rounded-lg border border-brand-hairline p-4">
          <p className="text-sm text-brand-ink-secondary">Install Riderr on this device to open it from your home screen, full screen.</p>
          <InstallButton className="mt-3" hideWhenUnavailable={false} />
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={() => setLogoutOpen(true)}>
          <LogOut aria-hidden className="size-4" />
          Log out
        </Button>
        <Button variant="danger-outline" onClick={() => { setPassword(""); setError(null); setDeleteOpen(true); }}>
          <Trash2 aria-hidden className="size-4" />
          Delete account
        </Button>
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doLogout} loading={busy}>
              Log out
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink-secondary">You&apos;ll need to sign in again to use Riderr on this device.</p>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => !busy && setDeleteOpen(false)}
        title="Delete your account?"
        description="This permanently removes your account and history. It can't be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doDelete} loading={busy}>
              Delete account
            </Button>
          </>
        }
      >
        <label htmlFor="delete-password" className="dash-label">
          Enter your password to confirm
        </label>
        <PasswordInput id="delete-password" value={password} onChange={setPassword} />
        {error && (
          <Notice tone="danger" className="mt-3">
            {error}
          </Notice>
        )}
      </Modal>
    </>
  );
}

function RowGroup({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
        {rows.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-brand-canvas-soft/60">
              <r.icon aria-hidden className="size-4 text-brand-ink-muted" />
              <span className="flex-1">{r.label}</span>
              <ChevronRight aria-hidden className="size-4 text-brand-ink-faint" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
