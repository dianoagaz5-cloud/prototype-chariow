"use client";

import { useEffect, useState } from "react";

export function Countdown({ to, className }: { to: Date | string | number; className?: string }) {
  const target = typeof to === "object" ? to.getTime() : new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? 0 : Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold tabular-nums ${className ?? ""}`}>
      <Box>{pad(h)}</Box>:<Box>{pad(m)}</Box>:<Box>{pad(s)}</Box>
    </span>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-grid min-w-[2ch] place-items-center rounded-md bg-zinc-900 px-1.5 py-0.5 text-xs text-white">
      {children}
    </span>
  );
}
