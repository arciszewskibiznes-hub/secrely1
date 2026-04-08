"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { CheckCircle, Users, ImageIcon, TrendingUp, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { SkeletonPost } from "@/components/SkeletonPost";
import { useProfileByUsername } from "@/hooks/useProfiles";
import { useCreatorPosts } from "@/hooks/usePosts";
import { useT, interpolate } from "@/hooks/useT";
import { getInitials, formatNumber } from "@/lib/utils";

export default function CreatorProfilePage({ params }: { params: { username: string } }) {
  const { profile, isLoading: profileLoading } = useProfileByUsername(params.username);
  const { posts, isLoading: postsLoading } = useCreatorPosts(profile?.id ?? "");
  const t = useT().creatorProfile;

  const lockedCount = posts.filter((p) => p.is_locked).length;
  const displayName = profile?.display_name ?? profile?.username ?? "Creator";

  if (profileLoading) {
    return (
      <div className="space-y-5">
        <div className="relative h-44 rounded-2xl overflow-hidden bg-secondary animate-pulse -mx-4" />
        <div className="card-base p-5 -mt-12 relative animate-pulse space-y-3">
          <div className="h-16 w-16 rounded-full bg-secondary" />
          <div className="h-6 w-40 bg-secondary rounded" />
          <div className="h-4 w-28 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground font-medium">Creator not found</p>
        <Button variant="purple" size="sm" className="mt-4" asChild>
          <Link href="/explore">Explore creators</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Cover */}
      <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 -mx-4">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="card-base p-5 -mt-12 relative"
      >
        <div className="flex items-end justify-between mb-4">
          <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
            <AvatarImage src={profile.avatar_url ?? ""} alt={displayName} />
            <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <Button variant="purple">
            {t.follow}
          </Button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-foreground">{displayName}</h1>
            {profile.is_verified && <CheckCircle className="w-5 h-5 text-[hsl(270,75%,60%)]" />}
          </div>
          {profile.username && <div className="text-sm text-muted-foreground">@{profile.username}</div>}
          {profile.bio && <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>}
          {profile.is_creator && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="purple">Creator</Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          {[
            { icon: Users, value: "—", label: t.followers },
            { icon: ImageIcon, value: posts.length, label: t.posts },
            { icon: TrendingUp, value: formatNumber(posts.reduce((s, p) => s + (p.like_count ?? 0), 0)), label: t.likes },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-bold text-foreground tabular-nums">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {lockedCount > 0 && (
          <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg purple-gradient flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-800">{interpolate(t.premiumPosts, { count: lockedCount })}</div>
              <div className="text-xs text-purple-600">{t.unlockIndividually}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{posts.length} {t.posts}</h2>
        {postsLoading
          ? Array.from({ length: 2 }).map((_, i) => <SkeletonPost key={i} />)
          : posts.length === 0
          ? <div className="text-center py-10 text-sm text-muted-foreground">No posts yet</div>
          : posts.map((post) => <PostCard key={post.id} post={post} />)
        }
      </div>
    </div>
  );
}
