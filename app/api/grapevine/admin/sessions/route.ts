import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type { GrapevineSessionType } from "@/types/grapevine-ama";

// POST /api/grapevine/admin/sessions
// Create a new session. Admin only. The slug is unique; we trust the
// admin to pass a clean one (or we generate from title if omitted).
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as {
    title?: string;
    slug?: string;
    description?: string;
    expert_name?: string;
    expert_title?: string;
    expert_bio?: string;
    expert_avatar_url?: string;
    expert_credentials?: string[];
    session_type?: GrapevineSessionType;
    tags?: string[];
    scheduled_start?: string;
    scheduled_end?: string;
  };

  if (!b.title || !b.expert_name) {
    return NextResponse.json(
      { error: "title and expert_name are required" },
      { status: 400 },
    );
  }

  const slug = b.slug?.trim() || slugify(b.title);

  const { data, error } = await supabase
    .from("grapevine_ama_sessions")
    .insert({
      title: b.title,
      slug,
      description: b.description ?? null,
      expert_name: b.expert_name,
      expert_title: b.expert_title ?? null,
      expert_bio: b.expert_bio ?? null,
      expert_avatar_url: b.expert_avatar_url ?? null,
      expert_credentials: b.expert_credentials ?? null,
      session_type: b.session_type ?? null,
      tags: b.tags ?? null,
      scheduled_start: b.scheduled_start ?? null,
      scheduled_end: b.scheduled_end ?? null,
      status: "upcoming",
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create session" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, session: data });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
