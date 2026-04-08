"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Users, ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/useT";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface CreatorCardProps {
  creator: Profile;
  index?: number;
}

export function CreatorCard({ creator, index = 0 }: CreatorCardProps) {
  const t = useT().creatorCard;
  const displayName = creator.display_name ?? creator.username ?? "Creator";
  const username = creator.username ?? "";
  const avatarUrl = creator.avatar_url ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/creator/${username}`} className="block group">
        <div className="card-base overflow-hidden hover:shadow-card-hover transition-shadow duration-300">
          {/* Cover placeholder */}
          <div className="relative h-28 bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {creator.is_verified && (
              <div className="absolute top-2.5 right-2.5">
                <span className="w-5 h-5 rounded-full purple-gradient flex items-center justify-center shadow">
                  <span className="text-white text-[9px] font-bold">✓</span>
                </span>
              </div>
            )}
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-end justify-between -mt-6 mb-3">
              <Avatar className="w-12 h-12 ring-3 ring-white shadow-md">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-sm">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="purple" className="h-8 text-xs" asChild>
                <Link href={`/creator/${username}`}>{t.follow}</Link>
              </Button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground truncate">{displayName}</span>
                {creator.is_verified && <CheckCircle className="w-3.5 h-3.5 text-[hsl(270,75%,60%)] flex-shrink-0" />}
              </div>
              {username && <div className="text-xs text-muted-foreground">@{username}</div>}
              {creator.bio && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{creator.bio}</p>}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              <Badge variant="purple" className="text-[10px]">Creator</Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
