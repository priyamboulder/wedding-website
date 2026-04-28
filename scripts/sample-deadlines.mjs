// Standalone replica of the classifier in lib/checklist-seed.ts.
// Used to preview deadline assignments before committing to all 575 tasks.
// Run: node scripts/sample-deadlines.mjs

const PHASE_WINDOWS = {
  "phase-0": [365, 270],
  "phase-1": [300, 180],
  "phase-2": [270, 150],
  "phase-3": [180, 60],
  "phase-4": [210, 90],
  "phase-5": [150, 45],
  "phase-6": [120, 30],
  "phase-7": [90, 14],
  "phase-8": [90, 30],
  "phase-9": [240, 180],
  "phase-10": [30, 7],
  "phase-12": [-1, -30],
};

const EARLY_VERBS = new Set([
  "research","define","decide","discuss","plan","design","set","identify",
  "agree","establish","consult","receive","document","draft","build",
  "develop","start","create","arrange","order","book","secure","hire",
  "sign","select","choose","register","open","shop","request","negotiate",
  "reserve","allocate","brainstorm","draw","outline","compile","explore",
  "schedule","host","formal","align",
]);
const LATE_VERBS = new Set([
  "confirm","finalize","finalise","review","check","test","approve",
  "print","distribute","send","lock","verify","ensure","collect","pay",
  "tip","follow","reconcile","wrap","close","preserve","return","complete",
  "track","remind","rehearse","trial",
]);

function classifyVerb(title) {
  const first = title.trim().split(/\s+/)[0]?.toLowerCase().replace(/[:,]/g, "");
  if (!first) return "mid";
  if (EARLY_VERBS.has(first)) return "early";
  if (LATE_VERBS.has(first)) return "late";
  return "mid";
}

function defaultDays(phaseId, title, idx, total) {
  if (phaseId === "phase-11") return undefined;
  const win = PHASE_WINDOWS[phaseId];
  if (!win) return undefined;
  const [early, late] = win;
  const span = early - late;
  const bucket = classifyVerb(title);
  let bs, be;
  if (bucket === "early") { bs = early;             be = early - span / 3; }
  else if (bucket === "mid") { bs = early - span/3; be = early - 2*span/3; }
  else { bs = early - 2*span/3;                     be = late; }
  const t = total <= 1 ? 0 : idx / (total - 1);
  return { bucket, value: Math.round(bs - t * (bs - be)) };
}

// Sample tasks pulled directly from checklist-seed.ts (mix of phases + verbs).
const samples = [
  // Phase 0 — Foundation
  { id: "p0-couple-01", phaseId: "phase-0", title: "Discuss overall wedding vision" },
  { id: "p0-budget-01", phaseId: "phase-0", title: "Set total budget ceiling" },

  // Phase 2 — Core Bookings
  { id: "p2-venue-16", phaseId: "phase-2", title: "Sign contracts and pay deposits" },
  { id: "p2-photo-04", phaseId: "phase-2", title: "Book photographer" },

  // Phase 3 — Attire & Styling (largest phase)
  { id: "p3-bwar-04", phaseId: "phase-3", title: "Choose wedding lehenga" },
  { id: "p3-beau-02", phaseId: "phase-3", title: "Makeup trial with MUA" },

  // Phase 7 — Ceremony Specifics
  { id: "p7-x", phaseId: "phase-7", title: "Confirm muhurat times with priest" },

  // Phase 10 — Final Month
  { id: "p10-y", phaseId: "phase-10", title: "Final dress fitting" },

  // Phase 12 — Post-Wedding
  { id: "p12-post-06", phaseId: "phase-12", title: "Send thank you notes" },
];

// We don't know real bucket totals here (they require all 575 items),
// but for spot-check purposes, assume each sample is the only item in its
// (phase, bucket) — ie. it lands at bucketStart. Real values will spread.
console.log("Sample deadlines (lands at bucket-start; real values spread within bucket):");
console.log("─".repeat(90));
const wedding = new Date(2026, 11, 12); // Dec 12, 2026
for (const s of samples) {
  const r = defaultDays(s.phaseId, s.title, 0, 1);
  if (!r) { console.log(`${s.id}\t(no offset)`); continue; }
  const d = new Date(wedding);
  d.setDate(d.getDate() - r.value);
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  console.log(`${s.id.padEnd(20)} | ${s.phaseId} | ${r.bucket.padEnd(5)} | ${String(r.value).padStart(4)}d before | ${dateStr}  | "${s.title}"`);
}

console.log("\nEvent Days (p11) examples — wedding date Dec 12, 2026:");
console.log("─".repeat(90));
const EVENT_DAYS = {
  welcome:     { daysOffset: -3, mainHour: 19 },
  ganesh_puja: { daysOffset: -2, mainHour: 9  },
  mehndi:      { daysOffset: -2, mainHour: 11 },
  haldi:       { daysOffset: -1, mainHour: 10 },
  sangeet:     { daysOffset: -1, mainHour: 19 },
  wedding:     { daysOffset:  0, mainHour: 11 },
  reception:   { daysOffset:  0, mainHour: 19 },
  post_brunch: { daysOffset:  1, mainHour: 11 },
};
const eventSamples = [
  { id: "p11-welcome-01", title: "Welcome desk setup at hotel",  eventDay: "welcome",  hoursBefore: 4 },
  { id: "p11-mehndi-01",  title: "Bride's mehndi session",        eventDay: "mehndi",   hoursBefore: 3 },
  { id: "p11-wed-05",     title: "Baraat assembly",               eventDay: "wedding",  hoursBefore: 1.5 },
  { id: "p11-recep-08",   title: "Late-night send-off",           eventDay: "reception", hoursBefore: -5 },
];
for (const s of eventSamples) {
  const info = EVENT_DAYS[s.eventDay];
  const d = new Date(wedding);
  d.setDate(d.getDate() + info.daysOffset);
  d.setHours(info.mainHour, 0, 0, 0);
  d.setTime(d.getTime() - s.hoursBefore * 60 * 60 * 1000);
  const dateStr = d.toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
  console.log(`${s.id.padEnd(20)} | eventDay=${s.eventDay.padEnd(11)} | hoursBefore=${String(s.hoursBefore).padStart(4)} | ${dateStr}  | "${s.title}"`);
}
