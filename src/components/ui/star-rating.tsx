import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 14,
  showNumber = true,
  className,
}: {
  value: number;
  size?: number;
  showNumber?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(v) ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
          />
        ))}
      </span>
      {showNumber && <span className="text-xs text-muted-foreground">{v.toFixed(1)}</span>}
    </span>
  );
}
