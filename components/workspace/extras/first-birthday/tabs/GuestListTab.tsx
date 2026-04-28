"use client";

// ── Guest List & RSVP tab ─────────────────────────────────────────────────
// Family-unit tracker: one row per household, with adults + kids nested
// inside. Per-person allergy/dietary fields, aggregate allergy dashboard,
// RSVP status, and contribution tracking (when funding model supports it).

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Link2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import type {
  FirstBirthdayFamily,
  FirstBirthdayGuestGroup,
  FirstBirthdayRsvp,
} from "@/types/first-birthday";
import { Label, Section, StatusPill, TextInput } from "../../bachelorette/ui";

const RSVP_OPTIONS: { value: FirstBirthdayRsvp; label: string }[] = [
  { value: "not_sent", label: "Not sent" },
  { value: "invited", label: "Invited" },
  { value: "going", label: "Going" },
  { value: "maybe", label: "Maybe" },
  { value: "declined", label: "Declined" },
];

const GROUP_OPTIONS: { value: FirstBirthdayGuestGroup; label: string }[] = [
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "coworkers", label: "Coworkers" },
  { value: "neighbors", label: "Neighbors" },
  { value: "daycare", label: "Daycare / Parent friends" },
  { value: "other", label: "Other" },
];

function rsvpTone(rsvp: FirstBirthdayRsvp): "sage" | "gold" | "rose" | "muted" {
  if (rsvp === "going") return "sage";
  if (rsvp === "maybe") return "gold";
  if (rsvp === "declined") return "rose";
  return "muted";
}

function rsvpLabel(rsvp: FirstBirthdayRsvp): string {
  return RSVP_OPTIONS.find((o) => o.value === rsvp)?.label ?? rsvp;
}

export function GuestListTab() {
  return (
    <div className="space-y-5">
      <RosterStrip />
      <AllergyDashboard />
      <FamilyTable />
    </div>
  );
}

// ── Roster strip ──────────────────────────────────────────────────────────

function RosterStrip() {
  const families = useFirstBirthdayStore((s) => s.families);

  const stats = useMemo(() => {
    const invited = families.length;
    const going = families.filter((f) => f.rsvp === "going");
    const goingAdults = going.reduce((n, f) => n + f.adults.length, 0);
    const goingKids = going.reduce((n, f) => n + f.kids.length, 0);
    const notYet = families.filter((f) =>
      ["not_sent", "invited", "maybe"].includes(f.rsvp),
    ).length;
    const declined = families.filter((f) => f.rsvp === "declined").length;
    return { invited, going: going.length, goingAdults, goingKids, notYet, declined };
  }, [families]);

  return (
    <Section
      eyebrow="GUEST LIST"
      title={`${stats.invited} famil${stats.invited === 1 ? "y" : "ies"} invited · ${stats.goingAdults} adult${stats.goingAdults === 1 ? "" : "s"}, ${stats.goingKids} kid${stats.goingKids === 1 ? "" : "s"} going · ${stats.notYet} pending · ${stats.declined} declined`}
      description="Track RSVPs by family. Expand a row to see adults + kids and note per-person dietary or allergy needs."
      right={
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Link2 size={13} strokeWidth={1.8} /> Copy RSVP link
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Send size={13} strokeWidth={1.8} /> Send RSVP link
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Families" value={stats.invited} tone="ink" />
        <Stat label="Going (families)" value={stats.going} tone="sage" />
        <Stat label="Adults going" value={stats.goingAdults} tone="ink" />
        <Stat label="Kids going" value={stats.goingKids} tone="ink" />
      </div>
    </Section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ink" | "sage" | "rose";
}) {
  const color =
    tone === "sage" ? "text-sage" : tone === "rose" ? "text-rose" : "text-ink";
  return (
    <div className="rounded-md border border-border bg-white px-4 py-3">
      <Label>{label}</Label>
      <p className={cn("mt-1 font-serif text-[22px] leading-none", color)}>
        {value}
      </p>
    </div>
  );
}

// ── Allergy dashboard ─────────────────────────────────────────────────────

function AllergyDashboard() {
  const families = useFirstBirthdayStore((s) => s.families);
  const babyAllergens = useFirstBirthdayStore((s) => s.plan.allergyFlags);

  const aggregated = useMemo(() => {
    const bucket = new Map<string, { count: number; kids: number; severity: string[] }>();
    for (const fam of families) {
      for (const ad of fam.adults) {
        if (ad.dietaryNotes.trim()) {
          addToken(bucket, ad.dietaryNotes, "adult");
        }
      }
      for (const kid of fam.kids) {
        if (kid.allergyNotes.trim()) {
          addToken(bucket, kid.allergyNotes, "kid");
        }
        if (kid.dietaryNotes.trim()) {
          addToken(bucket, kid.dietaryNotes, "kid");
        }
      }
    }
    for (const b of babyAllergens) {
      addToken(bucket, `${b.allergen} (baby)`, "kid");
    }
    return Array.from(bucket.entries())
      .map(([key, { count, kids }]) => ({ key, count, kids }))
      .sort((a, b) => b.count - a.count);
  }, [families, babyAllergens]);

  if (aggregated.length === 0) return null;

  return (
    <Section
      eyebrow="ALLERGY & DIETARY DASHBOARD"
      title="What to flag with the caterer"
      description="Aggregated from family rows. Share this list with the caterer — it's also the nut-free zone plan."
    >
      <ul className="flex flex-wrap gap-2">
        {aggregated.map(({ key, count, kids }) => (
          <li
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-rose-pale/20 px-3 py-1 text-[12px] text-ink"
          >
            <AlertTriangle size={11} strokeWidth={2} className="text-rose" />
            <span>{key}</span>
            <span className="font-mono text-[10px] text-ink-faint">
              · {count}{kids > 0 ? ` (${kids} kid${kids === 1 ? "" : "s"})` : ""}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function addToken(
  bucket: Map<string, { count: number; kids: number; severity: string[] }>,
  raw: string,
  who: "adult" | "kid",
) {
  const entry = bucket.get(raw) ?? { count: 0, kids: 0, severity: [] };
  entry.count += 1;
  if (who === "kid") entry.kids += 1;
  bucket.set(raw, entry);
}

// ── Family table ──────────────────────────────────────────────────────────

function FamilyTable() {
  const families = useFirstBirthdayStore((s) => s.families);
  const addFamily = useFirstBirthdayStore((s) => s.addFamily);
  const [draft, setDraft] = useState("");

  function commit() {
    if (!draft.trim()) return;
    addFamily(draft.trim());
    setDraft("");
  }

  return (
    <Section title="Families & guests">
      <ul className="space-y-2">
        {families.map((f) => (
          <FamilyRow key={f.id} family={f} />
        ))}
        {families.length === 0 && (
          <li className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-6 text-center text-[12.5px] italic text-ink-faint">
            No families added yet — start with the first household below.
          </li>
        )}
      </ul>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <TextInput
          value={draft}
          onChange={setDraft}
          placeholder="Family / household name (e.g. The Lees)"
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add family
        </button>
      </div>
    </Section>
  );
}

function FamilyRow({ family }: { family: FirstBirthdayFamily }) {
  const updateFamily = useFirstBirthdayStore((s) => s.updateFamily);
  const removeFamily = useFirstBirthdayStore((s) => s.removeFamily);
  const setRsvp = useFirstBirthdayStore((s) => s.setRsvp);
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="rounded-md border border-border bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-ink-faint hover:text-ink"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown size={14} strokeWidth={1.8} />
          ) : (
            <ChevronRight size={14} strokeWidth={1.8} />
          )}
        </button>
        <div className="min-w-[200px] flex-1">
          <TextInput
            value={family.familyName}
            onChange={(v) => updateFamily(family.id, { familyName: v })}
          />
          <p className="mt-1 text-[11px] text-ink-muted">
            {family.adults.length} adult{family.adults.length === 1 ? "" : "s"} ·{" "}
            {family.kids.length} kid{family.kids.length === 1 ? "" : "s"}
          </p>
        </div>
        <select
          value={family.group}
          onChange={(e) =>
            updateFamily(family.id, {
              group: e.target.value as FirstBirthdayGuestGroup,
            })
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {GROUP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <select
            value={family.rsvp}
            onChange={(e) => setRsvp(family.id, e.target.value as FirstBirthdayRsvp)}
            className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
          >
            {RSVP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <StatusPill tone={rsvpTone(family.rsvp)} label={rsvpLabel(family.rsvp)} />
        </div>
        <button
          type="button"
          aria-label={`Remove ${family.familyName}`}
          onClick={() => removeFamily(family.id)}
          className="shrink-0 text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>

      {expanded && <FamilyExpanded family={family} />}
    </li>
  );
}

function FamilyExpanded({ family }: { family: FirstBirthdayFamily }) {
  const updateFamily = useFirstBirthdayStore((s) => s.updateFamily);
  const addAdult = useFirstBirthdayStore((s) => s.addAdultToFamily);
  const updateAdult = useFirstBirthdayStore((s) => s.updateAdultInFamily);
  const removeAdult = useFirstBirthdayStore((s) => s.removeAdultFromFamily);
  const addKid = useFirstBirthdayStore((s) => s.addKidToFamily);
  const updateKid = useFirstBirthdayStore((s) => s.updateKidInFamily);
  const removeKid = useFirstBirthdayStore((s) => s.removeKidFromFamily);

  const [adultDraft, setAdultDraft] = useState("");
  const [kidDraft, setKidDraft] = useState("");
  const [kidAge, setKidAge] = useState("");

  return (
    <div className="space-y-4 border-t border-border/60 bg-ivory-warm/30 px-4 py-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label>Email</Label>
          <div className="mt-1">
            <TextInput
              value={family.contactEmail}
              onChange={(v) => updateFamily(family.id, { contactEmail: v })}
              placeholder="family@example.com"
            />
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <div className="mt-1">
            <TextInput
              value={family.contactPhone}
              onChange={(v) => updateFamily(family.id, { contactPhone: v })}
              placeholder="(555) 555-5555"
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Adults</Label>
        <ul className="mt-2 space-y-1.5">
          {family.adults.map((ad) => (
            <li
              key={ad.id}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5"
            >
              <TextInput
                value={ad.name}
                onChange={(v) => updateAdult(family.id, ad.id, { name: v })}
                placeholder="Name"
              />
              <TextInput
                value={ad.dietaryNotes}
                onChange={(v) =>
                  updateAdult(family.id, ad.id, { dietaryNotes: v })
                }
                placeholder="Dietary notes"
              />
              <button
                type="button"
                aria-label={`Remove ${ad.name}`}
                onClick={() => removeAdult(family.id, ad.id)}
                className="text-ink-faint hover:text-rose"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <TextInput
            value={adultDraft}
            onChange={setAdultDraft}
            placeholder="Add adult"
          />
          <button
            type="button"
            onClick={() => {
              if (!adultDraft.trim()) return;
              addAdult(family.id, adultDraft.trim());
              setAdultDraft("");
            }}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={2} /> Adult
          </button>
        </div>
      </div>

      <div>
        <Label>Kids (name + age in months)</Label>
        <ul className="mt-2 space-y-1.5">
          {family.kids.map((kid) => (
            <li
              key={kid.id}
              className="grid grid-cols-[1fr_80px_1fr_1fr_auto] items-center gap-2 rounded-md border border-border bg-white px-3 py-1.5"
            >
              <TextInput
                value={kid.name}
                onChange={(v) => updateKid(family.id, kid.id, { name: v })}
                placeholder="Name"
              />
              <input
                type="number"
                value={kid.ageMonths}
                onChange={(e) =>
                  updateKid(family.id, kid.id, {
                    ageMonths: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
                aria-label="Age in months"
                placeholder="mo"
              />
              <TextInput
                value={kid.allergyNotes}
                onChange={(v) =>
                  updateKid(family.id, kid.id, { allergyNotes: v })
                }
                placeholder="Allergies"
              />
              <TextInput
                value={kid.dietaryNotes}
                onChange={(v) =>
                  updateKid(family.id, kid.id, { dietaryNotes: v })
                }
                placeholder="Dietary"
              />
              <button
                type="button"
                aria-label={`Remove ${kid.name}`}
                onClick={() => removeKid(family.id, kid.id)}
                className="text-ink-faint hover:text-rose"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-[1fr_100px_auto] gap-2">
          <TextInput
            value={kidDraft}
            onChange={setKidDraft}
            placeholder="Add kid"
          />
          <input
            type="number"
            value={kidAge}
            onChange={(e) => setKidAge(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            aria-label="Age in months"
            placeholder="Age (mo)"
          />
          <button
            type="button"
            onClick={() => {
              if (!kidDraft.trim()) return;
              addKid(family.id, kidDraft.trim(), Number(kidAge) || 0);
              setKidDraft("");
              setKidAge("");
            }}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={12} strokeWidth={2} /> Kid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label>Accessibility notes</Label>
          <div className="mt-1">
            <TextInput
              value={family.accessibilityNotes}
              onChange={(v) =>
                updateFamily(family.id, { accessibilityNotes: v })
              }
              placeholder="Mobility, sensory, etc."
            />
          </div>
        </div>
        <div>
          <Label>RSVP message</Label>
          <div className="mt-1">
            <TextInput
              value={family.rsvpMessage}
              onChange={(v) => updateFamily(family.id, { rsvpMessage: v })}
              placeholder="What they wrote when they RSVP'd"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
