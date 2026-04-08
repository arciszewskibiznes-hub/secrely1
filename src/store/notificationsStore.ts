"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_NOTIFICATIONS } from "@/data/notifications";
import type { Notification } from "@/types";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: MOCK_NOTIFICATIONS,
      unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,

      markAllRead: () => {
        // Future: POST /api/notifications/mark-read
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      markRead: (id: string) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length,
          };
        });
      },
    }),
    {
      name: "secrely_notifications",
    }
  )
);
