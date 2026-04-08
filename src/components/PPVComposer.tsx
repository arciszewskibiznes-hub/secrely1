"use client";

import { useState, useRef } from "react";
import { Diamond } from "@/components/Diamond";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/useToast";
import { Lock, Image as ImageIcon, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const supabase = createClient();

interface PPVComposerProps {
  chatId: string;
  senderId: string;
  onSent: () => void;
  onCancel: () => void;
}

export function PPVComposer({ chatId, senderId, onSent, onCancel }: PPVComposerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [price, setPrice] = useState(25);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSend = async () => {
    if (!file || price < 1) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `ppv/${senderId}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(uploadData.path);
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      // Encode PPV data as JSON in content — works without schema cache
      const ppvContent = JSON.stringify({
        __ppv: true,
        media_url: urlData.publicUrl,
        media_type: mediaType,
        price,
        caption: caption.trim() || null,
      });

      const { error: msgError } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: senderId,
        content: ppvContent,
      });

      if (msgError) throw new Error(msgError.message);

      toast({ title: "PPV wysłane!", variant: "success" });
      onSent();
    } catch (err: any) {
      toast({ title: "Błąd", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-[hsl(270,75%,60%)] rounded-2xl p-3 space-y-3 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(270,75%,60%)]">
          <Lock className="w-4 h-4" /> PPV — płatna wiadomość
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!preview ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full h-28 rounded-xl border-2 border-dashed border-[hsl(270,75%,60%)] flex flex-col items-center justify-center gap-2 text-[hsl(270,75%,60%)] hover:bg-purple-50 transition-colors">
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Dodaj zdjęcie lub wideo</span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden h-28">
          <img src={preview} alt="" className="w-full h-full object-cover blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-xl px-3 py-1.5 text-white text-xs font-semibold flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Podgląd zablurowany
            </div>
          </div>
          <button onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      <Input placeholder="Podpis (opcjonalny)…" value={caption}
        onChange={(e) => setCaption(e.target.value)} className="text-sm" />

      <div className="flex items-center gap-2">
        <Diamond size={14} className="text-[hsl(270,75%,60%)] flex-shrink-0" />
        <span className="text-sm text-muted-foreground">Cena:</span>
        <div className="flex gap-1.5 flex-wrap">
          {[10, 25, 50, 100, 200].map((p) => (
            <button key={p} onClick={() => setPrice(p)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                price === p
                  ? "bg-[hsl(270,75%,60%)] text-white border-[hsl(270,75%,60%)]"
                  : "border-border text-muted-foreground hover:border-[hsl(270,75%,60%)]"
              )}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <Button variant="purple" size="sm" className="w-full gap-2"
        disabled={!file || uploading} onClick={handleSend}>
        {uploading
          ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <Send className="w-3.5 h-3.5" />
        }
        {uploading ? "Wysyłam…" : `Wyślij PPV za ${price} 💎`}
      </Button>
    </div>
  );
}
