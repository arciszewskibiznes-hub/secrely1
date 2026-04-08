"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bell, MessageCircle, Search, MoreHorizontal, X, Wallet, User, LayoutDashboard, PlusSquare, Settings, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { useAuth, getDisplayName, getUsername } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/admin";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Diamond } from "@/components/Diamond";
import { useCredits } from "@/hooks/useCredits";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT().nav;
  const { badge } = useUnreadNotifications();
  const { profile } = useAuth();
  const { balance } = useCredits();
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { href: "/feed",          icon: Home,          label: t.home },
    { href: "/explore",       icon: Compass,       label: t.explore },
    { href: "/notifications", icon: Bell,          label: t.notifications, badge },
    { href: "/messages",      icon: MessageCircle, label: t.messages },
    { href: "/search",        icon: Search,        label: "Szukaj" },
  ];

  const moreItems = [
    { href: "/wallet",             icon: Wallet,          label: t.wallet ?? "Portfel" },
    { href: "/profile",            icon: User,            label: t.profile ?? "Profil" },
    { href: "/following",          icon: Users,           label: "Obserwowani" },
    { href: "/dashboard",          icon: LayoutDashboard, label: t.dashboard ?? "Panel" },
    { href: "/dashboard/new-post", icon: PlusSquare,      label: t.newPost ?? "Nowy post" },
    { href: "/settings",           icon: Settings,        label: t.settings ?? "Ustawienia" },
    ...(isAdmin(profile?.id) ? [{ href: "/admin", icon: Shield, label: "Moderacja" }] : []),
  ];

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);

  return (
    <>
      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border bottom-nav md:hidden">
        <div className="flex items-center justify-around px-2 h-16">
          {mainItems.map(({ href, icon: Icon, label, badge: itemBadge }) => {
            const isActive = pathname === href || (href !== "/feed" && pathname?.startsWith(href));
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isActive ? "text-[hsl(270,75%,60%)]" : "text-muted-foreground hover:text-foreground"
                )}>
                <div className="relative">
                  <Icon className={cn("w-5 h-5 transition-all", isActive ? "stroke-[2.5px]" : "stroke-[1.75px]")} />
                  {itemBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {itemBadge}
                    </span>
                  )}
                  {isActive && !itemBadge && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(270,75%,60%)]" />
                  )}
                </div>
                <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
              showMore ? "text-[hsl(270,75%,60%)]" : "text-muted-foreground"
            )}>
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">Więcej</span>
          </button>
        </div>
      </nav>

      {/* More drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setShowMore(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl md:hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* User info */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url ?? ""} />
                  <AvatarFallback className="text-sm purple-gradient text-white">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{displayName}</div>
                  <div className="text-xs text-muted-foreground">@{username}</div>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                  <Diamond size={12} className="text-[hsl(270,75%,60%)]" />
                  <span className="text-xs font-bold text-[hsl(270,75%,60%)]">{balance}</span>
                </div>
              </div>

              {/* More nav items — 2 column grid */}
              <div className="grid grid-cols-2 gap-2 p-4">
                {moreItems.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href || (pathname?.startsWith(href) && href !== "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all",
                        isActive
                          ? "bg-purple-50 text-[hsl(270,75%,60%)]"
                          : "bg-gray-50 text-foreground hover:bg-purple-50 hover:text-[hsl(270,75%,60%)]"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Close button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowMore(false)}
                  className="w-full py-3 rounded-2xl bg-gray-100 text-sm font-semibold text-muted-foreground flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Zamknij
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
