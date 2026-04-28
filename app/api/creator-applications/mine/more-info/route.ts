import { NextResponse } from "next/server";

// PUT /api/creator-applications/mine/more-info
// Applicant responds to a "request more info" prompt. The canonical
// write happens in the client Zustand store; this route validates the
// payload and echoes the acknowledgement so a future backend can slot
// in without touching the client.

export async function PUT(request: Request) {
  let body: { applicationId?: string; response?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.applicationId || !body.response?.trim()) {
    return NextResponse.json(
      { error: "applicationId and response are required." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    applicationId: body.applicationId,
    response: body.response.trim(),
    status: "under_review",
    updatedAt: new Date().toISOString(),
  });
}
