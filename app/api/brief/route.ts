// POST /api/brief — save anonymous quiz answers, return short public id.
//
// Anon writes are blocked at the RLS layer (migration 0038), so this route
// uses the service-role client. Validation mirrors the column CHECKs so
// bad payloads get rejected before the DB rejects them with an opaque
// error. Generated public_id is what /brief/[id] resolves against.

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generatePublicId, parseBriefAnswers } from '@/lib/brief/validate';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseBriefAnswers(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Lightweight spam triage: capture client IP/UA. We never surface these
  // to the read APIs, but they let us spot patterns if the route gets
  // pounded. inet column accepts both v4 and v6.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const ua = request.headers.get('user-agent')?.slice(0, 500) ?? null;

  // Up to 3 attempts to avoid a public_id collision (~50 bits per id; the
  // unique index will catch any actual collision and we just regenerate).
  for (let attempt = 0; attempt < 3; attempt++) {
    const public_id = generatePublicId();
    const { data, error } = await supabase
      .from('brief_responses')
      .insert({
        public_id,
        events: parsed.answers.events,
        guests: parsed.answers.guests,
        budget: parsed.answers.budget,
        vibe: parsed.answers.vibe,
        destination: parsed.answers.destination,
        priorities: parsed.answers.priorities,
        timeline: parsed.answers.timeline,
        client_ip: ip,
        user_agent: ua,
      })
      .select('id, public_id')
      .maybeSingle();

    if (data) {
      return NextResponse.json(
        { id: data.id, public_id: data.public_id },
        { status: 201 },
      );
    }

    // 23505 = unique_violation on public_id; retry. Any other error → bail.
    if (error && error.code !== '23505') {
      return NextResponse.json(
        { error: 'Could not save your brief.' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: 'Could not save your brief.' },
    { status: 500 },
  );
}
