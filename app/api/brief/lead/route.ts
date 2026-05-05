// POST /api/brief/lead — capture an email tied to a brief for the
// "Save Your Brief" flow. Service-role client (brief_leads is locked
// behind RLS so only this trusted route can write).

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: NextRequest) {
  let body: { public_id?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { public_id, email } = body;
  if (!public_id || typeof public_id !== 'string') {
    return NextResponse.json({ error: 'Missing brief id' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
  }

  // Resolve public_id → row uuid. (brief_leads.brief_id FKs the uuid.)
  const { data: brief, error: lookupErr } = await supabase
    .from('brief_responses')
    .select('id')
    .eq('public_id', public_id)
    .maybeSingle();

  if (lookupErr || !brief) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }

  const normalized = email.trim().toLowerCase();

  // Insert; if (brief_id, lower(email)) already exists the unique index
  // raises 23505 — that's fine, the user just resubmitted. Any other
  // error is a real failure.
  const { error: insertErr } = await supabase
    .from('brief_leads')
    .insert({ brief_id: brief.id, email: normalized });

  if (insertErr && insertErr.code !== '23505') {
    return NextResponse.json(
      { error: 'Could not save your email.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
