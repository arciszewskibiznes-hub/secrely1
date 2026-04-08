import { cn } from "@/lib/utils";

interface DiamondProps {
  className?: string;
  size?: number;
}

// Custom diamond / gem icon — clean geometric shape
export function Diamond({ className, size = 14 }: DiamondProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("inline-block flex-shrink-0", className)}
      aria-hidden="true"
    >
      {/* Top facets */}
      <polygon points="12,2 20,9 12,9" fill="currentColor" opacity="0.6" />
      <polygon points="12,2 4,9 12,9" fill="currentColor" opacity="0.85" />
      {/* Bottom large facet */}
      <polygon points="4,9 12,22 20,9" fill="currentColor" />
      {/* Center line for depth */}
      <polygon points="12,9 12,22 20,9" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

// Inline credits display: gem icon + number
export function Credits({
  amount,
  className,
  iconSize = 12,
}: {
  amount: number;
  className?: string;
  iconSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Diamond size={iconSize} className="text-[hsl(270,75%,60%)]" />
      <span className="tabular-nums font-semibold">{amount.toLocaleString()}</span>
    </span>
  );
}
