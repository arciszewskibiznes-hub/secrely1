"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

export function BottomNav() {
  const pathname = usePathname();
  const t = useT().nav;

  const navItems = [
    { href: "/feed", icon: Home, label: t.home },
    { href: "/explore", icon: Compass, label: t.explore },
    { href: "/messages", icon: MessageCircle, label: t.messages },
    { href: "/dashboard", icon: LayoutDashboard, label: t.dashboard },
    { href: "/profile", icon: User, label: t.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (href !== "/feed" && pathname?.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                isActive
                  ? "text-[hsl(270,75%,60%)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(270,75%,60%)]" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-semibold"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
