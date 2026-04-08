"use client";

import { motion, AnimatePresence } from "motion/react";
import { useLangStore } from "@/store/langStore";
import { cn } from "@/lib/utils";

interface LangToggleProps {
  className?: string;
  /** "pill" = PL|EN slider (default), "button" = simple text button */
  variant?: "pill" | "button";
}

export function LangToggle({ className, variant = "pill" }: LangToggleProps) {
  const { lang, toggle } = useLangStore();

  if (variant === "button") {
    return (
      <button
        onClick={toggle}
        className={cn(
          "text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary",
          className
        )}
        aria-label="Switch language"
      >
        {lang === "en" ? "PL" : "EN"}
      </button>
    );
  }

  // Pill variant — animated sliding toggle
  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={cn(
        "relative flex items-center bg-secondary rounded-full p-0.5 gap-0 h-7 w-16 flex-shrink-0",
        className
      )}
    >
      {/* Sliding background */}
      <motion.span
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm"
        animate={{ left: lang === "en" ? 2 : "calc(50%)" }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      {/* Labels */}
      {(["en", "pl"] as const).map((l) => (
        <span
          key={l}
          className={cn(
            "relative z-10 flex-1 text-center text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 select-none",
            lang === l ? "text-[hsl(270,75%,60%)]" : "text-muted-foreground"
          )}
        >
          {l}
        </span>
      ))}
    </button>
  );
}
