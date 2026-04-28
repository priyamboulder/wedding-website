import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type { CreatorApplication } from "@/types/creator-application";

// POST /api/creator-applications
// Accepts a new application and persists it into the creator_applications_state
// JSONB blob (keyed by "__platform__"). The data column holds an array of
// CreatorApplication objects.

const PLATFORM_KEY = "__platform__";

const required = [
  "fullName",
  "email",
  "locationCity",
  "locationCountry",
  "bio",
  "primaryExpertise",
  "yearsExperience",
  "combinedFollowingRange",
  "contentPlan",
] as const;

export async function POST(request: Request) {
  let body: Partial<CreatorApplication>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const missing = required.filter((k) => {
    const value = body[k];
    return value == null || (typeof value === "string" && value.trim() === "");
  });
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }
  if (!body.agreedToTerms) {
    return NextResponse.json(
      { error: "Applicants must agree to the Creator Program Terms." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const application: CreatorApplication = {
    id: `app_${Date.now().toString(36)}`,
    userId: body.userId ?? null,
    fullName: String(body.fullName).trim(),
    email: String(body.email).trim().toLowerCase(),
    locationCity: String(body.locationCity).trim(),
    locationCountry: String(body.locationCountry).trim(),
    avatarUrl: body.avatarUrl ?? null,
    bio: String(body.bio).trim(),
    primaryExpertise: body.primaryExpertise!,
    secondaryExpertise: body.secondaryExpertise ?? [],
    yearsExperience: body.yearsExperience!,
    isIndustryProfessional: Boolean(body.isIndustryProfessional),
    professionalRole: body.professionalRole ?? null,
    instagramHandle: body.instagramHandle ?? null,
    youtubeChannel: body.youtubeChannel ?? null,
    tiktokHandle: body.tiktokHandle ?? null,
    blogUrl: body.blogUrl ?? null,
    otherSocialLinks: body.otherSocialLinks ?? null,
    combinedFollowingRange: body.combinedFollowingRange!,
    portfolioUrls: body.portfolioUrls ?? [],
    contentPlan: String(body.contentPlan).trim(),
    agreedToTerms: true,
    status: "pending",
    rejectionReasonCategory: null,
    rejectionReasonText: null,
    waitlistNote: null,
    moreInfoRequest: null,
    moreInfoResponse: null,
    adminInternalNotes: null,
    reviewedBy: null,
    reviewedAt: null,
    reapplyEligibleAt: null,
    linkedCreatorId: null,
    createdAt: now,
    updatedAt: now,
  };

  // Load existing blob row (or empty array if not yet created)
  const { data: row, error: fetchErr } = await supabase
    .from("creator_applications_state")
    .select("data")
    .eq("couple_id", PLATFORM_KEY)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(
      { error: "DB read failed." },
      { status: 500 },
    );
  }

  const existing: CreatorApplication[] = Array.isArray(row?.data)
    ? (row.data as CreatorApplication[])
    : [];

  const updated = [...existing, application];

  const { error: upsertErr } = await supabase
    .from("creator_applications_state")
    .upsert({ couple_id: PLATFORM_KEY, data: updated, updated_at: now });

  if (upsertErr) {
    return NextResponse.json(
      { error: "DB write failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ application }, { status: 201 });
}

// GET /api/creator-applications
// Returns all applications. Admin only.

export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { data: row, error } = await supabase
    .from("creator_applications_state")
    .select("data")
    .eq("couple_id", PLATFORM_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "DB read failed." },
      { status: 500 },
    );
  }

  const applications: CreatorApplication[] = Array.isArray(row?.data)
    ? (row.data as CreatorApplication[])
    : [];

  return NextResponse.json({ applications, total: applications.length });
}
