"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CreditTransaction } from "@/types/database";

const supabase = createClient();

// Module-level shared balance — all components see the same value
let _sharedBalance = 0;
let _balanceListeners: Array<(b: number) => void> = [];

function setSharedBalance(b: number) {
  _sharedBalance = b;
  _balanceListeners.forEach((fn) => fn(b));
}

export function useCredits() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;

  const [balance, setBalance] = useState(_sharedBalance);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadedForRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Subscribe to shared balance changes
  useEffect(() => {
    const listener = (b: number) => {
      if (mountedRef.current) setBalance(b);
    };
    _balanceListeners.push(listener);
    return () => {
      _balanceListeners = _balanceListeners.filter((l) => l !== listener);
    };
  }, []);

  const fetchData = useCallback(async (uid: string) => {
    const [balResult, txResult] = await Promise.all([
      supabase.from("credit_balances").select("balance").eq("user_id", uid).single(),
      supabase.from("credit_transactions").select("*").eq("user_id", uid)
        .order("created_at", { ascending: false }).limit(50),
    ]);
    if (!mountedRef.current) return;
    const newBalance = balResult.data?.balance ?? 0;
    setSharedBalance(newBalance); // updates all components at once
    setTransactions(txResult.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      // Always fetch fresh — no cache
      loadedForRef.current = userId;
      setIsLoading(true);
      fetchData(userId);
    } else if (!isAuthenticated) {
      setIsLoading(false);
      loadedForRef.current = null;
      setSharedBalance(0);
    }
  }, [isAuthenticated, userId, fetchData]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    await fetchData(userId);
  }, [userId, fetchData]);

  const addCredits = useCallback(async (amount: number, description: string) => {
    if (!userId) return;
    const newBalance = _sharedBalance + amount;
    setSharedBalance(newBalance); // optimistic
    await supabase.from("credit_balances").upsert(
      { user_id: userId, balance: newBalance },
      { onConflict: "user_id" }
    );
    await supabase.from("credit_transactions").insert({
      user_id: userId, amount, type: "purchase" as const, description,
    });
    fetchData(userId); // sync with DB
  }, [userId, fetchData]);

  const spendCredits = useCallback(async (
    amount: number, description: string, postId?: string
  ): Promise<boolean> => {
    if (!userId || _sharedBalance < amount) return false;
    const newBalance = _sharedBalance - amount;
    setSharedBalance(newBalance); // optimistic
    const { error } = await supabase.from("credit_balances").upsert(
      { user_id: userId, balance: newBalance },
      { onConflict: "user_id" }
    );
    if (error) {
      setSharedBalance(_sharedBalance); // rollback
      return false;
    }
    await supabase.from("credit_transactions").insert({
      user_id: userId, amount: -amount, type: "spend" as const, description,
    });
    fetchData(userId); // sync with DB
    return true;
  }, [userId, fetchData]);

  const canAfford = useCallback((amount: number) => _sharedBalance >= amount, []);

  return { balance, transactions, isLoading, addCredits, spendCredits, canAfford, refresh };
}
