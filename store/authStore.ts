import { create } from "zustand";

/**
 * User object returned from backend
 */
interface User {
  _id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

/**
 * Auth store state
 */
interface AuthState {
  // user info
  user: User | null;
  userId: string | null;
  email: string | null;

  // tokens
  accessToken: string | null;
  refreshToken: string | null;

  // flags
  requiresVerification: boolean;

  // actions
  setAuth: (data: Partial<AuthState>) => void;
  reset: () => void;
}

/**
 * Zustand auth store
 */
export const useAuthStore = create<AuthState>((set) => ({
  // initial state
  user: null,
  userId: null,
  email: null,
  accessToken: null,
  refreshToken: null,
  requiresVerification: false,

  // merge new auth data
  setAuth: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  // clear everything (logout / reset)
  reset: () =>
    set({
      user: null,
      userId: null,
      email: null,
      accessToken: null,
      refreshToken: null,
      requiresVerification: false,
    }),
}));
