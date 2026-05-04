import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getDiaryById } from "@/lib/week-of/queries";

// GET /api/week-of/[id] — full diary with all day entries.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const diary = await getDiaryById(supabase, id);
  if (!diary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ diary });
}
