// ── Seasonal Style Drops data model ──────────────────────────────────────
// Time-bound capsule collections from creators. Stronger visual identity
// than a regular collection (cover art, accent color, countdown), and a
// natural trigger for follower notifications.

export type DropStatus = "scheduled" | "active" | "expired" | "archived";

export type DropNotificationType = "launch" | "reminder_24h" | "last_day";

export interface CreatorDrop {
  id: string;
  slug: string;
  creatorId: string;
  title: string;
  description: string;
  themeTag: string;
  coverImageUrl: string;
  accentColor: string; // hex, e.g. "#FF6B6B"
  startsAt: string;
  endsAt: string;
  status: DropStatus;
  module: string; // checklist phase id, parallels CreatorCollection.module
  viewCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DropItem {
  id: string;
  dropId: string;
  productId: string;
  creatorNote: string | null;
  sortOrder: number;
}

export interface DropNotification {
  id: string;
  dropId: string;
  userId: string;
  notificationType: DropNotificationType;
  sentAt: string;
  readAt: string | null;
}

export interface DropSave {
  dropId: string;
  savedAt: string;
}

export function getDropTimingStatus(
  drop: Pick<CreatorDrop, "startsAt" | "endsAt" | "status">,
): DropStatus {
  if (drop.status === "archived") return "archived";
  const now = Date.now();
  const start = new Date(drop.startsAt).getTime();
  const end = new Date(drop.endsAt).getTime();
  if (now < start) return "scheduled";
  if (now > end) return "expired";
  return "active";
}

export function dropTimeRemaining(endsAt: string): {
  days: number;
  hours: number;
  expired: boolean;
  label: string;
} {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, expired: true, label: "Ended" };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let label: string;
  if (days >= 1) {
    label = `Ends in ${days} ${days === 1 ? "day" : "days"}`;
  } else if (hours >= 1) {
    label = `Ends in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else {
    label = "Ends soon";
  }
  return { days, hours, expired: false, label };
}

export function dropTimeUntilStart(startsAt: string): {
  days: number;
  label: string;
} {
  const diff = new Date(startsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, label: "Live now" };
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { days, label: `Starts in ${days} ${days === 1 ? "day" : "days"}` };
}
