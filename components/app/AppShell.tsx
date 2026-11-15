"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Bell,
  Bike,
  Home,
  LifeBuoy,
  Package,
  Plus,
  UserRound,
  Wallet,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/lib/app/hooks";
import { initials } from "@/lib/app/format";
import { useSession } from "@/lib/app/session";
import { useRider } from "@/lib/app/rider-runtime";
import { InstallButton } from "@/components/pwa/InstallButton";

type NavItem = { href: string; label: string; icon: LucideIcon; match?: (p: string) => boolean };

const CUSTOMER_NAV: NavItem[] = [
  { href: "/app", label: "Home", icon: Home, match: (p) => p === "/app" || p.startsWith("/app/send") },
  { href: "/app/deliveries", label: "Deliveries", icon: Package },
  { href: "/app/support", label: "Support", icon: LifeBuoy },
  { href: "/app/profile", label: "Profile", icon: UserRound, match: (p) => p.startsWith("/app/profile") || p.startsWith("/app/notifications") },
];

const RIDER_NAV: NavItem[] = [
  { href: "/app/rider", label: "Home", icon: Home, match: (p) => p === "/app/rider" },
  { href: "/app/rider/jobs", label: "Jobs", icon: Package, match: (p) => p.startsWith("/app/rider/jobs") || p.startsWith("/app/rider/deliveries") || p.startsWith("/app/rider/pod") },
  { href: "/app/support", label: "Support", icon: LifeBuoy },
  { href: "/app/profile", label: "Profile", icon: UserRound, match: (p) => p.startsWith("/app/profile") || p.startsWith("/app/notifications") || p.startsWith("/app/rider/earnings") || p.startsWith("/app/rider/vehicle") },
];

function isActive(item: NavItem, path: string) {
  return item.match ? item.match(path) : path === item.href || path.startsWith(`${item.href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useSession((s) => s.user);
  const path = usePathname() ?? "/app";
  const online = useOnlineStatus();
  const isRider = user?.role === "driver";
  const nav = isRider ? RIDER_NAV : CUSTOMER_NAV;
  const homeHref = isRider ? "/app/rider" : "/app";

  return (
    <div className="min-h-dvh bg-white text-brand-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-brand-hairline bg-white md:flex">
        <Link href={homeHref} className="flex h-14 items-center gap-2.5 border-b border-brand-hairline px-5">
          <Image src="/icons/icon-96.png" alt="" width={26} height={26} className="rounded-md" priority />
          <span className="text-[15px] font-semibold tracking-tight">Riderr</span>
        </Link>

        <div className="px-3 pt-4">
          {isRider ? (
            <RiderStatusPill />
          ) : (
            <Link href="/app/send" className="dash-btn dash-btn-primary w-full">
              <Plus aria-hidden className="size-4" />
              Send a package
            </Link>
          )}
        </div>

        <nav aria-label="Main" className="flex-1 space-y-0.5 px-3 pt-4">
          {nav.map((item) => {
            const active = isActive(item, path);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                  active
                    ? "bg-brand-canvas-soft font-medium text-brand-ink"
                    : "text-brand-ink-muted hover:bg-brand-canvas-soft hover:text-brand-ink",
                )}
              >
                <item.icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            );
          })}
          {isRider && (
            <Link
              href="/app/rider/earnings"
              aria-current={path.startsWith("/app/rider/earnings") ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                path.startsWith("/app/rider/earnings")
                  ? "bg-brand-canvas-soft font-medium text-brand-ink"
                  : "text-brand-ink-muted hover:bg-brand-canvas-soft hover:text-brand-ink",
              )}
            >
              <Wallet aria-hidden className="size-4" />
              Earnings
            </Link>
          )}
          <Link
            href="/app/notifications"
            aria-current={path.startsWith("/app/notifications") ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              path.startsWith("/app/notifications")
                ? "bg-brand-canvas-soft font-medium text-brand-ink"
                : "text-brand-ink-muted hover:bg-brand-canvas-soft hover:text-brand-ink",
            )}
          >
            <Bell aria-hidden className="size-4" />
            Notifications
          </Link>
        </nav>

        <div className="space-y-3 border-t border-brand-hairline p-3">
          <InstallButton className="w-full" />
          <Link href="/app/profile" className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-brand-canvas-soft">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-canvas-soft text-xs font-medium text-brand-ink-secondary ring-1 ring-brand-hairline ring-inset">
              {initials(user?.name, "U")}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{user?.name}</span>
              <span className="block truncate text-xs text-brand-ink-muted">{isRider ? "Rider" : "Customer"}</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between border-b border-brand-hairline bg-white/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <Link href={homeHref} className="flex items-center gap-2">
          <Image src="/icons/icon-96.png" alt="" width={24} height={24} className="rounded-md" priority />
          <span className="text-[15px] font-semibold tracking-tight">Riderr</span>
        </Link>
        <div className="flex items-center gap-1">
          {isRider && <RiderStatusPill compact />}
          <Link href="/app/notifications" className="dash-icon-btn" aria-label="Notifications">
            <Bell className="size-[18px]" />
          </Link>
        </div>
      </header>

      {!online && (
        <div role="status" className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-800 md:ml-60">
          <WifiOff aria-hidden className="size-4" />
          You&apos;re offline. Changes will fail until your connection is back.
        </div>
      )}

      <main className="md:ml-60">
        <div className="mx-auto w-full max-w-5xl px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:pt-8 md:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-brand-hairline bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {nav.map((item) => {
          const active = isActive(item, path);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-[11px]",
                active ? "font-medium text-brand-primary" : "text-brand-ink-muted",
              )}
            >
              <item.icon aria-hidden className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function RiderStatusPill({ compact = false }: { compact?: boolean }) {
  const { isOnline } = useRider();
  return (
    <Link
      href="/app/rider"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-brand-hairline text-sm",
        compact ? "h-8 px-2.5 text-xs" : "h-9 w-full px-3",
      )}
    >
      <span className={cn("size-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-brand-ink-faint")} />
      {compact ? (isOnline ? "Online" : "Offline") : (
        <span className="flex flex-1 items-center justify-between">
          {isOnline ? "Online" : "Offline"}
          <Bike aria-hidden className="size-4 text-brand-ink-faint" />
        </span>
      )}
    </Link>
  );
}
