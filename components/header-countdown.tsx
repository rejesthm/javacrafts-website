"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 30 * 60 * 1000;
const STORAGE_KEY = "java-crafts-header-countdown-until";

function getOrCreateDeadline(): number {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    const until = parseInt(raw, 10);
    if (!Number.isNaN(until) && until > Date.now()) return until;
  }
  const until = Date.now() + DURATION_MS;
  sessionStorage.setItem(STORAGE_KEY, String(until));
  return until;
}

function formatRemaining(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function HeaderCountdown() {
  const [remainingSec, setRemainingSec] = useState<number | null>(null);

  useEffect(() => {
    const deadline = getOrCreateDeadline();
    const tick = () => {
      setRemainingSec(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const seconds = remainingSec ?? 30 * 60;
  const label = formatRemaining(seconds);

  return (
    <span
      className="inline-flex min-w-[3.25rem] justify-center tabular-nums tracking-tight"
      role="timer"
      aria-live="polite"
      aria-label={`${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds remaining on this offer`}
    >
      {label}
    </span>
  );
}