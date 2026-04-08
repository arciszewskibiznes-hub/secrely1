"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, ChevronDown } from "lucide-react";
import { SwipeDeck } from "@/components/SwipeDeck";
import { usePosts } from "@/hooks/usePosts";
import { SkeletonPost } from "@/components/SkeletonPost";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Photography", "Art", "Fitness", "Music", "Cooking", "Lifestyle", "Tutorial"];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExplorePage() {
  const [category, setCategory] = useState("All");
  const [seed, setSeed] = useState(0);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { posts, isLoading } = usePosts();

  const filteredPosts = useMemo(() => {
    const base = category === "All"
      ? posts
      : posts.filter((p) => {
          const tags: string[] = p.tags ?? [];
          return tags.some((t) => t.toLowerCase().includes(category.toLowerCase()));
        });
    return shuffleArray(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, category, seed]);

  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100dvh - 3.5rem - 4rem)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowCategoryPicker((v) => !v)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-purple-50 rounded-xl px-3.5 py-2 text-sm font-semibold text-foreground transition-colors"
          >
            {category}
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", showCategoryPicker && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showCategoryPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-card-hover border border-border overflow-hidden min-w-[160px]"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setShowCategoryPicker(false); setSeed((s) => s + 1); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors",
                      cat === category ? "text-[hsl(270,75%,60%)] bg-purple-50" : "text-foreground hover:bg-secondary"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ rotate: 180, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={() => setSeed((s) => s + 1)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[hsl(270,75%,60%)] transition-colors bg-secondary hover:bg-purple-50 rounded-xl px-3.5 py-2"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </motion.button>
      </div>

      {/* Swipe deck */}
      {isLoading ? (
        <div className="flex-1 space-y-4">
          <SkeletonPost />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${seed}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col gap-3 min-h-0"
          >
            <SwipeDeck posts={filteredPosts} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
