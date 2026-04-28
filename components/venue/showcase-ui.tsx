import type { WeddingSetup } from "@/lib/venue/seed";

export const SETUP_DISPLAY: Record<WeddingSetup, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  both: "Outdoor + Indoor",
  tent: "Tent / Marquee",
};

export function VendorBadge({ kind }: { kind: "select" | "verified" }) {
  const label = kind === "select" ? "Select" : "Verified";
  const glyph = kind === "select" ? "✦" : "✓";
  const tone =
    kind === "select"
      ? { bg: "#FBF1DF", color: "#9E8245" }
      : { bg: "#EAF5EC", color: "#3E7F52" };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] font-mono text-[9.5px] uppercase tracking-[0.18em]"
      style={{ backgroundColor: tone.bg, color: tone.color }}
    >
      <span aria-hidden>{glyph}</span>
      {label}
    </span>
  );
}
