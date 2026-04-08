"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Settings, Grid, Heart, Lock, Edit3, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Diamond } from "@/components/Diamond";
import { useAuth, getDisplayName, getUsername } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useUnlocked } from "@/hooks/useUnlocked";
import { useFollows } from "@/hooks/useFollows";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatNumber, formatCredits } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/database";

const supabase = createClient();
type Tab = "posts" | "unlocked" | "liked";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const { profile, isLoading: authLoading } = useAuth();
  const { balance } = useCredits();
  const { unlockedPostIds } = useUnlocked();
  const { following } = useFollows();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [unlockedPosts, setUnlockedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    // Fetch follower count (people following ME)
    supabase.rpc("get_follower_count", { p_user_id: profile.id })
      .then(({ data }) => setFollowerCount(data ?? 0));
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    setLoadingPosts(true);
    const load = async () => {
      const { data: myPostsData } = await supabase
        .from("posts")
        .select("id, creator_id, image_url, caption, teaser_text, price, is_locked, like_count, view_count, comment_count, tags, created_at")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false });
      setMyPosts((myPostsData ?? []).map(p => ({ ...p, creator: profile })) as Post[]);

      const { data: likeData } = await supabase
        .from("post_likes").select("post_id").eq("user_id", profile.id);
      if (likeData?.length) {
        const { data: lp } = await supabase.from("posts")
          .select("id, creator_id, image_url, caption, teaser_text, price, is_locked, like_count, view_count, comment_count, tags, created_at")
          .in("id", likeData.map(r => r.post_id));
        setLikedPosts((lp ?? []).map(p => ({ ...p, creator: null })) as Post[]);
      }
      const { data: unlockData } = await supabase
        .from("unlocked_posts").select("post_id").eq("user_id", profile.id);
      if (unlockData?.length) {
        const { data: up } = await supabase.from("posts")
          .select("id, creator_id, image_url, caption, teaser_text, price, is_locked, like_count, view_count, comment_count, tags, created_at")
          .in("id", unlockData.map(r => r.post_id));
        setUnlockedPosts((up ?? []).map(p => ({ ...p, creator: null })) as Post[]);
      }
      setLoadingPosts(false);
    };
    load();
  }, [profile?.id]);

  if (authLoading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-72 rounded-3xl bg-secondary" />
    </div>
  );

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "posts", label: "Posty", icon: Grid, count: myPosts.length },
    { id: "unlocked", label: "Odblokowane", icon: Lock, count: unlockedPosts.length },
    { id: "liked", label: "Polubione", icon: Heart, count: likedPosts.length },
  ];

  const displayPosts = activeTab === "posts" ? myPosts
    : activeTab === "unlocked" ? unlockedPosts : likedPosts;

  const S = {
    card: { background: "linear-gradient(160deg,#12001e 0%,#2d0550 55%,#130020 100%)" } as React.CSSProperties,
    statCard: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 } as React.CSSProperties,
    balancePill: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100 } as React.CSSProperties,
    gradPink: { background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)" } as React.CSSProperties,
  };

  return (
    <div className="space-y-3">
      {/* ── HERO CARD ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden" style={S.card}>

        {/* Decorative radial */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 280, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(192,38,211,0.22) 0%, transparent 70%)",
        }} />

        {/* Top actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Link href="/settings" style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
          }}>
            <Settings className="w-3.5 h-3.5 text-white/60" />
          </Link>
          <Link href="/settings" style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700,
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.75)", textDecoration: "none",
          }}>
            <Edit3 className="w-3 h-3" /> Edytuj
          </Link>
        </div>

        <div className="relative px-5 pt-10 pb-5">
          {/* Avatar row */}
          <div className="flex items-end gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-[76px] h-[76px] rounded-[20px] overflow-hidden"
                style={{ boxShadow: "0 0 0 3px rgba(192,38,211,0.45), 0 12px 32px rgba(0,0,0,0.5)" }}>
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={profile?.avatar_url ?? ""} className="object-cover" />
                  <AvatarFallback className="w-full h-full rounded-none text-2xl font-black text-white"
                    style={S.gradPink}>
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ ...S.gradPink, boxShadow: "0 2px 10px rgba(192,38,211,0.6)" }}>
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] font-black text-white tracking-tight leading-none">{displayName}</h1>
                {profile?.is_verified && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={S.gradPink}>
                    <span className="text-white text-[9px] font-black">✓</span>
                  </div>
                )}
              </div>
              <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>@{username}</p>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              {profile.bio}
            </p>
          )}

          {/* Balance */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 mb-5" style={S.balancePill}>
            <Diamond size={14} className="text-fuchsia-400 flex-shrink-0" />
            <span className="text-[15px] font-black text-white">{formatCredits(balance)}</span>
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>diamentów</span>
          </div>

          {/* Stats 4-grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Posty", value: myPosts.length },
              { label: "Obserwujący", value: followerCount },
              { label: "Obserwowani", value: following.length },
              { label: "Odblokowane", value: unlockedPostIds.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center justify-center py-3 px-1" style={S.statCard}>
                <span className="text-[18px] font-black text-white tabular-nums leading-none mb-1">{value}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-center leading-tight"
                  style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
              activeTab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{label}</span>
            {count > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                activeTab === id ? "bg-purple-100 text-[hsl(270,75%,60%)]" : "bg-muted text-muted-foreground"
              )}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── POSTS GRID ── */}
      {loadingPosts ? (
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl purple-gradient flex items-center justify-center mx-auto mb-3">
            {activeTab === "posts" ? <Grid className="w-6 h-6 text-white" />
              : activeTab === "unlocked" ? <Lock className="w-6 h-6 text-white" />
              : <Heart className="w-6 h-6 text-white" />}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {activeTab === "posts" ? "Brak postów" : activeTab === "unlocked" ? "Brak odblokowanych" : "Brak polubionych"}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
            {activeTab === "posts" ? "Dodaj swój pierwszy post" : activeTab === "unlocked" ? "Odblokuj treści od twórców" : "Polub posty które Cię interesują"}
          </p>
          {activeTab === "posts" && (
            <Link href="/dashboard/new-post"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl purple-gradient text-white text-xs font-semibold">
              Dodaj post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {displayPosts.map((post, i) => (
            <motion.div key={post.id}
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}>
              <Link href={`/post/${post.id}`}
                className="block relative aspect-square rounded-xl overflow-hidden bg-secondary group">
                {post.image_url && (
                  <Image src={post.image_url} alt="" fill
                    className="object-cover transition-transform duration-400 group-hover:scale-105"
                    sizes="(max-width: 640px) 33vw, 200px" />
                )}
                {post.is_locked && activeTab !== "posts" && !unlockedPostIds.includes(post.id) && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1 text-white text-[10px] font-bold">
                    <Heart className="w-2.5 h-2.5 fill-white" />{formatNumber(post.like_count ?? 0)}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
