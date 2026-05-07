import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import type { PartnershipProposal } from "@/types/partnership";

// GET /api/partnerships/[id]
// Proposal detail — scans partnerships_state rows to find the proposal by id.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const { data: rows, error } = await supabase
      .from("partnerships_state")
      .select("data");

    if (error) throw error;

    const proposal = (rows ?? [])
      .flatMap((row) => ((row.data as { proposals?: PartnershipProposal[] })?.proposals ?? []))
      .find((p) => p.id === id);

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // IDOR check: user must be the vendor, creator, or couple on the proposal
    if (
      user.id !== proposal.vendorId &&
      user.id !== proposal.creatorId &&
      user.id !== (proposal as any).coupleId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ proposal });
  } catch (err) {
    console.error("[partnerships/id GET]", err);
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
  }
}
