// ── Color-name lookup ───────────────────────────────────────────────────────
// Given a hex like "#E8B84B" return a wedding-friendly name like "Marigold"
// by finding the nearest named colour in a curated list. Used for the inline
// AI color-identification label in the Colour Story block.

type NamedColor = { hex: string; name: string };

const NAMED_COLORS: NamedColor[] = [
  { hex: "#FFFDF7", name: "Ivory" },
  { hex: "#FFF8EA", name: "Warm Ivory" },
  { hex: "#FBF6EC", name: "Cream" },
  { hex: "#F5ECE1", name: "Champagne" },
  { hex: "#EDD7B5", name: "Deep Champagne" },
  { hex: "#F5E6D3", name: "Beige" },
  { hex: "#E8D5B8", name: "Sand" },
  { hex: "#D9C8A8", name: "Oat" },
  { hex: "#B89B7E", name: "Antique Gold" },
  { hex: "#A89577", name: "Driftwood" },
  { hex: "#B09A86", name: "Taupe" },
  { hex: "#816655", name: "Mocha" },
  { hex: "#5A4434", name: "Walnut" },
  { hex: "#3D2B1F", name: "Cocoa" },
  { hex: "#F5D547", name: "Turmeric" },
  { hex: "#E8B84B", name: "Marigold" },
  { hex: "#E09E2E", name: "Saffron" },
  { hex: "#F2A83B", name: "Amber" },
  { hex: "#D4A853", name: "Antique Gold" },
  { hex: "#C8A24B", name: "Honey" },
  { hex: "#F2856A", name: "Coral" },
  { hex: "#C4766E", name: "Terracotta" },
  { hex: "#D9A7A0", name: "Dusty Rose" },
  { hex: "#F2C9C3", name: "Blush" },
  { hex: "#C94030", name: "Sindoor" },
  { hex: "#8B2A1F", name: "Ruby" },
  { hex: "#6E1C16", name: "Deep Garnet" },
  { hex: "#C4488B", name: "Fuchsia" },
  { hex: "#8B4A6B", name: "Mulberry" },
  { hex: "#C7ACC9", name: "Mauve" },
  { hex: "#3B1F4A", name: "Plum" },
  { hex: "#5D6E4D", name: "Moss" },
  { hex: "#8B9E7E", name: "Sage" },
  { hex: "#2E6B3D", name: "Emerald" },
  { hex: "#4F613F", name: "Forest" },
  { hex: "#2FB3B3", name: "Turquoise" },
  { hex: "#3B6E6E", name: "Deep Teal" },
  { hex: "#2E3457", name: "Navy" },
  { hex: "#1C1F3A", name: "Midnight" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#000000", name: "Black" },
  { hex: "#C0C0C0", name: "Silver" },
];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([a-f\d]{6})$/i);
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  // Perceptually weighted RGB distance (low-cost approximation of CIE76).
  const rMean = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - rMean) / 256) * db * db,
  );
}

export function nameForHex(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "";
  let best: NamedColor = NAMED_COLORS[0];
  let bestDist = Infinity;
  for (const c of NAMED_COLORS) {
    const crgb = hexToRgb(c.hex);
    if (!crgb) continue;
    const d = distance(rgb, crgb);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.name;
}
