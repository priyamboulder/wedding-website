import { NextResponse } from "next/server";
import {
  getProposal,
  getMessagesForProposal,
} from "@/lib/partnerships/seed";

// GET /api/partnerships/[id]/messages — message thread
// POST /api/partnerships/[id]/messages — append a message
//   Body: { senderType: "vendor" | "creator", senderId, messageText }

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!getProposal(id)) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  return NextResponse.json({ messages: getMessagesForProposal(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!getProposal(id)) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  let body: {
    senderType?: "vendor" | "creator";
    senderId?: string;
    messageText?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.senderType ||
    !body.senderId ||
    !body.messageText?.trim()
  ) {
    return NextResponse.json(
      { error: "senderType, senderId, and messageText are required" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      message: {
        id: `msg-${Date.now().toString(36)}`,
        partnershipId: id,
        senderType: body.senderType,
        senderId: body.senderId,
        messageText: body.messageText,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
