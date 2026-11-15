"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { PageLoader } from "@/components/app/ui";
import { RequestModal } from "@/components/app/rider/RequestModal";
import { RiderRuntimeProvider } from "@/lib/app/rider-runtime";
import { useSession } from "@/lib/app/session";

// Pages both customers and riders use.
const SHARED = ["/app/support", "/app/profile", "/app/notifications", "/app/chat"];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useSession();
  const router = useRouter();
  const path = usePathname() ?? "/app";

  const isRider = user?.role === "driver";
  const shared = SHARED.some((p) => path === p || path.startsWith(`${p}/`));
  const wrongArea = !!user && !shared && (isRider ? !path.startsWith("/app/rider") : path.startsWith("/app/rider"));

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`/app/login?next=${encodeURIComponent(path)}`);
    } else if (wrongArea) {
      router.replace(isRider ? "/app/rider" : "/app");
    }
  }, [hydrated, user, wrongArea, isRider, path, router]);

  if (!hydrated || !user || wrongArea) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <PageLoader />
      </div>
    );
  }

  if (isRider) {
    return (
      <RiderRuntimeProvider>
        <AppShell>{children}</AppShell>
        <RequestModal />
      </RiderRuntimeProvider>
    );
  }

  return <AppShell>{children}</AppShell>;
}
