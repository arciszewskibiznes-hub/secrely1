"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const supabase = createClient();

export function useUnlocked() {
  const { user, isAuthenticated } = useAuth();
  const [unlockedPostIds, setUnlockedPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async (uid?: string) => {
    const userId = uid ?? user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from("unlocked_posts")
      .select("post_id")
      .eq("user_id", userId);
    if (mountedRef.current) {
      setUnlockedPostIds(data?.map((r) => r.post_id) ?? []);
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refresh(user.id);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const isUnlocked = useCallback(
    (postId: string) => unlockedPostIds.includes(postId),
    [unlockedPostIds]
  );

  const unlockPost = useCallback(async (postId: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("unlocked_posts")
      .insert({ user_id: user.id, post_id: postId });
    // ignore duplicate key error (already unlocked)
    if (!error && mountedRef.current) {
      setUnlockedPostIds((prev) =>
        prev.includes(postId) ? prev : [...prev, postId]
      );
    }
  }, [user?.id]);

  return { unlockedPostIds, isUnlocked, unlockPost, isLoading, refresh };
}
