#!/usr/bin/env node
// scripts/seed-stationery.mjs
// Seeds stationery templates into Supabase `stationery_templates` table.
// Run: npx tsx scripts/seed-stationery.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const content = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim();
      if (k && v && !process.env[k]) process.env[k] = v;
    }
  } catch { console.error("Could not load .env.local"); process.exit(1); }
}
loadEnv();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { SEED_STATIONERY_SUITE_DETAILS } = await import("../lib/stationery-detail-seed.ts");
  const items = SEED_STATIONERY_SUITE_DETAILS ?? [];
  console.log(`Seeding ${items.length} stationery templates...`);

  const rows = items.map((s) => ({
    id: s.item_id ?? s.slug,
    name: s.slug ?? s.item_id ?? "untitled",
    description: s.tagline ?? null,
    style_tags: [],
    preview_image: null,
    data: s,
    created_at: new Date().toISOString(),
  }));

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from("stationery_templates").upsert(rows.slice(i, i + BATCH), { onConflict: "id" });
    if (error) console.error("Batch error:", error.message);
    else { inserted += Math.min(BATCH, rows.length - i); process.stdout.write(`\r${inserted}/${rows.length}...`); }
  }
  console.log(`\n✓ ${inserted} stationery templates seeded.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
