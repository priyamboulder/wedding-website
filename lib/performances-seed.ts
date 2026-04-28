// ── Performances seed ───────────────────────────────────────────────────────
// Starter performances for the Sangeet & Reception so the page isn't empty
// on first load. Guest IDs follow the `hX-gY` shape from guests page mock
// data — references may not resolve to the exact names if the seed churns,
// but the linkage system remains demonstrable.

import type { Performance } from "@/types/performance";

const now = "2026-04-22T00:00:00.000Z";

export const DEFAULT_PERFORMANCES: Performance[] = [
  {
    id: "perf-seed-1",
    name: "Bride's Friends — Bollywood Medley",
    eventId: "sangeet",
    type: "Dance",
    songs: [
      {
        id: "song-seed-1a",
        title: "Kala Chashma",
        artist: "Amar Arshi, Badshah",
        durationSeconds: 230,
      },
      {
        id: "song-seed-1b",
        title: "Ghungroo",
        artist: "Arijit Singh, Shilpa Rao",
        durationSeconds: 210,
      },
      {
        id: "song-seed-1c",
        title: "Nagada Sang Dhol",
        artist: "Shreya Ghoshal, Osman Mir",
        durationSeconds: 240,
      },
    ],
    durationMinutes: null,
    participants: [
      { guestId: "h1-g1", role: "Lead" },
      { guestId: "h1-g2", role: "Performer" },
      { guestId: "h2-g1", role: "Performer" },
      { guestId: "h3-g1", role: "Choreographer" },
    ],
    rehearsals: [
      {
        id: "reh-seed-1",
        date: "2026-05-02",
        time: "14:00",
        location: "Bride's home, living room",
        notes: "First full run-through — bring costume mockups",
        attendance: {},
      },
    ],
    status: "Rehearsing",
    order: 0,
    notes:
      "Opening act. Choreographer: Leena (415-555-0142). Group entrance from house-left.",
    costumes: "Gold lehengas with pink dupattas",
    avRequirements: ["wireless mic", "dance floor spotlight"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "perf-seed-2",
    name: "Groom's Brothers — Hip-Hop Mix",
    eventId: "sangeet",
    type: "Dance",
    songs: [
      {
        id: "song-seed-2a",
        title: "Proper Patola",
        artist: "Diljit Dosanjh, Badshah",
        durationSeconds: 200,
      },
      {
        id: "song-seed-2b",
        title: "Tareefan",
        artist: "Badshah, Lisa Mishra",
        durationSeconds: 190,
      },
    ],
    durationMinutes: 7,
    participants: [
      { guestId: "h4-g1", role: "Lead" },
      { guestId: "h4-g2", role: "Performer" },
      { guestId: "h5-g1", role: "Performer" },
    ],
    rehearsals: [],
    status: "Planning",
    order: 1,
    notes: "Needs hype intro from MC. Surprise outfit reveal midway.",
    costumes: "Black kurtas, white sneakers",
    avRequirements: ["wireless mic", "haze machine"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "perf-seed-3",
    name: "Father of the Bride — Speech",
    eventId: "reception",
    type: "Speech",
    songs: [],
    durationMinutes: 5,
    participants: [{ guestId: "h1-g1", role: "Lead" }],
    rehearsals: [],
    status: "Planning",
    order: 0,
    notes: "Please queue soft instrumental under the close.",
    costumes: "",
    avRequirements: ["wireless mic", "podium"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "perf-seed-4",
    name: "Couple's First Dance",
    eventId: "reception",
    type: "Dance",
    songs: [
      {
        id: "song-seed-4a",
        title: "Tum Hi Ho",
        artist: "Arijit Singh",
        durationSeconds: 260,
      },
    ],
    durationMinutes: null,
    participants: [],
    rehearsals: [],
    status: "Planning",
    order: 1,
    notes: "Choreographed by Sonal. Needs dim lighting + single spotlight.",
    costumes: "Reception outfits",
    avRequirements: ["projector for video montage", "specific lighting"],
    createdAt: now,
    updatedAt: now,
  },
];
