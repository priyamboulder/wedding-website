// ──────────────────────────────────────────────────────────────────────────
// Starter template catalog — client-side mirror of supabase/seed_templates.sql
//
// The production source of truth is the `design_templates` table. While the
// app still runs on Zustand + localStorage this module ships a curated subset
// (1–2 templates per surface) so the marketplace has real content to render.
// Swap to Supabase fetches once the client is configured — the shape here
// intentionally matches a `design_templates` row.
// ──────────────────────────────────────────────────────────────────────────

import type { SurfaceType } from "@/components/studio/canvas-editor/CanvasEditor";

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  surface_type: SurfaceType;
  cultural_style: string | null;
  regional_style: string | null;
  canvas_width: number;
  canvas_height: number;
  canvas_data: object;
  thumbnail_url: string | null;       // Supabase Storage URL once wired
  colors: string[];
  fonts: string[];
  tags: string[];
  price_cents: number;
  is_trending: boolean;
  is_featured: boolean;
  is_published: boolean;
  download_count: number;
  category_tags: string[];
  created_at: string;
}

// ── Canvas data helpers — compact, realistic layouts ─────────────────────

function invitationRoyalRajasthani() {
  return {
    version: "5.3.0",
    background: "#FDF8EF",
    objects: [
      { type: "rect", left: 60, top: 60, width: 1380, height: 1980, fill: "", stroke: "#8B1A2B", strokeWidth: 4 },
      { type: "rect", left: 90, top: 90, width: 1320, height: 1920, fill: "", stroke: "#D4AF37", strokeWidth: 1.5 },
      { type: "textbox", text: "शुभ विवाह", left: 750, top: 280, width: 900, fontSize: 54, fontFamily: "Noto Serif Devanagari", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
      { type: "textbox", text: "Together with their families", left: 750, top: 440, width: 900, fontSize: 24, fontFamily: "Cormorant Garamond", fill: "#5A4634", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Your Names", left: 750, top: 720, width: 1300, fontSize: 110, fontFamily: "Playfair Display", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", fontWeight: "bold", charSpacing: 120 },
      { type: "textbox", text: "Request the honour of your presence", left: 750, top: 960, width: 1000, fontSize: 24, fontFamily: "Cormorant Garamond", fill: "#5A4634", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "Date", left: 750, top: 1180, width: 1000, fontSize: 52, fontFamily: "Playfair Display", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", charSpacing: 300 },
      { type: "textbox", text: "Venue", left: 750, top: 1360, width: 1000, fontSize: 30, fontFamily: "Cormorant Garamond", fill: "#5A4634", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "circle", left: 750, top: 1500, radius: 8, fill: "#D4AF37", originX: "center", originY: "center" },
      { type: "textbox", text: "Reception to follow", left: 750, top: 1700, width: 1000, fontSize: 22, fontFamily: "Cormorant Garamond", fill: "#5A4634", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function invitationMumbaiModern() {
  return {
    version: "5.3.0",
    background: "#F8F6F1",
    objects: [
      { type: "textbox", text: "WEDDING", left: 750, top: 260, width: 1000, fontSize: 18, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 800, fontWeight: "500" },
      { type: "line", x1: 600, y1: 340, x2: 900, y2: 340, stroke: "#2C2C2C", strokeWidth: 1 },
      { type: "textbox", text: "Your Names", left: 750, top: 800, width: 1300, fontSize: 130, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontWeight: "300", charSpacing: -20 },
      { type: "textbox", text: "are getting married", left: 750, top: 1020, width: 1000, fontSize: 22, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Date", left: 750, top: 1280, width: 900, fontSize: 28, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 400, fontWeight: "500" },
      { type: "textbox", text: "Venue", left: 750, top: 1380, width: 900, fontSize: 22, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center" },
      { type: "line", x1: 650, y1: 1600, x2: 850, y2: 1600, stroke: "#B08968", strokeWidth: 1.5 },
      { type: "textbox", text: "please join us", left: 750, top: 1700, width: 900, fontSize: 18, fontFamily: "Inter", fill: "#B08968", textAlign: "center", originX: "center", originY: "center", charSpacing: 300 },
    ],
  };
}

function saveTheDateSilk() {
  return {
    version: "5.3.0",
    background: "#F5E8D0",
    objects: [
      { type: "rect", left: 0, top: 0, width: 1500, height: 200, fill: "#8B0A1F" },
      { type: "rect", left: 0, top: 1900, width: 1500, height: 200, fill: "#8B0A1F" },
      { type: "textbox", text: "கல்யாண அழைப்பிதழ்", left: 750, top: 100, width: 1400, fontSize: 42, fontFamily: "Noto Serif Tamil", fill: "#FFD700", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "Save the Date", left: 750, top: 400, width: 1200, fontSize: 36, fontFamily: "Cormorant Garamond", fill: "#8B0A1F", textAlign: "center", originX: "center", originY: "center", charSpacing: 600, fontStyle: "italic" },
      { type: "textbox", text: "Your Names", left: 750, top: 780, width: 1300, fontSize: 108, fontFamily: "Cormorant Garamond", fill: "#8B0A1F", textAlign: "center", originX: "center", originY: "center", fontWeight: "bold" },
      { type: "textbox", text: "Date", left: 750, top: 1100, width: 1200, fontSize: 64, fontFamily: "Cormorant Garamond", fill: "#8B0A1F", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
      { type: "textbox", text: "Venue", left: 750, top: 1300, width: 1200, fontSize: 30, fontFamily: "Cormorant Garamond", fill: "#5A3A20", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function saveTheDateScriptSage() {
  return {
    version: "5.3.0",
    background: "#EBE5DA",
    objects: [
      { type: "textbox", text: "SAVE THE DATE", left: 750, top: 280, width: 1200, fontSize: 20, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 800, fontWeight: "600" },
      { type: "line", x1: 550, y1: 380, x2: 950, y2: 380, stroke: "#8B7355", strokeWidth: 1 },
      { type: "textbox", text: "Your Names", left: 750, top: 800, width: 1400, fontSize: 140, fontFamily: "Great Vibes", fill: "#8B7355", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "are tying the knot", left: 750, top: 1040, width: 1000, fontSize: 26, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Date", left: 750, top: 1300, width: 1000, fontSize: 48, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
      { type: "textbox", text: "Venue", left: 750, top: 1450, width: 1000, fontSize: 24, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center" },
    ],
  };
}

function menuTastingNotes() {
  return {
    version: "5.3.0",
    background: "#FBF8F3",
    objects: [
      { type: "textbox", text: "MENU", left: 600, top: 200, width: 1000, fontSize: 28, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 800, fontWeight: "600" },
      { type: "line", x1: 450, y1: 300, x2: 750, y2: 300, stroke: "#2C2C2C", strokeWidth: 1 },
      { type: "textbox", text: "Your Names", left: 600, top: 440, width: 1100, fontSize: 60, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
      { type: "textbox", text: "First Course", left: 600, top: 800, width: 1000, fontSize: 18, fontFamily: "Inter", fill: "#B08968", textAlign: "center", originX: "center", originY: "center", charSpacing: 500 },
      { type: "textbox", text: "Tomato Shorba", left: 600, top: 860, width: 1000, fontSize: 32, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Main", left: 600, top: 1400, width: 1000, fontSize: 18, fontFamily: "Inter", fill: "#B08968", textAlign: "center", originX: "center", originY: "center", charSpacing: 500 },
      { type: "textbox", text: "Saffron Biryani", left: 600, top: 1460, width: 1000, fontSize: 32, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Dessert", left: 600, top: 1700, width: 1000, fontSize: 18, fontFamily: "Inter", fill: "#B08968", textAlign: "center", originX: "center", originY: "center", charSpacing: 500 },
      { type: "textbox", text: "Rose Kulfi", left: 600, top: 1760, width: 1000, fontSize: 32, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function menuMughalFeast() {
  return {
    version: "5.3.0",
    background: "#1A1412",
    objects: [
      { type: "textbox", text: "بسم الله", left: 600, top: 180, width: 1000, fontSize: 48, fontFamily: "Noto Naskh Arabic", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "WEDDING FEAST", left: 600, top: 320, width: 1000, fontSize: 22, fontFamily: "Cinzel", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
      { type: "textbox", text: "Your Names", left: 600, top: 520, width: 1100, fontSize: 72, fontFamily: "Playfair Display", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", fontWeight: "bold" },
      { type: "line", x1: 300, y1: 800, x2: 900, y2: 800, stroke: "#D4AF37", strokeWidth: 1 },
      { type: "textbox", text: "STARTERS", left: 600, top: 900, width: 1000, fontSize: 26, fontFamily: "Cinzel", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
      { type: "textbox", text: "Shorba • Galouti Kebab", left: 600, top: 990, width: 1100, fontSize: 22, fontFamily: "Cormorant Garamond", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "MAINS", left: 600, top: 1240, width: 1000, fontSize: 26, fontFamily: "Cinzel", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
      { type: "textbox", text: "Hyderabadi Biryani • Nihari", left: 600, top: 1340, width: 1100, fontSize: 20, fontFamily: "Cormorant Garamond", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "DESSERTS", left: 600, top: 1940, width: 1000, fontSize: 26, fontFamily: "Cinzel", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
      { type: "textbox", text: "Shahi Tukda • Phirni", left: 600, top: 2030, width: 1100, fontSize: 22, fontFamily: "Cormorant Garamond", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center" },
    ],
  };
}

function welcomePalaceSwagatam() {
  return {
    version: "5.3.0",
    background: "#2E1810",
    objects: [
      { type: "rect", left: 80, top: 80, width: 1040, height: 1640, fill: "", stroke: "#D4AF37", strokeWidth: 3 },
      { type: "textbox", text: "स्वागतम्", left: 600, top: 350, width: 1000, fontSize: 96, fontFamily: "Noto Serif Devanagari", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
      { type: "textbox", text: "WELCOME", left: 600, top: 550, width: 1000, fontSize: 36, fontFamily: "Cinzel", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", charSpacing: 700 },
      { type: "textbox", text: "to the wedding of", left: 600, top: 780, width: 1000, fontSize: 32, fontFamily: "Cormorant Garamond", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Your Names", left: 600, top: 1020, width: 1100, fontSize: 120, fontFamily: "Playfair Display", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", fontWeight: "bold" },
      { type: "textbox", text: "Date", left: 600, top: 1380, width: 1000, fontSize: 42, fontFamily: "Playfair Display", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", charSpacing: 300 },
      { type: "textbox", text: "Venue", left: 600, top: 1500, width: 1000, fontSize: 28, fontFamily: "Cormorant Garamond", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function welcomeBohemian() {
  return {
    version: "5.3.0",
    background: "#F2EDE4",
    objects: [
      { type: "textbox", text: "welcome", left: 600, top: 400, width: 1000, fontSize: 140, fontFamily: "Great Vibes", fill: "#8B7355", textAlign: "center", originX: "center", originY: "center" },
      { type: "line", x1: 450, y1: 620, x2: 750, y2: 620, stroke: "#8B7355", strokeWidth: 1 },
      { type: "textbox", text: "to our wedding", left: 600, top: 720, width: 1000, fontSize: 28, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center", charSpacing: 400, fontStyle: "italic" },
      { type: "textbox", text: "Your Names", left: 600, top: 1000, width: 1100, fontSize: 88, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
      { type: "textbox", text: "Date", left: 600, top: 1320, width: 1000, fontSize: 28, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center", charSpacing: 300 },
      { type: "textbox", text: "Venue", left: 600, top: 1440, width: 1000, fontSize: 22, fontFamily: "Inter", fill: "#8B8B8B", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function seatingHeritage() {
  return {
    version: "5.3.0",
    background: "#EFE3CD",
    objects: [
      { type: "rect", left: 60, top: 60, width: 1680, height: 1080, fill: "", stroke: "#8B1A2B", strokeWidth: 3 },
      { type: "textbox", text: "SEATING CHART", left: 900, top: 240, width: 1400, fontSize: 22, fontFamily: "Cinzel", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", charSpacing: 800 },
      { type: "textbox", text: "Your Names", left: 900, top: 400, width: 1600, fontSize: 72, fontFamily: "Playfair Display", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", fontWeight: "bold" },
      { type: "line", x1: 500, y1: 520, x2: 1300, y2: 520, stroke: "#D4AF37", strokeWidth: 1.5 },
      { type: "textbox", text: "Table 1", left: 350, top: 700, width: 600, fontSize: 34, fontFamily: "Playfair Display", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
      { type: "textbox", text: "Table 2", left: 900, top: 700, width: 600, fontSize: 34, fontFamily: "Playfair Display", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
      { type: "textbox", text: "Table 3", left: 1450, top: 700, width: 600, fontSize: 34, fontFamily: "Playfair Display", fill: "#8B1A2B", textAlign: "center", originX: "center", originY: "center", charSpacing: 200 },
    ],
  };
}

function programAnandKaraj() {
  return {
    version: "5.3.0",
    background: "#F5E8D0",
    objects: [
      { type: "textbox", text: "ੴ", left: 750, top: 260, width: 500, fontSize: 96, fontFamily: "Noto Sans Gurmukhi", fill: "#FF6B35", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "ANAND KARAJ", left: 750, top: 440, width: 1200, fontSize: 32, fontFamily: "Cinzel", fill: "#2A3A8B", textAlign: "center", originX: "center", originY: "center", charSpacing: 700, fontWeight: "bold" },
      { type: "textbox", text: "Your Names", left: 750, top: 660, width: 1300, fontSize: 88, fontFamily: "Playfair Display", fill: "#2A3A8B", textAlign: "center", originX: "center", originY: "center", fontWeight: "bold" },
      { type: "textbox", text: "ORDER OF CEREMONY", left: 750, top: 940, width: 1200, fontSize: 20, fontFamily: "Cinzel", fill: "#2A3A8B", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
      { type: "textbox", text: "Ardaas · Kirtan · Laavan · Hukamnama · Karah Parshad · Langar", left: 750, top: 1200, width: 1200, fontSize: 26, fontFamily: "Playfair Display", fill: "#2A3A8B", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic", lineHeight: 1.6 },
    ],
  };
}

function thankYouSimpleGratitude() {
  return {
    version: "5.3.0",
    background: "#EBE5DA",
    objects: [
      { type: "textbox", text: "thank you", left: 620, top: 600, width: 1100, fontSize: 160, fontFamily: "Great Vibes", fill: "#8B7355", textAlign: "center", originX: "center", originY: "center" },
      { type: "line", x1: 470, y1: 860, x2: 770, y2: 860, stroke: "#8B7355", strokeWidth: 1 },
      { type: "textbox", text: "for celebrating with us", left: 620, top: 960, width: 1000, fontSize: 26, fontFamily: "Inter", fill: "#5A5A5A", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic", charSpacing: 300 },
      { type: "textbox", text: "Your Names", left: 620, top: 1250, width: 1100, fontSize: 48, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
    ],
  };
}

function tableDeco() {
  return {
    version: "5.3.0",
    background: "#2C2C2C",
    objects: [
      { type: "rect", left: 60, top: 60, width: 1080, height: 1680, fill: "", stroke: "#D4AF37", strokeWidth: 1.5 },
      { type: "textbox", text: "TABLE", left: 600, top: 340, width: 1000, fontSize: 22, fontFamily: "Inter", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 1000 },
      { type: "textbox", text: "01", left: 600, top: 900, width: 1000, fontSize: 380, fontFamily: "Playfair Display", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
      { type: "textbox", text: "Your Names", left: 600, top: 1480, width: 1000, fontSize: 20, fontFamily: "Inter", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
    ],
  };
}

function igStoryMinimal() {
  return {
    version: "5.3.0",
    background: "#F8F6F1",
    objects: [
      { type: "textbox", text: "SAVE THE DATE", left: 540, top: 360, width: 900, fontSize: 22, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 800, fontWeight: "600" },
      { type: "line", x1: 420, y1: 460, x2: 660, y2: 460, stroke: "#2C2C2C", strokeWidth: 1 },
      { type: "textbox", text: "Your Names", left: 540, top: 900, width: 1000, fontSize: 120, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
      { type: "textbox", text: "are getting married", left: 540, top: 1160, width: 900, fontSize: 28, fontFamily: "Inter", fill: "#8B8B8B", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Date", left: 540, top: 1450, width: 900, fontSize: 30, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 400 },
      { type: "textbox", text: "Venue", left: 540, top: 1570, width: 900, fontSize: 22, fontFamily: "Inter", fill: "#8B8B8B", textAlign: "center", originX: "center", originY: "center" },
    ],
  };
}

function igPostModern() {
  return {
    version: "5.3.0",
    background: "#FAFAF7",
    objects: [
      { type: "textbox", text: "WE ARE GETTING MARRIED", left: 540, top: 200, width: 900, fontSize: 20, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 600 },
      { type: "line", x1: 440, y1: 280, x2: 640, y2: 280, stroke: "#2C2C2C", strokeWidth: 1 },
      { type: "textbox", text: "Your Names", left: 540, top: 500, width: 1000, fontSize: 88, fontFamily: "Playfair Display", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
      { type: "circle", left: 540, top: 660, radius: 4, fill: "#B08968", originX: "center", originY: "center" },
      { type: "textbox", text: "Date", left: 540, top: 780, width: 900, fontSize: 24, fontFamily: "Inter", fill: "#2C2C2C", textAlign: "center", originX: "center", originY: "center", charSpacing: 400 },
      { type: "textbox", text: "Venue", left: 540, top: 870, width: 900, fontSize: 18, fontFamily: "Inter", fill: "#8B8B8B", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function whatsappNikah() {
  return {
    version: "5.3.0",
    background: "#0E2A3F",
    objects: [
      { type: "textbox", text: "بسم الله", left: 400, top: 160, width: 700, fontSize: 48, fontFamily: "Noto Naskh Arabic", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center" },
      { type: "textbox", text: "NIKAH", left: 400, top: 260, width: 700, fontSize: 24, fontFamily: "Cinzel", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 900 },
      { type: "line", x1: 250, y1: 330, x2: 550, y2: 330, stroke: "#D4AF37", strokeWidth: 1 },
      { type: "textbox", text: "Your Names", left: 400, top: 440, width: 720, fontSize: 60, fontFamily: "Playfair Display", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", fontWeight: "300" },
      { type: "line", x1: 250, y1: 560, x2: 550, y2: 560, stroke: "#D4AF37", strokeWidth: 1 },
      { type: "textbox", text: "Date", left: 400, top: 630, width: 700, fontSize: 22, fontFamily: "Inter", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 400 },
      { type: "textbox", text: "Venue", left: 400, top: 700, width: 700, fontSize: 18, fontFamily: "Inter", fill: "#F5E6C3", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
    ],
  };
}

function rsvpOrnate() {
  return {
    version: "5.3.0",
    background: "#FDF8EF",
    objects: [
      { type: "rect", left: 50, top: 50, width: 1140, height: 1648, fill: "", stroke: "#8B1A2B", strokeWidth: 2.5 },
      { type: "textbox", text: "R.S.V.P.", left: 620, top: 360, width: 1000, fontSize: 44, fontFamily: "Cinzel", fill: "#D4AF37", textAlign: "center", originX: "center", originY: "center", charSpacing: 800, fontWeight: "bold" },
      { type: "textbox", text: "Kindly respond by Date", left: 620, top: 580, width: 1000, fontSize: 26, fontFamily: "Cormorant Garamond", fill: "#5A3A20", textAlign: "center", originX: "center", originY: "center", fontStyle: "italic" },
      { type: "line", x1: 260, y1: 850, x2: 980, y2: 850, stroke: "#5A3A20", strokeWidth: 1 },
      { type: "textbox", text: "Joyfully Accepts", left: 440, top: 1000, width: 500, fontSize: 22, fontFamily: "Cormorant Garamond", fill: "#8B1A2B", textAlign: "left", originX: "left", originY: "center", fontStyle: "italic" },
      { type: "textbox", text: "Regretfully Declines", left: 440, top: 1080, width: 500, fontSize: 22, fontFamily: "Cormorant Garamond", fill: "#8B1A2B", textAlign: "left", originX: "left", originY: "center", fontStyle: "italic" },
    ],
  };
}

// ── Catalog ──────────────────────────────────────────────────────────────

const now = "2026-04-01T00:00:00Z";

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "tpl-royal-rajasthani", name: "Royal Rajasthani",
    description: "Palace-inspired heritage invitation with devanagari header and marigold-gold accents.",
    surface_type: "invitation", cultural_style: "hindu_north", regional_style: "rajasthani",
    canvas_width: 1500, canvas_height: 2100, canvas_data: invitationRoyalRajasthani(),
    thumbnail_url: null, colors: ["#8B1A2B","#D4AF37","#FDF8EF","#5A4634"],
    fonts: ["Playfair Display","Cormorant Garamond","Noto Serif Devanagari"],
    tags: ["luxury","traditional","gold_foil","royal","rajasthani","devanagari","trending"],
    price_cents: 199, is_trending: true, is_featured: true, is_published: true,
    download_count: 412, category_tags: ["wedding","engagement"], created_at: now,
  },
  {
    id: "tpl-mumbai-modern", name: "Mumbai Modern",
    description: "Editorial minimalist invitation with tall serif display and generous whitespace.",
    surface_type: "invitation", cultural_style: "fusion", regional_style: null,
    canvas_width: 1500, canvas_height: 2100, canvas_data: invitationMumbaiModern(),
    thumbnail_url: null, colors: ["#2C2C2C","#B08968","#F8F6F1","#5A5A5A"],
    fonts: ["Playfair Display","Inter"],
    tags: ["minimalist","modern","editorial","trending"],
    price_cents: 149, is_trending: true, is_featured: false, is_published: true,
    download_count: 356, category_tags: ["wedding","engagement"], created_at: now,
  },
  {
    id: "tpl-south-indian-silk", name: "South Indian Silk",
    description: "Kanchipuram-silk inspired save-the-date with Tamil header and deep pomegranate banding.",
    surface_type: "save_the_date", cultural_style: "hindu_south", regional_style: "tamil",
    canvas_width: 1500, canvas_height: 2100, canvas_data: saveTheDateSilk(),
    thumbnail_url: null, colors: ["#8B0A1F","#FFD700","#F5E8D0","#5A3A20"],
    fonts: ["Cormorant Garamond","Noto Serif Tamil"],
    tags: ["traditional","south_indian","silk","tamil","trending"],
    price_cents: 149, is_trending: true, is_featured: false, is_published: true,
    download_count: 289, category_tags: ["save_the_date"], created_at: now,
  },
  {
    id: "tpl-script-sage", name: "Script and Sage",
    description: "Romantic script-first save-the-date in soft sage and cream.",
    surface_type: "save_the_date", cultural_style: "fusion", regional_style: null,
    canvas_width: 1500, canvas_height: 2100, canvas_data: saveTheDateScriptSage(),
    thumbnail_url: null, colors: ["#8B7355","#2C2C2C","#EBE5DA","#5A5A5A"],
    fonts: ["Great Vibes","Playfair Display","Inter"],
    tags: ["romantic","script","minimalist"],
    price_cents: 0, is_trending: false, is_featured: false, is_published: true,
    download_count: 128, category_tags: ["save_the_date","digital"], created_at: now,
  },
  {
    id: "tpl-mughal-feast", name: "Mughal Feast",
    description: "Obsidian menu with Arabic bismillah header and course-by-course Playfair serif.",
    surface_type: "menu", cultural_style: "muslim", regional_style: null,
    canvas_width: 1200, canvas_height: 2700, canvas_data: menuMughalFeast(),
    thumbnail_url: null, colors: ["#1A1412","#D4AF37","#F5E6C3"],
    fonts: ["Playfair Display","Cinzel","Cormorant Garamond","Noto Naskh Arabic"],
    tags: ["luxury","mughal","muslim","dark","gold_foil"],
    price_cents: 299, is_trending: false, is_featured: false, is_published: true,
    download_count: 94, category_tags: ["reception","menu"], created_at: now,
  },
  {
    id: "tpl-tasting-notes", name: "Tasting Notes",
    description: "Pared-back course card. Eyebrow tags in copper, course names in italic Playfair.",
    surface_type: "menu", cultural_style: "fusion", regional_style: null,
    canvas_width: 1200, canvas_height: 2700, canvas_data: menuTastingNotes(),
    thumbnail_url: null, colors: ["#2C2C2C","#B08968","#FBF8F3"],
    fonts: ["Playfair Display","Inter"],
    tags: ["minimalist","modern","editorial"],
    price_cents: 149, is_trending: false, is_featured: false, is_published: true,
    download_count: 176, category_tags: ["reception","menu"], created_at: now,
  },
  {
    id: "tpl-palace-swagatam", name: "Palace Swagatam",
    description: "Oxblood-and-gold welcome sign with devanagari swagatam and monumental display type.",
    surface_type: "welcome_sign", cultural_style: "hindu_north", regional_style: "rajasthani",
    canvas_width: 1200, canvas_height: 1800, canvas_data: welcomePalaceSwagatam(),
    thumbnail_url: null, colors: ["#2E1810","#D4AF37","#F5E6C3"],
    fonts: ["Playfair Display","Cinzel","Cormorant Garamond","Noto Serif Devanagari"],
    tags: ["luxury","royal","palace","rajasthani","trending"],
    price_cents: 299, is_trending: true, is_featured: true, is_published: true,
    download_count: 221, category_tags: ["welcome","signage"], created_at: now,
  },
  {
    id: "tpl-bohemian-welcome", name: "Bohemian Welcome",
    description: "Airy welcome sign with handwritten script hero on warm linen.",
    surface_type: "welcome_sign", cultural_style: "fusion", regional_style: null,
    canvas_width: 1200, canvas_height: 1800, canvas_data: welcomeBohemian(),
    thumbnail_url: null, colors: ["#8B7355","#2C2C2C","#F2EDE4"],
    fonts: ["Great Vibes","Playfair Display","Inter"],
    tags: ["bohemian","romantic","script","destination"],
    price_cents: 0, is_trending: false, is_featured: false, is_published: true,
    download_count: 143, category_tags: ["welcome","signage"], created_at: now,
  },
  {
    id: "tpl-heritage-seating", name: "Heritage Seating",
    description: "Bengali alpona-inspired seating chart in jasmine and pomegranate.",
    surface_type: "seating_chart", cultural_style: "hindu_north", regional_style: "bengali",
    canvas_width: 1800, canvas_height: 1200, canvas_data: seatingHeritage(),
    thumbnail_url: null, colors: ["#8B1A2B","#D4AF37","#EFE3CD","#5A3A20"],
    fonts: ["Playfair Display","Cormorant Garamond","Cinzel"],
    tags: ["luxury","bengali","traditional","heritage"],
    price_cents: 299, is_trending: false, is_featured: false, is_published: true,
    download_count: 67, category_tags: ["reception","seating"], created_at: now,
  },
  {
    id: "tpl-anand-karaj", name: "Anand Karaj",
    description: "Sikh Anand Karaj program with Ik Onkar header and saffron-and-royal-blue palette.",
    surface_type: "ceremony_program", cultural_style: "sikh", regional_style: "punjabi",
    canvas_width: 1500, canvas_height: 2100, canvas_data: programAnandKaraj(),
    thumbnail_url: null, colors: ["#2A3A8B","#FF6B35","#F5E8D0","#5A3A20"],
    fonts: ["Playfair Display","Cinzel","Noto Sans Gurmukhi"],
    tags: ["sikh","punjabi","traditional","religious","trending"],
    price_cents: 199, is_trending: true, is_featured: false, is_published: true,
    download_count: 189, category_tags: ["ceremony"], created_at: now,
  },
  {
    id: "tpl-simple-gratitude", name: "Simple Gratitude",
    description: "Oversized script thank-you on sage linen. Two objects, one moment.",
    surface_type: "thank_you", cultural_style: "fusion", regional_style: null,
    canvas_width: 1240, canvas_height: 1748, canvas_data: thankYouSimpleGratitude(),
    thumbnail_url: null, colors: ["#8B7355","#2C2C2C","#EBE5DA"],
    fonts: ["Great Vibes","Playfair Display","Inter"],
    tags: ["minimalist","script","romantic","trending"],
    price_cents: 0, is_trending: true, is_featured: true, is_published: true,
    download_count: 512, category_tags: ["post_wedding","thank_you"], created_at: now,
  },
  {
    id: "tpl-deco-table", name: "Deco Table Numbers",
    description: "Onyx Art Deco table card with gold rule and double-zero prefixed numeral.",
    surface_type: "table_number", cultural_style: "fusion", regional_style: null,
    canvas_width: 1200, canvas_height: 1800, canvas_data: tableDeco(),
    thumbnail_url: null, colors: ["#2C2C2C","#D4AF37","#F5E6C3"],
    fonts: ["Playfair Display","Inter"],
    tags: ["art_deco","modern","dark","gold_foil"],
    price_cents: 0, is_trending: false, is_featured: false, is_published: true,
    download_count: 234, category_tags: ["reception","signage"], created_at: now,
  },
  {
    id: "tpl-minimal-story", name: "Minimal Story",
    description: "Editorial save-the-date story in bone and ink. Oversized italic hero.",
    surface_type: "ig_story", cultural_style: "fusion", regional_style: null,
    canvas_width: 1080, canvas_height: 1920, canvas_data: igStoryMinimal(),
    thumbnail_url: null, colors: ["#2C2C2C","#B08968","#F8F6F1"],
    fonts: ["Playfair Display","Inter"],
    tags: ["minimalist","modern","editorial","trending"],
    price_cents: 0, is_trending: true, is_featured: false, is_published: true,
    download_count: 678, category_tags: ["digital","social"], created_at: now,
  },
  {
    id: "tpl-modern-square", name: "Modern Square Announcement",
    description: "Bone-paper announcement square with long-tracked Inter eyebrow and Playfair hero.",
    surface_type: "ig_post", cultural_style: "fusion", regional_style: null,
    canvas_width: 1080, canvas_height: 1080, canvas_data: igPostModern(),
    thumbnail_url: null, colors: ["#2C2C2C","#B08968","#FAFAF7"],
    fonts: ["Playfair Display","Inter"],
    tags: ["minimalist","modern","editorial","trending"],
    price_cents: 0, is_trending: true, is_featured: true, is_published: true,
    download_count: 890, category_tags: ["digital","social"], created_at: now,
  },
  {
    id: "tpl-noor-nikah", name: "Noor Nikah",
    description: "Midnight-navy Nikah card with Arabic bismillah header and restrained gold rules.",
    surface_type: "whatsapp_invite", cultural_style: "muslim", regional_style: null,
    canvas_width: 800, canvas_height: 800, canvas_data: whatsappNikah(),
    thumbnail_url: null, colors: ["#0E2A3F","#D4AF37","#F5E6C3"],
    fonts: ["Playfair Display","Cinzel","Inter","Noto Naskh Arabic"],
    tags: ["muslim","nikah","minimalist","dark","gold_foil"],
    price_cents: 149, is_trending: false, is_featured: false, is_published: true,
    download_count: 201, category_tags: ["digital","whatsapp"], created_at: now,
  },
  {
    id: "tpl-ornate-rsvp", name: "Ornate RSVP",
    description: "Heritage RSVP with double border, accept/decline check boxes, and guest-count rule.",
    surface_type: "rsvp_card", cultural_style: "hindu_north", regional_style: null,
    canvas_width: 1240, canvas_height: 1748, canvas_data: rsvpOrnate(),
    thumbnail_url: null, colors: ["#8B1A2B","#D4AF37","#FDF8EF","#5A3A20"],
    fonts: ["Cormorant Garamond","Cinzel"],
    tags: ["traditional","gold_foil","heritage"],
    price_cents: 199, is_trending: false, is_featured: true, is_published: true,
    download_count: 145, category_tags: ["wedding","rsvp"], created_at: now,
  },
];

export function templatesForSurface(surface: SurfaceType): StarterTemplate[] {
  return STARTER_TEMPLATES.filter((t) => t.surface_type === surface && t.is_published);
}

export function findTemplate(id: string): StarterTemplate | undefined {
  return STARTER_TEMPLATES.find((t) => t.id === id);
}

// ── Supabase fetch pattern — enable when client is wired ──────────────────
// export async function fetchTemplates(supabase, surface: SurfaceType) {
//   const { data, error } = await supabase
//     .from("design_templates")
//     .select("*")
//     .eq("surface_type", surface)
//     .eq("is_published", true)
//     .order("is_trending", { ascending: false });
//   if (error) throw error;
//   return data as StarterTemplate[];
// }
