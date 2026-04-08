"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UnlockedStore {
  unlockedPostIds: string[];
  subscriptions: string[]; // creator IDs
  isUnlocked: (postId: string) => boolean;
  unlockPost: (postId: string) => void;
  subscribe: (creatorId: string) => void;
  unsubscribe: (creatorId: string) => void;
  isSubscribed: (creatorId: string) => boolean;
}

export const useUnlockedStore = create<UnlockedStore>()(
  persist(
    (set, get) => ({
      unlockedPostIds: ["post_8"], // Rafael's program pre-unlocked for demo
      subscriptions: ["creator_2"], // Marco pre-subscribed for demo

      isUnlocked: (postId: string) => get().unlockedPostIds.includes(postId),

      unlockPost: (postId: string) => {
        // Future: POST /api/posts/:id/unlock
        set((state) => ({
          unlockedPostIds: [...state.unlockedPostIds, postId],
        }));
      },

      subscribe: (creatorId: string) => {
        // Future: POST /api/creators/:id/subscribe
        set((state) => ({
          subscriptions: [...state.subscriptions, creatorId],
        }));
      },

      unsubscribe: (creatorId: string) => {
        // Future: DELETE /api/creators/:id/subscribe
        set((state) => ({
          subscriptions: state.subscriptions.filter((id) => id !== creatorId),
        }));
      },

      isSubscribed: (creatorId: string) => get().subscriptions.includes(creatorId),
    }),
    {
      name: "secrely_unlocked",
    }
  )
);
