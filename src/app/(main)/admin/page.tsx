"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Shield, CheckCircle, XCircle, Clock, Eye, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useT, interpolate } from "@/hooks/useT";
import { getInitials, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const supabase = createClient();

interface ModerationPost {
  id: string;
  caption: string | null;
  teaser_text: string | null;
  image_url: string | null;
  is_locked: boolean;
  price: number;
  tags: string[] | null;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  creator_id: string;
  creator: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
}

type Filter = "all" | "pending" | "approved" | "rejected";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"  },
  approved: { label: "Approved", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle,     color: "text-rose-500",    bg: "bg-rose-50",    border: "border-rose-200"   },
};

import { isAdmin } from "@/lib/admin";

export default function AdminPage() {
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [activeSection, setActiveSection] = useState<"posts" | "payouts">("posts");
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [updatingPayout, setUpdatingPayout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const { user } = useAuth();
  const router = useRouter();

  const loadPayouts = useCallback(async () => {
    setLoadingPayouts(true);
    const { data } = await supabase.rpc("admin_get_payouts");
    setPayouts(data ?? []);
    setLoadingPayouts(false);
  }, []);

  useEffect(() => {
    if (activeSection === "payouts") loadPayouts();
  }, [activeSection, loadPayouts]);

  const updatePayoutStatus = async (payoutId: string, status: string) => {
    setUpdatingPayout(payoutId);
    const sb = createClient();
    await sb.rpc("admin_update_payout_status", { p_payout_id: payoutId, p_status: status });
    setPayouts((prev) => prev.map((p) => p.id === payoutId ? { ...p, status } : p));
    setUpdatingPayout(null);
  };

  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const t = useT().admin;

  // Redirect non-admins immediately
  if (user && isAdmin(user.id) === false) {
    router.replace("/feed");
    return null;
  }

  const load = async () => {
    setIsLoading(true);

    const { data: postsData, error } = await supabase
      .from("posts")
      .select("id, caption, teaser_text, image_url, is_locked, price, tags, created_at, creator_id, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load error:", error.message);
      setIsLoading(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    const creatorIds = [...new Set(postsData.map((p) => p.creator_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, is_verified")
      .in("id", creatorIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const mapped: ModerationPost[] = postsData.map((p) => ({
      ...p,
      status: (p.status ?? "pending") as "pending" | "approved" | "rejected",
      creator: profileMap.get(p.creator_id) ?? null,
    }));

    setPosts(mapped);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Real DB update ─────────────────────────────────────────
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);

    const { error } = await supabase
      .from("posts")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Update status error:", error.message);
      setUpdating(null);
      return;
    }

    // Update local state immediately
    setPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, status } : p)
    );
    setUpdating(null);
    setExpanded(null);
  };

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);
  const counts = {
    all: posts.length,
    pending: posts.filter((p) => p.status === "pending").length,
    approved: posts.filter((p) => p.status === "approved").length,
    rejected: posts.filter((p) => p.status === "rejected").length,
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Oczekujące", color: "text-amber-600 bg-amber-50 border-amber-200" },
    completed: { label: "Zrealizowano", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    rejected: { label: "Odrzucono", color: "text-rose-600 bg-rose-50 border-rose-200" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl purple-gradient flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{counts.pending} {t.pending}</p>
          </div>
        </div>
        <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary">
          Refresh
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-2xl">
        {(["posts", "payouts"] as const).map((id) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              activeSection === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {id === "posts" ? "Moderacja postów" : "Wypłaty"}
          </button>
        ))}
      </div>

      {activeSection === "posts" && (
        <>
      {/* Filter tabs */}
      <div className="grid grid-cols-4 gap-2">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "card-base p-3 text-center transition-all",
              filter === f
                ? f === "all"
                  ? "border-[hsl(270,75%,60%)] border-2"
                  : `${STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.border ?? ""} border-2`
                : ""
            )}>
            <div className="text-lg font-bold text-foreground tabular-nums">{counts[f]}</div>
            <div className="text-[10px] text-muted-foreground capitalize mt-0.5">{f}</div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[hsl(270,75%,60%)] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-foreground">{t.allClear}</p>
          <p className="text-xs text-muted-foreground mt-1">
            No {filter === "all" ? "" : filter} posts to show.
          </p>
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {filtered.map((post, i) => {
          const config = STATUS_CONFIG[post.status];
          const StatusIcon = config.icon;
          const isExpanded = expanded === post.id;
          const isUpdating = updating === post.id;
          const creatorName = post.creator?.display_name ?? post.creator?.username ?? "Unknown";
          const creatorAvatar = post.creator?.avatar_url ?? "";

          return (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="card-base overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {post.image_url && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                      <Image src={post.image_url} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={creatorAvatar} />
                          <AvatarFallback className="text-[9px]">{getInitials(creatorName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-foreground">{creatorName}</span>
                        {post.is_locked && (
                          <Badge variant="purple" className="text-[9px]">{post.price} cr</Badge>
                        )}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        config.color, config.bg, config.border
                      )}>
                        <StatusIcon className="w-3 h-3" />{config.label}
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                      {post.caption ?? post.teaser_text ?? "No caption"}
                    </p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[9px] bg-purple-50 text-purple-600 rounded-full px-1.5 py-0.5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-muted-foreground mt-1.5">
                      {timeAgo(post.created_at)}
                    </div>
                  </div>

                  <button onClick={() => setExpanded(isExpanded ? null : post.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                </div>

                {/* Actions */}
                {post.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" variant="outline"
                      className="flex-1 text-xs gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50"
                      disabled={isUpdating}
                      onClick={() => updateStatus(post.id, "rejected")}>
                      <XCircle className="w-3.5 h-3.5" />
                      {isUpdating ? "…" : t.reject}
                    </Button>
                    <Button size="sm" variant="outline"
                      className="flex-1 text-xs gap-1.5 text-muted-foreground"
                      onClick={() => setExpanded(isExpanded ? null : post.id)}>
                      <Eye className="w-3.5 h-3.5" />{t.review}
                    </Button>
                    <Button size="sm"
                      className="flex-1 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isUpdating}
                      onClick={() => updateStatus(post.id, "approved")}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isUpdating ? "Saving…" : t.approve}
                    </Button>
                  </div>
                )}
              </div>

              {/* Expanded */}
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-border px-4 py-3 bg-secondary/40 space-y-3">
                  {post.image_url && (
                    <div className="relative h-48 rounded-xl overflow-hidden">
                      <Image src={post.image_url} alt="" fill className="object-cover" sizes="600px" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-muted-foreground">Caption</span>
                    <p className="text-xs text-foreground leading-relaxed mt-0.5">{post.caption ?? "—"}</p>
                  </div>
                  {post.teaser_text && (
                    <div>
                      <span className="text-xs text-muted-foreground">Teaser</span>
                      <p className="text-xs text-foreground leading-relaxed mt-0.5 italic">{post.teaser_text}</p>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Creator: <span className="text-foreground font-medium">{creatorName}</span>
                    {post.creator?.is_verified && <span className="text-emerald-600 ml-1">✓ Verified</span>}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      </>
      )}

      {/* Payouts panel */}
      {activeSection === "payouts" && (
        <div className="space-y-3">
          {loadingPayouts ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 card-base animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12 card-base rounded-2xl">
              <p className="text-sm text-muted-foreground">Brak zleconych wypłat</p>
            </div>
          ) : (
            payouts.map((p) => {
              const st = statusMap[p.status] ?? statusMap.pending;
              const userName = p.display_name ?? p.username ?? "Unknown";
              return (
                <div key={p.id} className="card-base p-4 space-y-3 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">{p.amount_pln} PLN</span>
                        <span className="text-xs text-muted-foreground">({p.credits} 💎)</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="font-medium text-foreground">{p.full_name} · @{p.username}</div>
                        {p.address && <div>{p.address}</div>}
                        {p.phone && <div>{p.phone}</div>}
                        <div className="font-mono text-[10px]">{p.iban}</div>
                        <div>{new Date(p.created_at).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0", st.color)}>
                      {st.label}
                    </span>
                  </div>

                  {/* Status buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => updatePayoutStatus(p.id, "pending")}
                      disabled={p.status === "pending" || updatingPayout === p.id}
                      className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                        p.status === "pending" ? "bg-amber-50 border-amber-200 text-amber-600" : "border-border text-muted-foreground hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200")}>
                      Oczekujące
                    </button>
                    <button
                      onClick={() => updatePayoutStatus(p.id, "completed")}
                      disabled={p.status === "completed" || updatingPayout === p.id}
                      className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                        p.status === "completed" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-border text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200")}>
                      Zrealizowano
                    </button>
                    <button
                      onClick={() => updatePayoutStatus(p.id, "rejected")}
                      disabled={p.status === "rejected" || updatingPayout === p.id}
                      className={cn("flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                        p.status === "rejected" ? "bg-rose-50 border-rose-200 text-rose-600" : "border-border text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200")}>
                      Odrzucono
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </motion.div>
  );
}
