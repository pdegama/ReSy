import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthUser } from '../api/auth';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clearExpiredSession: () => void;
  logout: () => void;
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        expiresAt: null,
        setSession: (token, user) => set({ token, user, expiresAt: Date.now() + SESSION_TTL_MS }),
        setUser: (user) => set({ user }),
        clearExpiredSession: () =>
          set((state) => {
            if (!state.expiresAt || state.expiresAt > Date.now()) {
              return state;
            }

            return { token: null, user: null, expiresAt: null };
          }),
        logout: () => set({ token: null, user: null, expiresAt: null }),
      }),
      {
        name: 'resy-auth-store',
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          expiresAt: state.expiresAt,
        }),
      },
    ),
  ),
);
