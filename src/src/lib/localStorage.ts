// localStorage helpers — replace with API calls in production

const PREFIX = "secrely_";

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PREFIX + key);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

// Specific storage keys
export const STORAGE_KEYS = {
  AUTH_USER: "auth_user",
  CREDITS: "credits",
  UNLOCKED_POSTS: "unlocked_posts",
  NOTIFICATIONS_READ: "notifications_read",
  MESSAGES_READ: "messages_read",
  SUBSCRIPTIONS: "subscriptions",
} as const;
