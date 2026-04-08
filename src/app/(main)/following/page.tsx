"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { createClient } from "@/lib/supabase/client";
import type { Post, Profile } from "@/types/database";

const supabase = createClient();

export default function FollowingPage() {
  const { user } = useAuth();
  const { following } = useFollows();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || following.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const load = async () => {
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, creator_id, image_url, caption, teaser_text, price, is_locked, like_count, view_count, comment_count, tags, created_at")
        .in("creator_id", following)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!postsData || postsData.length === 0) { setIsLoading(false); return; }

      // Fetch creators
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at")
        .in("id", following);

      const profileMap = new Map((profiles ?? []).map((p: Profile) => [p.id, p]));
      setPosts(postsData.map((p) => ({ ...p, creator: profileMap.get(p.creator_id) ?? null })) as Post[]);
      setIsLoading(false);
    };
    load();
  }, [user?.id, following]);

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-base overflow-hidden animate-pulse">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-secondary" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-28 bg-secondary rounded" />
              <div className="h-3 w-20 bg-secondary rounded" />
            </div>
          </div>
          <div className="aspect-[4/3] bg-secondary" />
        </div>
      ))}
    </div>
  );

  if (following.length === 0) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl purple-gradient flex items-center justify-center mx-auto mb-4">
        <Users className="w-7 h-7 text-white" />
      </div>
      <h2 className="font-display text-lg font-bold text-foreground mb-2">Nikogo nie obserwujesz</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Obserwuj swoich ulubionych twórców, żeby zobaczyć ich posty tutaj
      </p>
      <Button variant="purple" asChild>
        <Link href="/explore"><Compass className="w-4 h-4" /> Odkryj twórców</Link>
      </Button>
    </div>
  );

  if (posts.length === 0) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
        <Users className="w-7 h-7 text-muted-foreground" />
      </div>
      <h2 className="font-display text-lg font-bold text-foreground mb-2">Brak nowych postów</h2>
      <p className="text-sm text-muted-foreground">
        Osoby które obserwujesz nie dodały jeszcze żadnych postów.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-foreground">Obserwowani</h1>
        <span className="text-xs text-muted-foreground">{following.length} obserwowanych</span>
      </div>
      {posts.map((post, i) => (
        <motion.div key={post.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}>
          <PostCard post={post} />
        </motion.div>
      ))}
    </div>
  );
}
