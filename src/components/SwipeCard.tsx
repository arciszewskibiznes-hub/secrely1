"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from "motion/react";
import { Lock, Unlock, Heart, Eye, CheckCircle } from "lucide-react";
import { Diamond } from "@/components/Diamond";
import { TipModal } from "@/components/TipModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatNumber, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/database";

const supabase = createClient();

export type SwipeDirection = "left" | "right";

interface SwipeCardProps {
  post: Post;
  isTop: boolean;
  stackIndex: number;
  isUnlocked: boolean;
  onSwipe: (direction: SwipeDirection) => void;
  onTap: () => void;
}

const SWIPE_THRESHOLD = 100;
const FLY_OUT_X = 500;

export function SwipeCard({ post, isTop, stackIndex, isUnlocked, onSwipe, onTap }: SwipeCardProps) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);
  const [showTip, setShowTip] = useState(false);
  const viewTrackedRef = useRef(false);

  // Track view when this card becomes the top card
  useEffect(() => {
    if (!isTop || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    supabase
      .from("posts")
      .update({ view_count: (post.view_count ?? 0) + 1 })
      .eq("id", post.id);
  }, [isTop, post.id, post.view_count]);

  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const opacity = useTransform(x, [-250, -100, 0, 100, 250], [0, 1, 1, 1, 0]);
  const skipOpacity = useTransform(x, [-120, -40, 0], [1, 0.5, 0]);
  const saveOpacity = useTransform(x, [0, 40, 120], [0, 0.5, 1]);

  const creatorId = (post as any).creator_id ?? post.creator?.id;
  const unlocked = !post.is_locked || isUnlocked || false; // ownership checked in SwipeDeck
  const stackScale = 1 - stackIndex * 0.04;
  const stackY = stackIndex * 10;

  const creator = post.creator;
  const creatorName = creator?.display_name ?? creator?.username ?? "Creator";
  const creatorUsername = creator?.username ?? "";
  const creatorAvatar = creator?.avatar_url ?? "";
  const tags: string[] = post.tags ?? [];

  const handleDragStart = () => { setIsDragging(true); setDragDir(null); };

  const handleDrag = () => {
    const currentX = x.get();
    if (currentX > 20) setDragDir("right");
    else if (currentX < -20) setDragDir("left");
    else setDragDir(null);
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    const xVal = x.get();
    const velocity = info.velocity.x;
    const shouldFlyOut = Math.abs(xVal) > SWIPE_THRESHOLD || Math.abs(velocity) > 600;
    if (shouldFlyOut) {
      const dir = xVal > 0 || velocity > 600 ? "right" : "left";
      await controls.start({
        x: dir === "right" ? FLY_OUT_X : -FLY_OUT_X,
        y: y.get() - 40,
        rotate: dir === "right" ? 25 : -25,
        opacity: 0,
        transition: { duration: 0.38, ease: [0.25, 1, 0.5, 1] },
      });
      onSwipe(dir);
    } else {
      await controls.start({ x: 0, y: 0, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
      setDragDir(null);
    }
  };

  const handleTap = () => {
    if (!isDragging && Math.abs(x.get()) < 5) onTap();
  };

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-card"
        style={{ scale: stackScale, y: stackY, zIndex: 10 - stackIndex }}
        animate={{ scale: stackScale, y: stackY }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <CardInner post={post} unlocked={false} isDragging={false} dragDir={null} skipOpacity={null} saveOpacity={null} creatorName={creatorName} creatorUsername={creatorUsername} creatorAvatar={creatorAvatar} tags={tags} />
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-card-hover cursor-grab active:cursor-grabbing"
        style={{ x, y, rotate, opacity, zIndex: 20 }}
        animate={controls}
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.85}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        whileTap={{ scale: isDragging ? 1 : 0.98 }}
      >
        <CardInner post={post} unlocked={unlocked} isDragging={isDragging} dragDir={dragDir} skipOpacity={skipOpacity} saveOpacity={saveOpacity} creatorName={creatorName} creatorUsername={creatorUsername} creatorAvatar={creatorAvatar} tags={tags} onTip={() => setShowTip(true)} />
      </motion.div>
      <TipModal open={showTip} onClose={() => setShowTip(false)} post={post} />
    </>
  );
}

interface CardInnerProps {
  post: Post;
  unlocked: boolean;
  isDragging: boolean;
  dragDir: "left" | "right" | null;
  skipOpacity: ReturnType<typeof useTransform> | null;
  saveOpacity: ReturnType<typeof useTransform> | null;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  tags: string[];
  onTip?: () => void;
}

function CardInner({ post, unlocked, skipOpacity, saveOpacity, creatorName, creatorAvatar, tags, onTip }: CardInnerProps) {
  return (
    <div className="relative w-full h-full bg-white select-none">
      <div className="absolute inset-0">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.teaser_text ?? ""}
            fill
            className={cn("object-cover transition-all duration-300", post.is_locked && !unlocked && "blur-[14px] scale-110")}
            sizes="(max-width: 640px) 100vw, 480px"
            draggable={false}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-50" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      {post.is_locked && !unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl purple-gradient shadow-xl flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
        </div>
      )}

      {skipOpacity && (
        <motion.div style={{ opacity: skipOpacity }} className="absolute top-10 right-6 z-30 pointer-events-none">
          <div className="border-[3px] border-rose-400 text-rose-400 font-display font-bold text-2xl tracking-widest uppercase px-4 py-1.5 rounded-xl rotate-[12deg]">
            Skip
          </div>
        </motion.div>
      )}

      {saveOpacity && (
        <motion.div style={{ opacity: saveOpacity }} className="absolute top-10 left-6 z-30 pointer-events-none">
          <div className="border-[3px] border-emerald-400 text-emerald-400 font-display font-bold text-2xl tracking-widest uppercase px-4 py-1.5 rounded-xl -rotate-[12deg]">
            Save
          </div>
        </motion.div>
      )}

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs font-semibold">
          {tags[0] ?? "Post"}
        </Badge>
        {post.is_locked ? (
          unlocked ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-semibold">
              <Unlock className="w-3 h-3" /> Unlocked
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-semibold">
              <Diamond size={11} className="text-purple-300" /> {post.price}
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full px-3 py-1 text-xs font-semibold">
            <Unlock className="w-3 h-3" /> Free
          </div>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar className="w-9 h-9 ring-2 ring-white/40">
            <AvatarImage src={creatorAvatar} alt={creatorName} />
            <AvatarFallback className="text-xs bg-purple-200 text-purple-800">{getInitials(creatorName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm leading-tight truncate">{creatorName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <Heart className="w-3 h-3" /> {formatNumber(post.like_count ?? 0)}
            </span>
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <Eye className="w-3 h-3" /> {formatNumber(post.view_count ?? 0)}
            </span>
          </div>
        </div>
        <p className="text-white/90 text-sm leading-relaxed line-clamp-2 mb-3">
          {unlocked ? (post.caption ?? post.teaser_text ?? "") : (post.teaser_text ?? post.caption ?? "")}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-[10px] text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-0.5 font-medium">#{tag}</span>
            ))}
          </div>
          {unlocked && post.is_locked && onTip && (
            <button
              onClick={(e) => { e.stopPropagation(); onTip(); }}
              className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ml-2"
            >
              <Diamond size={10} className="text-purple-300" /> Napiwek
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
