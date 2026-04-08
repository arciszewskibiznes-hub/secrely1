"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ImagePlus, Lock, Unlock, Tag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Photography", "Art", "Fitness", "Music", "Cooking", "Lifestyle", "Tutorial", "Behind the Scenes"];

export default function NewPostPage() {
  const [caption, setCaption] = useState("");
  const [teaserText, setTeaserText] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [price, setPrice] = useState("50");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuth();
  const t = useT().newPost;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast({ title: t.errorCaption, description: t.errorCaptionDesc, variant: "destructive" });
      return;
    }
    if (!user) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("posts").insert({
      creator_id: user.id,
      caption: caption.trim(),
      teaser_text: teaserText.trim() || null,
      is_locked: isLocked,
      price: isLocked ? parseInt(price, 10) || 50 : 0,
      tags: selectedTags.length > 0 ? selectedTags : null,
    });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      toast({ title: t.toastTitle, description: t.toastDesc, variant: "success" });
    } else {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{t.successTitle}</h2>
          <p className="text-sm text-muted-foreground max-w-xs">{t.successDesc}</p>
          <div className="flex gap-3 mt-8 justify-center">
            <Button variant="outline" onClick={() => { setSubmitted(false); setCaption(""); setTeaserText(""); setSelectedTags([]); }}>{t.createAnother}</Button>
            <Button variant="purple" asChild><a href="/dashboard">{t.viewDashboard}</a></Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload area (UI only — connect to Supabase Storage when ready) */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={cn("border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all", isDragging ? "border-[hsl(270,75%,60%)] bg-purple-50" : "border-border hover:border-[hsl(270,75%,60%)] hover:bg-purple-50/50")}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-[hsl(270,75%,60%)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{t.dropzone}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.dropzoneHint}</p>
          </div>
          <Button type="button" variant="outline" size="sm">{t.browse}</Button>
          <p className="text-[10px] text-muted-foreground">Image upload: connect to Supabase Storage</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.caption}</label>
          <textarea
            placeholder={t.captionPlaceholder}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-all"
          />
          <div className="text-[10px] text-muted-foreground text-right">{caption.length}/500</div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.teaserLabel} <span className="text-muted-foreground font-normal">{t.teaserNote}</span>
          </label>
          <Input placeholder={t.teaserPlaceholder} value={teaserText} onChange={(e) => setTeaserText(e.target.value)} />
        </div>

        <div className="card-base p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isLocked ? <Lock className="w-4 h-4 text-[hsl(270,75%,60%)]" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
              <div>
                <div className="text-sm font-semibold text-foreground">{isLocked ? t.lockLabel : t.freeLabel}</div>
                <div className="text-xs text-muted-foreground">{isLocked ? t.lockDesc : t.freeDesc}</div>
              </div>
            </div>
            <Switch checked={isLocked} onCheckedChange={setIsLocked} />
          </div>

          {isLocked && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.priceLabel}</label>
              <div className="flex gap-2">
                {["25", "50", "75", "100", "150"].map((p) => (
                  <button key={p} type="button" onClick={() => setPrice(p)}
                    className={cn("flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border", price === p ? "bg-[hsl(270,75%,60%)] text-white border-[hsl(270,75%,60%)]" : "bg-white border-border text-muted-foreground hover:border-[hsl(270,75%,60%)] hover:text-[hsl(270,75%,60%)]")}>
                    {p}
                  </button>
                ))}
              </div>
              <Input type="number" placeholder={t.customPrice} value={price} onChange={(e) => setPrice(e.target.value)} min="1" max="500" className="mt-2" />
            </motion.div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.tagsLabel} <span className="text-muted-foreground font-normal">{t.tagsNote}</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => toggleTag(cat)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border", selectedTags.includes(cat) ? "bg-[hsl(270,75%,60%)] text-white border-[hsl(270,75%,60%)]" : "bg-white border-border text-muted-foreground hover:border-[hsl(270,75%,60%)] hover:text-[hsl(270,75%,60%)]")}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1">{t.saveDraft}</Button>
          <Button type="submit" variant="purple" className="flex-1" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing…
              </span>
            ) : t.submit}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">{t.reviewNote}</p>
      </form>
    </motion.div>
  );
}
