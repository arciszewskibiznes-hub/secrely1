"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CreditTransaction } from "@/types/database";

// Stable supabase reference
const supabase = createClient();

export function useCredits() {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async (uid?: string) => {
    const userId = uid ?? user?.id;
    if (!userId) return;

    const [balResult, txResult] = await Promise.all([
      supabase
        .from("credit_balances")
        .select("balance")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (!mountedRef.current) return;
    setBalance(balResult.data?.balance ?? 0);
    setTransactions(txResult.data ?? []);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setIsLoading(true);
      refresh(user.id);
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const addCredits = useCallback(async (amount: number, description: string) => {
    if (!user?.id) return;
    const newBalance = balance + amount;

    await supabase.from("credit_balances").upsert(
      { user_id: user.id, balance: newBalance },
      { onConflict: "user_id" }
    );
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount,
      type: "purchase" as const,
      description,
    });

    if (mountedRef.current) {
      setBalance(newBalance);
      refresh(user.id);
    }
  }, [user?.id, balance, refresh]);

  const spendCredits = useCallback(async (
    amount: number,
    description: string,
    postId?: string
  ): Promise<boolean> => {
    if (!user?.id || balance < amount) return false;
    const newBalance = balance - amount;

    const { error } = await supabase.from("credit_balances").upsert(
      { user_id: user.id, balance: newBalance },
      { onConflict: "user_id" }
    );
    if (error) return false;

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -amount,
      type: "spend" as const,
      description,
      post_id: postId ?? null,
    });

    if (mountedRef.current) {
      setBalance(newBalance);
      refresh(user.id);
    }
    return true;
  }, [user?.id, balance, refresh]);

  const canAfford = useCallback((amount: number) => balance >= amount, [balance]);

  return { balance, transactions, isLoading, addCredits, spendCredits, canAfford, refresh };
}
