"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, MessageCircle, Eye, Lock, Bookmark, Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UnlockModal } from "@/components/UnlockModal";
import { usePost } from "@/hooks/usePosts";
import { useUnlocked } from "@/hooks/useUnlocked";
import { useT, interpolate } from "@/hooks/useT";
import { formatNumber, timeAgo, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MOCK_COMMENTS = [
  { id: "c1", author: "Maya L.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=faces", text: "This is absolutely stunning. The light work here is unreal.", time: "2h ago" },
  { id: "c2", author: "James K.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=faces", text: "Been following your work for 2 years — this might be your best yet.", time: "4h ago" },
];

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { post, isLoading } = usePost(params.id);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [comment, setComment] = useState("");
  const { isUnlocked } = useUnlocked();
  const t = useT().postDetail;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-24 bg-secondary rounded" />
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-secondary" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="h-3 w-20 bg-secondary rounded" />
            </div>
          </div>
          <div className="aspect-square bg-secondary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Post not found</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/feed">Back to feed</Link>
        </Button>
      </div>
    );
  }

  const unlocked = !post.is_locked || isUnlocked(post.id);
  const creator = post.creator;
  const creatorName = creator?.display_name ?? creator?.username ?? "Creator";
  const creatorUsername = creator?.username ?? "";
  const creatorAvatar = creator?.avatar_url ?? "";
  const currentLikeCount = likeCount ?? (post.like_count ?? 0);
  const tags: string[] = post.tags ?? [];

  return (
    <>
      <div className="space-y-4">
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backToFeed}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="card-base overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4">
            <Link href={`/creator/${creatorUsername}`}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={creatorAvatar} />
                <AvatarFallback>{getInitials(creatorName)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link href={`/creator/${creatorUsername}`} className="text-sm font-semibold hover:text-[hsl(270,75%,60%)] transition-colors">
                {creatorName}
              </Link>
              <div className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</div>
            </div>
            {post.is_locked && (
              <Badge variant={unlocked ? "success" : "purple"}>
                {unlocked ? "Unlocked" : `${post.price} credits`}
              </Badge>
            )}
          </div>

          {post.image_url && (
            <div className="relative aspect-square bg-secondary">
              <Image
                src={post.image_url}
                alt={post.teaser_text ?? ""}
                fill
                className={cn("object-cover", post.is_locked && !unlocked && "locked-blur")}
                sizes="(max-width: 640px) 100vw, 640px"
              />
              {post.is_locked && !unlocked && (
                <div className="absolute inset-0 locked-overlay flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-2xl purple-gradient flex items-center justify-center shadow-lg purple-glow">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{t.premiumContent}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{interpolate(t.unlockFor, { price: post.price })}</p>
                  </div>
                  <Button variant="purple" onClick={() => setShowUnlock(true)}>{t.unlockNow}</Button>
                </div>
              )}
            </div>
          )}

          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setLiked((l) => !l); setLikeCount(liked ? currentLikeCount - 1 : currentLikeCount + 1); }}
                className={cn("flex items-center gap-1.5 text-sm transition-all", liked ? "text-rose-500" : "text-muted-foreground hover:text-foreground")}
              >
                <Heart className={cn("w-5 h-5", liked && "fill-current scale-110")} />
                <span>{formatNumber(currentLikeCount)}</span>
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-5 h-5" /><span>{formatNumber(post.comment_count ?? 0)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye className="w-5 h-5" /><span>{formatNumber(post.view_count ?? 0)}</span>
              </span>
            </div>
            <button className="text-muted-foreground hover:text-[hsl(270,75%,60%)] transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 pb-3">
            <p className="text-sm text-foreground leading-relaxed">
              {unlocked ? (post.caption ?? post.teaser_text ?? "") : (post.teaser_text ?? post.caption ?? "")}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag) => (
                  <span key={tag} className="text-xs text-[hsl(270,75%,60%)] bg-purple-50 rounded-full px-2.5 py-0.5 font-medium">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Comments */}
        <div className="card-base p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{interpolate(t.comments, { count: post.comment_count ?? 0 })}</h3>
          <div className="space-y-4">
            {MOCK_COMMENTS.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={c.avatar} /><AvatarFallback className="text-xs">{c.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{c.author}</span>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input placeholder={t.commentPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} className="flex-1" />
            <Button size="icon" variant="purple" disabled={!comment.trim()} onClick={() => setComment("")}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {post && <UnlockModal open={showUnlock} onClose={() => setShowUnlock(false)} post={post} />}
    </>
  );
}
