// ── Rishta Circle types ─────────────────────────────────────────────────────
// Shapes mirror the eventual Supabase tables: applications → members → interests.
// Every row carries its own `id` so the relational edges hold up once we move
// off localStorage.

export type Gender = "male" | "female" | "non-binary";

export type ApplicationStatus = "pending" | "approved" | "declined";

export type InterestStatus = "pending" | "accepted" | "declined";

export type SubmittedBy = "self" | "family";

export interface Application {
  id: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  submittedBy: SubmittedBy;
  submitterName?: string;
  submitterRelationship?: string;
  submitterContact?: string;
  fullName: string;
  age: number;
  gender: Gender;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  hometown: string;
  religion: string;
  religionOther?: string;
  profilePhoto: string | null;
  education: string;
  profession: string;
  bio: string;
  lookingFor: string;
  familyValues: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Member {
  id: string;
  applicationId: string;
  approvedAt: string;
  submittedBy: SubmittedBy;
  submitterName?: string;
  submitterRelationship?: string;
  submitterContact?: string;
  fullName: string;
  age: number;
  gender: Gender;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  hometown: string;
  religion: string;
  religionOther?: string;
  profilePhoto: string | null;
  education: string;
  profession: string;
  bio: string;
  lookingFor: string;
  familyValues: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
}

export interface Interest {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  createdAt: string;
  status: InterestStatus;
}

export const RELIGIONS = [
  "Hindu",
  "Sikh",
  "Muslim",
  "Christian",
  "Jain",
  "Buddhist",
  "Interfaith",
  "Non-Religious",
  "Other",
] as const;

export type Religion = (typeof RELIGIONS)[number];
