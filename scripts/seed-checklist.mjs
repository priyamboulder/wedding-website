#!/usr/bin/env node
// scripts/seed-checklist.mjs
// Seeds the Supabase `checklist_items` table from the checklist seed.
// These become the TEMPLATE items for all new couples.
// Run: npx tsx scripts/seed-checklist.mjs
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

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
    console.error("Could not load .env.local");
    process.exit(1);
  }
}

loadEnv();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Template couple_id — these rows represent the canonical template
// (not tied to any real user). When a user first opens the checklist,
// loadFromDB() finds nothing for their couple_id and falls back to seed.
// The template rows are used by the admin to preview the master checklist.
const TEMPLATE_COUPLE_ID = "template-seed";

async function main() {
  console.log("Loading checklist seed data...");
  const { CHECKLIST_ITEMS, PHASES } = await import("../lib/checklist-seed.ts");

  console.log(`Found ${CHECKLIST_ITEMS.length} checklist items across ${PHASES.length} phases`);

  const rows = CHECKLIST_ITEMS.map((item) => ({
    id: item.id,
    couple_id: TEMPLATE_COUPLE_ID,
    phase_id: item.phase_id,
    subsection: item.subsection ?? "",
    title: item.title,
    description: item.description ?? null,
    status: item.status ?? "not_started",
    priority: item.priority ?? "medium",
    due_date: item.due_date ?? null,
    notes: item.notes ?? null,
    is_custom: item.source === "custom",
    category_tags: item.category_tags ?? [],
    assignee_ids: item.assignee_ids ?? [],
    dependencies: item.dependencies ?? [],
    decision_fields: item.decision_fields ?? [],
    created_at: item.created_at ?? new Date().toISOString(),
    updated_at: item.updated_at ?? new Date().toISOString(),
  }));

  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("checklist_items").upsert(batch, {
      onConflict: "id",
      ignoreDuplicates: false,
    });
    if (error) {
      console.error(`Batch error:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\rInserted ${inserted}/${rows.length} items...`);
    }
  }

  console.log(`\n✓ Done. ${inserted} checklist template items seeded.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
