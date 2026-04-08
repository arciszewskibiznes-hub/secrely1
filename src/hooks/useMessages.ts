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

    // Fetch chats via RPC to bypass schema cache issues with joins
    const { data: chats, error } = await supabase
      .from("chats")
      .select("id, user1, user2, created_at")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error || !chats || chats.length === 0 || !mountedRef.current) {
      if (mountedRef.current) setIsLoading(false);
      return;
    }

    // Fetch all participant profiles
    const participantIds = chats.map((c) => c.user1 === user.id ? c.user2 : c.user1);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at")
      .in("id", participantIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    // Fetch last messages in parallel
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
      const participantId = chat.user1 === user.id ? chat.user2 : chat.user1;
      const participant: Profile = profileMap.get(participantId) ?? {
        ...EMPTY_PROFILE, id: participantId,
      };
      const last = lastMsgMap[chat.id];
      // Parse PPV message for friendly display
      let lastMsg = last?.content ?? null;
      if (lastMsg) {
        try {
          const parsed = JSON.parse(lastMsg);
          if (parsed.__ppv) {
            lastMsg = `🔒 Płatne ${parsed.media_type === "video" ? "wideo" : "zdjęcie"} · ${parsed.price} 💎`;
          }
        } catch {}
      }

      return {
        chat_id: chat.id,
        participant,
        last_message: lastMsg,
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

  // Load fresh every time (no cache)
  useEffect(() => {
    if (user?.id) load();
    else setIsLoading(false);
  }, [user?.id, load]);

  // Reload on window focus (e.g. after coming back from tip)
  useEffect(() => {
    const onFocus = () => { if (user?.id) load(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.id, load]);

  return { conversations, isLoading, refresh: load };
}

const MSG_SELECT = "id, chat_id, sender_id, content, media_url, media_type, price, is_ppv, created_at";

export function useChatMessages(chatId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadMessages = useCallback(async (silent = false) => {
    if (!chatId) return;
    if (!silent) setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select(MSG_SELECT)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("loadMessages error:", error.message);
      if (!silent && mountedRef.current) setIsLoading(false);
      return;
    }

    if (!mountedRef.current) return;
    const msgs = (data ?? []) as Message[];

    if (msgs.length !== lastCountRef.current || !silent) {
      lastCountRef.current = msgs.length;

      // Fetch sender profiles separately (avoids schema cache join issues)
      const senderIds = [...new Set(msgs.map((m) => m.sender_id).filter(Boolean))];
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", senderIds);
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        const enriched = msgs.map((m) => ({
          ...m,
          sender: profileMap.get(m.sender_id) ?? null,
        }));
        if (mountedRef.current) setMessages(enriched as Message[]);
      } else {
        if (mountedRef.current) setMessages(msgs);
      }
    }
    if (!silent && mountedRef.current) setIsLoading(false);
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      lastCountRef.current = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    loadMessages(false);

    // Poll every 2 seconds for new messages
    intervalRef.current = setInterval(() => loadMessages(true), 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chatId, loadMessages]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!chatId || !user?.id || !content.trim()) return false;

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
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      return false;
    }
    return true;
  }, [chatId, user?.id]);

  const sendPPV = useCallback(async ({
    content,
    mediaUrl,
    mediaType,
    ppvPrice,
  }: {
    content: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    ppvPrice: number;
  }): Promise<boolean> => {
    if (!chatId || !user?.id) return false;

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      content,
      media_url: mediaUrl,
      media_type: mediaType,
      ppv_price: ppvPrice,
      ppv_unlocked_by: [],
    });

    return !error;
  }, [chatId, user?.id]);

  return { messages, isLoading, sendMessage, sendPPV };
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
