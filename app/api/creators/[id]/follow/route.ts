import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// POST /api/creators/[id]/follow   — add a follower
// DELETE /api/creators/[id]/follow — remove a follower
// Follower list is persisted in creators_state JSONB blob under data.followers[].

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const followerId: string | undefined = body?.follower_id;

    const { data: row, error: fetchError } = await supabase
      .from("creators_state")
      .select("data")
      .eq("couple_id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const existing = (row?.data ?? {}) as Record<string, unknown>;
    const followers = Array.isArray(existing.followers)
      ? (existing.followers as string[])
      : [];

    if (followerId && !followers.includes(followerId)) {
      followers.push(followerId);
    }

    const newData = { ...existing, followers };

    const { error: upsertError } = await supabase
      .from("creators_state")
      .upsert({ couple_id: id, data: newData, updated_at: new Date().toISOString() });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      creatorId: id,
      isFollowing: true,
      followerCount: followers.length,
    });
  } catch (err) {
    console.error("[creators/[id]/follow POST]", err);
    return NextResponse.json({ error: "Failed to follow creator" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const followerId: string | undefined = body?.follower_id;

    const { data: row, error: fetchError } = await supabase
      .from("creators_state")
      .select("data")
      .eq("couple_id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const existing = (row?.data ?? {}) as Record<string, unknown>;
    let followers = Array.isArray(existing.followers)
      ? (existing.followers as string[])
      : [];

    if (followerId) {
      followers = followers.filter((f) => f !== followerId);
    }

    const newData = { ...existing, followers };

    const { error: upsertError } = await supabase
      .from("creators_state")
      .upsert({ couple_id: id, data: newData, updated_at: new Date().toISOString() });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      creatorId: id,
      isFollowing: false,
      followerCount: followers.length,
    });
  } catch (err) {
    console.error("[creators/[id]/follow DELETE]", err);
    return NextResponse.json({ error: "Failed to unfollow creator" }, { status: 500 });
  }
}
