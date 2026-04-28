// ── Space AI recommendations ────────────────────────────────────────────────
// Generates per-space suggestions (colours, themes, décor elements) from the
// space's type, its reference photos, and the couple's reactions so far.
// The logic is deterministic and local — acts as the "AI guidance" layer
// couples see while browsing. Real LLM hookup can replace the body later
// without changing the shape.

import type {
  DecorSpaceCard,
  SpaceAIRecommendation,
  DecorSpaceType,
} from "@/types/decor";
import { DECOR_ELEMENTS } from "./catalog";

const COLOR_PRESETS_BY_TYPE: Record<
  DecorSpaceType,
  { hex: string; name: string }[]
> = {
  ceremony: [
    { hex: "#8B2A1F", name: "Sindoor" },
    { hex: "#D4A853", name: "Antique Gold" },
    { hex: "#FFF8EA", name: "Warm Ivory" },
    { hex: "#F2A83B", name: "Marigold" },
  ],
  reception: [
    { hex: "#3D2B1F", name: "Cocoa" },
    { hex: "#D4A853", name: "Gold" },
    { hex: "#D9A7A0", name: "Dusty Rose" },
    { hex: "#FFFDF7", name: "Ivory" },
  ],
  outdoor: [
    { hex: "#8B9E7E", name: "Sage" },
    { hex: "#F2A83B", name: "Marigold" },
    { hex: "#A89577", name: "Driftwood" },
    { hex: "#F5ECE1", name: "Champagne" },
  ],
  pre_event: [
    { hex: "#F5D547", name: "Turmeric" },
    { hex: "#F2A83B", name: "Marigold" },
    { hex: "#5D6E4D", name: "Moss" },
    { hex: "#FFF2D1", name: "Cream" },
  ],
};

const THEMES_BY_TYPE: Record<DecorSpaceType, string[]> = {
  ceremony: [
    "Traditional sacred with floral mandap and gold accents",
    "Modern minimal with architectural mandap and single-variety florals",
    "Garden ceremony with open-canopy mandap and trailing greenery",
  ],
  reception: [
    "Candlelit romantic — warm lighting, low centrepieces, lush roses",
    "Modern glam — geometric florals, metallics, dramatic uplighting",
    "Royal heritage — jewel tones, ornate stage, grand entrance",
  ],
  outdoor: [
    "Garden party — string lights, petal path, wildflower arrangements",
    "Bohemian — pampas grass, dried florals, floor seating",
    "Festival — marigold everywhere, parasols, floral rangoli underfoot",
  ],
  pre_event: [
    "Sunny Haldi — marigolds, jasmine, bright cotton drapes",
    "Intimate Mehendi — low cushions, lanterns, soft greens",
    "Courtyard garden — floor rangoli, brass vessels, trailing florals",
  ],
};

// Element recommendations keyed to space type — we surface the ones whose
// id appears in DECOR_ELEMENTS and pull their display names.
const RECOMMENDED_ELEMENT_IDS_BY_TYPE: Record<DecorSpaceType, string[]> = {
  ceremony: [
    "el-mandap-open-canopy",
    "el-pillar-florals",
    "el-aisle-florals",
    "el-ceiling-canopy",
  ],
  reception: [
    "el-centrepieces-mixed",
    "el-lighting-chandeliers",
    "el-dance-floor",
    "el-stage-reception",
  ],
  outdoor: [
    "el-ground-treatment",
    "el-tree-lighting",
    "el-canopy-tent",
    "el-entrance-arch",
  ],
  pre_event: [
    "el-floral-rangoli",
    "el-low-tables",
    "el-umbrella-install",
    "el-swing-props",
  ],
};

export function generateSpaceAIRecommendation(
  space: DecorSpaceCard,
): SpaceAIRecommendation {
  const type = space.space_type;

  // Filter element recs to ones the couple hasn't already said no to.
  const avoided = new Set(
    Object.entries(space.element_reactions)
      .filter(([, r]) => r === "not_for_us")
      .map(([id]) => id),
  );

  const elementIds = RECOMMENDED_ELEMENT_IDS_BY_TYPE[type].filter(
    (id) => !avoided.has(id),
  );
  const elements = DECOR_ELEMENTS.filter((el) => elementIds.includes(el.id))
    .map((el) => `${el.name} — ${el.description}`)
    .slice(0, 4);

  return {
    space_id: space.id,
    colors: COLOR_PRESETS_BY_TYPE[type].slice(0, 4),
    themes: THEMES_BY_TYPE[type].slice(0, 3),
    elements,
    generated_at: new Date().toISOString(),
  };
}
