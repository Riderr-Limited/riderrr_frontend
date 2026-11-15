"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { errorMessage } from "./api";

/** Runs `fn` every `ms` milliseconds while `ms` is non-null. Always calls the latest `fn`. */
export function useInterval(fn: () => void, ms: number | null) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  }, [fn]);
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => saved.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

/**
 * Loads data once, exposes reload(), and optionally keeps polling.
 * A failed background refresh keeps the last good data on screen.
 */
export function useResource<T>(
  loader: () => Promise<T>,
  options: { pollMs?: number | null; enabled?: boolean } = {},
) {
  const { pollMs = null, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await loaderRef.current();
      if (!mounted.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      if (!silent) setError(errorMessage(e, "We couldn't load this. Please try again."));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);

  useInterval(() => {
    if (enabled && typeof document !== "undefined" && document.visibilityState === "visible") reload(true);
  }, pollMs);

  return { data, setData, error, loading, reload };
}

/** Reads one query-string value on the client without a Suspense boundary. */
export function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    subscribeToHistory,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

function subscribeToHistory(cb: () => void) {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
}

function subscribeToConnection(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribeToConnection, () => navigator.onLine, () => true);
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  }, []);
  return { copied, copy };
}
