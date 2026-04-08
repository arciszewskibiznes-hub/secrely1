"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { CURRENT_USER } from "@/data/users";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Future: replace with real API call
  signIn: (email: string, _password: string) => Promise<void>;
  signUp: (email: string, _password: string, displayName: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      signIn: async (_email: string, _password: string) => {
        set({ isLoading: true });
        // Future: POST /api/auth/sign-in
        await new Promise((r) => setTimeout(r, 800));
        set({ user: CURRENT_USER, isAuthenticated: true, isLoading: false });
      },

      signUp: async (_email: string, _password: string, displayName: string) => {
        set({ isLoading: true });
        // Future: POST /api/auth/sign-up
        await new Promise((r) => setTimeout(r, 1000));
        const newUser: User = {
          ...CURRENT_USER,
          id: `user_${Date.now()}`,
          displayName,
          username: displayName.toLowerCase().replace(/\s+/g, "_"),
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
      },

      signOut: () => {
        // Future: POST /api/auth/sign-out
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: "secrely_auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
