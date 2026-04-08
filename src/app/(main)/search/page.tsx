"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, TrendingUp, Hash, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

const supabase = createClient();

interface SearchProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_creator: boolean;
}

const TRENDING_TAGS = ["Fitness", "Lifestyle", "Art", "Music", "Fashion", "Travel", "Food", "Photo", "Beauty", "Sport", "Vlog", "Dance"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [featured, setFeatured] = useState<SearchProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, is_verified, is_creator")
      .eq("is_creator", true)
      .limit(10)
      .then(({ data }) => setFeatured((data ?? []) as SearchProfile[]));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setIsSearching(false); return; }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.trim().replace(/^@/, "");
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_verified, is_creator")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,bio.ilike.%${q}%`)
        .limit(15);
      setResults((data ?? []) as SearchProfile[]);
      setIsSearching(false);
    }, 200);
  }, [query]);

  const showResults = query.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Szukaj</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Znajdź twórców i profile</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <div className={cn(
          "flex items-center gap-3 px-4 h-12 rounded-2xl border transition-all duration-200",
          focused
            ? "border-[hsl(270,75%,60%)] bg-white shadow-md shadow-purple-100"
            : "border-border bg-secondary"
        )}>
          <Search className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors duration-200",
            focused ? "text-[hsl(270,75%,60%)]" : "text-muted-foreground"
          )} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Wpisz nazwę, @username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoComplete="off"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RESULTS */}
      <AnimatePresence mode="wait">
        {showResults ? (
          <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {isSearching ? (
              <div className="card-base divide-y divide-border overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-28 bg-secondary rounded" />
                      <div className="h-3 w-44 bg-secondary rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Brak wyników dla &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground mt-1">Spróbuj innej frazy</p>
              </div>
            ) : (
              <div className="card-base divide-y divide-border overflow-hidden">
                {results.map((profile, i) => (
                  <ProfileRow key={profile.id} profile={profile} index={i} query={query} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="discovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-5">

            {/* Trending tags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-3.5 h-3.5 text-[hsl(270,75%,60%)]" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Popularne tagi</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button key={tag} onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-white text-muted-foreground hover:border-[hsl(270,75%,60%)] hover:text-[hsl(270,75%,60%)] hover:bg-purple-50 transition-all">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured creators */}
            {featured.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(270,75%,60%)]" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Polecani twórcy</span>
                </div>
                <div className="card-base divide-y divide-border overflow-hidden">
                  {featured.map((profile, i) => (
                    <ProfileRow key={profile.id} profile={profile} index={i} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileRow({ profile, index, query }: { profile: SearchProfile; index: number; query?: string }) {
  const displayName = profile.display_name ?? profile.username ?? "User";
  const username = profile.username ?? profile.id.slice(0, 8);

  // Highlight matching text
  const highlight = (text: string) => {
    if (!query) return <span>{text}</span>;
    const q = query.replace(/^@/, "");
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-purple-100 text-[hsl(270,75%,60%)] rounded px-0.5 not-italic">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}>
      <Link href={`/creator/${username}`}
        className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/60 transition-colors group">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={profile.avatar_url ?? ""} />
          <AvatarFallback className="text-sm">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold text-foreground group-hover:text-[hsl(270,75%,60%)] transition-colors truncate">
              {highlight(displayName)}
            </span>
            {profile.is_verified && (
              <span className="w-3.5 h-3.5 rounded-full purple-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-bold">✓</span>
              </span>
            )}
            {profile.is_creator && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-[hsl(270,75%,60%)] flex-shrink-0 leading-none">
                TWÓRCA
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            @{highlight(username)}
            {profile.bio && <span className="text-muted-foreground/60"> · {profile.bio.slice(0, 40)}{profile.bio.length > 40 ? "…" : ""}</span>}
          </p>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-secondary group-hover:bg-purple-100 transition-colors flex-shrink-0">
          <span className="text-xs text-muted-foreground group-hover:text-[hsl(270,75%,60%)]">→</span>
        </div>
      </Link>
    </motion.div>
  );
}
