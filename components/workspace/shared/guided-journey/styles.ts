// Shared design tokens for the generic guided journey shell.
// Mirrors the palette in components/workspace/photography/GuidedJourney.tsx
// so guided mode looks the same whether you're in Photography (bespoke
// implementation) or any other category (generic implementation).

export const C = {
  ivory: "#FBF9F4",
  ivorySoft: "#FAF7F2",
  paper: "#FFFFFF",
  champagne: "#F2EDE3",
  champagnePale: "#FBFAF7",
  ink: "#1A1A1A",
  inkSoft: "#2E2E2E",
  muted: "#6B6B6B",
  faint: "#A3A3A3",
  line: "rgba(26, 26, 26, 0.08)",
  lineSoft: "rgba(26, 26, 26, 0.04)",
  rose: "#C97B63",
  roseSoft: "#F5DDD2",
  rosePale: "#FBEFE9",
  gold: "#B8860B",
  goldDeep: "#8B6508",
  goldSoft: "#F0E4C8",
  leaf: "#9CAF88",
  amber: "#B45309",
  sage: "#6B7F5E",
  sageSoft: "#DFE5D8",
};

export const FONT_SERIF = `"Cormorant Garamond", "Playfair Display", Georgia, serif`;
export const FONT_SANS = `Inter, system-ui, sans-serif`;
export const FONT_MONO = `"JetBrains Mono", "Fira Code", monospace`;

export function statusColors(
  status: "not_started" | "in_progress" | "completed",
) {
  if (status === "completed") return { accent: C.sage, label: C.sage };
  if (status === "in_progress") return { accent: C.amber, label: C.amber };
  return { accent: C.faint, label: C.muted };
}
