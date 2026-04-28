// Replaces all picsum.photos placeholder URLs in vendor-unified-seed.ts
// with real wedding photos from public/wedding-photos/, assigned by vendor category.
// Run: node scripts/wire-vendor-images.mjs

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Photo pools by category ──────────────────────────────────────────────────
// Photography vendors → portrait + best + wedding shots (most impressive)
// Decor/florals → decor shots from USA weddings + sangeet/baraat/haldi
// Entertainment → sangeet + baraat + pre-wedding shots
// Catering → reception decor (food/events context)
// HMUA → mehndi + portrait close-ups
// Venue → wedding + USA decor wide shots
// Attire → portrait + pre-wedding (outfit-focused)
// Jewellery → portrait + mehndi (close detail shots)
// Stationery → pre-wedding + new folder
// Planning → wide event shots

const PHOTO_POOLS = {
  photography: [
    // Best + portrait + wedding — most polished shots
    "/wedding-photos/best/best-01.jpg",
    "/wedding-photos/best/best-02.jpg",
    "/wedding-photos/best/best-03.jpg",
    "/wedding-photos/best/best-04.jpg",
    "/wedding-photos/best/best-05.jpg",
    "/wedding-photos/best/best-06.jpg",
    "/wedding-photos/best/best-07.jpg",
    "/wedding-photos/portrait/portrait-01.jpg",
    "/wedding-photos/portrait/portrait-02.jpg",
    "/wedding-photos/portrait/portrait-03.jpg",
    "/wedding-photos/portrait/portrait-04.jpg",
    "/wedding-photos/portrait/portrait-05.jpg",
    "/wedding-photos/portrait/portrait-06.jpg",
    "/wedding-photos/portrait/portrait-07.jpg",
    "/wedding-photos/portrait/portrait-08.jpg",
    "/wedding-photos/portrait/portrait-09.jpg",
    "/wedding-photos/portrait/portrait-10.jpg",
    "/wedding-photos/portrait/portrait-11.jpg",
    "/wedding-photos/portrait/portrait-12.jpg",
    "/wedding-photos/portrait/portrait-13.jpg",
    "/wedding-photos/portrait/portrait-14.jpg",
    "/wedding-photos/wedding/wedding-01.jpg",
    "/wedding-photos/wedding/wedding-02.jpg",
    "/wedding-photos/wedding/wedding-03.jpg",
    "/wedding-photos/wedding/wedding-04.jpg",
    "/wedding-photos/wedding/wedding-05.jpg",
    "/wedding-photos/wedding/wedding-06.jpg",
    "/wedding-photos/wedding/wedding-07.jpg",
    "/wedding-photos/wedding/wedding-08.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-001.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-002.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-003.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-004.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-005.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-006.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-007.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-008.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-009.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-010.jpg",
  ],
  decor_florals: [
    "/wedding-photos/usa-decor/usa-decor-001.jpg",
    "/wedding-photos/usa-decor/usa-decor-002.jpg",
    "/wedding-photos/usa-decor/usa-decor-003.jpg",
    "/wedding-photos/usa-decor/usa-decor-004.jpg",
    "/wedding-photos/usa-decor/usa-decor-005.jpg",
    "/wedding-photos/usa-decor/usa-decor-006.jpg",
    "/wedding-photos/usa-decor/usa-decor-007.jpg",
    "/wedding-photos/usa-decor/usa-decor-008.jpg",
    "/wedding-photos/usa-decor/usa-decor-009.jpg",
    "/wedding-photos/usa-decor/usa-decor-010.jpg",
    "/wedding-photos/usa-decor/usa-decor-011.jpg",
    "/wedding-photos/usa-decor/usa-decor-012.jpg",
    "/wedding-photos/usa-decor/usa-decor-013.jpg",
    "/wedding-photos/usa-decor/usa-decor-014.jpg",
    "/wedding-photos/usa-decor/usa-decor-015.jpg",
    "/wedding-photos/usa-decor/usa-decor-016.jpg",
    "/wedding-photos/usa-decor/usa-decor-017.jpg",
    "/wedding-photos/usa-decor/usa-decor-018.jpg",
    "/wedding-photos/usa-decor/usa-decor-019.jpg",
    "/wedding-photos/usa-decor/usa-decor-020.jpg",
    "/wedding-photos/usa-decor/usa-decor-021.jpg",
    "/wedding-photos/usa-decor/usa-decor-022.jpg",
    "/wedding-photos/usa-decor/usa-decor-023.jpg",
    "/wedding-photos/usa-decor/usa-decor-024.jpg",
    "/wedding-photos/usa-decor/usa-decor-025.jpg",
    "/wedding-photos/sangeet/sangeet-01.jpg",
    "/wedding-photos/sangeet/sangeet-02.jpg",
    "/wedding-photos/sangeet/sangeet-03.jpg",
    "/wedding-photos/sangeet/sangeet-04.jpg",
    "/wedding-photos/sangeet/sangeet-05.jpg",
    "/wedding-photos/haldi/haldi-01.jpg",
    "/wedding-photos/haldi/haldi-02.jpg",
    "/wedding-photos/haldi/haldi-03.jpg",
    "/wedding-photos/haldi/haldi-04.jpg",
    "/wedding-photos/haldi/haldi-05.jpg",
    "/wedding-photos/baraat/baraat-01.jpg",
    "/wedding-photos/baraat/baraat-02.jpg",
    "/wedding-photos/baraat/baraat-03.jpg",
    "/wedding-photos/baraat/baraat-04.jpg",
    "/wedding-photos/baraat/baraat-05.jpg",
  ],
  entertainment: [
    "/wedding-photos/sangeet/sangeet-01.jpg",
    "/wedding-photos/sangeet/sangeet-02.jpg",
    "/wedding-photos/sangeet/sangeet-03.jpg",
    "/wedding-photos/sangeet/sangeet-04.jpg",
    "/wedding-photos/sangeet/sangeet-05.jpg",
    "/wedding-photos/baraat/baraat-01.jpg",
    "/wedding-photos/baraat/baraat-02.jpg",
    "/wedding-photos/baraat/baraat-03.jpg",
    "/wedding-photos/baraat/baraat-04.jpg",
    "/wedding-photos/baraat/baraat-05.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-01.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-02.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-03.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-04.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-05.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-06.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-07.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-08.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-09.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-10.jpg",
    "/wedding-photos/usa-decor/usa-decor-021.jpg",
    "/wedding-photos/usa-decor/usa-decor-022.jpg",
    "/wedding-photos/usa-decor/usa-decor-023.jpg",
    "/wedding-photos/usa-decor/usa-decor-024.jpg",
    "/wedding-photos/usa-decor/usa-decor-025.jpg",
    "/wedding-photos/usa-decor/usa-decor-026.jpg",
    "/wedding-photos/usa-decor/usa-decor-027.jpg",
    "/wedding-photos/usa-decor/usa-decor-028.jpg",
    "/wedding-photos/usa-decor/usa-decor-029.jpg",
    "/wedding-photos/usa-decor/usa-decor-030.jpg",
  ],
  catering: [
    "/wedding-photos/usa-decor/usa-decor-026.jpg",
    "/wedding-photos/usa-decor/usa-decor-027.jpg",
    "/wedding-photos/usa-decor/usa-decor-028.jpg",
    "/wedding-photos/usa-decor/usa-decor-029.jpg",
    "/wedding-photos/usa-decor/usa-decor-030.jpg",
    "/wedding-photos/usa-decor/usa-decor-031.jpg",
    "/wedding-photos/usa-decor/usa-decor-032.jpg",
    "/wedding-photos/usa-decor/usa-decor-033.jpg",
    "/wedding-photos/usa-decor/usa-decor-034.jpg",
    "/wedding-photos/usa-decor/usa-decor-035.jpg",
    "/wedding-photos/wedding/wedding-01.jpg",
    "/wedding-photos/wedding/wedding-02.jpg",
    "/wedding-photos/wedding/wedding-03.jpg",
    "/wedding-photos/wedding/wedding-04.jpg",
    "/wedding-photos/sangeet/sangeet-01.jpg",
  ],
  hmua: [
    "/wedding-photos/mehndi/mehndi-01.jpg",
    "/wedding-photos/mehndi/mehndi-02.jpg",
    "/wedding-photos/mehndi/mehndi-03.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-001.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-002.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-003.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-004.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-005.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-006.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-007.jpg",
    "/wedding-photos/portrait/portrait-01.jpg",
    "/wedding-photos/portrait/portrait-02.jpg",
    "/wedding-photos/portrait/portrait-03.jpg",
    "/wedding-photos/portrait/portrait-04.jpg",
    "/wedding-photos/portrait/portrait-05.jpg",
    "/wedding-photos/new/new-01.jpg",
    "/wedding-photos/new/new-02.jpg",
    "/wedding-photos/new/new-03.jpg",
    "/wedding-photos/new/new-04.jpg",
    "/wedding-photos/new/new-05.jpg",
  ],
  venue: [
    "/wedding-photos/usa-decor/usa-decor-001.jpg",
    "/wedding-photos/usa-decor/usa-decor-005.jpg",
    "/wedding-photos/usa-decor/usa-decor-010.jpg",
    "/wedding-photos/usa-decor/usa-decor-015.jpg",
    "/wedding-photos/usa-decor/usa-decor-020.jpg",
    "/wedding-photos/wedding/wedding-01.jpg",
    "/wedding-photos/wedding/wedding-03.jpg",
    "/wedding-photos/wedding/wedding-05.jpg",
    "/wedding-photos/baraat/baraat-01.jpg",
    "/wedding-photos/baraat/baraat-03.jpg",
    "/wedding-photos/sangeet/sangeet-01.jpg",
    "/wedding-photos/sangeet/sangeet-03.jpg",
    "/wedding-photos/haldi/haldi-01.jpg",
    "/wedding-photos/haldi/haldi-05.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-01.jpg",
  ],
  attire: [
    "/wedding-photos/portrait/portrait-01.jpg",
    "/wedding-photos/portrait/portrait-03.jpg",
    "/wedding-photos/portrait/portrait-05.jpg",
    "/wedding-photos/portrait/portrait-07.jpg",
    "/wedding-photos/portrait/portrait-09.jpg",
    "/wedding-photos/portrait/portrait-11.jpg",
    "/wedding-photos/portrait/portrait-13.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-01.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-03.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-05.jpg",
    "/wedding-photos/new/new-06.jpg",
    "/wedding-photos/new/new-07.jpg",
    "/wedding-photos/new/new-08.jpg",
    "/wedding-photos/new/new-09.jpg",
    "/wedding-photos/new/new-10.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-010.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-015.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-020.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-025.jpg",
    "/wedding-photos/usa-portrait/usa-portrait-030.jpg",
  ],
  jewellery: [
    "/wedding-photos/mehndi/mehndi-01.jpg",
    "/wedding-photos/mehndi/mehndi-02.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-008.jpg",
    "/wedding-photos/usa-mehndi/usa-mehndi-010.jpg",
    "/wedding-photos/portrait/portrait-02.jpg",
    "/wedding-photos/portrait/portrait-04.jpg",
    "/wedding-photos/portrait/portrait-06.jpg",
    "/wedding-photos/new/new-11.jpg",
    "/wedding-photos/new/new-12.jpg",
    "/wedding-photos/new/new-13.jpg",
    "/wedding-photos/best/best-01.jpg",
    "/wedding-photos/best/best-03.jpg",
    "/wedding-photos/best/best-05.jpg",
  ],
  stationery: [
    "/wedding-photos/new/new-01.jpg",
    "/wedding-photos/new/new-02.jpg",
    "/wedding-photos/new/new-03.jpg",
    "/wedding-photos/new/new-04.jpg",
    "/wedding-photos/new/new-05.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-01.jpg",
    "/wedding-photos/pre-wedding/pre-wedding-02.jpg",
    "/wedding-photos/best/best-01.jpg",
    "/wedding-photos/best/best-02.jpg",
    "/wedding-photos/portrait/portrait-01.jpg",
  ],
};

// Fallback pool for any category not listed
const DEFAULT_POOL = [
  "/wedding-photos/best/best-01.jpg",
  "/wedding-photos/best/best-02.jpg",
  "/wedding-photos/best/best-03.jpg",
  "/wedding-photos/wedding/wedding-01.jpg",
  "/wedding-photos/wedding/wedding-02.jpg",
  "/wedding-photos/portrait/portrait-01.jpg",
  "/wedding-photos/portrait/portrait-02.jpg",
  "/wedding-photos/usa-decor/usa-decor-001.jpg",
  "/wedding-photos/sangeet/sangeet-01.jpg",
  "/wedding-photos/pre-wedding/pre-wedding-01.jpg",
];

// Portfolio pools per category (cycled through to give each vendor 4 portfolio images)
const PORTFOLIO_POOLS = {
  photography: [
    ...Array.from({ length: 49 }, (_, i) => `/wedding-photos/usa-portrait/usa-portrait-${String(i + 1).padStart(3, "0")}.jpg`),
    ...Array.from({ length: 14 }, (_, i) => `/wedding-photos/portrait/portrait-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 8 }, (_, i) => `/wedding-photos/wedding/wedding-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 7 }, (_, i) => `/wedding-photos/best/best-${String(i + 1).padStart(2, "0")}.jpg`),
  ],
  decor_florals: [
    ...Array.from({ length: 57 }, (_, i) => `/wedding-photos/usa-decor/usa-decor-${String(i + 1).padStart(3, "0")}.jpg`),
    ...Array.from({ length: 5 }, (_, i) => `/wedding-photos/sangeet/sangeet-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 11 }, (_, i) => `/wedding-photos/haldi/haldi-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 5 }, (_, i) => `/wedding-photos/baraat/baraat-${String(i + 1).padStart(2, "0")}.jpg`),
  ],
  entertainment: [
    ...Array.from({ length: 5 }, (_, i) => `/wedding-photos/sangeet/sangeet-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 5 }, (_, i) => `/wedding-photos/baraat/baraat-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 10 }, (_, i) => `/wedding-photos/pre-wedding/pre-wedding-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 22 }, (_, i) => `/wedding-photos/new/new-${String(i + 1).padStart(2, "0")}.jpg`),
  ],
  hmua: [
    ...Array.from({ length: 3 }, (_, i) => `/wedding-photos/mehndi/mehndi-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 77 }, (_, i) => `/wedding-photos/usa-mehndi/usa-mehndi-${String(i + 1).padStart(3, "0")}.jpg`),
    ...Array.from({ length: 14 }, (_, i) => `/wedding-photos/portrait/portrait-${String(i + 1).padStart(2, "0")}.jpg`),
  ],
};

function getPool(category) {
  return PHOTO_POOLS[category] || DEFAULT_POOL;
}

function getPortfolioPool(category) {
  return PORTFOLIO_POOLS[category] || [
    ...Array.from({ length: 8 }, (_, i) => `/wedding-photos/wedding/wedding-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 5 }, (_, i) => `/wedding-photos/sangeet/sangeet-${String(i + 1).padStart(2, "0")}.jpg`),
    ...Array.from({ length: 7 }, (_, i) => `/wedding-photos/best/best-${String(i + 1).padStart(2, "0")}.jpg`),
  ];
}

// Counters per category for round-robin assignment
const coverCounters = {};
const portfolioCounters = {};

function nextCoverImage(category) {
  const pool = getPool(category);
  const idx = (coverCounters[category] ?? 0) % pool.length;
  coverCounters[category] = idx + 1;
  return pool[idx];
}

function nextPortfolioImages(category, count = 4) {
  const pool = getPortfolioPool(category);
  const start = (portfolioCounters[category] ?? 0);
  portfolioCounters[category] = start + count;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
}

// ── Transform the seed file ──────────────────────────────────────────────────

const seedPath = join(ROOT, "lib", "vendor-unified-seed.ts");
let content = readFileSync(seedPath, "utf8");

// Replace cover_image picsum URLs — match pattern: "https://picsum.photos/seed/XXX-cover/..."
// We need to track which category each vendor block belongs to.
// Strategy: process line-by-line, track current category, replace cover and portfolio URLs.

const lines = content.split("\n");
const result = [];
let currentCategory = "photography";
let inPortfolioImages = false;
let portfolioImagesForCurrent = [];
let portfolioInsertPending = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Track category
  const catMatch = line.match(/category:\s*["']([^"']+)["']/);
  if (catMatch) {
    currentCategory = catMatch[1];
    inPortfolioImages = false;
  }

  // Replace cover_image picsum URL
  if (line.includes("cover_image:") && line.includes("picsum.photos")) {
    const newUrl = nextCoverImage(currentCategory);
    const replaced = line.replace(/https:\/\/picsum\.photos\/seed\/[^"']+/, newUrl);
    result.push(replaced);
    continue;
  }

  // Detect portfolio_images: [] (empty array — replace with real images)
  if (line.includes("portfolio_images: []")) {
    const imgs = nextPortfolioImages(currentCategory, 4);
    const indent = line.match(/^(\s*)/)[1];
    result.push(`${indent}portfolio_images: [`);
    imgs.forEach((url, idx) => {
      result.push(`${indent}  { url: "${url}", alt: "portfolio image ${idx + 1}" },`);
    });
    result.push(`${indent}],`);
    continue;
  }

  // Replace existing portfolio_images picsum URLs
  if (line.includes("portfolio_images: [") && !line.includes("[]")) {
    inPortfolioImages = true;
    result.push(line);
    continue;
  }

  if (inPortfolioImages && line.includes("picsum.photos")) {
    // Replace individual portfolio picsum URL
    const pool = getPortfolioPool(currentCategory);
    const idx = (portfolioCounters[currentCategory] ?? 0) % pool.length;
    portfolioCounters[currentCategory] = idx + 1;
    const newUrl = pool[idx];
    const replaced = line.replace(/https:\/\/picsum\.photos\/seed\/[^"']+/, newUrl);
    result.push(replaced);
    continue;
  }

  if (inPortfolioImages && line.trim() === "],") {
    inPortfolioImages = false;
  }

  result.push(line);
}

writeFileSync(seedPath, result.join("\n"), "utf8");
console.log("Done! vendor-unified-seed.ts updated with real photo URLs.");
console.log("Cover counters:", JSON.stringify(coverCounters, null, 2));
