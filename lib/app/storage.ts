// Session storage for the customer / rider web app.
// Kept under its own keys so a rider or customer session never collides with an
// organization session on the /dashboard side of the same browser.

import type { AppUser } from "./types";

const KEYS = {
  access: "riderr_app_access_token",
  refresh: "riderr_app_refresh_token",
  user: "riderr_app_user",
} as const;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the session simply won't persist.
  }
}

export const sessionStorageKeys = KEYS;

export function readSession(): {
  accessToken: string | null;
  refreshToken: string | null;
  user: AppUser | null;
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, user: null };
  }
  let user: AppUser | null = null;
  const raw = safeGet(KEYS.user);
  if (raw) {
    try {
      user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }
  return {
    accessToken: safeGet(KEYS.access),
    refreshToken: safeGet(KEYS.refresh),
    user,
  };
}

export function writeTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (accessToken !== undefined) safeSet(KEYS.access, accessToken);
  if (refreshToken !== undefined) safeSet(KEYS.refresh, refreshToken);
}

export function writeUser(user: AppUser | null) {
  safeSet(KEYS.user, user ? JSON.stringify(user) : null);
}

export function clearSession() {
  safeSet(KEYS.access, null);
  safeSet(KEYS.refresh, null);
  safeSet(KEYS.user, null);
}

export function getAccessToken() {
  return typeof window === "undefined" ? null : safeGet(KEYS.access);
}

export function getRefreshToken() {
  return typeof window === "undefined" ? null : safeGet(KEYS.refresh);
}
