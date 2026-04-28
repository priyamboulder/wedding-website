// ── Rishta Circle localStorage helpers ──────────────────────────────────────
// Thin CRUD over the three canonical keys. Kept plain (no Zustand) so the
// shapes map 1:1 to Supabase rows when we migrate. Every mutation reads → writes
// the whole array so the JSON on disk stays the single source of truth.

import { v4 as uuid } from "uuid";
import type {
  Application,
  ApplicationStatus,
  Interest,
  InterestStatus,
  Member,
} from "./types";

export const STORAGE_KEYS = {
  applications: "innerCircleApplications",
  members: "innerCircleMembers",
  interests: "innerCircleInterests",
  currentUser: "innerCircleCurrentUser",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function readArray<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ── Applications ─────────────────────────────────────────────────────────────

export function getApplications(): Application[] {
  return readArray<Application>(STORAGE_KEYS.applications);
}

export function getApplication(id: string): Application | null {
  return getApplications().find((a) => a.id === id) ?? null;
}

export function createApplication(
  data: Omit<Application, "id" | "status" | "submittedAt" | "reviewedAt">,
): Application {
  const app: Application = {
    id: uuid(),
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    ...data,
  };
  const all = getApplications();
  writeArray(STORAGE_KEYS.applications, [app, ...all]);
  return app;
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Application | null {
  const all = getApplications();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const reviewedAt = new Date().toISOString();
  const updated: Application = { ...all[idx], status, reviewedAt };
  all[idx] = updated;
  writeArray(STORAGE_KEYS.applications, all);

  if (status === "approved") {
    promoteApplicationToMember(updated);
  }
  return updated;
}

// ── Members ─────────────────────────────────────────────────────────────────

export function getMembers(): Member[] {
  return readArray<Member>(STORAGE_KEYS.members);
}

export function getMember(id: string): Member | null {
  return getMembers().find((m) => m.id === id) ?? null;
}

export function upsertMembers(members: Member[]) {
  const existing = getMembers();
  const byId = new Map(existing.map((m) => [m.id, m]));
  for (const m of members) byId.set(m.id, m);
  writeArray(STORAGE_KEYS.members, Array.from(byId.values()));
}

function promoteApplicationToMember(app: Application): Member {
  const existing = getMembers();
  if (existing.some((m) => m.applicationId === app.id)) {
    return existing.find((m) => m.applicationId === app.id)!;
  }
  const member: Member = {
    id: app.id,
    applicationId: app.id,
    approvedAt: new Date().toISOString(),
    submittedBy: app.submittedBy,
    submitterName: app.submitterName,
    submitterRelationship: app.submitterRelationship,
    submitterContact: app.submitterContact,
    fullName: app.fullName,
    age: app.age,
    gender: app.gender,
    locationCity: app.locationCity,
    locationState: app.locationState,
    locationCountry: app.locationCountry,
    hometown: app.hometown,
    religion: app.religion,
    religionOther: app.religionOther,
    profilePhoto: app.profilePhoto,
    education: app.education,
    profession: app.profession,
    bio: app.bio,
    lookingFor: app.lookingFor,
    familyValues: app.familyValues,
    contactEmail: app.contactEmail ?? app.submitterContact,
    contactPhone: app.contactPhone,
    isActive: true,
  };
  writeArray(STORAGE_KEYS.members, [member, ...existing]);
  return member;
}

// ── Interests ───────────────────────────────────────────────────────────────

export function getInterests(): Interest[] {
  return readArray<Interest>(STORAGE_KEYS.interests);
}

export function getInterestBetween(
  fromMemberId: string,
  toMemberId: string,
): Interest | null {
  return (
    getInterests().find(
      (i) => i.fromMemberId === fromMemberId && i.toMemberId === toMemberId,
    ) ?? null
  );
}

export function createInterest(
  fromMemberId: string,
  toMemberId: string,
): Interest {
  const existing = getInterestBetween(fromMemberId, toMemberId);
  if (existing) return existing;
  const interest: Interest = {
    id: uuid(),
    fromMemberId,
    toMemberId,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const all = getInterests();
  writeArray(STORAGE_KEYS.interests, [interest, ...all]);
  return interest;
}

export function updateInterestStatus(
  id: string,
  status: InterestStatus,
): Interest | null {
  const all = getInterests();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated: Interest = { ...all[idx], status };
  all[idx] = updated;
  writeArray(STORAGE_KEYS.interests, all);
  return updated;
}

export function getMutualMatches(memberId: string): Member[] {
  const interests = getInterests();
  const acceptedOutbound = new Set(
    interests
      .filter((i) => i.fromMemberId === memberId && i.status === "accepted")
      .map((i) => i.toMemberId),
  );
  const acceptedInbound = new Set(
    interests
      .filter((i) => i.toMemberId === memberId && i.status === "accepted")
      .map((i) => i.fromMemberId),
  );
  const mutualIds = [...acceptedOutbound].filter((id) => acceptedInbound.has(id));
  const members = getMembers();
  return members.filter((m) => mutualIds.includes(m.id));
}

// ── Current user ────────────────────────────────────────────────────────────

export function getCurrentUserId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.currentUser);
}

export function setCurrentUserId(id: string | null) {
  if (!isBrowser()) return;
  if (id === null) window.localStorage.removeItem(STORAGE_KEYS.currentUser);
  else window.localStorage.setItem(STORAGE_KEYS.currentUser, id);
}

export function getCurrentMember(): Member | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getMember(id);
}

export function getMyPendingApplication(): Application | null {
  // When we don't yet have a member (i.e. not approved), we tag the
  // applicant as the current user via a cached application id so the
  // landing page can show "under review".
  if (!isBrowser()) return null;
  const pendingId = window.localStorage.getItem(
    "innerCircleMyPendingApplicationId",
  );
  if (!pendingId) return null;
  return getApplication(pendingId);
}

export function setMyPendingApplicationId(id: string | null) {
  if (!isBrowser()) return;
  if (id === null) {
    window.localStorage.removeItem("innerCircleMyPendingApplicationId");
  } else {
    window.localStorage.setItem("innerCircleMyPendingApplicationId", id);
  }
}
