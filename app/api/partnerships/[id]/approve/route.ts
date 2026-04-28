import { NextResponse } from "next/server";
import { getProposal } from "@/lib/partnerships/seed";
import {
  calculatePlatformFee,
  calculateNetPayout,
} from "@/types/partnership";

// PUT /api/partnerships/[id]/approve
// Vendor approves the deliverable; payout is queued/released.

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const proposal = getProposal(id);
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  if (proposal.status !== "delivered") {
    return NextResponse.json(
      {
        error: `Cannot approve from status: ${proposal.status}`,
      },
      { status: 409 },
    );
  }

  const grossAmount = proposal.proposedBudget;
  const platformFee = calculatePlatformFee(grossAmount);
  const netAmount = calculateNetPayout(grossAmount);

  return NextResponse.json({
    proposalId: id,
    status: "completed",
    approvedAt: new Date().toISOString(),
    payout: {
      grossAmount,
      platformFee,
      netAmount,
      status: "paid",
      paidAt: new Date().toISOString(),
    },
  });
}
