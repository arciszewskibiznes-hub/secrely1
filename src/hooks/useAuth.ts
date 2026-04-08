"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  createElement,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import type { User, Session } from "@supabase/supabase-js";

const supabase = createClient();

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const defaultState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthState>(defaultState);

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const applySession = async (sess: Session | null) => {
      if (!mountedRef.current) return;
      if (sess?.user) {
        const prof = await fetchProfileById(sess.user.id);
        if (!mountedRef.current) return;
        setUser(sess.user);
        setProfile(prof);
        setSession(sess);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        applySession(sess);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if (!mountedRef.current) return;
        if (event === "TOKEN_REFRESHED") return;
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          applySession(sess);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const prof = await fetchProfileById(user.id);
    if (mountedRef.current) setProfile(prof);
  }, [user?.id]);

  const value: AuthState = {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    signOut,
    refreshProfile,
  };

  // Use createElement instead of JSX since this is a .ts file
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}

export function getDisplayName(profile: Profile | null | undefined): string {
  if (!profile) return "User";
  return profile.display_name ?? profile.username ?? "User";
}

export function getUsername(profile: Profile | null | undefined): string {
  if (!profile) return "user";
  return profile.username ?? profile.id.slice(0, 8);
}
