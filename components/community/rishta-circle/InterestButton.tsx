"use client";

import { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createInterest,
  getCurrentUserId,
  getInterestBetween,
} from "@/lib/rishta-circle/storage";

export function InterestButton({
  toMemberId,
  compact = false,
  className,
}: {
  toMemberId: string;
  compact?: boolean;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const uid = getCurrentUserId();
    setCurrentUserId(uid);
    if (uid) {
      const existing = getInterestBetween(uid, toMemberId);
      setSent(Boolean(existing));
    }
    setMounted(true);
  }, [toMemberId]);

  if (!mounted) return null;
  if (!currentUserId || currentUserId === toMemberId) return null;

  const onClick = () => {
    createInterest(currentUserId, toMemberId);
    setSent(true);
  };

  const base = compact
    ? "px-3.5 py-1.5 text-[12px]"
    : "px-5 py-2.5 text-[13px]";

  if (sent) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-pale/50 font-medium text-ink-soft",
          base,
          className,
        )}
      >
        <Check size={13} strokeWidth={2} />
        Interest Sent
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold bg-white font-medium text-gold transition-colors hover:bg-gold hover:text-white",
        base,
        className,
      )}
    >
      <Heart size={13} strokeWidth={2} />
      Express Interest
    </button>
  );
}
