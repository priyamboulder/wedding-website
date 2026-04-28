// ── Music Equipment & Technical seed ──────────────────────────────────────
// Seed specs for the four events that warrant detailed planning. Haldi is
// intentionally light — it usually doesn't get a full PA. The seed gives
// each event enough scaffolding that the tab body has something to render
// and edit on first paint.

import type { TechSpec } from "@/types/music";

export const DEMO_MUSIC_WEDDING_ID = "wedding-demo";

const t0 = "2026-04-01T00:00:00.000Z";

let counter = 0;
const id = (p: string) => `seed-${p}-${++counter}`;

export const SEED_TECH_SPECS: TechSpec[] = [
  {
    id: id("tech"),
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "haldi",
    speakers: [
      { id: id("spk"), placement: "Garden corner Bluetooth", kind: "fill" },
    ],
    mics: [],
    volume_levels: [
      { phase: "cocktails", level: 2, notes: "Soft — families talking" },
    ],
    lighting: { notes: "Daylight only — no rig needed" },
    stage: { notes: "No stage — paste application on low chowki" },
    power: { total_draw_estimate: "Single 15A circuit", generator_required: false },
    updated_at: t0,
  },
  {
    id: id("tech"),
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "mehendi",
    speakers: [
      { id: id("spk"), placement: "Lawn — main PA stage left", kind: "main_pa" },
      { id: id("spk"), placement: "Lawn — main PA stage right", kind: "main_pa" },
      { id: id("spk"), placement: "Bride mehendi corner fill", kind: "fill" },
    ],
    mics: [
      {
        id: id("mic"),
        kind: "wireless_handheld",
        count: 2,
        notes: "For emcee + family qawwali singer",
      },
    ],
    sound_check_at: "2026-04-26T14:00:00.000Z",
    sound_check_attendees: ["DJ Pranav", "Venue AV", "Urvashi"],
    volume_levels: [
      { phase: "cocktails", level: 2, notes: "Background sufi" },
      { phase: "party", level: 4, notes: "Punjabi giddha block" },
    ],
    lighting: {
      uplighting_color: "Marigold + tea light",
      dance_floor: "String lights overhead, no DMX",
      ceremony_lighting: "Candle aisle for evening qawwali",
    },
    stage: {
      stage_size: "8x6 ft riser for live qawwali singer",
      dance_floor_size: "20x20 ft (parquet)",
      dj_booth_placement: "Lawn west corner",
    },
    power: {
      total_draw_estimate: "60A single phase",
      generator_required: false,
      power_drop_locations: ["Stage stage-right", "Bar"],
    },
    backup_plan: "Indoor pivot to lobby if rain — same PA on castor flight cases.",
    updated_at: t0,
  },
  {
    id: id("tech"),
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "sangeet",
    speakers: [
      { id: id("spk"), placement: "Stage left main PA", kind: "main_pa" },
      { id: id("spk"), placement: "Stage right main PA", kind: "main_pa" },
      { id: id("spk"), placement: "Stage monitors x2 (performers)", kind: "monitor" },
      { id: id("spk"), placement: "Subwoofer center", kind: "subwoofer" },
      { id: id("spk"), placement: "Back-of-room delay speakers x2", kind: "delay" },
    ],
    mics: [
      {
        id: id("mic"),
        kind: "wireless_handheld",
        count: 6,
        notes: "Emcee + 2 brothers (skit) + speeches + 2 spares",
      },
      {
        id: id("mic"),
        kind: "lapel",
        count: 2,
        notes: "Hot for couple if they speak",
      },
      { id: id("mic"), kind: "headset", count: 2, notes: "Lead choreographer + emcee backup" },
    ],
    sound_check_at: "2026-04-27T15:00:00.000Z",
    sound_check_attendees: [
      "DJ Pranav",
      "MC Rajiv",
      "Choreographer Neha",
      "Venue AV",
      "Urvashi",
    ],
    volume_levels: [
      { phase: "cocktails", level: 2, notes: "Lounge bgm — guests arriving" },
      { phase: "dinner", level: 3, notes: "Performances begin — speech-friendly" },
      { phase: "party", level: 5, notes: "Open dance floor — full club" },
      { phase: "after_curfew", level: 3, notes: "Move indoors if outdoor curfew hits" },
    ],
    lighting: {
      uplighting_color: "Saffron + plum (matches Décor)",
      dance_floor: "Intelligent lights + LED panels + haze",
      performance_spotlight: true,
      pin_spots_on_centerpieces: true,
      cake_spotlight: false,
      ceremony_lighting: undefined,
    },
    stage: {
      stage_size: "20x16 ft riser, 18\" tall",
      dance_floor_size: "32x32 ft parquet",
      dj_booth_placement: "Stage right corner — facing the floor",
      stage_risers_for_performers: true,
    },
    power: {
      total_draw_estimate: "120A 3-phase",
      generator_required: false,
      power_drop_locations: ["Stage left x2", "Stage right x2", "DJ booth"],
    },
    backup_plan:
      "Spare wireless mic kit (4 channels) on the truck. Spare DJ controller. Sub-PA in van for emergency floor fill.",
    updated_at: t0,
  },
  {
    id: id("tech"),
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "ceremony",
    speakers: [
      { id: id("spk"), placement: "Mandap front L+R", kind: "main_pa" },
      { id: id("spk"), placement: "Back-of-aisle delay", kind: "delay" },
    ],
    mics: [
      {
        id: id("mic"),
        kind: "lapel",
        count: 2,
        notes: "Pandit + emcee announcements",
      },
      {
        id: id("mic"),
        kind: "instrument",
        count: 2,
        notes: "Shehnai + tabla — live-mic'd",
      },
    ],
    sound_check_at: "2026-04-28T08:00:00.000Z",
    sound_check_attendees: ["Pandit ji", "Sound engineer", "Urvashi"],
    volume_levels: [
      { phase: "ceremony", level: 1, notes: "Ambient — let the mantras carry" },
      { phase: "party", level: 4, notes: "Baraat dhol entrance only" },
    ],
    lighting: {
      uplighting_color: "Warm white + saffron uplights on mandap",
      ceremony_lighting: "Cinematic spot on the couple during pheras",
    },
    stage: {
      stage_size: "Mandap 12x12 ft",
      dance_floor_size: "—",
      dj_booth_placement: "Hidden — speakers run from house mix position",
    },
    power: {
      total_draw_estimate: "30A single phase (mandap power, mics, lights)",
      generator_required: false,
    },
    backup_plan: "Backup wired SM58 hand-held in case lapels die mid-pheras.",
    updated_at: t0,
  },
  {
    id: id("tech"),
    wedding_id: DEMO_MUSIC_WEDDING_ID,
    event: "reception",
    speakers: [
      { id: id("spk"), placement: "Ballroom L main PA", kind: "main_pa" },
      { id: id("spk"), placement: "Ballroom R main PA", kind: "main_pa" },
      { id: id("spk"), placement: "Subwoofer dance floor", kind: "subwoofer" },
      { id: id("spk"), placement: "Cocktail anteroom fill", kind: "fill" },
    ],
    mics: [
      {
        id: id("mic"),
        kind: "wireless_handheld",
        count: 4,
        notes: "Emcee + speeches (parents + best man + maid of honor)",
      },
    ],
    sound_check_at: "2026-04-29T15:00:00.000Z",
    sound_check_attendees: ["DJ Pranav", "Venue AV", "Urvashi"],
    volume_levels: [
      { phase: "cocktails", level: 2 },
      { phase: "dinner", level: 3 },
      { phase: "party", level: 5 },
    ],
    lighting: {
      uplighting_color: "Saffron + rose (matches Décor reception palette)",
      dance_floor: "Intelligent moving heads + disco ball + LED matrix",
      performance_spotlight: true,
      pin_spots_on_centerpieces: true,
      cake_spotlight: true,
    },
    stage: {
      stage_size: "12x10 ft (couple's table + speeches)",
      dance_floor_size: "30x30 ft parquet",
      dj_booth_placement: "Beside dance floor — far from couple's table",
    },
    power: {
      total_draw_estimate: "100A 3-phase",
      generator_required: false,
    },
    backup_plan:
      "Indoor venue — no rain pivot needed. Spare battery pack for wireless mics.",
    updated_at: t0,
  },
];
