import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import {
  getProposal,
  getMessagesForProposal,
} from "@/lib/partnerships/seed";

// GET /api/partnerships/[id]/messages — message thread
// POST /api/partnerships/[id]/messages — append a message
//   Body: { senderType: "vendor" | "creator", messageText }
//   senderId is derived from the authenticated user — NOT trusted from the body.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const proposal = getProposal(id);
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

  return NextResponse.json({ messages: getMessagesForProposal(id) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const proposal = getProposal(id);
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

  let body: {
    senderType?: "vendor" | "creator";
    messageText?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.senderType || !body.messageText?.trim()) {
    return NextResponse.json(
      { error: "senderType and messageText are required" },
      { status: 400 },
    );
  }

  // senderId is always derived from the authenticated user — never trust the client
  const senderId = user.id;

  return NextResponse.json(
    {
      message: {
        id: `msg-${Date.now().toString(36)}`,
        partnershipId: id,
        senderType: body.senderType,
        senderId,
        messageText: body.messageText,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
