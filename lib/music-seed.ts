// ── Music & Entertainment seed ────────────────────────────────────────────
// Plausible slate of candidates so the Shortlist & Contract board renders
// real content from first paint. Covers every vendor type the tab knows
// about, with a mix of pipeline states so the sections (In consideration
// / In debate / Passed / Booked) all have something to show.
//
// Reactions and comments seed a few threads so the board feels lived-in.

import type {
  MusicCandidate,
  MusicCandidateLean,
  MusicComment,
  MusicContract,
  MusicPresenceSignal,
  MusicReaction,
} from "@/types/music";
import { ARJUN_ID, PRIYA_ID, URVASHI_ID } from "@/lib/music/parties";

export const DEMO_MUSIC_WEDDING_ID = "wedding-demo";

const now = new Date().toISOString();
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

// ── Vendor shorthand ─────────────────────────────────────────────────────

const DJ_PRANAV = "dj_pranav";
const DJ_SURAJ = "dj_suraj";
const BAND_WILDFIRE = "band_wildfire";
const DHOL_MUMBAI = "dhol_mumbai";
const CLASSICAL_AARYAN = "classical_aaryan_trio";
const CHOREOGRAPHER_NEHA = "choreographer_neha";
const MC_RAJIV = "mc_rajiv";
const DJ_KARAN = "dj_karan_passed";
const DJ_MEERA = "dj_meera_parked";

export const MUSIC_VENDOR_NAMES: Record<string, string> = {
  [DJ_PRANAV]: "DJ Pranav",
  [DJ_SURAJ]: "DJ Suraj",
  [BAND_WILDFIRE]: "Wildfire (live band)",
  [DHOL_MUMBAI]: "Mumbai Dhol Ensemble",
  [CLASSICAL_AARYAN]: "Aaryan Classical Trio",
  [CHOREOGRAPHER_NEHA]: "Neha Kapoor Choreography",
  [MC_RAJIV]: "Rajiv Menon (MC)",
  [DJ_KARAN]: "DJ Karan",
  [DJ_MEERA]: "DJ Meera",
};

// ── Candidates ───────────────────────────────────────────────────────────

export const SEED_MUSIC_CANDIDATES: MusicCandidate[] = [
  {
    id: "cand-dj-pranav",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "dj",
    name: "DJ Pranav",
    descriptor: "Mumbai wedding DJ — Bollywood, house, Punjabi hybrid sets",
    rate_low: 180000,
    rate_high: 240000,
    currency: "INR",
    sample_urls: [
      "https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmNBRM",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://www.instagram.com/p/ABC123/",
    ],
    events: ["sangeet", "reception"],
    status: "proposal_received",
    pending_action: {
      owner: ARJUN_ID,
      description: "Listen to the sangeet sample mix",
    },
    vendor_id: DJ_PRANAV,
    suggested_by: URVASHI_ID,
    created_at: daysAgo(12),
    updated_at: hoursAgo(6),
  },
  {
    id: "cand-dj-suraj",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "dj",
    name: "DJ Suraj",
    descriptor: "Delhi-based — known for progressive house + desi fusion",
    rate_low: 220000,
    rate_high: 260000,
    currency: "INR",
    sample_urls: [
      "https://soundcloud.com/example/desi-fusion-mix",
      "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    ],
    events: ["sangeet", "reception"],
    status: "in_debate",
    pending_action: {
      owner: PRIYA_ID,
      description: "Decide between Pranav vs Suraj for reception",
    },
    vendor_id: DJ_SURAJ,
    suggested_by: PRIYA_ID,
    created_at: daysAgo(9),
    updated_at: hoursAgo(14),
  },
  {
    id: "cand-band-wildfire",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "band",
    name: "Wildfire",
    descriptor: "8-piece — cocktail-hour classics, Hindi retro, light jazz",
    rate_low: 320000,
    rate_high: 380000,
    currency: "INR",
    sample_urls: [
      "https://www.youtube.com/watch?v=JGwWNGJdvx8",
      "https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3",
    ],
    events: ["reception"],
    status: "waiting_vendor",
    pending_action: {
      owner: "wildfire_vendor",
      description: "Send reception-night availability + rate for 5 hours",
    },
    vendor_id: BAND_WILDFIRE,
    suggested_by: URVASHI_ID,
    created_at: daysAgo(5),
    updated_at: daysAgo(2),
  },
  {
    id: "cand-dhol-mumbai",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "dhol",
    name: "Mumbai Dhol Ensemble",
    descriptor: "6 dholis + 2 shehnai — baraat, sangeet entrance",
    rate_low: 75000,
    rate_high: 90000,
    currency: "INR",
    sample_urls: [
      "https://www.instagram.com/reel/DEF456/",
      "https://www.youtube.com/watch?v=VYOjWnS4cMY",
    ],
    events: ["sangeet", "ceremony_lunch"],
    status: "booked",
    vendor_id: DHOL_MUMBAI,
    suggested_by: URVASHI_ID,
    created_at: daysAgo(21),
    updated_at: daysAgo(3),
  },
  {
    id: "cand-classical-aaryan",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "classical_singers",
    name: "Aaryan Classical Trio",
    descriptor: "Hindustani vocal + tabla + harmonium — mandap & ceremony",
    rate_low: 120000,
    rate_high: 140000,
    currency: "INR",
    sample_urls: [
      "https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P",
      "https://www.youtube.com/watch?v=Xq4H3SJLQ-0",
    ],
    events: ["ceremony_lunch"],
    status: "signed",
    vendor_id: CLASSICAL_AARYAN,
    suggested_by: ARJUN_ID,
    created_at: daysAgo(34),
    updated_at: daysAgo(4),
  },
  {
    id: "cand-choreographer-neha",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "choreographer",
    name: "Neha Kapoor Choreography",
    descriptor: "Sangeet sequences for family — 6 routines, 8 rehearsals",
    rate_low: 90000,
    rate_high: 110000,
    currency: "INR",
    sample_urls: [
      "https://www.instagram.com/reel/GHI789/",
      "https://www.youtube.com/watch?v=Jp-gN_vLKHg",
    ],
    events: ["sangeet"],
    status: "contract_sent",
    pending_action: {
      owner: CHOREOGRAPHER_NEHA,
      description: "Return countersigned contract",
    },
    vendor_id: CHOREOGRAPHER_NEHA,
    suggested_by: PRIYA_ID,
    created_at: daysAgo(18),
    updated_at: daysAgo(1),
  },
  {
    id: "cand-mc-rajiv",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "mc",
    name: "Rajiv Menon",
    descriptor: "Bilingual (Hindi/English) — reception MC + sangeet host",
    rate_low: 45000,
    rate_high: 55000,
    currency: "INR",
    sample_urls: ["https://www.youtube.com/watch?v=aJOTlE1K90k"],
    events: ["sangeet", "reception"],
    status: "draft",
    pending_action: {
      owner: URVASHI_ID,
      description: "Request availability + sample of reception intro",
    },
    vendor_id: MC_RAJIV,
    suggested_by: URVASHI_ID,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
  },
  {
    id: "cand-dj-karan-passed",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "dj",
    name: "DJ Karan",
    descriptor: "Gurgaon — club circuit, heavy EDM leaning",
    rate_low: 210000,
    rate_high: 260000,
    currency: "INR",
    sample_urls: ["https://soundcloud.com/example/karan-set"],
    events: ["sangeet"],
    status: "passed",
    passed_reason: "Too EDM-forward — not a fit for the family sangeet vibe.",
    vendor_id: DJ_KARAN,
    suggested_by: URVASHI_ID,
    created_at: daysAgo(20),
    updated_at: daysAgo(11),
  },
  {
    id: "cand-dj-meera-parked",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    vendor_type: "dj",
    name: "DJ Meera",
    descriptor: "Bengaluru-based — refined taste, subtle sets",
    rate_low: 280000,
    rate_high: 320000,
    currency: "INR",
    sample_urls: ["https://open.spotify.com/playlist/2fmTTbBkXi8pewbUvG3CeZ"],
    events: ["reception"],
    status: "parked",
    passed_reason:
      "Out of band — revisit if reception budget opens up after venue deposit.",
    vendor_id: DJ_MEERA,
    suggested_by: PRIYA_ID,
    created_at: daysAgo(25),
    updated_at: daysAgo(14),
  },
];

// ── Leans (per-party) ────────────────────────────────────────────────────

export const SEED_MUSIC_LEANS: MusicCandidateLean[] = [
  // DJ Pranav — couple on board, Urvashi keen
  { id: "ml-1", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dj-pranav", party_id: PRIYA_ID, lean: "love", note: "Sangeet mix hit exactly the tone I wanted.", updated_at: hoursAgo(14) },
  { id: "ml-2", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dj-pranav", party_id: ARJUN_ID, lean: "idle", updated_at: daysAgo(3) },
  { id: "ml-3", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dj-pranav", party_id: URVASHI_ID, lean: "yes", note: "Reliable on setup day, my top pick.", updated_at: hoursAgo(6) },

  // DJ Suraj — the debate
  { id: "ml-4", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dj-suraj", party_id: PRIYA_ID, lean: "yes", note: "Progressive house energy is the right call for reception.", updated_at: hoursAgo(30) },
  { id: "ml-5", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dj-suraj", party_id: ARJUN_ID, lean: "no", note: "Too clubby — family won't stay on the floor past midnight.", updated_at: hoursAgo(22) },
  { id: "ml-6", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dj-suraj", party_id: URVASHI_ID, lean: "unsure", note: "Talent is real. Fit question is real.", updated_at: hoursAgo(20) },

  // Band Wildfire
  { id: "ml-7", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-band-wildfire", party_id: PRIYA_ID, lean: "yes", updated_at: daysAgo(2) },
  { id: "ml-8", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-band-wildfire", party_id: ARJUN_ID, lean: "love", note: "Cocktail hour is made by a real band — let's do this.", updated_at: daysAgo(1) },
  { id: "ml-9", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-band-wildfire", party_id: URVASHI_ID, lean: "yes", updated_at: daysAgo(2) },

  // Dhol Mumbai — booked
  { id: "ml-10", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dhol-mumbai", party_id: PRIYA_ID, lean: "love", updated_at: daysAgo(6) },
  { id: "ml-11", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dhol-mumbai", party_id: ARJUN_ID, lean: "love", updated_at: daysAgo(6) },
  { id: "ml-12", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-dhol-mumbai", party_id: URVASHI_ID, lean: "yes", updated_at: daysAgo(6) },

  // Aaryan Classical Trio — signed
  { id: "ml-13", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-classical-aaryan", party_id: PRIYA_ID, lean: "yes", updated_at: daysAgo(20) },
  { id: "ml-14", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-classical-aaryan", party_id: ARJUN_ID, lean: "love", note: "Dad will cry when they start.", updated_at: daysAgo(20) },
  { id: "ml-15", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-classical-aaryan", party_id: URVASHI_ID, lean: "yes", updated_at: daysAgo(20) },

  // Neha Kapoor — contract sent
  { id: "ml-16", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-choreographer-neha", party_id: PRIYA_ID, lean: "love", updated_at: daysAgo(5) },
  { id: "ml-17", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-choreographer-neha", party_id: ARJUN_ID, lean: "yes", updated_at: daysAgo(5) },
  { id: "ml-18", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-choreographer-neha", party_id: URVASHI_ID, lean: "yes", updated_at: daysAgo(5) },

  // MC Rajiv
  { id: "ml-19", wedding_id: DEMO_MUSIC_WEDDING_ID, candidate_id: "cand-mc-rajiv", party_id: URVASHI_ID, lean: "unsure", note: "Voice is great. Unsure he reads the room for an Indian-American crowd.", updated_at: daysAgo(3) },
];

// ── Reactions (on comments / references) ─────────────────────────────────
export const SEED_MUSIC_REACTIONS: MusicReaction[] = [];

// ── Comments ─────────────────────────────────────────────────────────────

export const SEED_MUSIC_COMMENTS: MusicComment[] = [
  {
    id: "mc-1",
    entity_id: "cand-dj-suraj",
    entity_kind: "candidate",
    party_id: ARJUN_ID,
    body: "Genuinely worried about the tempo — listen to the 2nd sample at 22:00 in. That's midnight-at-a-club, not midnight-at-a-sangeet.",
    reference_url: "https://soundcloud.com/example/desi-fusion-mix",
    created_at: hoursAgo(22),
  },
  {
    id: "mc-2",
    entity_id: "cand-dj-suraj",
    entity_kind: "candidate",
    party_id: PRIYA_ID,
    parent_id: "mc-1",
    body: "Fair — but Pranav's sangeet mix is almost *too* safe. We need somebody who can push the room. Can we ask Suraj for a second mix tuned for family events?",
    created_at: hoursAgo(20),
  },
  {
    id: "mc-3",
    entity_id: "cand-dj-suraj",
    entity_kind: "candidate",
    party_id: URVASHI_ID,
    parent_id: "mc-1",
    body: "I'll request a reference mix for an Indian-American wedding specifically. Will report back.",
    created_at: hoursAgo(18),
  },
  {
    id: "mc-4",
    entity_id: "cand-dj-pranav",
    entity_kind: "candidate",
    party_id: URVASHI_ID,
    body: "Proposal received — 2.4L all-in for sangeet + reception, includes backup DJ + lighting bar. Sending to group.",
    created_at: hoursAgo(6),
  },
];

// ── Contracts ────────────────────────────────────────────────────────────

export const SEED_MUSIC_CONTRACTS: MusicContract[] = [
  // Dhol Mumbai — booked, deposit paid
  {
    id: "mctr-dhol",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    candidate_id: "cand-dhol-mumbai",
    status: "signed_by_vendor",
    total_amount: 85000,
    currency: "INR",
    deposit_amount: 25500,
    deposit_paid: 25500,
    milestones: [
      { id: "m1", label: "Deposit (30%)", amount: 25500, due_date: daysAgo(2).slice(0, 10), paid_at: daysAgo(2) },
      { id: "m2", label: "Balance on event", amount: 59500, due_date: "2026-06-11" },
    ],
    pdf_url: "/docs/demo/dhol-mumbai-contract.pdf",
    sent_at: daysAgo(6),
    signed_by_vendor_at: daysAgo(3),
    created_at: daysAgo(8),
    updated_at: daysAgo(2),
  },
  // Aaryan Classical Trio — fully countersigned
  {
    id: "mctr-classical",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    candidate_id: "cand-classical-aaryan",
    status: "countersigned",
    total_amount: 130000,
    currency: "INR",
    deposit_amount: 39000,
    deposit_paid: 39000,
    milestones: [
      { id: "m1", label: "Deposit (30%)", amount: 39000, due_date: daysAgo(14).slice(0, 10), paid_at: daysAgo(14) },
      { id: "m2", label: "Mid-payment", amount: 39000, due_date: "2026-05-01" },
      { id: "m3", label: "Balance on event", amount: 52000, due_date: "2026-06-12" },
    ],
    pdf_url: "/docs/demo/aaryan-classical-contract.pdf",
    sent_at: daysAgo(16),
    signed_by_vendor_at: daysAgo(8),
    countersigned_at: daysAgo(4),
    created_at: daysAgo(18),
    updated_at: daysAgo(4),
  },
  // Neha Kapoor — contract_sent, unsigned
  {
    id: "mctr-neha",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    candidate_id: "cand-choreographer-neha",
    status: "sent",
    total_amount: 100000,
    currency: "INR",
    deposit_amount: 30000,
    deposit_paid: 0,
    milestones: [
      { id: "m1", label: "Deposit (30%)", amount: 30000, due_date: "2026-02-15" },
      { id: "m2", label: "Mid-rehearsal", amount: 30000, due_date: "2026-04-20" },
      { id: "m3", label: "Balance on event", amount: 40000, due_date: "2026-06-11" },
    ],
    pdf_url: "/docs/demo/neha-choreography-contract.pdf",
    sent_at: daysAgo(1),
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
  },
];

// ── Presence ─────────────────────────────────────────────────────────────

export const SEED_MUSIC_PRESENCE: MusicPresenceSignal[] = [
  { party_id: PRIYA_ID, last_seen_at: hoursAgo(2), last_action: "reacted to DJ Suraj" },
  { party_id: ARJUN_ID, last_seen_at: hoursAgo(22), last_action: "replied on DJ Suraj" },
  { party_id: URVASHI_ID, last_seen_at: now, last_action: "online now" },
  { party_id: DJ_PRANAV, last_seen_at: hoursAgo(6), last_action: "sent proposal" },
  { party_id: CHOREOGRAPHER_NEHA, last_seen_at: daysAgo(1), last_action: "received contract" },
];
