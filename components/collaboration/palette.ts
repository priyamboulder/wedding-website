import type { AvatarColorName } from "@/types/checklist";

// Muted palette that sits inside the champagne/ivory system.
export const AVATAR_PALETTE: Record<
  AvatarColorName,
  { bg: string; label: string }
> = {
  dustyRose: { bg: "#C97B63", label: "Dusty rose" },
  sage: { bg: "#9CAF88", label: "Sage" },
  terracotta: { bg: "#C6856A", label: "Terracotta" },
  slate: { bg: "#7C8894", label: "Slate" },
  plum: { bg: "#8E6B8E", label: "Plum" },
  ochre: { bg: "#C89A4E", label: "Ochre" },
};

const PALETTE_ORDER: AvatarColorName[] = [
  "dustyRose",
  "sage",
  "terracotta",
  "slate",
  "plum",
  "ochre",
];

// Simple deterministic hash on the name so the same person always gets
// the same colour across sessions.
export function colorForName(name: string): AvatarColorName {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE_ORDER[hash % PALETTE_ORDER.length];
}

export function avatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}
