"use client";

// ── Phase 6 · Final Board ──────────────────────────────────────────────────
// A single shareable artifact — direction, shots, outfits, locations,
// timeline, kit — read-only summary the couple sends to photographer + HMUA.
// Share is a local-only toggle (no backend yet).

import { Check, Copy, Download, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";
import {
  ITEM_STATUS_LABEL,
  MOODBOARD_SECTION_LABEL,
  RUN_SHEET_KIND_LABEL,
} from "@/types/engagement-shoot";
import {
  Label,
  PhaseStepper,
  Section,
  SummaryRow,
  TextInput,
  formatMoney,
} from "../ui";

export function FinalBoardTab() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <PhaseStepper phase={6} count={6} label="Share & deliver" />
        <h2 className="font-serif text-[24px] leading-tight text-ink">
          The Final Board
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          Everything in one place — the artifact you send your photographer,
          HMUA, and anyone helping on shoot day.
        </p>
      </header>

      <ShareCard />
      <CoverCard />
      <DirectionCard />
      <OutfitsCard />
      <LocationsCard />
      <TimelineCard />
      <KitCard />
    </div>
  );
}

// ── Share card ─────────────────────────────────────────────────────────────

function ShareCard() {
  const settings = useEngagementShootStore((s) => s.sharedBoard);
  const update = useEngagementShootStore((s) => s.updateSharedBoard);
  const addRecipient = useEngagementShootStore((s) => s.addShareRecipient);
  const removeRecipient = useEngagementShootStore(
    (s) => s.removeShareRecipient,
  );
  const [copied, setCopied] = useState(false);

  const pseudoUrl = `ananya.app/shoot/priya-arjun`;

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(pseudoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — no-op
    }
  }

  return (
    <Section
      eyebrow="SHARE"
      title="Send this to your photographer"
      description="Read-only view — all the planning in one link. They can reference the mood board, pins, shots, outfits, and timeline."
    >
      <div className="space-y-4">
        <div>
          <Label>Board title</Label>
          <div className="mt-1.5">
            <TextInput
              value={settings.shareTitle}
              onChange={(v) => update({ shareTitle: v })}
              placeholder="Priya + Arjun · Engagement Shoot"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-border bg-ivory-warm/30 p-3">
          <div className="flex-1">
            <Label>Share link</Label>
            <p className="mt-0.5 font-mono text-[12px] text-ink">
              {pseudoUrl}
            </p>
          </div>
          <label className="flex items-center gap-2 text-[12px] text-ink">
            <input
              type="checkbox"
              checked={settings.shareEnabled}
              onChange={(e) => update({ shareEnabled: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron/40"
            />
            Enable sharing
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            {copied ? (
              <>
                <Check size={12} strokeWidth={2} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={1.8} />
                Copy
              </>
            )}
          </button>
        </div>

        <div>
          <Label>Recipients</Label>
          <form
            className="mt-1.5 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const input = form.elements.namedItem(
                "recipient",
              ) as HTMLInputElement;
              if (input.value.trim()) {
                addRecipient(input.value);
                input.value = "";
              }
            }}
          >
            <input
              type="email"
              name="recipient"
              placeholder="photographer@email.com"
              className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Plus size={12} strokeWidth={2} />
              Add
            </button>
          </form>
          {settings.shareRecipients.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {settings.shareRecipients.map((email) => (
                <li
                  key={email}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-[12px] text-ink"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => removeRecipient(email)}
                    aria-label={`Remove ${email}`}
                    className="text-ink-faint hover:text-rose"
                  >
                    <Trash2 size={10} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Send size={12} strokeWidth={1.8} />
            Send to photographer
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <Download size={12} strokeWidth={1.8} />
            Export PDF
          </button>
        </div>
      </div>
    </Section>
  );
}

// ── Cover card ─────────────────────────────────────────────────────────────

function CoverCard() {
  const cover = useEngagementShootStore((s) => s.sharedBoard.coverImageUrl);
  const title = useEngagementShootStore((s) => s.sharedBoard.shareTitle);
  const direction = useEngagementShootStore(
    (s) => s.moodBoard.directionTitle,
  );
  const vision = useEngagementShootStore((s) => s.vision);
  const looks = useEngagementShootStore((s) => s.looks.length);
  const locations = useEngagementShootStore((s) => s.locations.length);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="relative aspect-[5/2] bg-gradient-to-br from-saffron/30 via-gold-pale/40 to-ivory-warm">
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Engagement shoot · {direction}
          </p>
          <h3 className="mt-1 font-serif text-[28px] leading-tight text-white drop-shadow">
            {title || "Your engagement shoot"}
          </h3>
        </div>
      </div>
      <div className="p-5">
        <SummaryRow
          items={[
            { label: "Date", value: vision.shootDate || "—" },
            { label: "Destination", value: vision.destinationIdea || vision.localCity || "—" },
            { label: "Looks", value: String(looks) },
            { label: "Locations", value: String(locations) },
          ]}
        />
      </div>
    </section>
  );
}

// ── Direction card ─────────────────────────────────────────────────────────

function DirectionCard() {
  const mood = useEngagementShootStore((s) => s.moodBoard);

  const pinsBySection = new Map<string, typeof mood.pins>();
  for (const pin of mood.pins) {
    if (!pinsBySection.has(pin.section))
      pinsBySection.set(pin.section, []);
    pinsBySection.get(pin.section)!.push(pin);
  }

  return (
    <Section
      eyebrow="CREATIVE DIRECTION"
      title={mood.directionTitle}
      description={mood.directionParagraph}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-md bg-ivory-warm/40 p-3">
            <Label>Palette</Label>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">
              {mood.paletteNote || "—"}
            </p>
          </div>
          <div className="rounded-md bg-rose-pale/20 p-3">
            <Label>Avoid</Label>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">
              {mood.avoidNote || "—"}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-white p-3">
          <Label>Photographer brief</Label>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">
            {mood.photographerBrief || "—"}
          </p>
        </div>

        {Array.from(pinsBySection.entries()).map(([section, pins]) => (
          <div key={section}>
            <Label>
              {MOODBOARD_SECTION_LABEL[
                section as keyof typeof MOODBOARD_SECTION_LABEL
              ] ?? section}
            </Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  className="aspect-[4/5] overflow-hidden rounded-md border border-border bg-gradient-to-br from-ivory-warm to-gold-pale/30 p-2"
                >
                  <span className="font-serif text-[11.5px] leading-snug text-ink/70">
                    {pin.caption}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Outfits card ───────────────────────────────────────────────────────────

function OutfitsCard() {
  const looks = useEngagementShootStore((s) => s.looks);
  const items = useEngagementShootStore((s) => s.outfitItems);

  const sorted = [...looks].sort((a, b) => a.index - b.index);

  return (
    <Section eyebrow="OUTFITS" title="Looks in order">
      <div className="space-y-3">
        {sorted.map((look) => {
          const lookItems = items.filter((i) => i.lookId === look.id);
          return (
            <div
              key={look.id}
              className="rounded-md border border-border bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-serif text-[15px] text-ink">
                  Look {look.index} · {look.name}
                </h4>
                <span
                  className="font-mono text-[10.5px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {look.estimatedMinutes} min
                </span>
              </div>
              {look.concept && (
                <p className="mt-1 text-[12.5px] italic text-ink-muted">
                  {look.concept}
                </p>
              )}
              <div className="mt-3 grid grid-cols-1 gap-2 text-[12.5px] leading-relaxed text-ink md:grid-cols-2">
                <div>
                  <strong className="text-ink">P1:</strong>{" "}
                  {look.partner1Direction || "—"}
                </div>
                <div>
                  <strong className="text-ink">P2:</strong>{" "}
                  {look.partner2Direction || "—"}
                </div>
              </div>
              {look.hairMakeupNote && (
                <p className="mt-2 text-[12px] text-ink-muted">
                  <strong className="text-ink">HMUA:</strong>{" "}
                  {look.hairMakeupNote}
                </p>
              )}
              {lookItems.length > 0 && (
                <ul className="mt-3 space-y-1 text-[12px] text-ink-muted">
                  {lookItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-ink-faint" />
                      {item.title}{" "}
                      <span className="text-ink-faint">
                        · {ITEM_STATUS_LABEL[item.status]}
                        {item.priceCents > 0
                          ? ` · ${formatMoney(item.priceCents)}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ── Locations card ─────────────────────────────────────────────────────────

function LocationsCard() {
  const locations = useEngagementShootStore((s) => s.locations);
  const sorted = [...locations].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Section eyebrow="LOCATIONS" title="Where you're shooting">
      <div className="space-y-2">
        {sorted.map((loc, i) => (
          <div
            key={loc.id}
            className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-md border border-border bg-white p-3"
          >
            <span
              className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ivory"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {i + 1}
            </span>
            <div>
              <h4 className="font-serif text-[14px] text-ink">{loc.name}</h4>
              {loc.address && (
                <p className="text-[11.5px] text-ink-muted">{loc.address}</p>
              )}
              {loc.whyItWorks && (
                <p className="mt-1 text-[12.5px] text-ink">{loc.whyItWorks}</p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-3 text-[11.5px] text-ink-muted">
                {loc.bestTime && (
                  <span>
                    <strong className="text-ink">When:</strong> {loc.bestTime}
                  </span>
                )}
                {loc.permitNote && (
                  <span>
                    <strong className="text-ink">Permit:</strong>{" "}
                    {loc.permitNote}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Timeline card ──────────────────────────────────────────────────────────

function TimelineCard() {
  const runSheet = useEngagementShootStore((s) => s.runSheet);
  const sorted = [...runSheet].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Section eyebrow="DAY-OF TIMELINE" title="Condensed run sheet">
      <ul className="space-y-1.5">
        {sorted.map((entry) => (
          <li
            key={entry.id}
            className="grid grid-cols-[90px_1fr] items-start gap-3 border-b border-border/40 py-1.5 last:border-b-0"
          >
            <div className="text-right">
              <div className="font-serif text-[13px] leading-tight text-ink tabular-nums">
                {entry.time}
              </div>
              <div
                className="font-mono text-[9.5px] text-ink-faint tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {entry.durationMinutes} min
              </div>
            </div>
            <div>
              <p className="text-[13px] text-ink">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  {RUN_SHEET_KIND_LABEL[entry.kind]} ·
                </span>{" "}
                {entry.title}
              </p>
              {entry.detail && (
                <p className="text-[11.5px] text-ink-muted">{entry.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── Kit card ───────────────────────────────────────────────────────────────

function KitCard() {
  const kit = useEngagementShootStore((s) => s.emergencyKit);
  return (
    <Section eyebrow="EMERGENCY KIT" title="Bring these">
      <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
        {kit.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-md border border-border/60 bg-white px-3 py-1.5 text-[12.5px] text-ink"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                item.packed ? "bg-sage" : "bg-border"
              }`}
              aria-hidden
            />
            {item.label}
          </li>
        ))}
      </ul>
    </Section>
  );
}
