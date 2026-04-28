#!/usr/bin/env node
// scripts/seed-vendors.mjs
// Seeds the Supabase `vendors` table from the unified vendor seed.
// Run: node scripts/seed-vendors.mjs
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && val && !process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error("Could not load .env.local — ensure it exists");
    process.exit(1);
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Dynamic import of compiled seed — we use tsx/ts-node or a pre-built version.
// Since seed is TypeScript, we import the JS-compatible form by reading directly.
// The vendor seed exports UNIFIED_VENDORS. We'll use tsx to run this.
async function loadVendors() {
  // Import using dynamic require via tsx transformation
  const { UNIFIED_VENDORS } = await import("../lib/vendor-unified-seed.ts");
  return UNIFIED_VENDORS;
}

async function main() {
  console.log("Loading vendor seed data...");
  let vendors;
  try {
    vendors = await loadVendors();
  } catch (err) {
    console.error("Failed to import vendor seed. Try: npx tsx scripts/seed-vendors.mjs");
    console.error(err.message);
    process.exit(1);
  }

  console.log(`Seeding ${vendors.length} vendors into Supabase...`);

  // Map TypeScript Vendor shape → Supabase vendors table schema (0001_vendors.sql)
  // Only include columns that exist in the DB schema
  const rows = vendors.map((v) => ({
    name: v.name,
    category: v.category,
    location: v.location ?? null,
    price_range: v.price_display?.type === "starting_from"
      ? `₹${(v.price_display.amount / 100000).toFixed(1)}L+`
      : v.price_display?.type === "range"
        ? `₹${(v.price_display.min / 100000).toFixed(1)}L – ₹${(v.price_display.max / 100000).toFixed(1)}L`
        : null,
    style_tags: v.style_tags ?? [],
    rating: v.rating ?? null,
    review_count: v.review_count ?? 0,
    images: v.portfolio_images ?? [],
    bio: v.bio ?? null,
    contact: {
      email: v.contact?.email ?? "",
      phone: v.contact?.phone ?? "",
      website: v.contact?.website ?? "",
      instagram: v.contact?.instagram ?? v.instagram_handle ?? "",
    },
    turnaround: v.response_time_hours
      ? `${v.response_time_hours}h response`
      : null,
    created_at: v.created_at ?? new Date().toISOString(),
  }));

  // Upsert in batches of 100 to avoid payload limits
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("vendors").insert(batch);
    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`\rInserted ${inserted}/${rows.length} vendors...`);
    }
  }

  console.log(`\n✓ Done. ${inserted} vendors inserted, ${errors} errors.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
