"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Stable supabase reference outside the hook - never changes
const supabase = createClient();

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Track if component is still mounted to avoid setState on unmounted
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // 1. Get current session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mountedRef.current) return;
      if (session?.user) {
        const profile = await fetchProfileById(session.user.id);
        if (!mountedRef.current) return;
        setState({
          user: session.user,
          profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    // 2. Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        if (session?.user) {
          const profile = await fetchProfileById(session.user.id);
          if (!mountedRef.current) return;
          setState({
            user: session.user,
            profile,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // empty — supabase is a stable module-level singleton

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfileById(state.user.id);
    if (mountedRef.current) {
      setState((s) => ({ ...s, profile }));
    }
  }, [state.user]);

  return { ...state, signOut, refreshProfile };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getDisplayName(profile: Profile | null | undefined): string {
  if (!profile) return "User";
  return profile.display_name ?? profile.username ?? "User";
}

export function getUsername(profile: Profile | null | undefined): string {
  if (!profile) return "user";
  return profile.username ?? profile.id.slice(0, 8);
}
