// Auto-generated types matching your Supabase schema
// Run `npx supabase gen types typescript` to regenerate after schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_creator: boolean;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_creator?: boolean;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_creator?: boolean;
          is_verified?: boolean;
        };
      };
      credit_balances: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: {
          balance?: number;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "purchase" | "spend" | "tip" | "earning";
          description: string | null;
          post_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: "purchase" | "spend" | "tip" | "earning";
          description?: string | null;
          post_id?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      posts: {
        Row: {
          id: string;
          creator_id: string;
          image_url: string | null;
          caption: string | null;
          teaser_text: string | null;
          price: number;
          is_locked: boolean;
          like_count: number;
          comment_count: number;
          view_count: number;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          image_url?: string | null;
          caption?: string | null;
          teaser_text?: string | null;
          price?: number;
          is_locked?: boolean;
          like_count?: number;
          comment_count?: number;
          view_count?: number;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          image_url?: string | null;
          caption?: string | null;
          teaser_text?: string | null;
          price?: number;
          is_locked?: boolean;
        };
      };
      unlocked_posts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: never;
      };
      chats: {
        Row: {
          id: string;
          user1: string;
          user2: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user1: string;
          user2: string;
          created_at?: string;
        };
        Update: never;
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: never;
      };
      payouts: {
        Row: {
          id: string;
          user_id: string;
          credits: number;
          amount_pln: number;
          iban: string;
          full_name: string;
          address: string | null;
          status: "pending" | "paid" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credits: number;
          amount_pln: number;
          iban: string;
          full_name: string;
          address?: string | null;
          status?: "pending" | "paid" | "rejected";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "paid" | "rejected";
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Convenient Row aliases ─────────────────────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  creator: Profile; // joined
};
export type CreditBalance = Database["public"]["Tables"]["credit_balances"]["Row"];
export type CreditTransaction = Database["public"]["Tables"]["credit_transactions"]["Row"];
export type UnlockedPost = Database["public"]["Tables"]["unlocked_posts"]["Row"];
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender?: Profile; // joined
};
export type Payout = Database["public"]["Tables"]["payouts"]["Row"];

// ── App-level helpers ─────────────────────────────────────────────────────────
export interface Conversation {
  chat_id: string;
  participant: Profile;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  label: string;
  popular?: boolean;
  bonus?: number;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
}
