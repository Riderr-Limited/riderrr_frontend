"use client";

import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState = {
  deferred: BeforeInstallPromptEvent | null;
  installed: boolean;
};

let state: InstallState = { deferred: null, installed: false };
const listeners = new Set<() => void>();
let listening = false;

function emit(next: Partial<InstallState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

/** Must run as early as possible: browsers fire beforeinstallprompt once, soon after load. */
export function startInstallListener() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    emit({ deferred: e as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => emit({ deferred: null, installed: true }));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const serverSnapshot: InstallState = { deferred: null, installed: false };

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document);
}

export function useInstall() {
  const snap = useSyncExternalStore(subscribe, () => state, () => serverSnapshot);
  const standalone = typeof window !== "undefined" && isStandalone();
  const ios = typeof window !== "undefined" && isIOS();

  return {
    /** A native install prompt is ready (Chrome, Edge, Android, Samsung Internet). */
    canPrompt: !!snap.deferred && !standalone,
    /** iOS Safari has no prompt; we show Add to Home Screen steps instead. */
    needsIOSInstructions: ios && !standalone,
    installed: snap.installed || standalone,
    promptInstall: async (): Promise<boolean> => {
      const evt = state.deferred;
      if (!evt) return false;
      await evt.prompt();
      const choice = await evt.userChoice;
      emit({ deferred: null, installed: choice.outcome === "accepted" });
      return choice.outcome === "accepted";
    },
  };
}
