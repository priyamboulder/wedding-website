"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/checklist";
import { AVATAR_PALETTE, avatarInitial } from "./palette";

// ── Hex helpers ─────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function MemberTooltip({ member }: { member: Member }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-white px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      style={{ borderColor: "#eeeae2" }}
    >
      <div className="font-serif text-[14px] leading-tight text-ink">
        {member.name}
      </div>
      <div className="mt-0.5 text-[11px] text-ink-faint">{member.email}</div>
    </motion.div>
  );
}

// ── Single avatar ──────────────────────────────────────────────────────────

export function Avatar({
  member,
  size = 22,
  showTooltip = true,
  className,
  style,
  onClick,
  title,
}: {
  member: Member;
  size?: number;
  showTooltip?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const hex = AVATAR_PALETTE[member.avatarColor].bg;
  const bg = hexToRgba(hex, 0.85);
  const fontSize = Math.round(size * 0.5);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center rounded-full",
        onClick && "cursor-pointer",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      title={title}
      aria-label={member.name}
    >
      <span
        className="font-semibold text-white"
        style={{
          fontSize: Math.max(10, fontSize),
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        {avatarInitial(member.name)}
      </span>
      <AnimatePresence>
        {showTooltip && hovered && <MemberTooltip member={member} />}
      </AnimatePresence>
    </span>
  );
}

// ── Stack of avatars ───────────────────────────────────────────────────────

export function AvatarStack({
  members,
  max = 3,
  size = 22,
  onClick,
  className,
}: {
  members: Member[];
  max?: number;
  size?: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  return (
    <span
      className={cn("inline-flex items-center", className)}
      onClick={onClick}
    >
      {visible.map((m, i) => (
        <Avatar
          key={m.id}
          member={m}
          size={size}
          style={{
            marginLeft: i === 0 ? 0 : -6,
            zIndex: visible.length - i,
          }}
        />
      ))}
      {overflow > 0 && (
        <span
          className="relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-ivory-warm font-mono text-[10px] font-medium text-ink-muted"
          style={{
            width: size,
            height: size,
            marginLeft: -6,
            zIndex: 0,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
          }}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
