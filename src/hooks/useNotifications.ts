"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const supabase = createClient();

let _unreadCount = 0;
let _countListeners: Array<(n: number) => void> = [];

export function setUnreadCount(n: number) {
  _unreadCount = n;
  _countListeners.forEach((fn) => fn(n));
}

export function formatBadge(count: number): string {
  if (count <= 0) return "";
  if (count <= 9) return String(count);
  if (count <= 49) return "9+";
  if (count <= 99) return "50+";
  return "100+";
}

export function useUnreadNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(_unreadCount);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const listener = (n: number) => { if (mountedRef.current) setCount(n); };
    _countListeners.push(listener);
    return () => { _countListeners = _countListeners.filter((l) => l !== listener); };
  }, []);

  const fetchCount = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.rpc("get_unread_notifications_count", {
      p_user_id: user.id,
    });
    if (mountedRef.current) setUnreadCount(data ?? 0);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setUnreadCount(0);
      return;
    }

    // Fetch immediately
    fetchCount();

    // Poll every 30 seconds
    intervalRef.current = setInterval(fetchCount, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, user?.id, fetchCount]);

  return { count, badge: formatBadge(count) };
}
