"use client";

// ── Tab 4 — Communications ────────────────────────────────────────────────
// Invitation channel, editable message template (subject + body), and a
// small tracking panel for sent/opened/rsvp counts. "Draft for me" is a
// placeholder — wires into the store's existing body field so the couple
// can regenerate later when AI lands.

import { Copy } from "lucide-react";
import { useState } from "react";
import { useWelcomeEventsStore } from "@/stores/welcome-events-store";
import { CHANNEL_OPTIONS } from "@/lib/welcome-events-seed";
import {
  Field,
  RadioRow,
  SectionIntro,
  SectionLabel,
  SectionTitle,
  TextInput,
  Textarea,
} from "../shared";
import type { InvitationChannel } from "@/types/welcome-events";

export function CommunicationsTab() {
  const comms = useWelcomeEventsStore((s) => s.comms);
  const updateComms = useWelcomeEventsStore((s) => s.updateComms);
  const updateStats = useWelcomeEventsStore((s) => s.updateStats);
  const guestCount = useWelcomeEventsStore((s) => s.basics.guestCount);

  const [copied, setCopied] = useState(false);

  async function copyBody() {
    const text = `Subject: ${comms.subject}\n\n${comms.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard can fail silently (insecure context) — no-op
    }
  }

  return (
    <div className="flex flex-col gap-14 py-10">
      <section>
        <SectionLabel>Communications</SectionLabel>
        <SectionTitle>Guest communications</SectionTitle>
        <SectionIntro>
          How the invite reaches guests — and what it says when it lands.
        </SectionIntro>

        <div className="mt-8 max-w-2xl">
          <Field label="Invitation channel">
            <RadioRow<InvitationChannel>
              value={comms.channel}
              options={CHANNEL_OPTIONS}
              onChange={(channel) => updateComms({ channel })}
            />
          </Field>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionLabel>Message template</SectionLabel>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Subject">
              <TextInput
                value={comms.subject}
                onChange={(e) => updateComms({ subject: e.target.value })}
                placeholder="You're invited — Welcome dinner for Priya & Raj"
              />
            </Field>
            <Field label="Body">
              <Textarea
                rows={14}
                value={comms.body}
                onChange={(e) => updateComms({ body: e.target.value })}
                className="font-sans"
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyBody}
              className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-white px-3 py-2 text-[13px] text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
            >
              <Copy size={14} strokeWidth={1.8} />
              {copied ? "Copied" : "Copy text"}
            </button>
            <span className="text-[12px] italic text-ink-faint">
              Send via your email or WhatsApp tool — the platform doesn't send
              on your behalf yet.
            </span>
          </div>
        </div>

        <div>
          <SectionLabel>Tracking</SectionLabel>
          <p className="mt-1 text-[13px] text-ink-muted">
            Update these after a send to keep a rough pulse on coverage.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <StatRow
              label="Sent"
              value={comms.stats.sent}
              max={Math.max(guestCount, comms.stats.sent)}
              onChange={(v) => updateStats({ sent: v })}
            />
            <StatRow
              label="Opened"
              value={comms.stats.opened}
              max={Math.max(guestCount, comms.stats.opened)}
              onChange={(v) => updateStats({ opened: v })}
            />
            <StatRow
              label="RSVP'd"
              value={comms.stats.rsvpd}
              max={Math.max(guestCount, comms.stats.rsvpd)}
              onChange={(v) => updateStats({ rsvpd: v })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatRow({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        <span className="text-[13px] text-ink-soft">
          <span
            className="font-mono text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {value}
          </span>
          <span className="text-ink-faint"> / {max}</span>
        </span>
      </div>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))
        }
        className="mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-1.5 text-[13px] text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
      />
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-ivory-deep">
        <div
          className="h-full bg-gold transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
