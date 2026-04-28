// ── Music Soundscape seed ─────────────────────────────────────────────────
// Pre-fills the Event Soundscapes tab so it never opens to a blank canvas.
// Five canonical events get an opening/build/peak/wind-down arc plus a
// pre-curated "must play" set of culturally-expected moments. Couples can
// edit, add, delete — the seed is just a draft to react to.

import type {
  EnergyPoint,
  GenreTaste,
  LiveDjMix,
  NonNegotiableMoment,
  PlaylistTrack,
  SangeetStyle,
  Soundscape,
} from "@/types/music";
import { ARJUN_ID, PRIYA_ID, URVASHI_ID } from "@/lib/music/parties";

export const DEMO_MUSIC_WEDDING_ID = "wedding-demo";

const t0 = "2026-04-01T00:00:00.000Z";

// ── Vibe defaults (overridden by quiz when run) ──────────────────────────

export const SEED_ENERGY_ARC: EnergyPoint[] = [
  { event: "haldi", energy: 30 },       // intimate
  { event: "mehendi", energy: 55 },     // festive
  { event: "sangeet", energy: 90 },     // party
  { event: "ceremony", energy: 25 },    // reverent
  { event: "reception", energy: 80 },   // builds to wild
];

export const SEED_SANGEET_STYLE: SangeetStyle = "sangeet-production";
export const SEED_LIVE_DJ_MIX: LiveDjMix = "hybrid";
export const SEED_GENRE_MIX: GenreTaste[] = [
  "classic-bollywood",
  "modern-bollywood",
  "sufi-qawwali",
  "western-pop",
];
export const SEED_NON_NEGOTIABLES: NonNegotiableMoment[] = [
  "dhol-baraat",
  "couple-first-dance",
  "parent-dances",
  "grand-entrance",
  "vidaai-song",
  "late-night-bollywood",
];

// ── Track helper ──────────────────────────────────────────────────────────

let trackCounter = 0;
const track = (
  partial: Omit<PlaylistTrack, "id" | "added_at">,
): PlaylistTrack => ({
  ...partial,
  id: `seed-trk-${++trackCounter}`,
  added_at: t0,
});

// ── Per-event soundscapes ─────────────────────────────────────────────────

export const SEED_SOUNDSCAPES: Soundscape[] = [
  {
    id: "ss-haldi",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "haldi",
    opening_mood: "Acoustic dholki + folk songs as families gather in the courtyard",
    build_mood: "Bride's friends sing traditional ladies' sangeet songs",
    peak_mood: "Whole family clapping along to a Punjabi haldi anthem",
    wind_down_mood: "Soft instrumental as the haldi paste is being washed off",
    cultural_requirements: [
      "Traditional dholki / dholak rhythm during haldi paste application",
      "Folk haldi songs (\"Mehndi Hai Rachne Wali\", \"Banno Teri Akhiyan\")",
    ],
    playlists: {
      must: {
        kind: "must",
        tracks: [
          track({
            title: "Mehndi Hai Rachne Wali",
            artist: "Alka Yagnik",
            moment: "Haldi paste application",
            added_by: PRIYA_ID,
          }),
          track({
            title: "Banno Teri Akhiyan",
            artist: "Folk traditional",
            moment: "Family chorus",
            added_by: URVASHI_ID,
          }),
        ],
      },
      request: {
        kind: "request",
        tracks: [
          track({
            title: "Madhaniya",
            artist: "Asees Kaur",
            moment: "Bride's entrance",
            added_by: PRIYA_ID,
          }),
        ],
      },
      dnp: { kind: "dnp", tracks: [] },
    },
    updated_at: t0,
  },
  {
    id: "ss-mehendi",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "mehendi",
    opening_mood: "Sufi instrumental as guests settle into the lawn",
    build_mood: "Bollywood retro hits — couple's friends start swaying",
    peak_mood: "Punjabi giddha medley, the aunties are up dancing",
    wind_down_mood: "Live qawwali — sun setting, henna drying",
    cultural_requirements: [
      "Live or recorded qawwali toward the wind-down moment",
      "Mehendi-themed Bollywood classics during application",
    ],
    playlists: {
      must: {
        kind: "must",
        tracks: [
          track({
            title: "Mehendi Laga Ke Rakhna",
            artist: "Lata Mangeshkar / Udit Narayan",
            moment: "Bride's mehendi start",
            added_by: PRIYA_ID,
          }),
          track({
            title: "Kun Faya Kun",
            artist: "A.R. Rahman",
            moment: "Live qawwali wind-down",
            added_by: ARJUN_ID,
            url: "https://open.spotify.com/track/7Heg3uwkOpUYGfWUJYWAf2",
          }),
        ],
      },
      request: {
        kind: "request",
        tracks: [
          track({
            title: "Saiyaara",
            artist: "Mohit Chauhan",
            moment: "Soft afternoon",
            added_by: PRIYA_ID,
          }),
        ],
      },
      dnp: { kind: "dnp", tracks: [] },
    },
    updated_at: t0,
  },
  {
    id: "ss-sangeet",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "sangeet",
    opening_mood: "Cocktail hour: lounge Bollywood remixes as guests arrive",
    build_mood: "Emcee opens, family performances stage by stage",
    peak_mood: "Punjabi MC + bhangra — open dance floor, bride and groom in the mosh",
    wind_down_mood: "Slow couple's-song slow dance, then last-call Punjabi",
    cultural_requirements: [
      "Performance-track music edited and cued (handled in Sangeet Planner)",
      "Bride + groom's first dance song",
      "Late-night Bollywood and bhangra block",
    ],
    playlists: {
      must: {
        kind: "must",
        tracks: [
          track({
            title: "Mundian To Bach Ke",
            artist: "Panjabi MC",
            moment: "Open dance floor opener",
            added_by: ARJUN_ID,
          }),
          track({
            title: "London Thumakda",
            artist: "Labh Janjua",
            moment: "Family group dance",
            added_by: PRIYA_ID,
          }),
          track({
            title: "Tujh Mein Rab Dikhta Hai",
            artist: "Roop Kumar Rathod",
            moment: "Couple's slow dance",
            added_by: PRIYA_ID,
          }),
        ],
      },
      request: {
        kind: "request",
        tracks: [
          track({
            title: "Kala Chashma",
            artist: "Badshah",
            moment: "Anytime — high energy",
            added_by: ARJUN_ID,
          }),
        ],
      },
      dnp: {
        kind: "dnp",
        tracks: [
          track({
            title: "Macarena",
            artist: "Los del Río",
            notes: "Hard no — Priya's request",
            added_by: PRIYA_ID,
          }),
        ],
      },
    },
    updated_at: t0,
  },
  {
    id: "ss-ceremony",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "ceremony",
    opening_mood: "Sitar + tabla as guests are seated in the mandap",
    build_mood: "Live shehnai as the baraat approaches",
    peak_mood: "Vedic mantras during pheras (priest-led, no recorded music)",
    wind_down_mood: "Vidaai song — emotional, slow Bollywood",
    cultural_requirements: [
      "Dhol + nagada for baraat procession",
      "Shehnai as bride enters mandap",
      "Vedic mantras (delegated to priest — no recorded music during pheras)",
      "Vidaai song at farewell",
    ],
    playlists: {
      must: {
        kind: "must",
        tracks: [
          track({
            title: "Aaj Mere Yaar Ki Shaadi Hai",
            artist: "Mohammed Aziz",
            moment: "Baraat dance",
            added_by: ARJUN_ID,
          }),
          track({
            title: "Babul Ki Duayein",
            artist: "Mohammed Rafi",
            moment: "Vidaai farewell",
            added_by: PRIYA_ID,
          }),
        ],
      },
      request: { kind: "request", tracks: [] },
      dnp: {
        kind: "dnp",
        tracks: [
          track({
            title: "Anything during pheras",
            notes: "Mantras only — no playback",
            added_by: URVASHI_ID,
          }),
        ],
      },
    },
    updated_at: t0,
  },
  {
    id: "ss-reception",
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "reception",
    opening_mood: "Sophisticated Bollywood lounge as guests arrive in formals",
    build_mood: "Couple's grand entrance, first dance, parent dances",
    peak_mood: "Open dance floor — Bollywood + Western mix builds to bhangra",
    wind_down_mood: "Couple's last song, sparkler send-off",
    cultural_requirements: [
      "Grand entrance song for the couple",
      "First dance + parent dances",
      "Cake-cutting moment with chosen song",
      "Last song before send-off",
    ],
    playlists: {
      must: {
        kind: "must",
        tracks: [
          track({
            title: "Dilbar Dilbar (entrance remix)",
            artist: "DJ Pranav edit",
            moment: "Grand entrance",
            added_by: PRIYA_ID,
          }),
          track({
            title: "Perfect",
            artist: "Ed Sheeran",
            moment: "First dance",
            added_by: PRIYA_ID,
          }),
          track({
            title: "Maa",
            artist: "Shankar Mahadevan",
            moment: "Mother-son dance",
            added_by: ARJUN_ID,
          }),
        ],
      },
      request: {
        kind: "request",
        tracks: [
          track({
            title: "September",
            artist: "Earth, Wind & Fire",
            moment: "Cross-cultural dance floor moment",
            added_by: ARJUN_ID,
          }),
        ],
      },
      dnp: {
        kind: "dnp",
        tracks: [
          track({
            title: "Cha Cha Slide",
            notes: "Please no line dances",
            added_by: PRIYA_ID,
          }),
        ],
      },
    },
    updated_at: t0,
  },
];
