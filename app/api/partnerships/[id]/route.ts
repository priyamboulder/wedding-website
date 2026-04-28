import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import type { PartnershipProposal } from "@/types/partnership";

// GET /api/partnerships/[id]
// Proposal detail — scans partnerships_state rows to find the proposal by id.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    return NextResponse.json({ proposal });
  } catch (err) {
    console.error("[partnerships/id GET]", err);
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
  }
}
