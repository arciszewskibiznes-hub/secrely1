"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, CheckCircle, XCircle, Clock, Eye, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT, interpolate } from "@/hooks/useT";
import { getInitials, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Future: fetch from Supabase posts table with status field
interface ModerationItem {
  id: string;
  creatorName: string;
  creatorAvatar: string;
  creatorUsername: string;
  type: "post" | "profile";
  status: "pending" | "approved" | "rejected";
  reason?: string;
  content: string;
  submittedAt: string;
  reviewedAt?: string;
}

const SEED_ITEMS: ModerationItem[] = [
  { id: "mod_1", creatorName: "Luna Chen", creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b69c?w=50&h=50&fit=crop&crop=faces", creatorUsername: "luna_visuals", type: "post", status: "pending", content: "New exclusive series: intimate portraits — 24-image set with full behind-the-scenes", submittedAt: new Date(Date.now() - 1000 * 60 * 23).toISOString() },
  { id: "mod_2", creatorName: "Sophia Nakamura", creatorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=50&h=50&fit=crop&crop=faces", creatorUsername: "sophia_art", type: "post", status: "pending", content: "Process video: creating the Dreamscape series — 40-minute exclusive walkthrough", submittedAt: new Date(Date.now() - 1000 * 60 * 67).toISOString() },
  { id: "mod_3", creatorName: "Marco Di Vito", creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=faces", creatorUsername: "marco_lifestyle", type: "profile", status: "approved", content: "Profile bio update and cover image change — new lifestyle photography direction", submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "mod_4", creatorName: "Elena Moreau", creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=faces", creatorUsername: "elena_cuisine", type: "post", status: "rejected", reason: "Content description requires clearer preview.", content: "Private dinner series — exclusive access to monthly tasting menu events in Paris", submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
];

type Filter = "all" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<ModerationItem[]>(SEED_ITEMS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const t = useT().admin;

  const STATUS_CONFIG = {
    pending: { label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    approved: { label: t.approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    rejected: { label: t.rejected, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const counts = { all: items.length, pending: items.filter((i) => i.status === "pending").length, approved: items.filter((i) => i.status === "approved").length, rejected: items.filter((i) => i.status === "rejected").length };

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    // Future: PATCH /api/moderation/:id
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status, reviewedAt: new Date().toISOString() } : item));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl purple-gradient flex items-center justify-center shadow-sm">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{counts.pending} {t.pending}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("card-base p-3 text-center transition-all", filter === f && (f === "all" ? "border-[hsl(270,75%,60%)] border-2" : `${STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.border ?? ""} border-2`))}>
            <div className="text-lg font-bold text-foreground tabular-nums">{counts[f]}</div>
            <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
              {f === "all" ? t.all : f === "pending" ? "Pending" : t[f as "approved" | "rejected"] ?? f}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => {
          const config = STATUS_CONFIG[item.status];
          const StatusIcon = config.icon;
          const isExpanded = expanded === item.id;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-base overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.creatorAvatar} />
                          <AvatarFallback className="text-[9px]">{getInitials(item.creatorName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-foreground">{item.creatorName}</span>
                        <Badge variant="secondary" className="text-[9px] capitalize">{item.type}</Badge>
                      </div>
                      <div className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", config.color, config.bg, config.border)}>
                        <StatusIcon className="w-3 h-3" />{config.label}
                      </div>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>{t.submitted} {timeAgo(item.submittedAt)}</span>
                      {item.reviewedAt && <span>· {t.reviewed} {timeAgo(item.reviewedAt)}</span>}
                    </div>
                    {item.status === "rejected" && item.reason && (
                      <div className="mt-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-200">
                        <p className="text-[10px] text-rose-700"><span className="font-semibold">{t.rejectionReason}: </span>{item.reason}</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : item.id)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                </div>

                {item.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => updateStatus(item.id, "rejected")}>
                      <XCircle className="w-3.5 h-3.5" />{t.reject}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5 text-muted-foreground" onClick={() => setExpanded(isExpanded ? null : item.id)}>
                      <Eye className="w-3.5 h-3.5" />{t.review}
                    </Button>
                    <Button size="sm" className="flex-1 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateStatus(item.id, "approved")}>
                      <CheckCircle className="w-3.5 h-3.5" />{t.approve}
                    </Button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.25 }} className="border-t border-border px-4 py-3 bg-secondary/40">
                  <span className="text-xs text-muted-foreground block mb-1">{t.fullDesc}</span>
                  <p className="text-xs text-foreground leading-relaxed">{item.content}</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-foreground">{t.allClear}</p>
            <p className="text-xs text-muted-foreground mt-1">{interpolate(t.allClearDesc, { status: filter !== "all" ? filter : "" })}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
