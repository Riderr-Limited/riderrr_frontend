"use client";

import { create } from "zustand";
import { api, setSessionExpiredHandler } from "./api";
import { clearSession, readSession, writeTokens, writeUser } from "./storage";
import type { AppUser } from "./types";

export class OrganizationAccountError extends Error {
  constructor() {
    super("This is an organization account. Sign in on the organization dashboard instead.");
    this.name = "OrganizationAccountError";
  }
}

interface SessionState {
  user: AppUser | null;
  hydrated: boolean;
  hydrate: () => void;
  setUser: (user: AppUser | null) => void;
  login: (emailOrPhone: string, password: string) => Promise<AppUser>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ requiresVerification: boolean }>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

function persistUser(user: AppUser | null) {
  writeUser(user);
}

export const useSession = create<SessionState>((set, get) => ({
  user: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const { user, accessToken } = readSession();
    set({ user: accessToken ? user : null, hydrated: true });
    setSessionExpiredHandler(() => set({ user: null }));
  },

  setUser: (user) => {
    persistUser(user);
    set({ user });
  },

  login: async (emailOrPhone, password) => {
    const res = await api.post("/auth/login", { emailOrPhone, password });
    const { user, accessToken, refreshToken } = res.data.data as {
      user: AppUser;
      accessToken: string;
      refreshToken: string;
    };
    if (user.role !== "customer" && user.role !== "driver") {
      throw new OrganizationAccountError();
    }
    writeTokens(accessToken, refreshToken);
    persistUser(user);
    set({ user });
    return user;
  },

  signup: async ({ name, email, phone, password }) => {
    const res = await api.post("/auth/signup", {
      name,
      email,
      phone,
      password,
      role: "customer",
    });
    const { accessToken, refreshToken, user } = res.data.data;
    writeTokens(accessToken, refreshToken);
    persistUser(user);
    set({ user });
    return { requiresVerification: Boolean(res.data.requiresVerification) };
  },

  verifyEmail: async (email, token) => {
    const res = await api.post("/auth/verify-email", { email, token });
    const { user, accessToken } = res.data.data;
    writeTokens(accessToken);
    persistUser(user);
    set({ user });
  },

  resendCode: async (email) => {
    await api.post("/auth/resend-verification", { email });
  },

  forgotPassword: async (email) => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (email, otp, newPassword) => {
    await api.post("/auth/reset-password", { email, otp, newPassword });
  },

  refreshUser: async () => {
    try {
      const res = await api.get("/auth/me");
      const fresh = res.data?.data as AppUser | undefined;
      if (fresh?._id) {
        const merged = { ...get().user, ...fresh } as AppUser;
        persistUser(merged);
        set({ user: merged });
      }
    } catch {
      // Keep the cached user; a 401 is handled by the API client.
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Signing out locally still succeeds when the server call fails.
    }
    clearSession();
    set({ user: null });
  },

  deleteAccount: async (password) => {
    await api.delete("/users/account", { data: { password } });
    clearSession();
    set({ user: null });
  },
}));
