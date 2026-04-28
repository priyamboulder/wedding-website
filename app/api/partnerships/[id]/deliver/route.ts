import { NextResponse } from "next/server";
import { getProposal } from "@/lib/partnerships/seed";

// PUT /api/partnerships/[id]/deliver
// Creator marks the deliverable as complete.

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const proposal = getProposal(id);
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  if (
    proposal.status !== "accepted" &&
    proposal.status !== "in_progress"
  ) {
    return NextResponse.json(
      {
        error: `Cannot deliver from status: ${proposal.status}`,
      },
      { status: 409 },
    );
  }
  return NextResponse.json({
    proposalId: id,
    status: "delivered",
    deliveredAt: new Date().toISOString(),
  });
}
