// Seed the `monogram_templates` table with the six launch templates.
//
// Run:
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE=… node scripts/seed-monogram-templates.mjs
//
// This is the authoritative source for which templates exist in production.
// The in-repo UI mirrors it in components/monograms/templates/index.ts so the
// gallery works before Supabase is wired up.
//
// preview_svg_static is a fallback thumbnail (generic letters) used in any
// context where the live React component can't render — PDFs, emails,
// server-rendered previews, etc.

import { createClient } from "@supabase/supabase-js";

const TEMPLATES = [
  {
    slug: "rose",
    name: "Rose monogram",
    category: "classic",
    component_key: "rose",
    preview_svg_static: makeStaticPreview("A&B", "classic stacked"),
  },
  {
    slug: "malin",
    name: "Malin monogram",
    category: "arched",
    component_key: "malin",
    preview_svg_static: makeStaticPreview("A & B", "arched names"),
  },
  {
    slug: "acadia",
    name: "Acadia monogram",
    category: "ampersand",
    component_key: "acadia",
    preview_svg_static: makeStaticPreview("A & B", "oversized ampersand"),
  },
  {
    slug: "gianna",
    name: "Gianna monogram",
    category: "editorial",
    component_key: "gianna",
    preview_svg_static: makeStaticPreview("A | B", "date block flanked"),
  },
  {
    slug: "cybil",
    name: "Cybil monogram",
    category: "framed",
    component_key: "cybil",
    preview_svg_static: makeStaticPreview("A&B", "nested oval frame"),
  },
  {
    slug: "chloe",
    name: "Chloe monogram",
    category: "circular",
    component_key: "chloe",
    preview_svg_static: makeStaticPreview("·", "circular orbit"),
  },
];

function makeStaticPreview(label, caption) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
  <rect width="640" height="400" fill="#F5F1EA"/>
  <text x="320" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="120" fill="#1a1a1a">${label}</text>
  <text x="320" y="340" text-anchor="middle" font-family="monospace" font-size="14" letter-spacing="4" fill="#1a1a1a" opacity="0.6">${caption.toUpperCase()}</text>
</svg>`;
}

async function main() {
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
  const key = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("monogram_templates")
    .upsert(TEMPLATES, { onConflict: "slug" })
    .select("slug,name");

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} monogram templates:`);
  for (const t of data) console.log(`  • ${t.slug.padEnd(8)} ${t.name}`);
}

main();
