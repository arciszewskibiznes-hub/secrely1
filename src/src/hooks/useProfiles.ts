"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const supabase = createClient();

export function useCreators() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    supabase
      .from("profiles")
      .select("*")
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

  useEffect(() => {
    mountedRef.current = true;
    if (!username) { setIsLoading(false); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()
      .then(({ data }) => {
        if (mountedRef.current) {
          setProfile(data ?? null);
          setIsLoading(false);
        }
      });
    return () => { mountedRef.current = false; };
  }, [username]);

  return { profile, isLoading };
}

export function useProfileById(id: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (mountedRef.current) {
      setProfile(data ?? null);
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) refresh();
    else setIsLoading(false);
  }, [id, refresh]);

  return { profile, isLoading, refresh };
}
