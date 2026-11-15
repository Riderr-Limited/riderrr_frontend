"use client";

import { useEffect, useState } from "react";
import { startInstallListener } from "./install-store";

startInstallListener();

/**
 * Registers the service worker (production only) and offers a reload when a
 * new version has been downloaded, instead of swapping code under the user.
 */
export function PwaProvider() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(worker);
          });
        });
        // Look for a new version whenever the app comes back to the foreground.
        const onVisible = () => {
          if (document.visibilityState === "visible") reg.update().catch(() => {});
        };
        document.addEventListener("visibilitychange", onVisible);
      })
      .catch(() => {
        // The site works without a service worker; installation just won't be offered.
      });

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border border-brand-hairline bg-white px-4 py-3 text-sm shadow-elevated md:bottom-6"
    >
      <span className="text-brand-ink-secondary">A new version of Riderr is ready.</span>
      <button
        type="button"
        className="dash-btn dash-btn-primary dash-btn-sm"
        onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}
      >
        Refresh
      </button>
    </div>
  );
}
