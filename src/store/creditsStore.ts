"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CREDITS } from "@/data/credits";
import type { Transaction } from "@/types";
import { MOCK_TRANSACTIONS } from "@/data/credits";

interface CreditsState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  // Future: replace with real payment API
  addCredits: (amount: number, description: string) => void;
  spendCredits: (amount: number, description: string, postId?: string) => boolean;
  canAfford: (amount: number) => boolean;
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      balance: DEFAULT_CREDITS,
      transactions: MOCK_TRANSACTIONS,
      isLoading: false,

      addCredits: (amount: number, description: string) => {
        // Future: POST /api/credits/purchase
        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          type: "purchase",
          amount,
          description,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          balance: state.balance + amount,
          transactions: [tx, ...state.transactions],
        }));
      },

      spendCredits: (amount: number, description: string, postId?: string) => {
        const { balance } = get();
        if (balance < amount) return false;
        // Future: POST /api/credits/spend
        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          type: "spend",
          amount: -amount,
          description,
          createdAt: new Date().toISOString(),
          postId,
        };
        set((state) => ({
          balance: state.balance - amount,
          transactions: [tx, ...state.transactions],
        }));
        return true;
      },

      canAfford: (amount: number) => get().balance >= amount,
    }),
    {
      name: "secrely_credits",
    }
  )
);
