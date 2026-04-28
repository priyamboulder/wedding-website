#!/usr/bin/env node
// scripts/seed-all.mjs
// Master seed runner — runs all seed scripts in order.
// Run: npx tsx scripts/seed-all.mjs
// Or individual seeds: npx tsx scripts/seed-vendors.mjs

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function run(script) {
  const scriptPath = resolve(__dirname, script);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Running: ${script}`);
  console.log("=".repeat(60));
  try {
    execSync(`npx tsx "${scriptPath}"`, {
      stdio: "inherit",
      cwd: root,
      env: { ...process.env },
    });
  } catch (err) {
    console.error(`✗ ${script} failed:`, err.message);
  }
}

console.log("Ananya — Full Database Seed");
console.log("This will upsert all seed data into your Supabase instance.");
console.log("Existing rows are updated (not deleted). Safe to re-run.\n");

run("seed-vendors.mjs");
run("seed-checklist.mjs");
run("seed-stationery.mjs");
run("seed-logo-templates.mjs");
run("seed-monogram-templates.mjs");

console.log("\n✓ All seeds complete.");
console.log("Your Supabase database now has all template data.");
