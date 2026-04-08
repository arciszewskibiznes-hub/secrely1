"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useConversations, useChatMessages } from "@/hooks/useMessages";
import { useAuth, getDisplayName, getUsername } from "@/hooks/useAuth";
import { useT, interpolate } from "@/hooks/useT";
import { timeAgo, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, isLoading: convsLoading } = useConversations();
  const { messages, sendMessage } = useChatMessages(activeChatId);
  const { user } = useAuth();
  const t = useT().messages;

  const activeConv = conversations.find((c) => c.chat_id === activeChatId);

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = getDisplayName(c.participant).toLowerCase();
    const uname = getUsername(c.participant).toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || uname.includes(q);
  });

  const handleSend = async () => {
    if (!messageText.trim() || !activeChatId) return;
    const ok = await sendMessage(messageText);
    if (ok) setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-9rem)]">
      {/* Conversation list */}
      <div
        className={cn(
          "flex flex-col gap-2 w-full md:w-72 flex-shrink-0",
          activeChatId && "hidden md:flex"
        )}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {convsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-secondary rounded" />
                  <div className="h-3 w-40 bg-secondary rounded" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filtered.map((conv) => {
              const name = getDisplayName(conv.participant);
              const avatarUrl = conv.participant.avatar_url ?? "";
              return (
                <motion.button
                  key={conv.chat_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveChatId(conv.chat_id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-secondary",
                    activeChatId === conv.chat_id && "bg-purple-50 hover:bg-purple-50"
                  )}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">{name}</span>
                      {conv.last_message_at && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.last_message ?? "Start a conversation"}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 flex-shrink-0 bg-[hsl(270,75%,60%)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeChatId && activeConv ? (
        <div className="flex-1 flex flex-col card-base overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <button
              onClick={() => setActiveChatId(null)}
              className="md:hidden text-sm text-muted-foreground hover:text-foreground"
            >
              {t.back}
            </button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={activeConv.participant.avatar_url ?? ""} />
              <AvatarFallback className="text-xs">
                {getInitials(getDisplayName(activeConv.participant))}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">
                {getDisplayName(activeConv.participant)}
              </div>
              <div className="text-xs text-muted-foreground">{t.online}</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                icon={<Send className="w-6 h-6" />}
                title={t.startConv}
                description={interpolate(t.startDesc, {
                  name: getDisplayName(activeConv.participant),
                })}
              />
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                const senderName = getDisplayName(
                  (msg as { sender?: { display_name?: string | null; username?: string | null } }).sender ?? null
                );
                const senderAvatar =
                  (msg as { sender?: { avatar_url?: string | null } }).sender?.avatar_url ?? "";
                return (
                  <div key={msg.id} className={cn("flex gap-2", isMe && "flex-row-reverse")}>
                    {!isMe && (
                      <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                        <AvatarImage src={senderAvatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isMe
                          ? "bg-[hsl(270,75%,60%)] text-white rounded-tr-sm"
                          : "bg-secondary text-foreground rounded-tl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              placeholder={interpolate(t.placeholder, {
                name: getDisplayName(activeConv.participant),
              })}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="purple"
              disabled={!messageText.trim()}
              onClick={handleSend}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 card-base items-center justify-center">
          <EmptyState
            icon={<Send className="w-6 h-6" />}
            title={t.selectConv}
            description={t.selectDesc}
          />
        </div>
      )}
    </div>
  );
}
