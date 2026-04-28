// Tests: shared-state invariants between the workspace UpcomingTasksPanel
// and the /checklist page.
//
// The panel MUST read the same ChecklistItem object as /checklist — no copy.
// We can't load Zustand + React in a plain .mjs, so we model the store
// invariants here against hand-built fixtures using the same update shape
// the store uses (pure reducers) and confirm:
//   1. setItemStatus("id", "done") → the item appears as done wherever it's
//      read from, including category-scoped selectors.
//   2. snoozeItem shifts due_date forward N days; selectors re-bucket.
//   3. Toggling status away from "done" → the task reappears in upcoming.
//
// Run: node scripts/test/checklist-workspace-sync.mjs

const results = [];
function it(name, fn) {
  try { fn(); results.push({ name, ok: true }); }
  catch (e) { results.push({ name, ok: false, err: e.message ?? String(e) }); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// ── Pure reducers mirrored from stores/checklist-store.ts ─────────────────

function setItemStatus(items, id, status) {
  return items.map((it) =>
    it.id === id ? { ...it, status, updated_at: "t" } : it,
  );
}
function snoozeItem(items, id, days, weddingDate) {
  const it = items.find((x) => x.id === id);
  if (!it) return items;
  const base = it.due_date ? new Date(it.due_date) : deriveAutoDeadline(it, weddingDate);
  if (!base) return items;
  const shifted = new Date(base);
  shifted.setDate(shifted.getDate() + days);
  const iso = shifted.toISOString().slice(0, 10);
  return items.map((x) => (x.id === id ? { ...x, due_date: iso, updated_at: "t" } : x));
}
function deriveAutoDeadline(item, weddingDate) {
  if (!weddingDate) return null;
  if (typeof item.daysBeforeWedding === "number") {
    const d = new Date(weddingDate);
    d.setDate(d.getDate() - item.daysBeforeWedding);
    return d;
  }
  return null;
}

// ── Selectors ─────────────────────────────────────────────────────────────
function filterForCategory(items, cat, opts = {}) {
  return items.filter((it) => {
    if (!(it.category_tags ?? []).includes(cat)) return false;
    if (opts.tab && !(it.workspace_tab_tags ?? []).includes(opts.tab)) return false;
    if (opts.status && !opts.status.includes(it.status)) return false;
    return true;
  });
}
function getUpcoming(items, cat) {
  return filterForCategory(items, cat)
    .filter((it) => it.status !== "done" && it.status !== "not_applicable");
}
function getProgress(items, cat) {
  const scoped = filterForCategory(items, cat);
  return { done: scoped.filter((x) => x.status === "done").length, total: scoped.length };
}

// ── Fixtures ──────────────────────────────────────────────────────────────
function mk(id, patch = {}) {
  return {
    id, phase_id: "phase-2", title: id, description: "", status: "not_started",
    priority: "medium", due_date: null, assigned_to: "both", module_link: null,
    decision_template: "generic", decision_fields: [], dependencies: [],
    tradition_profile_tags: ["all"], notes: "", source: "template",
    created_at: "t", updated_at: "t",
    ...patch,
  };
}
const photo = (id, p = {}) => mk(id, { category_tags: ["photography"], ...p });

// ── Tests ──────────────────────────────────────────────────────────────────

it("same items array powers /checklist and /workspace — no copy", () => {
  const items = [
    photo("a", { workspace_tab_tags: ["shortlist"] }),
    photo("b", { workspace_tab_tags: ["vision"] }),
    mk("x", { category_tags: ["catering"] }),
  ];
  // Reader 1: /checklist-style phase filter
  const phaseView = items.filter((i) => i.phase_id === "phase-2");
  // Reader 2: /workspace-style category filter
  const workspaceView = filterForCategory(items, "photography");
  // Both views should reference the SAME underlying objects.
  assert(phaseView[0] === items[0], "phaseView[0] is not the same ref as items[0]");
  assert(workspaceView[0] === items[0], "workspaceView[0] is not the same ref as items[0]");
});

it("setItemStatus(done) removes task from upcoming and bumps progress.done", () => {
  let items = [
    photo("a", { workspace_tab_tags: ["shortlist"] }),
    photo("b", { workspace_tab_tags: ["shortlist"] }),
  ];
  assert(getUpcoming(items, "photography").length === 2);
  assert(getProgress(items, "photography").done === 0);
  items = setItemStatus(items, "a", "done");
  const up = getUpcoming(items, "photography");
  const prog = getProgress(items, "photography");
  assert(up.length === 1 && up[0].id === "b", `expected [b], got ${up.map((x) => x.id)}`);
  assert(prog.done === 1 && prog.total === 2);
});

it("snoozeItem shifts due_date by N days (pre-existing override)", () => {
  let items = [photo("a", { due_date: "2026-04-20", workspace_tab_tags: ["shortlist"] })];
  items = snoozeItem(items, "a", 7, new Date("2026-12-12"));
  assert(items[0].due_date === "2026-04-27", `expected 2026-04-27 got ${items[0].due_date}`);
});

it("snoozeItem derives from auto-deadline when no override set", () => {
  let items = [photo("a", { daysBeforeWedding: 100, workspace_tab_tags: ["shortlist"] })];
  // Production store seeds wedding as `new Date(2026, 11, 12)` — local midnight.
  // UTC-midnight "2026-12-12" picks up a timezone-dependent day shift, so mirror
  // the production constructor to keep the test stable across time zones.
  const wedding = new Date(2026, 11, 12);
  const expected = new Date(wedding);
  expected.setDate(expected.getDate() - 100 + 7);
  const expectedIso = expected.toISOString().slice(0, 10);
  items = snoozeItem(items, "a", 7, wedding);
  assert(items[0].due_date === expectedIso, `got ${items[0].due_date}, expected ${expectedIso}`);
});

it("reopening a 'done' task re-adds it to upcoming", () => {
  let items = [photo("a", { status: "done", workspace_tab_tags: ["shortlist"] })];
  assert(getUpcoming(items, "photography").length === 0);
  items = setItemStatus(items, "a", "in_progress");
  assert(getUpcoming(items, "photography").length === 1);
});

it("tab filter is additive to category filter — tasks missing tab tag are hidden", () => {
  const items = [
    photo("a", { workspace_tab_tags: ["shortlist"] }),
    photo("b", { workspace_tab_tags: ["vision"] }),
    photo("c", {}), // no tab tags
  ];
  const shortlist = filterForCategory(items, "photography", { tab: "shortlist" });
  assert(shortlist.length === 1 && shortlist[0].id === "a");
});

it("multi-category task appears in both photography AND stationery queries", () => {
  const items = [
    mk("save-the-date", {
      category_tags: ["photography", "stationery"],
      workspace_tab_tags: ["plan"],
    }),
  ];
  assert(filterForCategory(items, "photography").length === 1);
  assert(filterForCategory(items, "stationery").length === 1);
});

it("sidebar progress ratio reflects real checklist state, not hardcoded", () => {
  const items = [
    photo("a", { status: "done" }),
    photo("b", { status: "done" }),
    photo("c", { status: "in_progress" }),
    photo("d"),
    photo("e"),
  ];
  const { done, total } = getProgress(items, "photography");
  assert(done === 2 && total === 5, `expected 2/5, got ${done}/${total}`);
});

// ── Report ────────────────────────────────────────────────────────────────

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results) {
  const mark = r.ok ? "✓" : "✗";
  console.log(`${mark} ${r.name}${r.ok ? "" : `\n    ${r.err}`}`);
}
console.log(`\n${pass}/${results.length} passed${fail ? `, ${fail} failed` : ""}`);
process.exit(fail === 0 ? 0 : 1);
