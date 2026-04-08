"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Settings, Grid, Heart, Lock, Edit3, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, getDisplayName, getUsername } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useUnlocked } from "@/hooks/useUnlocked";
import { usePosts } from "@/hooks/usePosts";
import { useT } from "@/hooks/useT";
import { getInitials, formatNumber, formatCredits } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/database";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"saved" | "unlocked" | "liked">("saved");
  const { profile, isLoading: authLoading } = useAuth();
  const { balance } = useCredits();
  const { unlockedPostIds } = useUnlocked();
  const { posts } = usePosts();
  const t = useT().profile;

  const tabs = [
    { id: "saved" as const, label: t.savedTab, icon: Grid },
    { id: "unlocked" as const, label: t.unlocked, icon: Lock },
    { id: "liked" as const, label: t.liked, icon: Heart },
  ];

  const unlockedPosts = posts.filter((p) => unlockedPostIds.includes(p.id));
  const savedPosts = posts.slice(0, 6);
  const likedPosts = posts.slice(0, 4);
  const displayPosts: Post[] =
    activeTab === "unlocked" ? unlockedPosts : activeTab === "liked" ? likedPosts : savedPosts;

  if (authLoading) {
    return (
      <div className="space-y-5">
        <div className="card-base overflow-hidden animate-pulse">
          <div className="h-24 bg-secondary" />
          <div className="px-5 pb-5 pt-2 space-y-3">
            <div className="h-12 w-12 rounded-full bg-secondary" />
            <div className="h-5 w-32 bg-secondary rounded" />
            <div className="h-3 w-24 bg-secondary rounded" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);
  const avatarUrl = profile?.avatar_url ?? "";

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="card-base overflow-hidden"
      >
        <div className="h-24 purple-gradient relative">
          <button className="absolute bottom-2 right-2 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16 ring-4 ring-white shadow-md">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-secondary transition-colors">
                <Camera className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings"><Settings className="w-3.5 h-3.5" /> {t.settings}</Link>
              </Button>
              <Button variant="purple" size="sm" asChild>
                <Link href="/settings"><Edit3 className="w-3.5 h-3.5" /> {t.edit}</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-foreground">{displayName}</h1>
              {profile?.is_verified && (
                <span className="w-5 h-5 rounded-full purple-gradient flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">✓</span>
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">@{username}</div>
            {profile?.bio && <p className="text-sm text-foreground leading-relaxed pt-1">{profile.bio}</p>}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
            {[
              { label: t.credits, value: formatCredits(balance) },
              { label: t.unlocked, value: unlockedPostIds.length },
              { label: t.following, value: 0 },
              { label: t.liked, value: formatNumber(0) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-base font-bold text-foreground tabular-nums">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-secondary p-1 rounded-2xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {displayPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-[hsl(270,75%,60%)]" />
          </div>
          <p className="text-sm font-medium text-foreground">{t.nothingYet}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTab === "unlocked" ? t.emptyUnlocked : activeTab === "liked" ? t.emptyLiked : t.emptySaved}
          </p>
          {activeTab === "unlocked" && (
            <Button variant="purple" size="sm" className="mt-4" asChild>
              <Link href="/explore">{t.discoverCreators}</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {displayPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/post/${post.id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-secondary group">
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={post.teaser_text ?? ""}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 300px"
                  />
                )}
                {post.is_locked && !unlockedPostIds.includes(post.id) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg purple-gradient flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                    <Heart className="w-3 h-3 fill-current" />
                    {formatNumber(post.like_count ?? 0)}
                  </div>
                </div>
                {post.is_locked && unlockedPostIds.includes(post.id) && (
                  <div className="absolute top-1.5 right-1.5">
                    <Badge variant="success" className="text-[9px] px-1.5 py-0.5">✓</Badge>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
