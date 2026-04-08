"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const supabase = createClient();

// Module-level shared state - all components sync instantly
let _following: string[] = [];
let _listeners: Array<(ids: string[]) => void> = [];

function setFollowing(ids: string[]) {
  _following = ids;
  _listeners.forEach((fn) => fn(ids));
}

export function useFollows() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const [following, setLocalFollowing] = useState<string[]>(_following);
  const mountedRef = useRef(true);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Subscribe to shared state
  useEffect(() => {
    const listener = (ids: string[]) => {
      if (mountedRef.current) setLocalFollowing(ids);
    };
    _listeners.push(listener);
    return () => { _listeners = _listeners.filter((l) => l !== listener); };
  }, []);

  // Fetch once per user
  useEffect(() => {
    if (!isAuthenticated || !userId || fetchedRef.current === userId) {
      if (!isAuthenticated) { fetchedRef.current = null; setFollowing([]); }
      return;
    }
    fetchedRef.current = userId;
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId)
      .then(({ data }) => setFollowing(data?.map((r) => r.following_id) ?? []));
  }, [isAuthenticated, userId]);

  const isFollowing = useCallback(
    (targetId: string) => following.includes(targetId),
    [following]
  );

  const follow = useCallback(async (targetId: string) => {
    if (!userId || targetId === userId || !targetId) return;
    const prev = [..._following];
    setFollowing([..._following, targetId]); // updates module-level + all listeners
    const { error } = await supabase.from("follows").insert({
      follower_id: userId,
      following_id: targetId,
    });
    if (error) setFollowing(prev); // rollback on error
  }, [userId]);

  const unfollow = useCallback(async (targetId: string) => {
    if (!userId || !targetId) return;
    const prev = [..._following];
    setFollowing(_following.filter((id) => id !== targetId)); // updates module-level + all listeners
    const { error } = await supabase.from("follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", targetId);
    if (error) setFollowing(prev); // rollback on error
  }, [userId]);

  const toggleFollow = useCallback(async (targetId: string) => {
    if (isFollowing(targetId)) await unfollow(targetId);
    else await follow(targetId);
  }, [isFollowing, follow, unfollow]);

  return { following, isFollowing, follow, unfollow, toggleFollow };
}
