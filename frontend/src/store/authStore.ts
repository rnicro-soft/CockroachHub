import { create } from "zustand";
import type { Admin } from "../types";

interface AuthState {
  token: string | null;
  admin: Admin | null;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  admin: null,

  setAuth: (token, admin) => {
    localStorage.setItem("auth", JSON.stringify({ token, admin }));
    set({ token, admin });
  },

  logout: () => {
    localStorage.removeItem("auth");
    set({ token: null, admin: null });
  },

  hydrate: () => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const { token, admin } = JSON.parse(stored);
        if (token && admin) {
          set({ token, admin });
        }
      } catch {
        localStorage.removeItem("auth");
      }
    }
  },
}));
