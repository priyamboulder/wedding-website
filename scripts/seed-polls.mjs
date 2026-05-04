#!/usr/bin/env node
// scripts/seed-polls.mjs
//
// Seeds the Supabase `polls` table from lib/polls/seed-data.ts. Idempotent:
// rows are matched by question text and updated in place.
//
// Run:    npx tsx scripts/seed-polls.mjs
// Needs:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
//
// Why tsx and not plain node: lib/polls/seed-data.ts is TypeScript and uses
// the @/ path alias. tsx handles both transparently. The repo already uses
// the same pattern in scripts/seed-vendors.mjs.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function loadSeeds() {
  const mod = await import("../lib/polls/seed-data.ts");
  return mod.POLL_SEEDS;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchExistingByQuestion() {
  const map = new Map();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("polls")
      .select("id, question")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const row of data) map.set(row.question, row.id);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return map;
}

async function main() {
  console.log("Loading poll seed data…");
  const seeds = await loadSeeds();
  console.log(`  ${seeds.length} polls in source.`);

  console.log("Fetching existing polls…");
  const existing = await fetchExistingByQuestion();
  console.log(`  ${existing.size} polls already in DB.`);

  const now = new Date().toISOString();

  const inserts = [];
  const updates = [];
  for (const seed of seeds) {
    const row = {
      question: seed.question,
      category: seed.category,
      options: seed.options,
      poll_type: seed.poll_type,
      is_featured: seed.is_featured ?? false,
      featured_date: seed.is_featured ? (seed.featured_date ?? now) : null,
    };
    const id = existing.get(seed.question);
    if (id) {
      updates.push({ id, ...row });
    } else {
      inserts.push(row);
    }
  }

  if (inserts.length > 0) {
    console.log(`Inserting ${inserts.length} new polls…`);
    for (const batch of chunk(inserts, 100)) {
      const { error } = await supabase.from("polls").insert(batch);
      if (error) {
        console.error("Insert error:", error.message);
        process.exit(1);
      }
    }
  }

  if (updates.length > 0) {
    console.log(`Updating ${updates.length} existing polls…`);
    for (const batch of chunk(updates, 100)) {
      const { error } = await supabase.from("polls").upsert(batch, { onConflict: "id" });
      if (error) {
        console.error("Update error:", error.message);
        process.exit(1);
      }
    }
  }

  // Sanity check: confirm featured poll is set correctly. The brief calls
  // out poll #63 (Gulab jamun or rasgulla) as the initial featured poll.
  const FEATURED_QUESTION = "Gulab jamun or rasgulla? (Settle this forever.)";
  const { data: featuredRow, error: featuredErr } = await supabase
    .from("polls")
    .select("id, is_featured, featured_date")
    .eq("question", FEATURED_QUESTION)
    .maybeSingle();
  if (featuredErr) {
    console.warn("Could not verify featured poll:", featuredErr.message);
  } else if (!featuredRow) {
    console.warn("Featured poll row not found after seeding");
  } else if (!featuredRow.is_featured) {
    console.warn("Featured poll was not marked is_featured = true");
  } else {
    console.log(`Featured poll set: ${featuredRow.id} (${featuredRow.featured_date})`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
