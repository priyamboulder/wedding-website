// ── share/Badge ─────────────────────────────────────────────────────────────
// Punchy pill badges with a colored top-border accent. Matches The Marigold's
// MOST READ / FAN FAVORITE pattern and powers DIY STORYTELLER, GUIDED BY AI,
// CHRONOLOGICAL, etc.

import { cn } from "@/lib/utils";

type Tone = "wine" | "rose" | "gold" | "saffron" | "sage" | "ink";

const TONE_STYLES: Record<Tone, { bg: string; text: string; bar: string }> = {
  wine: {
    bg: "bg-[#7E1F3D]",
    text: "text-ivory",
    bar: "bg-[#3F1020]",
  },
  rose: {
    bg: "bg-rose",
    text: "text-ivory",
    bar: "bg-[#8C5142]",
  },
  gold: {
    bg: "bg-gold",
    text: "text-ivory",
    bar: "bg-[#7A570A]",
  },
  saffron: {
    bg: "bg-saffron",
    text: "text-ink",
    bar: "bg-[#A07728]",
  },
  sage: {
    bg: "bg-sage",
    text: "text-ivory",
    bar: "bg-[#5C7048]",
  },
  ink: {
    bg: "bg-ink",
    text: "text-ivory",
    bar: "bg-[#000]",
  },
};

export function Badge({
  children,
  tone = "wine",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE_STYLES[tone];
  return (
    <span
      className={cn(
        "relative inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
        t.bg,
        t.text,
        className,
      )}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-[2px] rounded-t-md", t.bar)}
      />
      {children}
    </span>
  );
}
