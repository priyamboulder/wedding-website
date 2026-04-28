import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { calculatePlatformFee } from "@/types/partnership";
import type { PartnershipProposal } from "@/types/partnership";

// GET /api/partnerships/proposals?role=vendor&actorId=...
// GET /api/partnerships/proposals?role=creator&actorId=...
// GET /api/partnerships/proposals?couple_id=...  (returns full state blob)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const actorId = searchParams.get("actorId");
  const coupleId = searchParams.get("couple_id");

  try {
    if (coupleId) {
      const { data, error } = await supabase
        .from("partnerships_state")
        .select("data")
        .eq("couple_id", coupleId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      const proposals: PartnershipProposal[] = (data?.data as { proposals?: PartnershipProposal[] })?.proposals ?? [];
      return NextResponse.json({ proposals });
    }

    if (actorId && (role === "vendor" || role === "creator")) {
      // Scan all partnership state rows for proposals matching this actor
      const { data: rows, error } = await supabase
        .from("partnerships_state")
        .select("data");

      if (error) throw error;

      const key = role === "vendor" ? "vendorId" : "creatorId";
      const proposals: PartnershipProposal[] = (rows ?? [])
        .flatMap((row) => ((row.data as { proposals?: PartnershipProposal[] })?.proposals ?? []))
        .filter((p) => p[key as keyof PartnershipProposal] === actorId);

      return NextResponse.json({ proposals });
    }

    // Fallback: return all proposals across all state rows
    const { data: rows, error } = await supabase
      .from("partnerships_state")
      .select("data");

    if (error) throw error;

    const proposals: PartnershipProposal[] = (rows ?? []).flatMap(
      (row) => ((row.data as { proposals?: PartnershipProposal[] })?.proposals ?? [])
    );

    return NextResponse.json({ proposals });
  } catch (err) {
    console.error("[partnerships/proposals GET]", err);
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
  }
}

// POST /api/partnerships/proposals
// Body: { coupleId, vendorId, creatorId, title, description, deliverableType,
//   productIds, proposedBudget, timelineDays }

export async function POST(request: Request) {
  let body: Partial<PartnershipProposal> & { coupleId?: string; proposedBudget?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required: (keyof PartnershipProposal)[] = [
    "vendorId",
    "creatorId",
    "title",
    "description",
    "deliverableType",
    "productIds",
    "proposedBudget",
    "timelineDays",
  ];
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || body[k] === "") {
      return NextResponse.json(
        { error: `Missing required field: ${String(k)}` },
        { status: 400 },
      );
    }
  }

  const coupleId = body.coupleId ?? body.vendorId ?? `anon-${Date.now()}`;
  const proposedBudget = body.proposedBudget ?? 0;
  const platformFee = calculatePlatformFee(proposedBudget);

  const proposal: PartnershipProposal = {
    id: `ptr-${Date.now().toString(36)}`,
    vendorId: body.vendorId as string,
    creatorId: body.creatorId as string,
    title: body.title as string,
    description: body.description as string,
    deliverableType: body.deliverableType!,
    productIds: body.productIds as string[],
    proposedBudget,
    platformFee,
    timelineDays: body.timelineDays as number,
    status: "pending",
    creatorCounterBudget: null,
    creatorCounterNotes: null,
    declineReason: null,
    acceptedAt: null,
    deliveredAt: null,
    approvedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Upsert into the state blob for this couple
    const { data: existing } = await supabase
      .from("partnerships_state")
      .select("data")
      .eq("couple_id", coupleId)
      .single();

    const currentProposals: PartnershipProposal[] =
      (existing?.data as { proposals?: PartnershipProposal[] })?.proposals ?? [];

    const newData = { proposals: [...currentProposals, proposal] };

    const { error } = await supabase
      .from("partnerships_state")
      .upsert({ couple_id: coupleId, data: newData, updated_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (err) {
    console.error("[partnerships/proposals POST]", err);
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}
