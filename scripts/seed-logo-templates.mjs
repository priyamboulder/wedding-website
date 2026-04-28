// Seed the `logo_templates` table with the nine launch templates.
//
// Run:
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE=… node scripts/seed-logo-templates.mjs
//
// The in-repo UI mirrors these entries in components/logos/templates/index.ts
// so the gallery works before Supabase is wired up.
//
// preview_svg_static is a generic fallback thumbnail used in any context
// where the live React component can't render (PDFs, email, server renders).

import { createClient } from "@supabase/supabase-js";

const TEMPLATES = [
  {
    slug: "lisbeth",
    name: "Lisbeth Logo",
    category: "script",
    component_key: "lisbeth",
    default_connector: "and",
    preview_svg_static: makeStaticPreview("Priya", "and", "Arjun", "stacked script"),
  },
  {
    slug: "elaine",
    name: "Elaine Logo",
    category: "script",
    component_key: "elaine",
    default_connector: "and",
    preview_svg_static: makeStaticPreview("Priya", "and", "Arjun", "script + sprig"),
  },
  {
    slug: "gizelle",
    name: "Gizelle Logo",
    category: "condensed",
    component_key: "gizelle",
    default_connector: "&",
    preview_svg_static: makeStaticPreview("PRIYA", "&", "ARJUN", "tall condensed serif"),
  },
  {
    slug: "murphey",
    name: "Murphey Logo",
    category: "script",
    component_key: "murphey",
    default_connector: "*",
    preview_svg_static: makeStaticPreview("Priya", "*", "Arjun", "handwritten + star"),
  },
  {
    slug: "chloe",
    name: "Chloe Logo",
    category: "script",
    component_key: "chloe",
    default_connector: "|",
    preview_svg_static: makeStaticPreview("priya", "|", "arjun", "lowercase side-by-side"),
  },
  {
    slug: "rowan",
    name: "Rowan Logo",
    category: "display",
    component_key: "rowan",
    default_connector: "and",
    preview_svg_static: makeStaticPreview("PRIYA", "AND", "ARJUN", "bold display serif"),
  },
  {
    slug: "rosa",
    name: "Rosa Logo",
    category: "tracked",
    component_key: "rosa",
    default_connector: "and",
    preview_svg_static: makeStaticPreview("• PRIYA and", "", "ARJUN •", "tracked caps"),
  },
  {
    slug: "janie",
    name: "Janie Logo",
    category: "editorial",
    component_key: "janie",
    default_connector: "and",
    preview_svg_static: makeStaticPreview("PRIYA", "AND", "ARJUN", "light serif + rules"),
  },
  {
    slug: "royal",
    name: "Royal Logo",
    category: "deco",
    component_key: "royal",
    default_connector: "&",
    preview_svg_static: makeStaticPreview("PRIYA", "&", "ARJUN", "art deco overlap"),
  },
];

function makeStaticPreview(top, middle, bottom, caption) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" preserveAspectRatio="xMidYMid meet">
  <rect width="720" height="400" fill="#F5F1EA"/>
  <text x="360" y="160" text-anchor="middle" font-family="Georgia, serif" font-size="56" fill="#1a1a1a">${top}</text>
  <text x="360" y="220" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="26" fill="#1a1a1a" opacity="0.75">${middle}</text>
  <text x="360" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="56" fill="#1a1a1a">${bottom}</text>
  <text x="360" y="360" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="4" fill="#1a1a1a" opacity="0.6">${caption.toUpperCase()}</text>
</svg>`;
}

async function main() {
  // Load .env.local if env vars not already set
  if (!process.env.SUPABASE_URL) {
    try {
      const { readFileSync } = await import("fs");
      const { resolve, dirname } = await import("path");
      const { fileURLToPath } = await import("url");
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const content = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
      for (const line of content.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq < 0) continue;
        const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim();
        if (k && v && !process.env[k]) process.env[k] = v;
      }
    } catch {}
  }
  const url = process.env.SUPABASE_URL;
  // Support both SUPABASE_SERVICE_ROLE and SUPABASE_SERVICE_ROLE_KEY
  const key = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("logo_templates")
    .upsert(TEMPLATES, { onConflict: "slug" })
    .select("slug,name");

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} logo templates:`);
  for (const t of data) console.log(`  • ${t.slug.padEnd(9)} ${t.name}`);
}

main();
