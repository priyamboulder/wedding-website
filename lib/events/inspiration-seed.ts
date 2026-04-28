// ── Inspiration image seed ────────────────────────────────────────────────
// Hand-curated aesthetic references for Q4 (vibe per event). Each entry
// carries rich tags + a 3-color palette so the AI stub can reason over
// favorites without external calls. `url` is null today — tiles render as
// gradients from `paletteHex` so the UX works end-to-end before real
// Unsplash/Pexels URLs arrive.
//
// Coverage: 10 entries per event × 12 event types = 120 references. Every
// entry stays editorial-minimal in intent: color direction + mood tags, not
// literal photo descriptions. When we layer real imagery on top, the tag +
// palette columns stay — only the `url` field gets filled in.

import type { EventType, InspirationImage } from "@/types/events";

// Compact row shape for the seed table. We expand to InspirationImage at
// module-eval time so consumers always work with the full shape.
interface Seed {
  slug: string;
  eventTypes: EventType[];
  tags: string[];
  paletteHex: string[];
}

const SEEDS: Seed[] = [
  // ── Pithi ─────────────────────────────────────────────────────────────
  { slug: "pithi-01", eventTypes: ["pithi"], tags: ["warm", "saturated", "traditional", "family", "marigold", "turmeric", "bright"], paletteHex: ["#E5A72C", "#F5E6C8", "#C64F2A"] },
  { slug: "pithi-02", eventTypes: ["pithi"], tags: ["warm", "pastel", "traditional", "soft", "cream", "golden-hour", "intimate"], paletteHex: ["#F4D98A", "#FBF3DE", "#C99A45"] },
  { slug: "pithi-03", eventTypes: ["pithi"], tags: ["warm", "saturated", "casual", "candid", "outdoor", "marigold", "laughter"], paletteHex: ["#E08A2E", "#A5C25B", "#FBF4E3"] },
  { slug: "pithi-04", eventTypes: ["pithi"], tags: ["neutral", "traditional", "ceremonial", "brass", "banana-leaf", "daytime"], paletteHex: ["#A37A3A", "#3F6B3A", "#F4EAD0"] },
  { slug: "pithi-05", eventTypes: ["pithi"], tags: ["warm", "semi", "floral", "saffron", "cream", "golden", "candid"], paletteHex: ["#D4A24C", "#FBF9F4", "#5C3A1E"] },
  { slug: "pithi-06", eventTypes: ["pithi"], tags: ["pastel", "soft", "casual", "ivory", "rose", "linen", "outdoor"], paletteHex: ["#F5E0D6", "#E8D4A0", "#FBF6EF"] },
  { slug: "pithi-07", eventTypes: ["pithi"], tags: ["jewel", "saturated", "traditional", "marigold", "emerald", "ornate"], paletteHex: ["#E08A2E", "#1F4D3F", "#F4EAD0"] },
  { slug: "pithi-08", eventTypes: ["pithi"], tags: ["warm", "clay", "earth", "terracotta", "cream", "daytime", "courtyard"], paletteHex: ["#B76A46", "#F5ECDB", "#2A1914"] },
  { slug: "pithi-09", eventTypes: ["pithi"], tags: ["saturated", "folk", "playful", "marigold", "turmeric", "family"], paletteHex: ["#E5732A", "#D4A24C", "#F5E6C8"] },
  { slug: "pithi-10", eventTypes: ["pithi"], tags: ["neutral", "minimal", "editorial", "oat", "brass", "daylight"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },

  // ── Haldi ─────────────────────────────────────────────────────────────
  { slug: "haldi-01", eventTypes: ["haldi"], tags: ["warm", "saturated", "traditional", "turmeric", "marigold", "courtyard"], paletteHex: ["#E08A2E", "#D4A24C", "#FBF3DE"] },
  { slug: "haldi-02", eventTypes: ["haldi"], tags: ["pastel", "soft", "dreamy", "cream", "gold", "daylight", "outdoor"], paletteHex: ["#F4D98A", "#FBF6EF", "#B88A3A"] },
  { slug: "haldi-03", eventTypes: ["haldi"], tags: ["warm", "jewel", "saturated", "turmeric", "emerald", "ornate"], paletteHex: ["#D4A24C", "#1F4D3F", "#F4EAD0"] },
  { slug: "haldi-04", eventTypes: ["haldi"], tags: ["neutral", "minimal", "casual", "ivory", "linen", "daytime", "candid"], paletteHex: ["#FBF9F4", "#E8D4A0", "#3B3E45"] },
  { slug: "haldi-05", eventTypes: ["haldi"], tags: ["warm", "marigold", "traditional", "family", "outdoor", "banana-leaf"], paletteHex: ["#E5732A", "#3F6B3A", "#FBF4E3"] },
  { slug: "haldi-06", eventTypes: ["haldi"], tags: ["pastel", "rose", "gold", "soft", "intimate", "indoor"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "haldi-07", eventTypes: ["haldi"], tags: ["saturated", "coastal", "fresh", "coconut", "whitewash", "outdoor"], paletteHex: ["#F1EDE4", "#8FA8B3", "#D4A24C"] },
  { slug: "haldi-08", eventTypes: ["haldi"], tags: ["warm", "clay", "earth", "terracotta", "cream", "garden"], paletteHex: ["#B76A46", "#F5ECDB", "#8A6A2E"] },
  { slug: "haldi-09", eventTypes: ["haldi"], tags: ["warm", "saturated", "folk", "playful", "saffron", "family"], paletteHex: ["#E5732A", "#F5E6C8", "#5C3A1E"] },
  { slug: "haldi-10", eventTypes: ["haldi"], tags: ["pastel", "editorial", "minimal", "oat", "champagne", "indoor"], paletteHex: ["#E8D4A0", "#EDE4D3", "#3B3E45"] },

  // ── Mehendi ───────────────────────────────────────────────────────────
  { slug: "mehendi-01", eventTypes: ["mehendi"], tags: ["warm", "saturated", "henna", "garden", "marigold", "music"], paletteHex: ["#E08A2E", "#3F6B3A", "#FBF3DE"] },
  { slug: "mehendi-02", eventTypes: ["mehendi"], tags: ["pastel", "garden", "rose", "dusty", "soft", "outdoor"], paletteHex: ["#C98B9C", "#8FA276", "#F7EEE4"] },
  { slug: "mehendi-03", eventTypes: ["mehendi"], tags: ["jewel", "saturated", "peacock", "emerald", "ornate", "saturated"], paletteHex: ["#0F6A6B", "#1F4D3F", "#F1EADA"] },
  { slug: "mehendi-04", eventTypes: ["mehendi"], tags: ["warm", "folk", "playful", "marigold", "turmeric", "casual"], paletteHex: ["#E5732A", "#D4A24C", "#F5E6C8"] },
  { slug: "mehendi-05", eventTypes: ["mehendi"], tags: ["pastel", "lotus", "matcha", "tea", "soft", "daytime"], paletteHex: ["#C98B9C", "#8FA276", "#6F4A34"] },
  { slug: "mehendi-06", eventTypes: ["mehendi"], tags: ["neutral", "minimal", "editorial", "ivory", "brass", "courtyard"], paletteHex: ["#FBF6EF", "#A37A3A", "#3B3E45"] },
  { slug: "mehendi-07", eventTypes: ["mehendi"], tags: ["jewel", "saturated", "bougainvillea", "magenta", "playful"], paletteHex: ["#B1245F", "#F2A65A", "#FBF3E8"] },
  { slug: "mehendi-08", eventTypes: ["mehendi"], tags: ["warm", "haveli", "fresco", "indigo", "mirror", "ornate"], paletteHex: ["#3C4F8C", "#E8DFCE", "#D4A843"] },
  { slug: "mehendi-09", eventTypes: ["mehendi"], tags: ["pastel", "rose", "champagne", "soft", "intimate", "daytime"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "mehendi-10", eventTypes: ["mehendi"], tags: ["warm", "clay", "earth", "terracotta", "monsoon", "mist"], paletteHex: ["#B76A46", "#8FA398", "#F5ECDB"] },

  // ── Sangeet ───────────────────────────────────────────────────────────
  { slug: "sangeet-01", eventTypes: ["sangeet"], tags: ["bollywood", "glam", "saturated", "stage", "jewel", "theatrical"], paletteHex: ["#161A36", "#8A6A2E", "#5C1A2B"] },
  { slug: "sangeet-02", eventTypes: ["sangeet"], tags: ["garden", "romance", "pastel", "candlelight", "soft", "outdoor"], paletteHex: ["#C98B9C", "#8FA276", "#F7EEE4"] },
  { slug: "sangeet-03", eventTypes: ["sangeet"], tags: ["jewel", "sapphire", "emerald", "ruby", "gold", "ornate"], paletteHex: ["#1F4D3F", "#1B3A6B", "#D4A843"] },
  { slug: "sangeet-04", eventTypes: ["sangeet"], tags: ["monsoon", "modern", "architectural", "ink", "sage", "minimal"], paletteHex: ["#647A78", "#B8C4BD", "#1B2321"] },
  { slug: "sangeet-05", eventTypes: ["sangeet"], tags: ["bollywood", "retro", "70s", "deep", "saturated", "stage"], paletteHex: ["#7E1A2C", "#B7892E", "#1A1A1A"] },
  { slug: "sangeet-06", eventTypes: ["sangeet"], tags: ["haveli", "fresco", "indigo", "mirror", "ornate", "courtyard"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "sangeet-07", eventTypes: ["sangeet"], tags: ["black-tie", "monochrome", "gold", "cocktail", "ballroom", "formal"], paletteHex: ["#0A0A0A", "#FFFFFF", "#B88A3A"] },
  { slug: "sangeet-08", eventTypes: ["sangeet"], tags: ["jewel", "peacock", "brass", "saturated", "oxidized", "ornate"], paletteHex: ["#0F6A6B", "#A37A3A", "#F1EADA"] },
  { slug: "sangeet-09", eventTypes: ["sangeet"], tags: ["midnight", "navy", "gold", "editorial", "formal", "reception"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "sangeet-10", eventTypes: ["sangeet"], tags: ["bollywood", "glam", "bombay", "deep", "velvet", "sequined"], paletteHex: ["#521A2A", "#B88A3A", "#1A1A1A"] },

  // ── Garba / Dandiya ──────────────────────────────────────────────────
  { slug: "garba-01", eventTypes: ["garba"], tags: ["folk", "saturated", "playful", "marigold", "fuchsia", "dance"], paletteHex: ["#E5732A", "#B1245F", "#F4D98A"] },
  { slug: "garba-02", eventTypes: ["garba"], tags: ["haveli", "mirror", "indigo", "ornate", "courtyard", "traditional"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "garba-03", eventTypes: ["garba"], tags: ["warm", "gujarati", "traditional", "marigold", "cream", "music"], paletteHex: ["#D4A24C", "#E5732A", "#FBF3DE"] },
  { slug: "garba-04", eventTypes: ["garba"], tags: ["saturated", "folk", "bougainvillea", "fuchsia", "playful"], paletteHex: ["#B1245F", "#F2A65A", "#FBF3E8"] },
  { slug: "garba-05", eventTypes: ["garba"], tags: ["jewel", "emerald", "ruby", "saturated", "ornate", "folk"], paletteHex: ["#1F4D3F", "#8A1A2B", "#D4A843"] },
  { slug: "garba-06", eventTypes: ["garba"], tags: ["warm", "earthy", "terracotta", "cream", "lanterns", "outdoor"], paletteHex: ["#B76A46", "#F5ECDB", "#8A6A2E"] },
  { slug: "garba-07", eventTypes: ["garba"], tags: ["neon", "contemporary", "stage", "playful", "saturated"], paletteHex: ["#D93878", "#F2A65A", "#161A36"] },
  { slug: "garba-08", eventTypes: ["garba"], tags: ["traditional", "folk", "mirror", "yellow", "green", "saturated"], paletteHex: ["#E5A72C", "#3F6B3A", "#F4EAD0"] },
  { slug: "garba-09", eventTypes: ["garba"], tags: ["jewel", "peacock", "brass", "ornate", "oxidized", "folk"], paletteHex: ["#0F6A6B", "#A37A3A", "#F1EADA"] },
  { slug: "garba-10", eventTypes: ["garba"], tags: ["warm", "saturated", "folk", "casual", "dance", "outdoor"], paletteHex: ["#E08A2E", "#A5C25B", "#FBF4E3"] },

  // ── Baraat ────────────────────────────────────────────────────────────
  { slug: "baraat-01", eventTypes: ["baraat"], tags: ["saturated", "procession", "dhol", "marigold", "street", "celebratory"], paletteHex: ["#E5732A", "#D4A24C", "#F5E6C8"] },
  { slug: "baraat-02", eventTypes: ["baraat"], tags: ["warm", "traditional", "horse", "cream", "ivory", "gold"], paletteHex: ["#FBF9F4", "#D4A24C", "#5C3A1E"] },
  { slug: "baraat-03", eventTypes: ["baraat"], tags: ["saturated", "punjabi", "celebratory", "brass", "ornate", "playful"], paletteHex: ["#E08A2E", "#A37A3A", "#F1EADA"] },
  { slug: "baraat-04", eventTypes: ["baraat"], tags: ["jewel", "saturated", "turmeric", "emerald", "ornate", "procession"], paletteHex: ["#D4A24C", "#1F4D3F", "#F4EAD0"] },
  { slug: "baraat-05", eventTypes: ["baraat"], tags: ["warm", "haveli", "fresco", "indigo", "courtyard", "ornate"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "baraat-06", eventTypes: ["baraat"], tags: ["clay", "terracotta", "earth", "cream", "dhol", "street"], paletteHex: ["#B76A46", "#F5ECDB", "#2A1914"] },
  { slug: "baraat-07", eventTypes: ["baraat"], tags: ["saturated", "bollywood", "celebratory", "crimson", "gold", "music"], paletteHex: ["#A6182D", "#C99A45", "#F6ECD6"] },
  { slug: "baraat-08", eventTypes: ["baraat"], tags: ["folk", "saturated", "marigold", "orange", "playful", "street"], paletteHex: ["#E5732A", "#F2A65A", "#FBF3E8"] },
  { slug: "baraat-09", eventTypes: ["baraat"], tags: ["editorial", "minimal", "oat", "brass", "morning", "candid"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },
  { slug: "baraat-10", eventTypes: ["baraat"], tags: ["warm", "traditional", "procession", "sun", "white-horse", "cream"], paletteHex: ["#F5E6C8", "#B8860B", "#2A1914"] },

  // ── Ceremony ─────────────────────────────────────────────────────────
  { slug: "ceremony-01", eventTypes: ["ceremony"], tags: ["mandap", "floral", "jewel", "ornate", "ruby", "gold"], paletteHex: ["#8A1A2B", "#D4A843", "#F4EAD0"] },
  { slug: "ceremony-02", eventTypes: ["ceremony"], tags: ["mandap", "pastel", "garden", "rose", "outdoor", "soft"], paletteHex: ["#E6C2B6", "#8FA276", "#FBF6EF"] },
  { slug: "ceremony-03", eventTypes: ["ceremony"], tags: ["south-indian", "banana-leaf", "brass", "marigold", "traditional"], paletteHex: ["#3F6B3A", "#A37A3A", "#FBF3DE"] },
  { slug: "ceremony-04", eventTypes: ["ceremony"], tags: ["mandap", "jewel", "saturated", "emerald", "gold", "ornate"], paletteHex: ["#1F4D3F", "#D4A843", "#F4EAD0"] },
  { slug: "ceremony-05", eventTypes: ["ceremony"], tags: ["haveli", "fresco", "indigo", "mirror", "ornate", "courtyard"], paletteHex: ["#3C4F8C", "#E8DFCE", "#D4A843"] },
  { slug: "ceremony-06", eventTypes: ["ceremony"], tags: ["mandap", "editorial", "minimal", "ivory", "brass", "architectural"], paletteHex: ["#FBF9F4", "#A37A3A", "#3B3E45"] },
  { slug: "ceremony-07", eventTypes: ["ceremony"], tags: ["mandap", "warm", "saffron", "marigold", "traditional"], paletteHex: ["#D4A24C", "#E5732A", "#F5E6C8"] },
  { slug: "ceremony-08", eventTypes: ["ceremony"], tags: ["mandap", "clay", "terracotta", "cream", "earth", "outdoor"], paletteHex: ["#B76A46", "#F5ECDB", "#8A6A2E"] },
  { slug: "ceremony-09", eventTypes: ["ceremony"], tags: ["mandap", "coastal", "whitewash", "rattan", "fresh", "outdoor"], paletteHex: ["#F1EDE4", "#8FA8B3", "#D4A24C"] },
  { slug: "ceremony-10", eventTypes: ["ceremony"], tags: ["mandap", "midnight", "navy", "gold", "candlelight", "evening"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },

  // ── Cocktail hour ────────────────────────────────────────────────────
  { slug: "cocktail-01", eventTypes: ["cocktail"], tags: ["black-tie", "monochrome", "gold", "cocktail", "ballroom", "formal"], paletteHex: ["#0A0A0A", "#FFFFFF", "#B88A3A"] },
  { slug: "cocktail-02", eventTypes: ["cocktail"], tags: ["champagne", "blush", "tonal", "shimmer", "soft", "formal"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "cocktail-03", eventTypes: ["cocktail"], tags: ["onyx", "pearl", "silver", "monochrome", "minimal", "metallic"], paletteHex: ["#111111", "#EDEAE2", "#9A9A9A"] },
  { slug: "cocktail-04", eventTypes: ["cocktail"], tags: ["jewel", "sapphire", "emerald", "gold", "saturated", "ornate"], paletteHex: ["#1B3A6B", "#1F4D3F", "#D4A843"] },
  { slug: "cocktail-05", eventTypes: ["cocktail"], tags: ["midnight", "navy", "gold", "candlelight", "evening", "formal"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "cocktail-06", eventTypes: ["cocktail"], tags: ["coastal", "whitewash", "linen", "sea-salt", "fresh", "semi"], paletteHex: ["#F1EDE4", "#8FA8B3", "#CDBFA6"] },
  { slug: "cocktail-07", eventTypes: ["cocktail"], tags: ["smoke", "sand", "architectural", "minimal", "formal", "neutral"], paletteHex: ["#3B3E45", "#CDBFA6", "#F2EDE1"] },
  { slug: "cocktail-08", eventTypes: ["cocktail"], tags: ["bougainvillea", "magenta", "playful", "saturated", "garden"], paletteHex: ["#B1245F", "#F2A65A", "#FBF3E8"] },
  { slug: "cocktail-09", eventTypes: ["cocktail"], tags: ["peacock", "brass", "saturated", "ornate", "oxidized"], paletteHex: ["#0F6A6B", "#A37A3A", "#F1EADA"] },
  { slug: "cocktail-10", eventTypes: ["cocktail"], tags: ["monsoon", "modern", "architectural", "ink", "sage", "minimal"], paletteHex: ["#647A78", "#8FA398", "#1B2321"] },

  // ── Reception ────────────────────────────────────────────────────────
  { slug: "reception-01", eventTypes: ["reception"], tags: ["ballroom", "gold", "crystal", "formal", "grand", "classic"], paletteHex: ["#FBF9F4", "#B88A3A", "#1A1A1A"] },
  { slug: "reception-02", eventTypes: ["reception"], tags: ["jewel", "emerald", "gold", "saturated", "ornate", "formal"], paletteHex: ["#1F4D3F", "#D4A843", "#F4EAD0"] },
  { slug: "reception-03", eventTypes: ["reception"], tags: ["midnight", "navy", "gold", "editorial", "formal", "evening"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "reception-04", eventTypes: ["reception"], tags: ["bollywood", "glam", "saturated", "stage", "theatrical"], paletteHex: ["#521A2A", "#B88A3A", "#1A1A1A"] },
  { slug: "reception-05", eventTypes: ["reception"], tags: ["garden", "romance", "pastel", "candlelight", "outdoor", "soft"], paletteHex: ["#C98B9C", "#8FA276", "#F7EEE4"] },
  { slug: "reception-06", eventTypes: ["reception"], tags: ["black-tie", "monochrome", "gold", "formal", "ballroom"], paletteHex: ["#0A0A0A", "#FFFFFF", "#B88A3A"] },
  { slug: "reception-07", eventTypes: ["reception"], tags: ["champagne", "blush", "tonal", "shimmer", "formal"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "reception-08", eventTypes: ["reception"], tags: ["haveli", "fresco", "indigo", "mirror", "ornate", "grand"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "reception-09", eventTypes: ["reception"], tags: ["minimal", "editorial", "ivory", "brass", "architectural"], paletteHex: ["#FBF9F4", "#A37A3A", "#3B3E45"] },
  { slug: "reception-10", eventTypes: ["reception"], tags: ["jewel", "peacock", "brass", "saturated", "ornate"], paletteHex: ["#0F6A6B", "#A37A3A", "#F1EADA"] },

  // ── After-party ──────────────────────────────────────────────────────
  { slug: "after_party-01", eventTypes: ["after_party"], tags: ["club", "neon", "dark", "saturated", "late-night", "energy"], paletteHex: ["#0A0A0A", "#B1245F", "#D93878"] },
  { slug: "after_party-02", eventTypes: ["after_party"], tags: ["onyx", "gold", "monochrome", "intimate", "cocktail"], paletteHex: ["#111111", "#B88A3A", "#9A9A9A"] },
  { slug: "after_party-03", eventTypes: ["after_party"], tags: ["midnight", "navy", "gold", "lounge", "intimate"], paletteHex: ["#161A36", "#8A6A2E", "#F6F0E0"] },
  { slug: "after_party-04", eventTypes: ["after_party"], tags: ["bollywood", "glam", "stage", "dance", "saturated"], paletteHex: ["#521A2A", "#B88A3A", "#1A1A1A"] },
  { slug: "after_party-05", eventTypes: ["after_party"], tags: ["neon", "pink", "electric", "playful", "late-night"], paletteHex: ["#D93878", "#F2A65A", "#0F1024"] },
  { slug: "after_party-06", eventTypes: ["after_party"], tags: ["smoke", "dark", "moody", "minimal", "architectural"], paletteHex: ["#3B3E45", "#0F1012", "#9A9A9A"] },
  { slug: "after_party-07", eventTypes: ["after_party"], tags: ["jewel", "ruby", "sapphire", "saturated", "ornate"], paletteHex: ["#8A1A2B", "#1B3A6B", "#D4A843"] },
  { slug: "after_party-08", eventTypes: ["after_party"], tags: ["black-tie", "monochrome", "dance", "formal"], paletteHex: ["#0A0A0A", "#FFFFFF", "#B88A3A"] },
  { slug: "after_party-09", eventTypes: ["after_party"], tags: ["peacock", "brass", "saturated", "lounge"], paletteHex: ["#0F6A6B", "#A37A3A", "#0F1A1A"] },
  { slug: "after_party-10", eventTypes: ["after_party"], tags: ["neon", "dark", "hot-pink", "playful", "saturated"], paletteHex: ["#D93878", "#161A36", "#F2A65A"] },

  // ── Welcome dinner ───────────────────────────────────────────────────
  { slug: "welcome_dinner-01", eventTypes: ["welcome_dinner"], tags: ["garden", "romance", "candlelight", "outdoor", "semi", "intimate"], paletteHex: ["#C98B9C", "#8FA276", "#F7EEE4"] },
  { slug: "welcome_dinner-02", eventTypes: ["welcome_dinner"], tags: ["warm", "courtyard", "lanterns", "terracotta", "cream"], paletteHex: ["#B76A46", "#F5ECDB", "#8A6A2E"] },
  { slug: "welcome_dinner-03", eventTypes: ["welcome_dinner"], tags: ["coastal", "whitewash", "linen", "fresh", "outdoor", "semi"], paletteHex: ["#F1EDE4", "#8FA8B3", "#D4A24C"] },
  { slug: "welcome_dinner-04", eventTypes: ["welcome_dinner"], tags: ["jewel", "emerald", "gold", "saturated", "ornate"], paletteHex: ["#1F4D3F", "#D4A843", "#F4EAD0"] },
  { slug: "welcome_dinner-05", eventTypes: ["welcome_dinner"], tags: ["editorial", "minimal", "oat", "brass", "candlelight"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },
  { slug: "welcome_dinner-06", eventTypes: ["welcome_dinner"], tags: ["haveli", "fresco", "indigo", "ornate", "courtyard"], paletteHex: ["#3C4F8C", "#D4A843", "#E8DFCE"] },
  { slug: "welcome_dinner-07", eventTypes: ["welcome_dinner"], tags: ["monsoon", "sage", "mist", "architectural", "minimal"], paletteHex: ["#647A78", "#B8C4BD", "#EFEADF"] },
  { slug: "welcome_dinner-08", eventTypes: ["welcome_dinner"], tags: ["warm", "marigold", "traditional", "saffron", "family"], paletteHex: ["#D4A24C", "#E5732A", "#FBF3DE"] },
  { slug: "welcome_dinner-09", eventTypes: ["welcome_dinner"], tags: ["champagne", "blush", "tonal", "soft", "intimate"], paletteHex: ["#E6C2B6", "#E8D4A0", "#C79B7A"] },
  { slug: "welcome_dinner-10", eventTypes: ["welcome_dinner"], tags: ["neutral", "minimal", "linen", "sand", "slate", "architectural"], paletteHex: ["#F2EDE1", "#CDBFA6", "#3B3E45"] },

  // ── Farewell brunch ──────────────────────────────────────────────────
  { slug: "farewell_brunch-01", eventTypes: ["farewell_brunch"], tags: ["garden", "pastel", "daylight", "floral", "outdoor", "semi"], paletteHex: ["#F5E0D6", "#8FA276", "#FBF6EF"] },
  { slug: "farewell_brunch-02", eventTypes: ["farewell_brunch"], tags: ["coastal", "whitewash", "fresh", "linen", "daytime"], paletteHex: ["#F1EDE4", "#8FA8B3", "#D5CDBD"] },
  { slug: "farewell_brunch-03", eventTypes: ["farewell_brunch"], tags: ["warm", "courtyard", "terracotta", "cream", "daylight"], paletteHex: ["#B76A46", "#F5ECDB", "#8A6A2E"] },
  { slug: "farewell_brunch-04", eventTypes: ["farewell_brunch"], tags: ["editorial", "minimal", "oat", "brass", "morning"], paletteHex: ["#EDE4D3", "#8A6A2E", "#3B3E45"] },
  { slug: "farewell_brunch-05", eventTypes: ["farewell_brunch"], tags: ["pastel", "rose", "cream", "soft", "daylight"], paletteHex: ["#E6C2B6", "#FBF6EF", "#C79B7A"] },
  { slug: "farewell_brunch-06", eventTypes: ["farewell_brunch"], tags: ["monsoon", "sage", "mist", "outdoor", "fresh"], paletteHex: ["#B8C4BD", "#8FA398", "#EFEADF"] },
  { slug: "farewell_brunch-07", eventTypes: ["farewell_brunch"], tags: ["warm", "marigold", "casual", "outdoor", "family"], paletteHex: ["#D4A24C", "#E5732A", "#FBF3DE"] },
  { slug: "farewell_brunch-08", eventTypes: ["farewell_brunch"], tags: ["champagne", "blush", "tonal", "daytime", "soft"], paletteHex: ["#E6C2B6", "#E8D4A0", "#FBF6EF"] },
  { slug: "farewell_brunch-09", eventTypes: ["farewell_brunch"], tags: ["haveli", "fresco", "daytime", "courtyard", "indigo"], paletteHex: ["#3C4F8C", "#E8DFCE", "#D4A843"] },
  { slug: "farewell_brunch-10", eventTypes: ["farewell_brunch"], tags: ["neutral", "minimal", "linen", "sand", "morning"], paletteHex: ["#F2EDE1", "#CDBFA6", "#3B3E45"] },
];

export const INSPIRATION_IMAGES: InspirationImage[] = SEEDS.map((s) => ({
  id: s.slug,
  eventTypes: s.eventTypes,
  url: null,
  attribution: null,
  source: "placeholder" as const,
  tags: s.tags,
  paletteHex: s.paletteHex,
}));

const BY_ID: Record<string, InspirationImage> = Object.fromEntries(
  INSPIRATION_IMAGES.map((img) => [img.id, img]),
);

export function getInspirationImage(id: string): InspirationImage | undefined {
  return BY_ID[id];
}

// Small helper so the grid can paginate without every call site importing
// `INSPIRATION_IMAGES` directly and filtering.
export function getInspirationImagesFor(
  eventType: EventType,
  limit?: number,
  offset = 0,
): InspirationImage[] {
  const matches = INSPIRATION_IMAGES.filter((img) =>
    img.eventTypes.includes(eventType),
  );
  if (limit == null) return matches.slice(offset);
  return matches.slice(offset, offset + limit);
}
