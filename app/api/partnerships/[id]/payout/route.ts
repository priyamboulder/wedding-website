import { NextResponse } from "next/server";
import {
  getProposal,
  getPayoutForProposal,
} from "@/lib/partnerships/seed";

// GET /api/partnerships/[id]/payout

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!getProposal(id)) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  const payout = getPayoutForProposal(id);
  if (!payout) {
    return NextResponse.json(
      { payout: null, status: "no_payout_yet" },
      { status: 200 },
    );
  }
  return NextResponse.json({ payout });
}
