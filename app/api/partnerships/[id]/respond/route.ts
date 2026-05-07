import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import type { PartnershipProposal } from "@/types/partnership";

// PUT /api/partnerships/[id]/respond
// Body: { action: "accept" | "counter" | "decline",
//   counterBudget?, counterNotes?, declineReason? }

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  let body: {
    action?: "accept" | "counter" | "decline";
    counterBudget?: number;
    counterNotes?: string;
    declineReason?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.action || !["accept", "counter", "decline"].includes(body.action)) {
    return NextResponse.json(
      { error: "action must be one of: accept, counter, decline" },
      { status: 400 },
    );
  }
  if (body.action === "counter" && body.counterBudget == null) {
    return NextResponse.json(
      { error: "counterBudget required when action=counter" },
      { status: 400 },
    );
  }

  try {
    // Find the row containing this proposal
    const { data: rows, error: fetchError } = await supabase
      .from("partnerships_state")
      .select("couple_id, data");

    if (fetchError) throw fetchError;

    let targetCoupleId: string | null = null;
    let updatedProposals: PartnershipProposal[] = [];

    for (const row of rows ?? []) {
      const proposals: PartnershipProposal[] =
        (row.data as { proposals?: PartnershipProposal[] })?.proposals ?? [];
      const idx = proposals.findIndex((p) => p.id === id);
      if (idx !== -1) {
        const proposal = proposals[idx];

        // IDOR check: user must be the vendor, creator, or couple on the proposal
        if (
          user.id !== proposal.vendorId &&
          user.id !== proposal.creatorId &&
          user.id !== (proposal as any).coupleId
        ) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        targetCoupleId = row.couple_id as string;
        const updatedProposal = { ...proposal };
        const now = new Date().toISOString();

        if (body.action === "accept") {
          updatedProposal.status = "accepted";
          updatedProposal.acceptedAt = now;
        } else if (body.action === "counter") {
          updatedProposal.status = "negotiating";
          updatedProposal.creatorCounterBudget = body.counterBudget ?? null;
          updatedProposal.creatorCounterNotes = body.counterNotes ?? null;
        } else {
          updatedProposal.status = "declined";
          updatedProposal.declineReason = body.declineReason ?? null;
        }
        updatedProposal.updatedAt = now;
        proposals[idx] = updatedProposal;
        updatedProposals = proposals;
        break;
      }
    }

    if (!targetCoupleId) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const { error: upsertError } = await supabase
      .from("partnerships_state")
      .upsert({
        couple_id: targetCoupleId,
        data: { proposals: updatedProposals },
        updated_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      proposalId: id,
      action: body.action,
      accepted: body.action === "accept",
      countered: body.action === "counter",
      declined: body.action === "decline",
    });
  } catch (err) {
    console.error("[partnerships/id/respond PUT]", err);
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 });
  }
}
