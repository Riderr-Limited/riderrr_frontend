import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearSession, getAccessToken, getRefreshToken, writeTokens } from "./storage";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://riderr-backend.onrender.com/api"
).replace(/\/+$/, "");

/** Socket.IO lives on the API host without the /api prefix. */
export const SOCKET_URL = API_BASE.replace(/\/api$/, "");

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 45000,
});

let onSessionExpired: (() => void) | null = null;

/** The session store registers this so a dead token signs the user out everywhere. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
    const data = res.data?.data;
    if (res.data?.success && data?.accessToken) {
      writeTokens(data.accessToken, data.refreshToken ?? undefined);
      return data.accessToken as string;
    }
  } catch {
    // fall through
  }
  return null;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/verify-email", "/auth/forgot-password", "/auth/reset-password", "/auth/resend-verification"];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthRoute = AUTH_ROUTES.some((r) => config?.url?.startsWith(r));

    if (status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true;
      refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null));
      const token = await refreshing;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      }
      clearSession();
      onSessionExpired?.();
    }
    return Promise.reject(error);
  },
);

/** Turn any thrown value from an API call into a sentence a person can read. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
    if (!error.response) return "You appear to be offline. Check your connection and try again.";
    const data = error.response.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
