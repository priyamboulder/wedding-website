#!/usr/bin/env node
// scripts/seed-confessional.mjs
//
// Seeds the Marigold Confessional posts from
// lib/marigold-confessional/seed-data.ts. Idempotent: rows are matched by
// exact `content` text and updated in place.
//
// Run:    npx tsx scripts/seed-confessional.mjs
// Needs:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
//
// Same tsx pattern as scripts/seed-polls.mjs.

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
  const mod = await import("../lib/marigold-confessional/seed-data.ts");
  return mod.CONFESSIONAL_SEEDS;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchExistingByContent() {
  const map = new Map();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("marigold_confessions")
      .select("id, content")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const row of data) map.set(row.content, row.id);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return map;
}

function rowFromSeed(seed) {
  const r = seed.reactions ?? {};
  return {
    post_type: seed.post_type,
    persona_tag: seed.persona_tag,
    content: seed.content,
    seed_reaction_same: r.same ?? 0,
    seed_reaction_aunty_disapproves: r.aunty_disapproves ?? 0,
    seed_reaction_fire: r.fire ?? 0,
    seed_reaction_sending_chai: r.sending_chai ?? 0,
  };
}

async function main() {
  console.log("Loading confessional seed data…");
  const seeds = await loadSeeds();
  console.log(`  ${seeds.length} posts in source.`);

  console.log("Fetching existing posts…");
  const existing = await fetchExistingByContent();
  console.log(`  ${existing.size} posts already in DB.`);

  const inserts = [];
  const updates = [];
  for (const seed of seeds) {
    const row = rowFromSeed(seed);
    const id = existing.get(seed.content);
    if (id) updates.push({ id, ...row });
    else inserts.push(row);
  }

  if (inserts.length > 0) {
    console.log(`Inserting ${inserts.length} new posts…`);
    for (const batch of chunk(inserts, 100)) {
      const { error } = await supabase.from("marigold_confessions").insert(batch);
      if (error) {
        console.error("Insert error:", error.message);
        process.exit(1);
      }
    }
  }

  if (updates.length > 0) {
    console.log(`Updating ${updates.length} existing posts…`);
    for (const batch of chunk(updates, 100)) {
      const { error } = await supabase
        .from("marigold_confessions")
        .upsert(batch, { onConflict: "id" });
      if (error) {
        console.error("Update error:", error.message);
        process.exit(1);
      }
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
