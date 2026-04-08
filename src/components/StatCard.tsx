import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Diamond } from "@/components/Diamond";
import { cn } from "@/lib/utils";
import type { DashboardMetric } from "@/types/database";

interface StatCardProps {
  metric: DashboardMetric;
  className?: string;
}

export function StatCard({ metric, className }: StatCardProps) {
  const isUp = metric.trend === "up";
  const isDown = metric.trend === "down";
  // Show diamond icon if label contains "Zarobki" or "Odblokowania"
  const showDiamond = metric.label.includes("Zarobki") || metric.label.includes("💎");
  // Clean label - remove emoji
  const cleanLabel = metric.label.replace(" 💎", "");

  return (
    <div className={cn("card-base p-4", className)}>
      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
        {showDiamond && <Diamond size={11} className="text-[hsl(270,75%,60%)]" />}
        {cleanLabel}
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums mb-1.5 flex items-center gap-1.5">
        {showDiamond && <Diamond size={18} className="text-[hsl(270,75%,60%)]" />}
        {metric.value}
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isUp && "text-emerald-600",
        isDown && "text-rose-500",
        !isUp && !isDown && "text-muted-foreground"
      )}>
        {isUp && <TrendingUp className="w-3 h-3" />}
        {isDown && <TrendingDown className="w-3 h-3" />}
        {!isUp && !isDown && <Minus className="w-3 h-3" />}
        <span>
          {isUp && "+"}
          {metric.change}{typeof metric.change === "number" && "%"} {metric.changeLabel}
        </span>
      </div>
    </div>
  );
}
