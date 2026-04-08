"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Diamond } from "@/components/Diamond";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LangToggle } from "@/components/LangToggle";
import { useAuth, getDisplayName } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { getInitials, formatCredits } from "@/lib/utils";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

export function Header() {
  const { profile } = useAuth();
  const { balance } = useCredits();
  const pathname = usePathname();
  const t = useT().nav;

  const getTitle = () => {
    if (pathname === "/feed") return t.home;
    if (pathname === "/explore") return t.explore;
    if (pathname === "/messages") return t.messages;
    if (pathname === "/notifications") return t.notifications;
    if (pathname === "/wallet") return t.wallet;
    if (pathname === "/dashboard") return t.dashboard;
    if (pathname === "/settings") return t.settings;
    if (pathname === "/admin") return t.moderation;
    if (pathname === "/profile") return t.profile;
    if (pathname?.startsWith("/creator/")) return t.creator;
    return "Secrely";
  };

  const displayName = getDisplayName(profile);
  const avatarUrl = profile?.avatar_url ?? "";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / Title — plain <div> to avoid nested links */}
        <Link href="/feed" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg purple-gradient flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold tracking-tight">S</span>
          </div>
          <span
            className={cn(
              "font-display font-semibold text-foreground tracking-tight",
              pathname === "/feed" ? "hidden sm:block" : "block"
            )}
          >
            {getTitle()}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Credit badge — NOT a link inside another link */}
          <Link
            href="/wallet"
            className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 transition-colors"
          >
            <Diamond size={13} className="text-purple-600" />
            <span className="text-xs font-semibold tabular-nums">{formatCredits(balance)}</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>

          {/* Language toggle */}
          <LangToggle variant="button" />

          {/* Avatar */}
          <Link href="/profile" aria-label="Profile">
            <Avatar className="w-8 h-8 ring-2 ring-purple-100 hover:ring-purple-300 transition-all">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
