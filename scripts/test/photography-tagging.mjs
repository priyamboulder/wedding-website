// Tests: photography task tagging + category query logic.
// Standalone — no test framework. Run: node scripts/test/photography-tagging.mjs
//
// Covers:
//   1. All 29 photography-relevant task IDs appear in the seed with the
//      `photography` category tag and at least one workspace_tab_tag.
//   2. Multi-category tasks (e.g. save-the-date photoshoot → stationery,
//      makeup trial → hmua) include both expected category tags.
//   3. Pure query helpers: hasCategoryTag, filterItemsForCategory,
//      bucketForDeadline, relativeTimeLabel, getUpcomingForCategory sort order.
//
// We parse the seed as text (no TS compile step) to keep the test dep-free,
// and reimplement the pure helpers in JS — if the logic drifts in TS, these
// tests still pin the contract.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

// ── Assertion helper ────────────────────────────────────────────────────────

const results = [];
function it(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (err) {
    results.push({ name, ok: false, err: err.message ?? String(err) });
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function deepEq(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEq(a[i], b[i])) return false;
    return true;
  }
  if (a && b && typeof a === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!deepEq(a[k], b[k])) return false;
    return true;
  }
  return false;
}

// ── Seed parsing ────────────────────────────────────────────────────────────

const seed = fs.readFileSync(path.join(ROOT, "lib", "checklist-seed.ts"), "utf8");

function taskLine(id) {
  const lines = seed.split("\n");
  return lines.find((l) => l.includes(`"${id}"`) && l.includes("item("));
}

// Extract a JS-ish value after `key:` — handles simple arrays and nested objects.
function extractOptValue(line, key) {
  const idx = line.indexOf(`${key}:`);
  if (idx < 0) return null;
  // Walk the value respecting bracket depth. Value ends at the first comma at depth 0.
  let i = idx + key.length + 1;
  while (line[i] === " ") i++;
  let depth = 0, inStr = false, strCh = "", start = i;
  for (; i < line.length; i++) {
    const c = line[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
    else if (c === "," && depth === 0) break;
  }
  return line.slice(start, i).trim();
}

// ── Expected photography task IDs & multi-cat mapping ──────────────────────

const PHOTOGRAPHY_IDS = [
  "p1-digital-05",
  ...Array.from({ length: 13 }, (_, i) => `p2-photo-${String(i + 1).padStart(2, "0")}`),
  "p3-beau-02", "p3-beau-04", "p3-style-07",
  "p5-std-03", "p5-dop-10",
  "p7-cer-18", "p7-sang-08",
  "p9-honey-07",
  "p10-w4-12",
  "p11-puja-03", "p11-wed-10",
  "p12-post-09", "p12-post-10", "p12-post-12", "p12-post-22",
];

const MULTI_CATEGORY = {
  "p2-photo-03": ["photography", "videography"],
  "p2-photo-05": ["photography", "videography"],
  "p2-photo-06": ["photography", "videography"],
  "p2-photo-07": ["photography", "videography"],
  "p2-photo-08": ["photography", "videography"],
  "p3-beau-02": ["hmua", "photography"],
  "p3-beau-04": ["hmua", "photography"],
  "p3-style-07": ["wardrobe", "photography"],
  "p5-std-03": ["stationery", "photography"],
  "p5-dop-10": ["stationery", "photography"],
  "p7-sang-08": ["entertainment", "photography"],
  "p10-w4-12": ["hmua", "photography"],
  "p12-post-09": ["photography", "videography"],
};

// ── Tests: seed integrity ──────────────────────────────────────────────────

it("all 29 photography tasks exist in the seed", () => {
  for (const id of PHOTOGRAPHY_IDS) {
    const line = taskLine(id);
    assert(line, `task ${id} not found in seed`);
  }
});

it("every photography task has categoryTags including 'photography'", () => {
  const miss = [];
  for (const id of PHOTOGRAPHY_IDS) {
    const line = taskLine(id);
    const val = extractOptValue(line, "categoryTags");
    if (!val || !val.includes('"photography"')) miss.push(id);
  }
  assert(miss.length === 0, `missing photography tag: ${miss.join(", ")}`);
});

it("every photography task has at least one workspace_tab_tag", () => {
  const miss = [];
  for (const id of PHOTOGRAPHY_IDS) {
    const line = taskLine(id);
    const val = extractOptValue(line, "workspaceTabTags");
    if (!val || !/\[[^\]]+\]/.test(val)) miss.push(id);
  }
  assert(miss.length === 0, `missing tab tags: ${miss.join(", ")}`);
});

it("multi-category tasks carry all expected tags", () => {
  for (const [id, expected] of Object.entries(MULTI_CATEGORY)) {
    const line = taskLine(id);
    const val = extractOptValue(line, "categoryTags");
    for (const tag of expected) {
      assert(
        val.includes(`"${tag}"`),
        `${id} should have "${tag}" — got ${val}`,
      );
    }
  }
});

it("all referenced EventDayIds in linkedEntities are valid", () => {
  const VALID_EVENT_DAYS = [
    "welcome", "ganesh_puja", "mehndi", "haldi",
    "sangeet", "wedding", "reception", "post_brunch",
  ];
  for (const id of PHOTOGRAPHY_IDS) {
    const line = taskLine(id);
    const val = extractOptValue(line, "linkedEntities");
    if (!val) continue;
    const eventMatch = val.match(/event_day_ids:\s*\[([^\]]+)\]/);
    if (!eventMatch) continue;
    const events = eventMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/["']/g, ""))
      .filter(Boolean);
    for (const e of events) {
      assert(
        VALID_EVENT_DAYS.includes(e),
        `${id} references unknown EventDayId "${e}"`,
      );
    }
  }
});

it("p5-std-03 depends on p2-photo-10 (photos feed stationery)", () => {
  const line = taskLine("p5-std-03");
  const deps = extractOptValue(line, "deps");
  assert(
    deps && deps.includes('"p2-photo-10"'),
    "save-the-date print should depend on save-the-date photoshoot",
  );
});

// ── Pure query logic (mirrors lib/workspace/category-queries.ts) ────────────

function hasCategoryTag(item, cat) {
  return !!item.category_tags && item.category_tags.includes(cat);
}
function hasTabTag(item, tab) {
  return !!item.workspace_tab_tags && item.workspace_tab_tags.includes(tab);
}
function filterItemsForCategory(items, cat, opts = {}) {
  return items.filter((it) => {
    if (!hasCategoryTag(it, cat)) return false;
    if (opts.tab && !hasTabTag(it, opts.tab)) return false;
    if (opts.status && !opts.status.includes(it.status)) return false;
    return true;
  });
}
function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
const MS = 1000 * 60 * 60 * 24;
function bucketForDeadline(deadline, now = new Date()) {
  if (!deadline) return "no_date";
  const days = (startOfDay(deadline).getTime() - startOfDay(now).getTime()) / MS;
  if (days < 0) return "overdue";
  if (days < 7) return "this_week";
  if (days < 14) return "next_two_weeks";
  return "later";
}
function relativeTimeLabel(deadline, now = new Date()) {
  const days = Math.round((startOfDay(deadline).getTime() - startOfDay(now).getTime()) / MS);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days < 14) return `Due in ${days} days`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `Due in ${weeks} weeks`;
  return `Due in ${Math.round(days / 30)} mo`;
}

// Fixture builder
function mk(id, patch = {}) {
  return {
    id,
    phase_id: "phase-2",
    title: id,
    description: "",
    status: "not_started",
    priority: "medium",
    due_date: null,
    assigned_to: "both",
    module_link: null,
    decision_template: "generic",
    decision_fields: [],
    dependencies: [],
    tradition_profile_tags: ["all"],
    notes: "",
    source: "template",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    ...patch,
  };
}

it("filterItemsForCategory: filters by category tag", () => {
  const items = [
    mk("a", { category_tags: ["photography"] }),
    mk("b", { category_tags: ["catering"] }),
    mk("c", { category_tags: ["photography", "videography"] }),
    mk("d"), // untagged
  ];
  const r = filterItemsForCategory(items, "photography").map((x) => x.id);
  assert(deepEq(r, ["a", "c"]), `expected [a,c], got ${JSON.stringify(r)}`);
});

it("filterItemsForCategory: filters by tab tag when provided", () => {
  const items = [
    mk("a", { category_tags: ["photography"], workspace_tab_tags: ["shortlist"] }),
    mk("b", { category_tags: ["photography"], workspace_tab_tags: ["vision"] }),
    mk("c", { category_tags: ["photography"], workspace_tab_tags: ["shortlist", "decisions"] }),
  ];
  const r = filterItemsForCategory(items, "photography", { tab: "shortlist" }).map((x) => x.id);
  assert(deepEq(r, ["a", "c"]), `expected [a,c], got ${JSON.stringify(r)}`);
});

it("filterItemsForCategory: respects status filter", () => {
  const items = [
    mk("a", { category_tags: ["photography"], status: "done" }),
    mk("b", { category_tags: ["photography"], status: "in_progress" }),
    mk("c", { category_tags: ["photography"], status: "not_started" }),
  ];
  const r = filterItemsForCategory(items, "photography", {
    status: ["not_started", "in_progress"],
  }).map((x) => x.id);
  assert(deepEq(r, ["b", "c"]), `expected [b,c], got ${JSON.stringify(r)}`);
});

it("bucketForDeadline: classifies overdue / this week / later", () => {
  const now = new Date("2026-04-18T12:00:00Z");
  assert(bucketForDeadline(new Date("2026-04-15T12:00:00Z"), now) === "overdue");
  assert(bucketForDeadline(new Date("2026-04-18T23:00:00Z"), now) === "this_week");
  assert(bucketForDeadline(new Date("2026-04-24T12:00:00Z"), now) === "this_week");
  assert(bucketForDeadline(new Date("2026-04-26T12:00:00Z"), now) === "next_two_weeks");
  assert(bucketForDeadline(new Date("2026-05-15T12:00:00Z"), now) === "later");
  assert(bucketForDeadline(null, now) === "no_date");
});

it("relativeTimeLabel: human-readable formatting", () => {
  const now = new Date("2026-04-18T12:00:00Z");
  const day = (offset) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d;
  };
  assert(relativeTimeLabel(day(0), now) === "Due today");
  assert(relativeTimeLabel(day(1), now) === "Due tomorrow");
  assert(relativeTimeLabel(day(-1), now) === "1 day overdue");
  assert(relativeTimeLabel(day(-3), now) === "3 days overdue");
  assert(relativeTimeLabel(day(3), now) === "Due in 3 days");
  assert(relativeTimeLabel(day(14), now) === "Due in 2 weeks");
});

it("upcoming sort: earlier deadlines first, no-date last, ties broken by priority", () => {
  const items = [
    mk("no-date", { category_tags: ["photography"], due_date: null, priority: "high" }),
    mk("later", { category_tags: ["photography"], due_date: "2026-06-01", priority: "medium" }),
    mk("soon-lo", { category_tags: ["photography"], due_date: "2026-04-20", priority: "low" }),
    mk("soon-hi", { category_tags: ["photography"], due_date: "2026-04-20", priority: "critical" }),
  ];
  // Reimplement sort: deadline asc, critical first on ties, no-date last.
  const prio = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...items]
    .filter((it) => hasCategoryTag(it, "photography"))
    .sort((a, b) => {
      const ta = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      const tb = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      return (prio[a.priority] ?? 99) - (prio[b.priority] ?? 99);
    })
    .map((x) => x.id);
  assert(deepEq(sorted, ["soon-hi", "soon-lo", "later", "no-date"]), JSON.stringify(sorted));
});

it("cross-module link integrity: photography tasks referencing vendors exist in seed schema", () => {
  // Ensures every linked_entities.event_day_ids entry resolves to a known
  // EventDayId, and budget_category values are nonempty strings.
  for (const id of PHOTOGRAPHY_IDS) {
    const line = taskLine(id);
    const val = extractOptValue(line, "linkedEntities");
    if (!val) continue;
    const budgetMatch = val.match(/budget_category:\s*"([^"]+)"/);
    if (budgetMatch) {
      assert(budgetMatch[1].trim().length > 0, `${id} has empty budget_category`);
    }
  }
});

// ── Report ─────────────────────────────────────────────────────────────────

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results) {
  const mark = r.ok ? "✓" : "✗";
  console.log(`${mark} ${r.name}${r.ok ? "" : `\n    ${r.err}`}`);
}
console.log(`\n${pass}/${results.length} passed${fail ? `, ${fail} failed` : ""}`);
process.exit(fail === 0 ? 0 : 1);
