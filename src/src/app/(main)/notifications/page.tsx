"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, UserPlus, Lock, Zap, DollarSign, CheckCheck, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useT, interpolate } from "@/hooks/useT";
import { timeAgo, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Notification type (future: fetch from Supabase notifications table)
interface AppNotification {
  id: string;
  type: "like" | "comment" | "follow" | "unlock" | "new_post" | "tip";
  fromName: string;
  fromAvatar: string;
  fromUsername: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const iconMap: Record<AppNotification["type"], { icon: React.ElementType; color: string; bg: string }> = {
  like: { icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50" },
  follow: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-50" },
  unlock: { icon: Lock, color: "text-[hsl(270,75%,60%)]", bg: "bg-purple-50" },
  new_post: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  tip: { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
};

// Seed notifications — replace with Supabase query when notifications table is ready
const SEED: AppNotification[] = [
  {
    id: "n1",
    type: "new_post",
    fromName: "Luna Chen",
    fromAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b69c?w=50&h=50&fit=crop&crop=faces",
    fromUsername: "luna_visuals",
    message: "Luna Chen posted new exclusive content: The golden hour shoot",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "n2",
    type: "follow",
    fromName: "Marco Di Vito",
    fromAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=faces",
    fromUsername: "marco_lifestyle",
    message: "Marco Di Vito started following you",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "n3",
    type: "like",
    fromName: "Sophia Nakamura",
    fromAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=50&h=50&fit=crop&crop=faces",
    fromUsername: "sophia_art",
    message: "Sophia Nakamura liked your comment",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "n4",
    type: "tip",
    fromName: "Rafael Santos",
    fromAvatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=50&h=50&fit=crop&crop=faces",
    fromUsername: "rafael_fitness",
    message: "Someone sent you a 50 credit tip 🎉",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED);
  const t = useT().notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const markAll = () => setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
  const markOne = (id: string) => setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, isRead: true } : n));

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{interpolate(t.unread, { count: unreadCount })}</span>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAll} className="text-xs gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" /> {t.markAll}
          </Button>
        )}
      </div>

      {unread.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{t.newSection}</h3>
          <div className="card-base divide-y divide-border overflow-hidden">
            {unread.map((notif, i) => <NotifItem key={notif.id} notif={notif} onRead={() => markOne(notif.id)} index={i} />)}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{t.earlierSection}</h3>
          <div className="card-base divide-y divide-border overflow-hidden">
            {read.map((notif, i) => <NotifItem key={notif.id} notif={notif} onRead={() => {}} index={i} />)}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications yet"
          description="When someone likes, follows, or messages you, you will see it here."
        />
      )}
    </div>
  );
}

function NotifItem({ notif, onRead, index }: { notif: AppNotification; onRead: () => void; index: number }) {
  const { icon: Icon, color, bg } = iconMap[notif.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onRead}
      className={cn("flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-secondary/60 transition-colors", !notif.isRead && "bg-purple-50/50")}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={notif.fromAvatar} />
          <AvatarFallback className="text-xs">{getInitials(notif.fromName)}</AvatarFallback>
        </Avatar>
        <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white", bg)}>
          <Icon className={cn("w-2.5 h-2.5", color)} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{notif.message}</p>
        <span className="text-xs text-muted-foreground mt-0.5 block">{timeAgo(notif.createdAt)}</span>
      </div>
      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[hsl(270,75%,60%)] flex-shrink-0 mt-1.5" />}
    </motion.div>
  );
}
