"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Lock, Bell, CheckCheck } from "lucide-react";
import { Diamond } from "@/components/Diamond";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { setUnreadCount } from "@/hooks/useNotifications";
import { timeAgo, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const supabase = createClient();

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "unlock" | "tip";
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  post: {
    caption: string | null;
    teaser_text: string | null;
    image_url: string | null;
  } | null;
}

const TYPE_CONFIG = {
  like:    { icon: Heart,          color: "text-rose-500",    bg: "bg-rose-50",    label: (name: string) => `${name} polubił(a) Twój post` },
  comment: { icon: MessageCircle,  color: "text-blue-500",    bg: "bg-blue-50",    label: (name: string) => `${name} skomentował(a) Twój post` },
  follow:  { icon: Bell,           color: "text-emerald-500", bg: "bg-emerald-50", label: (name: string) => `${name} zaczął(ęła) Cię obserwować` },
  unlock:  { icon: Lock,           color: "text-purple-500",  bg: "bg-purple-50",  label: (name: string) => `${name} odblokował(a) Twój post` },
  tip:     { icon: Diamond,         color: "text-amber-500",   bg: "bg-amber-50",   label: (name: string) => `${name} wysłał(a) Ci napiwek` },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    // Fetch notifications with actor profiles and post info
    const { data } = await supabase
      .from("notifications")
      .select("id, type, is_read, created_at, post_id, actor_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!data || data.length === 0) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    // Fetch actor profiles
    const actorIds = [...new Set(data.map((n) => n.actor_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", actorIds);

    // Fetch post info
    const postIds = [...new Set(data.map((n) => n.post_id).filter(Boolean))] as string[];
    let postMap = new Map<string, { caption: string | null; teaser_text: string | null; image_url: string | null }>();
    if (postIds.length > 0) {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, caption, teaser_text, image_url")
        .in("id", postIds);
      postMap = new Map((posts ?? []).map((p) => [p.id, p]));
    }

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const mapped: Notification[] = data.map((n) => ({
      id: n.id,
      type: n.type as Notification["type"],
      is_read: n.is_read,
      created_at: n.created_at,
      post_id: n.post_id,
      actor: profileMap.get(n.actor_id) ?? null,
      post: n.post_id ? postMap.get(n.post_id) ?? null : null,
    }));

    setNotifications(mapped);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Mark all as read
  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Mark single as read on click
  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 card-base animate-pulse">
            <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 bg-secondary rounded" />
              <div className="h-3 w-24 bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : "Wszystkie przeczytane"}
        </span>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" /> Oznacz wszystkie
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-[hsl(270,75%,60%)]" />
          </div>
          <p className="text-sm font-medium text-foreground">Brak powiadomień</p>
          <p className="text-xs text-muted-foreground mt-1">
            Gdy ktoś polubi lub skomentuje Twój post, zobaczysz to tutaj.
          </p>
        </div>
      ) : (
        <div className="card-base divide-y divide-border overflow-hidden">
          {notifications.map((notif, i) => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;
            const actorName = notif.actor?.display_name ?? notif.actor?.username ?? "Ktoś";
            const actorAvatar = notif.actor?.avatar_url ?? "";
            const postTitle = notif.post?.caption ?? notif.post?.teaser_text ?? "post";

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                onClick={() => !notif.is_read && markRead(notif.id)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-secondary/60 transition-colors",
                  !notif.is_read && "bg-purple-50/50"
                )}
              >
                {/* Avatar z ikoną */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={actorAvatar} />
                    <AvatarFallback className="text-xs">{getInitials(actorName)}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white",
                    config.bg
                  )}>
                    <Icon className={cn("w-2.5 h-2.5", config.color)} />
                  </div>
                </div>

                {/* Treść */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-semibold">{actorName}</span>{" "}
                    {notif.type === "like" && "polubił(a) Twój post"}
                    {notif.type === "comment" && "skomentował(a) Twój post"}
                    {notif.type === "follow" && <span className="font-medium">zaczął(a) Cię obserwować</span>}
                    {notif.type === "unlock" && "odblokował(a) Twój post"}
                    {notif.type === "tip" && <span>wysłał(a) Ci napiwek <span className="inline-flex items-center gap-0.5 font-bold text-amber-600"><Diamond size={10} className="text-amber-500" /></span></span>}
                    {notif.post && notif.type !== "follow" && (
                      <span className="text-muted-foreground">
                        {" "}— <span className="italic">{postTitle.slice(0, 40)}{postTitle.length > 40 ? "…" : ""}</span>
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>

                {/* Unread dot */}
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-[hsl(270,75%,60%)] flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
