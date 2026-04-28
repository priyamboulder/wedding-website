// ── Performance types ───────────────────────────────────────────────────────
// Tracks choreographed dances, speeches, skits, musical acts, etc. that
// guests perform at events (primarily Sangeet & Reception). Feeds the
// future Music & Entertainment workspace.

export type PerformanceType =
  | "Dance"
  | "Speech"
  | "Skit"
  | "Musical"
  | "Game"
  | "Other";

export type PerformanceStatus = "Planning" | "Rehearsing" | "Ready";

export type PerformanceRole =
  | "Lead"
  | "Performer"
  | "Choreographer"
  | "MC";

export interface PerformanceSong {
  id: string;
  title: string;
  artist: string;
  durationSeconds: number;
}

export interface PerformanceParticipant {
  guestId: string;
  role: PerformanceRole;
}

export interface PerformanceRehearsal {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // e.g. "18:00"
  location: string;
  notes?: string;
  // Attendance keyed by guestId → true/false. Missing = not marked.
  attendance: Record<string, boolean>;
}

export interface Performance {
  id: string;
  name: string;
  eventId: string;
  type: PerformanceType;
  songs: PerformanceSong[];
  // Total estimated duration in minutes. If null, compute from songs.
  durationMinutes: number | null;
  participants: PerformanceParticipant[];
  rehearsals: PerformanceRehearsal[];
  status: PerformanceStatus;
  order: number;
  notes: string;
  costumes: string;
  avRequirements: string[];
  createdAt: string;
  updatedAt: string;
}

export const PERFORMANCE_TYPES: PerformanceType[] = [
  "Dance",
  "Speech",
  "Skit",
  "Musical",
  "Game",
  "Other",
];

export const PERFORMANCE_ROLES: PerformanceRole[] = [
  "Lead",
  "Performer",
  "Choreographer",
  "MC",
];

export const PERFORMANCE_STATUSES: PerformanceStatus[] = [
  "Planning",
  "Rehearsing",
  "Ready",
];

// Shared duration helper — prefer manual override, else sum of song lengths.
export function performanceDurationMinutes(p: Performance): number {
  if (p.durationMinutes != null) return p.durationMinutes;
  const seconds = p.songs.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  return Math.round(seconds / 60);
}
