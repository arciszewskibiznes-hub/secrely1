"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Diamond } from "@/components/Diamond";
import { useCredits } from "@/hooks/useCredits";
import { useUnlocked } from "@/hooks/useUnlocked";
import { toast } from "@/hooks/useToast";
import { useT, interpolate } from "@/hooks/useT";
import Link from "next/link";
import { formatCredits, getInitials } from "@/lib/utils";
import type { Post } from "@/types/database";

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

type Step = "confirm" | "success" | "insufficient" | "error";

export function UnlockModal({ open, onClose, post }: UnlockModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { balance, spendCredits } = useCredits();
  const { unlockPost } = useUnlocked();
  const t = useT().unlock;
  const canAfford = balance >= post.price;

  const creator = post.creator;
  const creatorName = creator?.display_name ?? creator?.username ?? "Creator";
  const creatorUsername = creator?.username ?? "";
  const creatorAvatar = creator?.avatar_url ?? "";

  const handleUnlock = async () => {
    setIsLoading(true);
    const description = `${(post.teaser_text ?? post.caption ?? "").slice(0, 60)} — ${creatorName}`;

    const success = await spendCredits(post.price, description, post.id);

    if (success) {
      await unlockPost(post.id);

      // Creator payment is handled server-side by pay_creator_on_unlock trigger
      // Close immediately so user sees unblurred content right away
      handleClose();
      toast({
        title: t.successTitle + " 🎉",
        description: interpolate(t.successDesc, { name: creatorName }),
        variant: "success",
      });
    } else if (balance < post.price) {
      setStep("insufficient");
    } else {
      setStep("error");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    // Reset step after animation completes
    setTimeout(() => setStep("confirm"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">{t.title}</DialogTitle>
              <DialogDescription className="text-center">
                {interpolate(t.description, { name: creatorName })}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
              <Avatar className="w-10 h-10">
                <AvatarImage src={creatorAvatar} />
                <AvatarFallback>{getInitials(creatorName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{creatorName}</div>
                <div className="text-xs text-muted-foreground">@{creatorUsername}</div>
              </div>
            </div>

            {post.image_url && (
              <div className="relative h-32 rounded-xl overflow-hidden">
                <Image
                  src={post.image_url}
                  alt=""
                  fill
                  className="object-cover locked-blur"
                  sizes="400px"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-xl purple-gradient flex items-center justify-center shadow-lg">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {post.teaser_text ?? post.caption ?? ""}
            </p>

            <div className="bg-purple-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.unlockPrice}</span>
                <span className="font-semibold flex items-center gap-1">
                  <Diamond size={14} className="text-[hsl(270,75%,60%)]" />
                  {post.price}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.yourBalance}</span>
                <span className={`font-semibold flex items-center gap-1 ${canAfford ? "text-emerald-600" : "text-rose-500"}`}>
                  <Diamond size={12} className="text-current" />{formatCredits(balance)}
                </span>
              </div>
              {canAfford && (
                <div className="flex items-center justify-between text-sm pt-1 border-t border-purple-200">
                  <span className="text-muted-foreground">{t.afterUnlock}</span>
                  <span className="font-semibold text-foreground">
                    <Diamond size={12} className="text-current" /><span>{formatCredits(balance - post.price)}</span>
                  </span>
                </div>
              )}
            </div>

            {!canAfford && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t.notEnough}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                {t.cancel}
              </Button>
              {canAfford ? (
                <Button
                  variant="purple"
                  className="flex-1"
                  onClick={handleUnlock}
                  disabled={isLoading}
                >
                  {isLoading
                    ? t.unlocking
                    : <span className="flex items-center gap-1.5">Odblokuj za <Diamond size={13} className="text-white" />{post.price}</span>}
                </Button>
              ) : (
                <Link href="/wallet" onClick={handleClose} className="flex-1">
                  <Button variant="default" className="w-full">
                    {t.getCredits}
                  </Button>
                </Link>
              )}
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t.successTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {interpolate(t.successDesc, { name: creatorName })}
              </p>
            </div>
            <Button variant="purple" className="w-full" onClick={handleClose}>
              {t.viewContent}
            </Button>
          </div>
        )}

        {(step === "insufficient" || step === "error") && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {step === "insufficient" ? t.insufficientTitle : "Something went wrong"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "insufficient"
                  ? t.insufficientDesc
                  : "Please try again. If the problem persists, contact support."}
              </p>
            </div>
            {step === "insufficient" ? (
              <Link href="/wallet" onClick={handleClose} className="w-full">
                <Button variant="purple" className="w-full">{t.topUp}</Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setStep("confirm")}>
                Try again
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
