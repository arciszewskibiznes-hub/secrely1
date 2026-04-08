"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bookmark, Unlock, Eye, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { SwipeCard, type SwipeDirection } from "@/components/SwipeCard";
import { UnlockModal } from "@/components/UnlockModal";
import { Button } from "@/components/ui/button";
import { useUnlocked } from "@/hooks/useUnlocked";
import { useCredits } from "@/hooks/useCredits";
import { useT, interpolate } from "@/hooks/useT";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/database";

interface SwipeDeckProps {
  posts: Post[];
  onQueueEmpty?: () => void;
}

const MAX_VISIBLE = 3;

export function SwipeDeck({ posts, onQueueEmpty }: SwipeDeckProps) {
  const [queue, setQueue] = useState<Post[]>(posts);
  const [saved, setSaved] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [history, setHistory] = useState<{ post: Post; dir: SwipeDirection }[]>([]);
  const [unlockTarget, setUnlockTarget] = useState<Post | null>(null);
  const [actionHint, setActionHint] = useState<"skip" | "save" | null>(null);

  const { isUnlocked } = useUnlocked();
  const { canAfford } = useCredits();
  const t = useT().explore;

  const currentPost = queue[0] ?? null;

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    const post = queue[0];
    if (!post) return;
    setHistory((h) => [...h, { post, dir: direction }]);
    setQueue((q) => q.slice(1));
    if (direction === "right") {
      setSaved((s) => [...s, post.id]);
      const name = post.creator?.display_name ?? post.creator?.username ?? "Creator";
      toast({ title: "Saved!", description: name, variant: "success" });
    } else {
      setSkipped((s) => [...s, post.id]);
    }
    if (queue.length <= 1) onQueueEmpty?.();
  }, [queue, onQueueEmpty]);

  const triggerSwipe = (direction: SwipeDirection) => {
    setActionHint(direction === "left" ? "skip" : "save");
    setTimeout(() => { setActionHint(null); handleSwipe(direction); }, 180);
  };

  const handleUndo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setQueue((q) => [last.post, ...q]);
    if (last.dir === "right") setSaved((s) => s.filter((id) => id !== last.post.id));
    else setSkipped((s) => s.filter((id) => id !== last.post.id));
    toast({ title: t.undo });
  };

  const visibleCards = queue.slice(0, MAX_VISIBLE);

  if (queue.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-[hsl(270,75%,60%)]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">{t.seenItAll}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interpolate(t.seenDesc, { total: skipped.length + saved.length })}
            {saved.length > 0 && " " + interpolate(t.seenSaved, { count: saved.length })}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="purple" onClick={() => { setQueue(posts); setSaved([]); setSkipped([]); setHistory([]); }}>
            <RotateCcw className="w-4 h-4" /> {t.startOver}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/feed">{t.backToFeed}</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="relative flex-1 w-full">
        <AnimatePresence>
          {[...visibleCards].reverse().map((post, reversedIdx) => {
            const stackIndex = visibleCards.length - 1 - reversedIdx;
            const isTop = stackIndex === 0;
            return (
              <SwipeCard
                key={post.id}
                post={post}
                isTop={isTop}
                stackIndex={stackIndex}
                isUnlocked={isUnlocked(post.id)}
                onSwipe={handleSwipe}
                onTap={() => { if (post.is_locked && !isUnlocked(post.id)) setUnlockTarget(post); }}
              />
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {actionHint === "skip" && (
            <motion.div key="hint-skip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 rounded-3xl pointer-events-none z-30 border-4 border-rose-400/60" />
          )}
          {actionHint === "save" && (
            <motion.div key="hint-save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 rounded-3xl pointer-events-none z-30 border-4 border-emerald-400/60" />
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-1 py-1">
        <span className="text-xs text-muted-foreground">{queue.length} {t.left} · {saved.length} {t.saved}</span>
        {history.length > 0 && (
          <button onClick={handleUndo} className="flex items-center gap-1 text-xs text-[hsl(270,75%,60%)] font-medium hover:underline">
            <RotateCcw className="w-3 h-3" /> {t.undo}
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pb-2">
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => triggerSwipe("left")} className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-rose-200 shadow-card flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-colors">
            <X className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">{t.skip}</span>
        </motion.button>

        {currentPost && (
          <motion.div whileTap={{ scale: 0.93 }} className="flex flex-col items-center gap-1.5">
            {currentPost.is_locked && !isUnlocked(currentPost.id) ? (
              <>
                <button
                  onClick={() => setUnlockTarget(currentPost)}
                  className={cn(
                    "w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all",
                    canAfford(currentPost.price) ? "purple-gradient purple-glow hover:opacity-90" : "bg-gray-100 border-2 border-gray-200"
                  )}
                >
                  <Unlock className={cn("w-6 h-6 stroke-[2.5px]", canAfford(currentPost.price) ? "text-white" : "text-muted-foreground")} />
                </button>
                <span className="text-[10px] font-semibold text-[hsl(270,75%,60%)] tracking-wide uppercase">{t.unlock} · {currentPost.price}cr</span>
              </>
            ) : (
              <>
                <Link href={`/post/${currentPost.id}`} className="w-16 h-16 rounded-full purple-gradient shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Eye className="w-6 h-6 text-white stroke-[2.5px]" />
                </Link>
                <span className="text-[10px] font-semibold text-[hsl(270,75%,60%)] tracking-wide uppercase">{t.view}</span>
              </>
            )}
          </motion.div>
        )}

        <motion.button whileTap={{ scale: 0.88 }} onClick={() => triggerSwipe("right")} className="flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-200 shadow-card flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors">
            <Bookmark className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wide uppercase">{t.save}</span>
        </motion.button>
      </div>

      {unlockTarget && (
        <UnlockModal open={!!unlockTarget} onClose={() => setUnlockTarget(null)} post={unlockTarget} />
      )}
    </>
  );
}
