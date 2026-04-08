"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { SkeletonPost } from "@/components/SkeletonPost";
import { usePosts } from "@/hooks/usePosts";
import { useCreators } from "@/hooks/useProfiles";
import { CreatorCard } from "@/components/CreatorCard";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<"following" | "foryou" | "trending">("foryou");
  const { posts, isLoading } = usePosts();
  const { creators } = useCreators();
  const t = useT().feed;

  const tabs = [
    { id: "following" as const, label: t.following, icon: Users },
    { id: "foryou" as const, label: t.forYou, icon: Sparkles },
    { id: "trending" as const, label: t.trending, icon: TrendingUp },
  ];

  const featuredCreators = creators.slice(0, 3);

  return (
    <div className="space-y-5">
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
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "foryou" && !isLoading && featuredCreators.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t.creatorsToFollow}</h2>
            <a href="/explore" className="text-xs text-[hsl(270,75%,60%)] font-medium hover:underline">{t.seeAll}</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredCreators.map((creator, i) => (
              <CreatorCard key={creator.id} creator={creator} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonPost key={i} />)
          : posts.length === 0
          ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No posts yet. Check back soon!
            </div>
          )
          : posts.map((post) => <PostCard key={post.id} post={post} />)
        }
      </div>
    </div>
  );
}
