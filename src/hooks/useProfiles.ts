"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const supabase = createClient();

export function useCreators() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at")
      .eq("is_creator", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (mountedRef.current) {
          setCreators(data ?? []);
          setIsLoading(false);
        }
      });

    return () => { mountedRef.current = false; };
  }, []);

  return { creators, isLoading };
}

export function useProfileByUsername(username: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!username || fetchedForRef.current === username) {
      if (!username) setIsLoading(false);
      return;
    }
    fetchedForRef.current = username;
    supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        if (mountedRef.current) {
          setProfile(data ?? null);
          setIsLoading(false);
        }
      });
  }, [username]);

  return { profile, isLoading };
}

export function useProfileById(id: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (mountedRef.current) setProfile(data ?? null);
  }, [id]);

  useEffect(() => {
    if (!id || fetchedForRef.current === id) {
      if (!id) setIsLoading(false);
      return;
    }
    fetchedForRef.current = id;
    supabase.from("profiles").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => {
        if (mountedRef.current) {
          setProfile(data ?? null);
          setIsLoading(false);
        }
      });
  }, [id]);

  return { profile, isLoading, refresh };
}
