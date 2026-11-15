"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useSession } from "@/lib/app/session";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useSession((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-lg !border !border-brand-hairline !bg-white !text-brand-ink !shadow-elevated !text-sm",
            description: "!text-brand-ink-muted",
          },
        }}
      />
    </>
  );
}
