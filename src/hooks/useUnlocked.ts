"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const supabase = createClient();

// Module-level shared state — all hook instances share the same array
// This is the simplest way to share state without Context/JSX
let _sharedIds: string[] = [];
let _listeners: Array<(ids: string[]) => void> = [];

function setSharedIds(ids: string[]) {
  _sharedIds = ids;
  _listeners.forEach((fn) => fn(ids));
}

function addUnlockedId(postId: string) {
  if (_sharedIds.includes(postId)) return;
  const next = [..._sharedIds, postId];
  setSharedIds(next);
}

export function useUnlocked() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const [unlockedPostIds, setUnlockedPostIds] = useState<string[]>(_sharedIds);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  const fetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Subscribe to shared state changes
  useEffect(() => {
    const listener = (ids: string[]) => {
      if (mountedRef.current) setUnlockedPostIds(ids);
    };
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  }, []);

  // Fetch from DB once per user
  useEffect(() => {
    if (!isAuthenticated || !userId || fetchedForRef.current === userId) {
      if (!isAuthenticated) {
        fetchedForRef.current = null;
        setSharedIds([]);
      }
      return;
    }
    fetchedForRef.current = userId;
    setIsLoading(true);
    supabase
      .from("unlocked_posts")
      .select("post_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        setSharedIds(data?.map((r) => r.post_id) ?? []);
        if (mountedRef.current) setIsLoading(false);
      });
  }, [isAuthenticated, userId]);

  const isUnlocked = useCallback(
    (postId: string) => unlockedPostIds.includes(postId),
    [unlockedPostIds]
  );

  // Instantly updates all PostCards everywhere
  const unlockPost = useCallback(async (postId: string) => {
    if (!userId) return;
    // Optimistic update — all components see change immediately
    addUnlockedId(postId);
    // Persist to DB
    await supabase
      .from("unlocked_posts")
      .insert({ user_id: userId, post_id: postId });
  }, [userId]);

  return { unlockedPostIds, isUnlocked, unlockPost, isLoading };
}
