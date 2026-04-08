"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { TrendingUp, Eye, Heart, BarChart2, PlusCircle, Users, DollarSign, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Diamond } from "@/components/Diamond";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/hooks/useT";
import { formatNumber, formatCredits } from "@/lib/utils";
import type { DashboardMetric } from "@/types/database";

const supabase = createClient();

export default function DashboardPage() {
  const [chartType, setChartType] = useState<"earnings" | "subscribers">("earnings");
  const { profile, isLoading: authLoading } = useAuth();
  const t = useT().dashboard;

  const [posts, setPosts] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [totalUnlocks, setTotalUnlocks] = useState(0);
  const [chartData, setChartData] = useState<{ month: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadAll = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);

    // Fetch posts
    const { data: postsData } = await supabase
      .from("posts")
      .select("id, caption, teaser_text, image_url, is_locked, price, like_count, view_count, created_at")
      .eq("creator_id", profile.id)
      .order("created_at", { ascending: false });
    setPosts(postsData ?? []);

    // Fetch earning transactions
    const { data: txs } = await supabase
      .from("credit_transactions")
      .select("amount, created_at")
      .eq("user_id", profile.id)
      .eq("type", "earning");

    const total = (txs ?? []).reduce((s, t) => s + t.amount, 0);
    setTotalEarnings(total);

    const now = new Date();
    const thisMonth = (txs ?? []).filter((t) => {
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    setMonthlyEarnings(thisMonth.reduce((s, t) => s + t.amount, 0));

    // Build 6-month chart
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const last6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth();
      const y = d.getFullYear();
      const val = (txs ?? [])
        .filter((t) => {
          const td = new Date(t.created_at);
          return td.getMonth() === m && td.getFullYear() === y;
        })
        .reduce((s, t) => s + t.amount, 0);
      return { month: months[m], value: val };
    });
    setChartData(last6);

    // Fetch unlock count directly with a join query
    const { data: unlockData } = await supabase.rpc("get_creator_unlock_count", {
      p_creator_id: profile.id,
    });
    setTotalUnlocks(unlockData ?? 0);

    setIsLoading(false);
  }, [profile?.id]);

  // Load every time page is visited (not cached)
  useEffect(() => {
    loadAll();
  }, [loadAll, lastRefresh]);

  const maxChart = Math.max(...chartData.map((d) => d.value), 1);

  const METRICS: DashboardMetric[] = [
    {
      label: "Zarobki łączne 💎",
      value: formatCredits(totalEarnings),
      change: monthlyEarnings,
      changeLabel: "w tym miesiącu",
      trend: monthlyEarnings > 0 ? "up" : "neutral",
    },
    {
      label: "Zarobki (miesiąc) 💎",
      value: formatCredits(monthlyEarnings),
      change: 0,
      changeLabel: "bieżący miesiąc",
      trend: "neutral",
    },
    {
      label: "Łączne wyświetlenia",
      value: formatNumber(posts.reduce((s, p) => s + (p.view_count ?? 0), 0)),
      change: 0,
      changeLabel: "łącznie",
      trend: "neutral",
    },
    {
      label: "Odblokowania",
      value: formatNumber(totalUnlocks),
      change: 0,
      changeLabel: "łącznie",
      trend: totalUnlocks > 0 ? "up" : "neutral",
    },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(270,75%,60%)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLastRefresh(Date.now())}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Odśwież"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Button variant="purple" size="sm" asChild>
            <Link href="/dashboard/new-post"><PlusCircle className="w-4 h-4" /> {t.newPost}</Link>
          </Button>
        </div>
      </motion.div>

      {/* Earnings banner */}
      {totalEarnings > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl purple-gradient p-5 text-white">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -mr-6 -mt-6" />
          <div className="flex items-center gap-2 mb-1">
            <Diamond size={14} className="text-white/80" />
            <span className="text-sm text-white/80">Łączne zarobki</span>
          </div>
          <div className="text-3xl font-bold tabular-nums flex items-center gap-2">
            <Diamond size={24} className="text-white/80" />
            {formatCredits(totalEarnings)}
          </div>
          {monthlyEarnings > 0 && (
            <div className="text-sm text-white/70 mt-1 flex items-center gap-1">
              +{formatCredits(monthlyEarnings)} <Diamond size={11} className="text-white/70" /> w tym miesiącu
            </div>
          )}
        </motion.div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-base p-4 animate-pulse">
              <div className="h-3 w-24 bg-secondary rounded mb-3" />
              <div className="h-7 w-16 bg-secondary rounded mb-2" />
              <div className="h-3 w-20 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {METRICS.map((metric, i) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <StatCard metric={metric} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }} className="card-base p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-[hsl(270,75%,60%)]" />
          <span className="text-sm font-semibold text-foreground">Zarobki — ostatnie 6 miesięcy</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {chartData.map((d) => {
            const height = Math.max(4, (d.value / maxChart) * 100);
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 112 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full rounded-t-lg purple-gradient opacity-80 hover:opacity-100 transition-opacity"
                    style={{ maxWidth: 36 }}
                    title={`${d.month}: ${d.value}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.month}</span>
              </div>
            );
          })}
        </div>
        {totalEarnings === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Zarobki pojawią się gdy ktoś odblokuje Twój post
          </p>
        )}
      </motion.div>

      {/* Top posts */}
      {posts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">{t.topPosts}</h2>
          <div className="card-base divide-y divide-border">
            {posts.slice(0, 5).map((post, i) => (
              <div key={post.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {post.caption ?? post.teaser_text ?? "Bez tytułu"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Eye className="w-3 h-3" />{formatNumber(post.view_count ?? 0)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Heart className="w-3 h-3" />{formatNumber(post.like_count ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {post.is_locked
                    ? <Badge variant="purple" className="text-[10px] flex items-center gap-0.5">
                        <Diamond size={9} className="text-current" />{post.price}
                      </Badge>
                    : <Badge variant="secondary" className="text-[10px]">Free</Badge>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && !isLoading && (
        <div className="card-base p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Nie masz jeszcze żadnych postów.</p>
          <Button variant="purple" size="sm" asChild>
            <Link href="/dashboard/new-post"><PlusCircle className="w-4 h-4" /> Utwórz pierwszy post</Link>
          </Button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{t.quickActions}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: PlusCircle, label: t.newPost, href: "/dashboard/new-post", variant: "purple" as const },
            { icon: Users, label: t.viewAudience, href: "/explore", variant: "outline" as const },
            { icon: DollarSign, label: "Portfel", href: "/wallet", variant: "outline" as const },
            { icon: TrendingUp, label: t.analytics, href: "/dashboard", variant: "outline" as const },
          ].map(({ icon: Icon, label, href, variant }) => (
            <Button key={label} variant={variant} size="sm" className="gap-2 h-10" asChild>
              <Link href={href}><Icon className="w-4 h-4" />{label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
