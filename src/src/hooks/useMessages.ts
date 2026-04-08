"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Message, Conversation, Profile } from "@/types/database";

const supabase = createClient();

const EMPTY_PROFILE: Profile = {
  id: "",
  username: null,
  display_name: null,
  avatar_url: null,
  bio: null,
  is_creator: false,
  is_verified: false,
  created_at: "",
};

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    // Single query: fetch chats with both user profiles joined.
    // user1_profile and user2_profile are joined via the FK columns.
    const { data: chats, error } = await supabase
      .from("chats")
      .select(`
        id,
        user1,
        user2,
        created_at,
        user1_profile:profiles!user1(id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at),
        user2_profile:profiles!user2(id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at)
      `)
      .or(`user1.eq.${user.id},user2.eq.${user.id}`);

    if (error || !chats || !mountedRef.current) {
      setIsLoading(false);
      return;
    }

    // For each chat, get the last message (one query per chat is unavoidable,
    // but we batch them with Promise.all so it runs in parallel, not serial)
    const lastMessages = await Promise.all(
      chats.map((chat) =>
        supabase
          .from("messages")
          .select("content, created_at")
          .eq("chat_id", chat.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data }) => ({ chatId: chat.id, last: data?.[0] ?? null }))
      )
    );

    const lastMsgMap = Object.fromEntries(
      lastMessages.map(({ chatId, last }) => [chatId, last])
    );

    const convs: Conversation[] = chats.map((chat) => {
      const isUser1 = chat.user1 === user.id;
      // Supabase returns joined rows as objects (not arrays) when using .single() semantics
      // but with select joins it may return array or object depending on relation type.
      // We normalise both cases:
      const participantRaw = isUser1
        ? (chat as Record<string, unknown>).user2_profile
        : (chat as Record<string, unknown>).user1_profile;
      const participant: Profile = (
        Array.isArray(participantRaw) ? participantRaw[0] : participantRaw
      ) ?? { ...EMPTY_PROFILE, id: isUser1 ? chat.user2 : chat.user1 };

      const last = lastMsgMap[chat.id];

      return {
        chat_id: chat.id,
        participant,
        last_message: last?.content ?? null,
        last_message_at: last?.created_at ?? chat.created_at,
        unread_count: 0,
      } satisfies Conversation;
    });

    convs.sort((a, b) =>
      (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "")
    );

    if (mountedRef.current) {
      setConversations(convs);
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) load();
    else setIsLoading(false);
  }, [user?.id, load]);

  return { conversations, isLoading, refresh: load };
}

const MSG_SELECT = `
  id, chat_id, sender_id, content, created_at,
  sender:profiles!sender_id(id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at)
`;

export function useChatMessages(chatId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("messages")
      .select(MSG_SELECT)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (mountedRef.current) {
      setMessages((data ?? []) as Message[]);
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    loadMessages();

    // Clean up previous channel
    channelRef.current?.unsubscribe();

    channelRef.current = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch new message with sender profile
          const { data } = await supabase
            .from("messages")
            .select(MSG_SELECT)
            .eq("id", payload.new.id)
            .single();
          if (data && mountedRef.current) {
            setMessages((prev) => {
              // Deduplicate — might have already been added optimistically
              const exists = prev.some((m) => m.id === data.id);
              return exists ? prev : [...prev, data as Message];
            });
          }
        }
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [chatId, loadMessages]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!chatId || !user?.id || !content.trim()) return false;

    // Optimistic update with a temp id
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      chat_id: chatId,
      sender_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      content: content.trim(),
    });

    if (error) {
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      return false;
    }
    return true;
  }, [chatId, user?.id]);

  return { messages, isLoading, sendMessage };
}

export async function getOrCreateChat(userId: string, participantId: string): Promise<string> {
  // Check both directions
  const { data: existing } = await supabase
    .from("chats")
    .select("id")
    .or(
      `and(user1.eq.${userId},user2.eq.${participantId}),and(user1.eq.${participantId},user2.eq.${userId})`
    )
    .limit(1)
    .single();

  if (existing?.id) return existing.id;

  const { data: newChat, error } = await supabase
    .from("chats")
    .insert({ user1: userId, user2: participantId })
    .select("id")
    .single();

  if (error || !newChat) throw new Error(`Failed to create chat: ${error?.message}`);
  return newChat.id;
}
