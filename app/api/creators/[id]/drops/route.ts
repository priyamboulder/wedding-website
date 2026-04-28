import { NextResponse } from "next/server";
import { getCreator } from "@/lib/creators/seed";
import { getDropsByCreator, getDropItems } from "@/lib/drops/seed";

// GET /api/creators/[id]/drops — all drops by a creator (any status)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!getCreator(id)) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }
  const drops = getDropsByCreator(id).map((d) => ({
    ...d,
    itemCount: getDropItems(d.id).length,
  }));
  return NextResponse.json({ drops });
}
