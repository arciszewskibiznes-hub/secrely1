"use client";

import { useState } from "react";
import { Diamond } from "@/components/Diamond";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "@/hooks/useToast";
import { Lock, Play } from "lucide-react";

const supabase = createClient();

interface PPVData {
  __ppv: boolean;
  media_url: string;
  media_type: string;
  price: number;
  caption: string | null;
}

export function parsePPV(content: string | null): PPVData | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed.__ppv) return parsed as PPVData;
  } catch {}
  return null;
}

interface PPVMessageProps {
  messageId: string;
  senderId: string;
  currentUserId: string;
  ppvData: PPVData;
}

export function PPVMessage({ messageId, senderId, currentUserId, ppvData }: PPVMessageProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const { balance, spendCredits, refresh } = useCredits();
  const isOwner = senderId === currentUserId;

  const handleUnlock = async () => {
    if (balance < ppvData.price) {
      toast({ title: "Za mało diamentów", description: "Doładuj portfel", variant: "destructive" });
      return;
    }
    setUnlocking(true);

    // Spend credits from buyer
    const ok = await spendCredits(ppvData.price, `PPV wiadomość`);
    if (!ok) {
      toast({ title: "Błąd płatności", variant: "destructive" });
      setUnlocking(false);
      return;
    }

    // Pay creator directly
    const { data: creatorBal } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", senderId)
      .single();

    if (creatorBal) {
      await supabase
        .from("credit_balances")
        .update({ balance: creatorBal.balance + ppvData.price })
        .eq("user_id", senderId);

      await supabase.from("credit_transactions").insert({
        user_id: senderId,
        amount: ppvData.price,
        type: "earning",
      });
    }

    await refresh();
    setUnlocked(true);
    toast({ title: "Odblokowano! 💎", variant: "success" });
    setUnlocking(false);
  };

  if (isOwner || unlocked) {
    return (
      <div className="rounded-xl overflow-hidden max-w-[240px] space-y-1">
        {ppvData.media_type === "video" ? (
          <video src={ppvData.media_url} controls className="w-full rounded-xl" />
        ) : (
          <img src={ppvData.media_url} alt="" className="w-full rounded-xl object-cover" />
        )}
        {ppvData.caption && (
          <p className="text-xs text-muted-foreground px-1">{ppvData.caption}</p>
        )}
        {isOwner && (
          <div className="flex items-center gap-1 text-[10px] text-[hsl(270,75%,60%)] px-1">
            <Lock className="w-2.5 h-2.5" /> PPV ·
            <Diamond size={9} className="text-[hsl(270,75%,60%)]" />{ppvData.price}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden max-w-[240px] space-y-1">
      <div className="relative">
        <img src={ppvData.media_url} alt=""
          className="w-full rounded-xl object-cover blur-lg scale-105"
          style={{ height: 160 }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[hsl(270,75%,60%)] flex items-center justify-center">
            {ppvData.media_type === "video"
              ? <Play className="w-5 h-5 text-white fill-white" />
              : <Lock className="w-5 h-5 text-white" />
            }
          </div>
          <div className="text-white text-xs font-semibold">
            {ppvData.media_type === "video" ? "Płatne wideo" : "Płatne zdjęcie"}
          </div>
        </div>
      </div>
      {ppvData.caption && (
        <p className="text-xs text-muted-foreground px-1">{ppvData.caption}</p>
      )}
      <Button variant="purple" size="sm" className="w-full gap-1.5 h-8 text-xs"
        disabled={unlocking} onClick={handleUnlock}>
        {unlocking
          ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <><Diamond size={11} className="text-white" /> Odblokuj za {ppvData.price}</>
        }
      </Button>
    </div>
  );
}
