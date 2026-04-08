"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Compass, MessageCircle, LayoutDashboard, User,
  Bell, Wallet, Settings, Shield, PlusSquare, Search, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, getDisplayName, getUsername } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LangToggle } from "@/components/LangToggle";
import { getInitials, formatCredits } from "@/lib/utils";
import { useT } from "@/hooks/useT";

import { isAdmin } from "@/lib/admin";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { Diamond } from "@/components/Diamond";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { badge } = useUnreadNotifications();
  const { balance } = useCredits();
  const t = useT().nav;

  const navItems: { href: string; icon: React.ElementType; label: string; badge?: string }[] = [
    { href: "/feed", icon: Home, label: t.home },
    { href: "/explore", icon: Compass, label: t.explore },
    { href: "/search", icon: Search, label: "Szukaj" },
    { href: "/following", icon: Users, label: "Obserwowani" },
    { href: "/messages", icon: MessageCircle, label: t.messages },
    { href: "/notifications", icon: Bell, label: t.notifications, badge },
    { href: "/wallet", icon: Wallet, label: t.wallet },
    { href: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { href: "/dashboard/new-post", icon: PlusSquare, label: t.newPost },
    { href: "/profile", icon: User, label: t.profile },
    { href: "/settings", icon: Settings, label: t.settings },
    ...(isAdmin(profile?.id) ? [{ href: "/admin", icon: Shield, label: t.moderation }] : []),
  ];

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);
  const avatarUrl = profile?.avatar_url ?? "";

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-border bg-white z-30 py-6 px-3">
      <Link href="/feed" className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-xl purple-gradient flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold tracking-tight">S</span>
        </div>
        <span className="font-display font-semibold text-lg text-foreground tracking-tight">
          Secrely
        </span>
      </Link>

      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-purple-50 text-[hsl(270,75%,60%)]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon
                style={{ width: 18, height: 18 }}
                className={cn(isActive ? "stroke-[2.5px]" : "stroke-[1.75px]")}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Credits */}
      <Link
        href="/wallet"
        className="mb-4 flex items-center gap-2.5 bg-purple-50 hover:bg-purple-100 rounded-xl px-3 py-3 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg purple-gradient flex items-center justify-center">
          <Diamond size={14} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t.wallet}</div>
          <div className="text-sm font-semibold text-[hsl(270,75%,60%)] tabular-nums">
            {formatCredits(balance)}
          </div>
        </div>
      </Link>

      {/* Language toggle */}
      <div className="flex items-center justify-between px-3 mb-3">
        <span className="text-xs text-muted-foreground font-medium">Language</span>
        <LangToggle />
      </div>

      {/* User profile */}
      <Link
        href="/profile"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors"
      >
        <Avatar className="w-9 h-9">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{displayName}</div>
          <div className="text-xs text-muted-foreground truncate">@{username}</div>
        </div>
      </Link>
    </aside>
  );
}
