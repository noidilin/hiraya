import { create } from "zustand";

import {
  getAccessToken,
  login as loginWithApi,
  logout as logoutWithApi,
  me,
  register as registerWithApi,
  type AuthRequest,
  type RegisterRequest,
  type User,
} from "@/api";
import { clearAccessToken } from "@/api/client";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  hasBootstrapped: boolean;
  bootstrap: () => Promise<User | null>;
  login: (credentials: AuthRequest) => Promise<User>;
  register: (details: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  error: null,
  hasBootstrapped: false,

  async bootstrap() {
    const current = get();

    if (current.hasBootstrapped && current.status === "authenticated" && current.user) {
      return current.user;
    }

    if (!getAccessToken()) {
      set({
        user: null,
        status: "unauthenticated",
        error: null,
        hasBootstrapped: true,
      });
      return null;
    }

    set({ status: "loading", error: null });

    try {
      const user = await me();
      set({
        user,
        status: "authenticated",
        error: null,
        hasBootstrapped: true,
      });
      return user;
    } catch (error) {
      clearAccessToken();
      set({
        user: null,
        status: "unauthenticated",
        error: getErrorMessage(error),
        hasBootstrapped: true,
      });
      return null;
    }
  },

  async login(credentials) {
    set({ status: "loading", error: null });

    try {
      const response = await loginWithApi(credentials);
      set({
        user: response.user,
        status: "authenticated",
        error: null,
        hasBootstrapped: true,
      });
      return response.user;
    } catch (error) {
      clearAccessToken();
      set({
        user: null,
        status: "unauthenticated",
        error: getErrorMessage(error),
        hasBootstrapped: true,
      });
      throw error;
    }
  },

  async register(details) {
    set({ status: "loading", error: null });

    try {
      const response = await registerWithApi(details);
      set({
        user: response.user,
        status: "authenticated",
        error: null,
        hasBootstrapped: true,
      });
      return response.user;
    } catch (error) {
      clearAccessToken();
      set({
        user: null,
        status: "unauthenticated",
        error: getErrorMessage(error),
        hasBootstrapped: true,
      });
      throw error;
    }
  },

  async logout() {
    set({ status: "loading", error: null });

    try {
      await logoutWithApi();
    } catch {
      // The backend does not revoke server sessions; client cleanup is the logout contract.
    } finally {
      set({
        user: null,
        status: "unauthenticated",
        error: null,
        hasBootstrapped: true,
      });
    }
  },

  clearError() {
    set({ error: null });
  },
}));

export type { AuthState, AuthStatus };
