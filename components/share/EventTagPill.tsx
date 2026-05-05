// ── EventTagPill ────────────────────────────────────────────────────────────
// The outlined small-caps event pills — HALDI · MEHENDI · SANGEET — that
// match the Real Wedding card row style.

import { cn } from "@/lib/utils";
import type { EventTag } from "@/types/share-shaadi";
import { EVENT_TAG_LABEL } from "@/types/share-shaadi";

export function EventTagPill({
  event,
  active,
  onClick,
  size = "md",
}: {
  event: EventTag;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const interactive = Boolean(onClick);
  const Comp: any = interactive ? "button" : "span";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border font-medium uppercase tracking-[0.18em] transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[10.5px]",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-ink/25 bg-white text-ink hover:border-gold/50 hover:text-ink",
      )}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {EVENT_TAG_LABEL[event].toUpperCase()}
    </Comp>
  );
}
