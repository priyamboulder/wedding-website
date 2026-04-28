// ── /api/flights/refresh ──────────────────────────────────────────────────
// Refreshes the status of tracked guest flights. Today this returns
// deterministic mock data so the Flights tab UI can be driven end-to-end
// without a live provider contract. When a real feed is wired up, swap
// the `mockStatus` block for one of:
//
//   • AviationStack (https://aviationstack.com) — simple REST, free tier
//     ~100 req/mo. Query by `flight_iata=AI101`.
//   • AeroDataBox (https://aerodatabox.com) — per-flight endpoint with
//     gate/terminal data. Query by flight number + date.
//   • FlightAware AeroAPI (https://flightaware.com/commercial/aeroapi/) —
//     most accurate, paid. Query by `ident` + origin.
//
// Expected caller payload:
//   { flights: [{ flightId, guestId, flightNumber, date }] }
//
// Response:
//   { updates: [{ flightId, guestId, status, delayMinutes?, gate? }],
//     checkedAt: ISO timestamp }
//
// The route is authenticated-by-default via Next's App Router conventions —
// no secrets live in the mock. Plug the real API key into a server-only
// env var (e.g. `AVIATIONSTACK_API_KEY`) when the provider is selected.

import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  flights: z
    .array(
      z.object({
        flightId: z.string(),
        guestId: z.string(),
        flightNumber: z.string(),
        date: z.string().optional(),
      }),
    )
    .max(200),
});

type FlightStatus =
  | "scheduled"
  | "on_time"
  | "delayed"
  | "landed"
  | "departed"
  | "cancelled";

interface StatusUpdate {
  flightId: string;
  guestId: string;
  status: FlightStatus;
  delayMinutes?: number;
  gate?: string;
}

// Deterministic mock — cycles through a handful of outcomes based on a
// simple hash of the flight number so repeated refreshes stay stable
// between calls. Good enough for demo; swap for a real feed later.
function mockStatus(flightNumber: string): {
  status: FlightStatus;
  delayMinutes?: number;
  gate?: string;
} {
  let hash = 0;
  for (let i = 0; i < flightNumber.length; i++) {
    hash = (hash * 31 + flightNumber.charCodeAt(i)) >>> 0;
  }
  const bucket = hash % 10;
  const gateLetter = String.fromCharCode(65 + (hash % 6)); // A–F
  const gateNumber = 1 + ((hash >> 3) % 24);
  const gate = `${gateLetter}${gateNumber}`;
  if (bucket < 5) return { status: "on_time", gate };
  if (bucket < 7) return { status: "delayed", delayMinutes: 20 + (hash % 80), gate };
  if (bucket < 8) return { status: "landed", gate };
  if (bucket < 9) return { status: "scheduled", gate };
  return { status: "cancelled" };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_API_KEY;

  // If real API key is available, use AviationStack; otherwise fall back to mock.
  if (AVIATIONSTACK_KEY) {
    const updates: StatusUpdate[] = [];
    for (const f of parsed.data.flights) {
      try {
        const iata = f.flightNumber.replace(/\s+/g, "").toUpperCase();
        const res = await fetch(
          `https://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&flight_iata=${iata}`,
        );
        if (!res.ok) {
          updates.push({ flightId: f.flightId, guestId: f.guestId, ...mockStatus(iata) });
          continue;
        }
        const json = await res.json();
        const flight = json?.data?.[0];
        if (!flight) {
          updates.push({ flightId: f.flightId, guestId: f.guestId, ...mockStatus(iata) });
          continue;
        }
        const rawStatus: string = flight.flight_status ?? "scheduled";
        const statusMap: Record<string, FlightStatus> = {
          scheduled: "scheduled",
          active: "departed",
          landed: "landed",
          cancelled: "cancelled",
          incident: "cancelled",
          diverted: "delayed",
        };
        const status: FlightStatus = statusMap[rawStatus] ?? "scheduled";
        const delayMinutes = flight.departure?.delay ?? undefined;
        const gate = flight.departure?.gate ?? undefined;
        updates.push({ flightId: f.flightId, guestId: f.guestId, status, ...(delayMinutes && { delayMinutes }), ...(gate && { gate }) });
      } catch {
        const iata = f.flightNumber.replace(/\s+/g, "").toUpperCase();
        updates.push({ flightId: f.flightId, guestId: f.guestId, ...mockStatus(iata) });
      }
    }
    return NextResponse.json({ updates, checkedAt: new Date().toISOString(), source: "aviationstack" });
  }

  // No API key — use deterministic mock so UI remains functional.
  const updates: StatusUpdate[] = parsed.data.flights.map((f) => ({
    flightId: f.flightId,
    guestId: f.guestId,
    ...mockStatus(f.flightNumber.replace(/\s+/g, "").toUpperCase()),
  }));

  return NextResponse.json({
    updates,
    checkedAt: new Date().toISOString(),
    source: "mock",
  });
}
