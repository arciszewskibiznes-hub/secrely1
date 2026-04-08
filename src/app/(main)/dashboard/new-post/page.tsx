"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ImagePlus, Lock, Unlock, Hash, CheckCircle, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

const supabase = createClient();


type Orientation = "portrait" | "landscape" | "square";

interface ImageInfo {
  file: File;
  preview: string;
  orientation: Orientation;
  width: number;
  height: number;
}

function getOrientation(w: number, h: number): Orientation {
  const ratio = w / h;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.87) return "portrait";
  return "square";
}

async function readImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          file,
          preview: e.target?.result as string,
          orientation: getOrientation(w, h),
          width: w,
          height: h,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Cannot read image")); };
    img.src = url;
  });
}

export default function NewPostPage() {
  const [caption, setCaption] = useState("");
  const [teaserText, setTeaserText] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [price, setPrice] = useState("50");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const router = useRouter();
  const t = useT().newPost;

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 50MB.");
      return;
    }
    try {
      const info = await readImageInfo(file);
      setImageInfo(info);
    } catch {
      setUploadError("Could not read image. Please try another file.");
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const removeImage = () => {
    setImageInfo(null);
    setUploadError(null);
    setUploadStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#+/, "").trim().replace(/\s+/g, "").slice(0, 20);
    if (!tag) return;
    setSelectedTags((prev) => {
      if (prev.includes(tag) || prev.length >= 5) return prev;
      return [...prev, tag];
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!caption.trim()) {
      toast({ title: t.errorCaption, description: t.errorCaptionDesc, variant: "destructive" });
      return;
    }
    if (!user?.id) {
      toast({ title: "Not logged in", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    let imageUrl: string | null = null;

    // Upload image directly — no listBuckets() check (requires service role)
    if (imageInfo?.file) {
      setUploadStatus("Uploading image…");

      const ext = imageInfo.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, imageInfo.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageInfo.file.type,
        });

      if (uploadError) {
        // Give user a clear actionable message based on error type
        let msg = uploadError.message;
        if (msg.includes("Bucket not found")) {
          msg = 'Bucket "posts" not found. Go to Supabase → Storage → New bucket → name: posts, Public: ON.';
        } else if (msg.includes("row-level security") || msg.includes("policy")) {
          msg = "Permission denied. Run the storage policy SQL in Supabase SQL Editor.";
        } else if (msg.includes("413") || msg.includes("too large")) {
          msg = "File is too large for the storage bucket limit.";
        }
        setUploadError(msg);
        setSubmitting(false);
        setUploadStatus("");
        return;
      }

      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    // Save post to database
    setUploadStatus("Saving post…");

    const { error: postError } = await supabase.from("posts").insert({
      creator_id: user.id,
      image_url: imageUrl,
      caption: caption.trim(),
      teaser_text: teaserText.trim() || null,
      is_locked: isLocked,
      price: isLocked ? Math.max(1, parseInt(price, 10) || 50) : 0,
      tags: selectedTags.length > 0 ? selectedTags : null,
    });

    setSubmitting(false);
    setUploadStatus("");

    if (postError) {
      setUploadError(`Failed to save post: ${postError.message}`);
      return;
    }

    setSubmitted(true);
    toast({ title: "Post published! 🎉", description: "It is now live on the feed.", variant: "success" });
  };

  const aspectClass =
    imageInfo?.orientation === "landscape" ? "aspect-video"
    : imageInfo?.orientation === "portrait" ? "aspect-[3/4]"
    : "aspect-square";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{t.successTitle}</h2>
          <p className="text-sm text-muted-foreground max-w-xs">{t.successDesc}</p>
          <div className="flex gap-3 mt-8 justify-center">
            <Button variant="outline" onClick={() => {
              setSubmitted(false); setCaption(""); setTeaserText("");
              setSelectedTags([]); setImageInfo(null);
            }}>
              {t.createAnother}
            </Button>
            <Button variant="purple" onClick={() => router.push("/feed")}>Go to Feed</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }} className="space-y-5 max-w-xl mx-auto">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Image area */}
        {imageInfo ? (
          <div className={cn("relative rounded-2xl overflow-hidden bg-secondary w-full", aspectClass)}>
            <Image src={imageInfo.preview} alt="Preview" fill className="object-cover" sizes="600px" />
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full capitalize">
              {imageInfo.orientation} · {imageInfo.width}×{imageInfo.height}
            </div>
            <button type="button" onClick={removeImage}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all",
              isDragging ? "border-[hsl(270,75%,60%)] bg-purple-50"
                : "border-border hover:border-[hsl(270,75%,60%)] hover:bg-purple-50/50"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-[hsl(270,75%,60%)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{t.dropzone}</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP · Max 50MB</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 text-purple-500">
                Portrait / landscape detected automatically
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">{t.browse}</Button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

        {/* Error display */}
        {uploadError && (
          <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl p-3 border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Caption */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.caption}</label>
          <textarea placeholder={t.captionPlaceholder} value={caption}
            onChange={(e) => setCaption(e.target.value)} rows={3} maxLength={500}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-all" />
          <div className="text-[10px] text-muted-foreground text-right">{caption.length}/500</div>
        </div>

        {/* Teaser */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.teaserLabel} <span className="text-muted-foreground font-normal">{t.teaserNote}</span>
          </label>
          <Input placeholder={t.teaserPlaceholder} value={teaserText}
            onChange={(e) => setTeaserText(e.target.value)} />
        </div>

        {/* Lock */}
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="space-y-1.5 pt-2 border-t border-border overflow-hidden">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.priceLabel}</label>
              <div className="flex gap-2">
                {["25", "50", "75", "100", "150"].map((p) => (
                  <button key={p} type="button" onClick={() => setPrice(p)}
                    className={cn("flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                      price === p ? "bg-[hsl(270,75%,60%)] text-white border-[hsl(270,75%,60%)]"
                        : "bg-white border-border text-muted-foreground hover:border-[hsl(270,75%,60%)]")}>
                    {p}
                  </button>
                ))}
              </div>
              <Input type="number" placeholder={t.customPrice} value={price}
                onChange={(e) => setPrice(e.target.value)} min="1" max="9999" className="mt-2" />
            </motion.div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hasztagi
              </label>
            </div>
            <span className={cn("text-xs", selectedTags.length >= 5 ? "text-amber-500 font-medium" : "text-muted-foreground")}>
              {selectedTags.length}/5
            </span>
          </div>

          {/* Tag chips + input */}
          <div className={cn(
            "flex flex-wrap gap-1.5 min-h-[44px] px-3 py-2 rounded-xl border bg-white transition-colors",
            selectedTags.length >= 5 ? "border-border" : "border-border focus-within:border-[hsl(270,75%,60%)]"
          )}>
            {selectedTags.map((tag) => (
              <span key={tag}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(270,75%,60%)] text-white">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)}
                  className="hover:opacity-70 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedTags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value.replace(/\s/g, ""))}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                placeholder={selectedTags.length === 0 ? "Wpisz hasztag i naciśnij Enter…" : "Dodaj kolejny…"}
                className="flex-1 min-w-[120px] text-xs outline-none bg-transparent placeholder:text-muted-foreground"
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Naciśnij <kbd className="px-1 py-0.5 rounded bg-secondary text-[9px]">Enter</kbd> lub <kbd className="px-1 py-0.5 rounded bg-secondary text-[9px]">Spacja</kbd> aby dodać · Max 5 hasztagów · Max 20 znaków
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" disabled={submitting}>{t.saveDraft}</Button>
          <Button type="submit" variant="purple" className="flex-1" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {uploadStatus || "Publishing…"}
              </span>
            ) : t.submit}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">{t.reviewNote}</p>
      </form>
    </motion.div>
  );
}
