"use client";

import { useState } from "react";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  targetId: string;
  onAuthRequired?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function FollowButton({ targetId, onAuthRequired, className, size = "md" }: FollowButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const { isFollowing, toggleFollow } = useFollows();
  const [loading, setLoading] = useState(false);

  // Don't render without targetId or on own profile
  if (!targetId || user?.id === targetId) return null;

  const followed = isFollowing(targetId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { onAuthRequired?.(); return; }
    setLoading(true);
    await toggleFollow(targetId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-200",
        size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
        followed
          ? "bg-secondary text-muted-foreground hover:bg-rose-50 hover:text-rose-500 border border-border hover:border-rose-200"
          : "purple-gradient text-white hover:opacity-90",
        loading && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : followed ? (
        <UserCheck className={cn("flex-shrink-0", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      ) : (
        <UserPlus className={cn("flex-shrink-0", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      )}
      {followed ? "Obserwowane" : "Obserwuj"}
    </button>
  );
}
