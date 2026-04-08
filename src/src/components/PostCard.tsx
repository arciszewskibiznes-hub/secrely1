"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Eye, Lock, Unlock, Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UnlockModal } from "@/components/UnlockModal";
import { useUnlocked } from "@/hooks/useUnlocked";
import { formatNumber, timeAgo, getInitials } from "@/lib/utils";
import { interpolate, useT } from "@/hooks/useT";
import type { Post } from "@/types/database";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export function PostCard({ post, compact = false }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [showUnlock, setShowUnlock] = useState(false);
  const { isUnlocked } = useUnlocked();
  const t = useT().postCard;

  const unlocked = !post.is_locked || isUnlocked(post.id);
  const creator = post.creator;
  const creatorName = creator?.display_name ?? creator?.username ?? "Creator";
  const creatorUsername = creator?.username ?? "";
  const creatorAvatar = creator?.avatar_url ?? "";
  const tags: string[] = post.tags ?? [];

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="card-base overflow-hidden group"
      >
        {/* Creator header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Link href={`/creator/${creatorUsername}`} tabIndex={-1}>
            <Avatar className="w-9 h-9 ring-2 ring-transparent hover:ring-purple-200 transition-all">
              <AvatarImage src={creatorAvatar} alt={creatorName} />
              <AvatarFallback className="text-xs">{getInitials(creatorName)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/creator/${creatorUsername}`} className="flex items-center gap-1.5 group/creator">
              <span className="text-sm font-semibold text-foreground group-hover/creator:text-[hsl(270,75%,60%)] transition-colors truncate">
                {creatorName}
              </span>
              {creator?.is_verified && (
                <span className="w-3.5 h-3.5 rounded-full purple-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[8px] font-bold">✓</span>
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">@{creatorUsername}</span>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            </div>
          </div>
          {post.is_locked && (
            <Badge variant={unlocked ? "success" : "purple"} className="flex items-center gap-1 flex-shrink-0">
              {unlocked ? (
                <><Unlock className="w-2.5 h-2.5" /> {t.unlocked}</>
              ) : (
                <><Lock className="w-2.5 h-2.5" /> {post.price} cr</>
              )}
            </Badge>
          )}
        </div>

        {/* Image */}
        {post.image_url && (
          <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.teaser_text ?? "Post image"}
              fill
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-[1.02]",
                post.is_locked && !unlocked && "locked-blur"
              )}
              sizes="(max-width: 640px) 100vw, 600px"
            />
            {post.is_locked && !unlocked && (
              <div className="absolute inset-0 locked-overlay flex flex-col items-center justify-center gap-3 px-6">
                <div className="w-12 h-12 rounded-2xl purple-gradient flex items-center justify-center shadow-lg purple-glow">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{t.premiumContent}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {interpolate(t.unlockFor, { price: post.price })}
                  </p>
                </div>
                {/* Use plain button — not Button asChild — to avoid nested <a> */}
                <button
                  onClick={(e) => { e.preventDefault(); setShowUnlock(true); }}
                  className="mt-1 h-8 px-4 text-xs font-semibold rounded-xl purple-gradient text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  {t.unlockNow}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        <div className="px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed line-clamp-2">
            {unlocked
              ? (post.caption ?? post.teaser_text ?? "")
              : (post.teaser_text ?? post.caption ?? "")}
          </p>
          {!compact && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-[hsl(270,75%,60%)] bg-purple-50 rounded-full px-2.5 py-0.5 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-all",
                liked ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("w-4 h-4 transition-all", liked && "fill-current scale-110")} />
              <span className="tabular-nums">{formatNumber(likeCount)}</span>
            </button>
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="tabular-nums">{formatNumber(post.comment_count ?? 0)}</span>
            </Link>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="tabular-nums">{formatNumber(post.view_count ?? 0)}</span>
            </span>
          </div>
          <button className="text-muted-foreground hover:text-[hsl(270,75%,60%)] transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <UnlockModal open={showUnlock} onClose={() => setShowUnlock(false)} post={post} />
    </>
  );
}
