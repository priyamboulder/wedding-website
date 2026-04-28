import type { VendorStatus } from "@/lib/planner/wedding-detail-seed";

type Style = {
  label: string;
  glyph: string;
  bg: string;
  fg: string;
  ring: string;
};

const STYLES: Record<VendorStatus, Style> = {
  booked: {
    label: "Booked",
    glyph: "✓",
    bg: "#EAF5EC",
    fg: "#1F7A3A",
    ring: "rgba(39, 174, 96, 0.35)",
  },
  contracted: {
    label: "Contracted",
    glyph: "📝",
    bg: "#E7EEF7",
    fg: "#2A558C",
    ring: "rgba(42, 85, 140, 0.28)",
  },
  "in-conversation": {
    label: "In Conversation",
    glyph: "💬",
    bg: "#FBF1DA",
    fg: "#8A5A20",
    ring: "rgba(196, 162, 101, 0.45)",
  },
  shortlisted: {
    label: "Shortlisted",
    glyph: "🔍",
    bg: "#EFE8F5",
    fg: "#5A3F88",
    ring: "rgba(90, 63, 136, 0.28)",
  },
  recommended: {
    label: "Recommended",
    glyph: "🔍",
    bg: "#F1EBFA",
    fg: "#5A3F88",
    ring: "rgba(90, 63, 136, 0.35)",
  },
  ordered: {
    label: "Ordered",
    glyph: "✓",
    bg: "#EAF5EC",
    fg: "#1F7A3A",
    ring: "rgba(39, 174, 96, 0.35)",
  },
  open: {
    label: "OPEN",
    glyph: "⚠",
    bg: "transparent",
    fg: "#C0392B",
    ring: "rgba(192, 57, 43, 0.55)",
  },
};

export function StatusBadge({ status }: { status: VendorStatus }) {
  const s = STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-medium"
      style={{
        backgroundColor: s.bg,
        color: s.fg,
        boxShadow: `inset 0 0 0 1px ${s.ring}`,
        letterSpacing: status === "open" ? "0.12em" : "0",
        fontFamily: status === "open" ? "'JetBrains Mono', monospace" : undefined,
      }}
    >
      <span aria-hidden className="text-[11px] leading-none">
        {s.glyph}
      </span>
      {s.label}
    </span>
  );
}
