"use client";

import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useT, interpolate } from "@/hooks/useT";
import { formatNumber, timeAgo, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const supabase = createClient();

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { post, isLoading } = usePost(params.id);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [sendingComment, setSendingComment] = useState(false);
  const { isUnlocked } = useUnlocked();
  const { user } = useAuth();
  const t = useT().postDetail;
  const bottomRef = useRef<HTMLDivElement>(null);

  const unlocked = !post?.is_locked || isUnlocked(post?.id ?? "");
  const currentLikeCount = likeCount ?? (post?.like_count ?? 0);

  // Load like state
  useEffect(() => {
    if (!user?.id || !post?.id) return;
    supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setLiked(true); });
  }, [user?.id, post?.id]);

  // Load comments
  useEffect(() => {
    if (!params.id) return;
    supabase
      .from("post_comments")
      .select("id, content, created_at, user_id")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true })
      .then(async ({ data }) => {
        if (!data || data.length === 0) return;
        // Fetch author profiles
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", userIds);
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        setComments(data.map((c) => {
          const profile = profileMap.get(c.user_id);
          return {
            ...c,
            author_name: profile?.display_name ?? profile?.username ?? "User",
            author_avatar: profile?.avatar_url ?? "",
          };
        }));
      });
  }, [params.id]);

  const handleLike = async () => {
    if (!user?.id || !post?.id) return;
    if (liked) {
      setLiked(false);
      setLikeCount(currentLikeCount - 1);
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      await supabase.from("posts").update({ like_count: Math.max(0, currentLikeCount - 1) }).eq("id", post.id);
    } else {
      setLiked(true);
      setLikeCount(currentLikeCount + 1);
      await supabase.from("post_likes").upsert({ post_id: post.id, user_id: user.id }, { onConflict: "post_id,user_id" });
      await supabase.from("posts").update({ like_count: currentLikeCount + 1 }).eq("id", post.id);
    }
  };

  const handleSendComment = async () => {
    if (!comment.trim() || !user?.id || !post?.id) return;
    setSendingComment(true);

    const { data: profile } = await supabase.from("profiles").select("display_name, username, avatar_url").eq("id", user.id).single();

    const { data: newComment } = await supabase
      .from("post_comments")
      .insert({ post_id: post.id, user_id: user.id, content: comment.trim() })
      .select("id, content, created_at, user_id")
      .single();

    if (newComment) {
      setComments((prev) => [...prev, {
        ...newComment,
        author_name: profile?.display_name ?? profile?.username ?? "User",
        author_avatar: profile?.avatar_url ?? "",
      }]);
      // Update comment count
      await supabase.from("posts").update({ comment_count: (post.comment_count ?? 0) + 1 }).eq("id", post.id);
      setComment("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setSendingComment(false);
  };

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

  const creator = post.creator;
  const creatorName = creator?.display_name ?? creator?.username ?? "Creator";
  const creatorUsername = creator?.username ?? "";
  const creatorAvatar = creator?.avatar_url ?? "";
  const tags: string[] = post.tags ?? [];

  return (
    <>
      <div className="space-y-4">
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backToFeed}
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="card-base overflow-hidden">
          {/* Creator */}
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

          {/* Image */}
          {post.image_url && (
            <div className="relative aspect-square bg-secondary">
              <Image
                src={post.image_url}
                alt={post.teaser_text ?? ""}
                fill
                className={cn("object-cover", post.is_locked && !unlocked && "locked-blur")}
                sizes="(max-width: 640px) 100vw, 640px"
                priority
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

          {/* Actions */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleLike}
                className={cn("flex items-center gap-1.5 text-sm transition-all", liked ? "text-rose-500" : "text-muted-foreground hover:text-foreground")}>
                <Heart className={cn("w-5 h-5", liked && "fill-current scale-110")} />
                <span>{formatNumber(currentLikeCount)}</span>
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                <span>{formatNumber(comments.length)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye className="w-5 h-5" />
                <span>{formatNumber(post.view_count ?? 0)}</span>
              </span>
            </div>
            <button className="text-muted-foreground hover:text-[hsl(270,75%,60%)] transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
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
          <h3 className="text-sm font-semibold text-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h3>

          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={c.author_avatar} />
                    <AvatarFallback className="text-xs">{getInitials(c.author_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Add a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
              className="flex-1"
              disabled={sendingComment}
            />
            <Button size="icon" variant="purple" disabled={!comment.trim() || sendingComment} onClick={handleSendComment}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {post && <UnlockModal open={showUnlock} onClose={() => setShowUnlock(false)} post={post} />}
    </>
  );
}
