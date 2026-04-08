"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Lock, ArrowLeft, Heart, Eye } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/PostCard";
import { SkeletonPost } from "@/components/SkeletonPost";
import { FollowButton } from "@/components/FollowButton";
import { useProfileByUsername } from "@/hooks/useProfiles";
import { useFollows } from "@/hooks/useFollows";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useCreatorPosts } from "@/hooks/usePosts";
import { getInitials, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const supabase = createClient();

export default function CreatorProfilePage({ params }: { params: { username: string } }) {
  const { profile, isLoading: profileLoading } = useProfileByUsername(params.username);
  const { posts, isLoading: postsLoading } = useCreatorPosts(profile?.id ?? "");
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.rpc("get_follower_count", { p_user_id: profile.id })
      .then(({ data }) => setFollowerCount(data ?? 0));
  }, [profile?.id]);

  const displayName = profile?.display_name ?? profile?.username ?? "Creator";
  const totalLikes = posts.reduce((s, p) => s + (p.like_count ?? 0), 0);

  const S = {
    hero: { background: "linear-gradient(160deg,#12001e 0%,#2d0550 55%,#130020 100%)" } as React.CSSProperties,
    gradPink: { background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)" } as React.CSSProperties,
    statCard: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 } as React.CSSProperties,
  };

  if (profileLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-24 bg-secondary rounded-xl" />
      <div className="h-64 rounded-3xl bg-secondary" />
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Profil nie istnieje</p>
      <Button variant="purple" size="sm" className="mt-4" asChild>
        <Link href="/explore">Odkryj twórców</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Wróć
      </Link>

      {/* ── HERO CARD ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden" style={S.hero}>

        {/* Radial glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 280, borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(192,38,211,0.22) 0%, transparent 70%)",
        }} />

        <div className="relative px-5 pt-10 pb-5">
          {/* Avatar + follow */}
          <div className="flex items-end justify-between mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-[76px] h-[76px] rounded-[20px] overflow-hidden"
                style={{ boxShadow: "0 0 0 3px rgba(192,38,211,0.45), 0 12px 32px rgba(0,0,0,0.5)" }}>
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={profile.avatar_url ?? ""} className="object-cover" />
                  <AvatarFallback className="w-full h-full rounded-none text-2xl font-black text-white" style={S.gradPink}>
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {profile.is_verified && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ ...S.gradPink, boxShadow: "0 2px 10px rgba(192,38,211,0.6)", border: "2px solid #12001e" }}>
                  <span className="text-white text-[9px] font-black">✓</span>
                </div>
              )}
            </div>

            {/* Follow button */}
            {profile?.id && <FollowButton targetId={profile.id} size="md" />}
          </div>

          {/* Name & bio */}
          <div className="mb-5">
            <h1 className="text-[22px] font-black text-white tracking-tight leading-none mb-1">{displayName}</h1>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>@{profile.username}</p>
            {profile.bio && (
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{profile.bio}</p>
            )}
            {profile.is_creator && (
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(192,38,211,0.15)", border: "1px solid rgba(192,38,211,0.3)", color: "#e879f9" }}>
                ✦ Twórca
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Obserwujący", value: followerCount },
              { label: "Posty", value: posts.length },
              { label: "Polubienia", value: formatNumber(totalLikes) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center justify-center py-3 px-1" style={S.statCard}>
                <span className="text-[18px] font-black text-white tabular-nums leading-none mb-1">{value}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-center"
                  style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── POSTS ── */}
      {postsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <SkeletonPost key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl purple-gradient flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-foreground">Brak postów</p>
          <p className="text-xs text-muted-foreground mt-1">Ten twórca nie dodał jeszcze żadnych postów</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div key={post.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
