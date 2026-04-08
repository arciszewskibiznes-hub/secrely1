"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Diamond } from "@/components/Diamond";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/useToast";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/database";

const supabase = createClient();

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

interface TipModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

export function TipModal({ open, onClose, post }: TipModalProps) {
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { balance, refresh } = useCredits();
  const { user } = useAuth();
  const router = useRouter();

  const creator = post.creator;
  const creatorName = creator?.display_name ?? creator?.username ?? "Creator";
  const creatorAvatar = creator?.avatar_url ?? "";
  const creatorId = (post as any).creator_id ?? creator?.id;

  const finalAmount = useCustom ? parseInt(custom, 10) || 0 : amount;
  const canSend = finalAmount > 0 && balance >= finalAmount && creatorId && creatorId !== user?.id;

  const handleSend = async () => {
    if (!canSend || !user?.id) return;
    setSending(true);

    try {
      // 1. Insert tip — trigger handles payment + notification
      const { error: tipError } = await supabase.from("tips").insert({
        from_user: user.id,
        to_user: creatorId,
        post_id: post.id,
        amount: finalAmount,
        message: message.trim() || null,
      });

      if (tipError) {
        toast({ title: "Błąd wysyłania napiwku", description: tipError.message, variant: "destructive" });
        setSending(false);
        return;
      }

      // 2. Get or create chat via RPC (bypasses RLS)
      const { data: chatId, error: chatError } = await supabase.rpc("get_or_create_chat", {
        p_user1: user.id,
        p_user2: creatorId,
      });

      if (!chatError && chatId) {
        // 3. Send tip message via RPC
        const tipMsg = message.trim()
          ? `💎 Napiwek ${finalAmount} diamentów\n\n"${message.trim()}"`
          : `💎 Wysłałem/am Ci napiwek ${finalAmount} diamentów!`;

        await supabase.rpc("send_message_as", {
          p_chat_id: chatId,
          p_sender_id: user.id,
          p_content: tipMsg,
        });
      }

      await refresh();

      toast({
        title: `Napiwek wysłany! 💎`,
        description: `${finalAmount} diamentów do ${creatorName}`,
        variant: "success",
      });

      onClose();

      // 4. Navigate to the conversation
      router.push("/messages");

    } catch (err: any) {
      toast({ title: "Błąd", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setMessage("");
      setCustom("");
      setUseCustom(false);
      setAmount(25);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Diamond size={16} className="text-[hsl(270,75%,60%)]" /> Wyślij napiwek
          </DialogTitle>
        </DialogHeader>

        {/* Creator */}
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
          <Avatar className="w-10 h-10">
            <AvatarImage src={creatorAvatar} />
            <AvatarFallback>{getInitials(creatorName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold">{creatorName}</div>
            <div className="text-xs text-muted-foreground">@{creator?.username}</div>
          </div>
        </div>

        {/* Preset amounts */}
        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setUseCustom(false); }}
              className={cn(
                "py-2 rounded-xl text-sm font-semibold border transition-all",
                !useCustom && amount === a
                  ? "bg-[hsl(270,75%,60%)] text-white border-[hsl(270,75%,60%)]"
                  : "bg-white border-border text-muted-foreground hover:border-[hsl(270,75%,60%)]"
              )}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Własna kwota
          </label>
          <div className="relative">
            <Diamond size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(270,75%,60%)]" />
            <Input
              type="number"
              placeholder="np. 500"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setUseCustom(true); }}
              className="pl-8"
              min="1"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Wiadomość <span className="font-normal normal-case">(opcjonalna)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            placeholder="Napisz coś do twórcy…"
            rows={2}
            maxLength={200}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <div className={cn("text-[10px] text-right", message.length >= 180 ? "text-amber-500" : "text-muted-foreground")}>
            {message.length}/200
          </div>
          <p className="text-[10px] text-muted-foreground">
            Po wysłaniu napiwku rozmowa z twórcą pojawi się w wiadomościach
          </p>
        </div>

        {/* Balance summary */}
        <div className="bg-purple-50 rounded-xl p-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Napiwek</span>
            <span className="font-semibold flex items-center gap-1">
              <Diamond size={12} className="text-[hsl(270,75%,60%)]" />{finalAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Twoje saldo</span>
            <span className={cn("font-semibold flex items-center gap-1", balance >= finalAmount ? "text-emerald-600" : "text-rose-500")}>
              <Diamond size={12} className="text-current" />{balance}
            </span>
          </div>
          {finalAmount > 0 && balance >= finalAmount && (
            <div className="flex justify-between text-sm pt-1 border-t border-purple-200">
              <span className="text-muted-foreground">Po wysłaniu</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Diamond size={12} className="text-[hsl(270,75%,60%)]" />{balance - finalAmount}
              </span>
            </div>
          )}
        </div>

        {balance < finalAmount && finalAmount > 0 && (
          <p className="text-xs text-rose-500 text-center">Za mało diamentów. Doładuj portfel.</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={sending}>
            Anuluj
          </Button>
          <Button variant="purple" className="flex-1" onClick={handleSend} disabled={!canSend || sending}>
            {sending ? "Wysyłam…" : `Wyślij ${finalAmount} 💎`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
