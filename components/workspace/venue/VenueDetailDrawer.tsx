"use client";

// ── Venue Detail Drawer ───────────────────────────────────────────────────
// Right-side slide-in overlay, opened from any ShortlistVenue card on the
// Shortlist tab. Four tabs:
//   · Overview       — hero, contact info, status, dates, virtual tour link
//   · Questionnaire  — structured fields + "questions to ask" checklist
//   · Notes          — rich notes + planner notes
//   · Pre-visit      — a lightweight summary of prep from recent site visits
//
// Nothing here writes fields that don't already live on the ShortlistVenue
// type. The drawer is a fuller-fidelity editor over the same record the
// card shows.

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  NotebookPen,
  Phone,
  Play,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVenueStore } from "@/stores/venue-store";
import {
  VENUE_STATUS_LABEL,
  type ShortlistVenue,
  type VenueStatus,
} from "@/types/venue";
import {
  VENUE_QUESTIONNAIRE_CHECKLIST,
  VENUE_STATUS_ORDER,
} from "@/lib/venue/questionnaire";
import { Eyebrow } from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";

type DrawerTab = "overview" | "questionnaire" | "notes" | "visits";

export function VenueDetailDrawer({
  venueId,
  onClose,
}: {
  venueId: string | null;
  onClose: () => void;
}) {
  const venue = useVenueStore((s) =>
    venueId ? s.shortlist.find((v) => v.id === venueId) ?? null : null,
  );
  const [tab, setTab] = useState<DrawerTab>("overview");

  // Close on Escape.
  useEffect(() => {
    if (!venueId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [venueId, onClose]);

  if (!venueId || !venue) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={`${venue.name} details`}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-ink/25 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <aside className="flex w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
        <DrawerHeader venue={venue} onClose={onClose} />
        <DrawerTabs tab={tab} onChange={setTab} venue={venue} />
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && <OverviewTab venue={venue} />}
          {tab === "questionnaire" && <QuestionnaireTab venue={venue} />}
          {tab === "notes" && <NotesTab venue={venue} />}
          {tab === "visits" && <VisitsTab venue={venue} />}
        </div>
      </aside>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────

function DrawerHeader({
  venue,
  onClose,
}: {
  venue: ShortlistVenue;
  onClose: () => void;
}) {
  const setStatus = useVenueStore((s) => s.setVenueStatus);
  const update = useVenueStore((s) => s.updateShortlistVenue);

  return (
    <header className="relative border-b border-border">
      <div className="relative h-40 bg-ivory-warm">
        {venue.hero_image_url ? (
          <img
            src={venue.hero_image_url}
            alt={venue.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink-muted shadow hover:text-ink"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex items-start justify-between gap-3 px-6 py-4">
        <div className="min-w-0 flex-1">
          <InlineText
            value={venue.name}
            onSave={(n) => update(venue.id, { name: n })}
            className="!p-0"
            editClassName="text-[20px]"
            readOnlyClassName="text-[20px] font-bold leading-tight text-ink"
          />
          <p className="mt-0.5 text-[12.5px] text-ink-muted">{venue.location}</p>
        </div>
        <StatusSelector
          status={venue.status}
          onChange={(s) => setStatus(venue.id, s)}
        />
      </div>
    </header>
  );
}

function StatusSelector({
  status,
  onChange,
}: {
  status: VenueStatus;
  onChange: (s: VenueStatus) => void;
}) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as VenueStatus)}
      className="rounded-sm border border-border bg-white px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink focus:border-saffron focus:outline-none"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {VENUE_STATUS_ORDER.map((s) => (
        <option key={s.id} value={s.id}>
          {VENUE_STATUS_LABEL[s.id]}
        </option>
      ))}
    </select>
  );
}

// ── Tabs nav ──────────────────────────────────────────────────────────────

function DrawerTabs({
  tab,
  onChange,
  venue,
}: {
  tab: DrawerTab;
  onChange: (t: DrawerTab) => void;
  venue: ShortlistVenue;
}) {
  const totalQs = VENUE_QUESTIONNAIRE_CHECKLIST.reduce(
    (n, g) => n + g.items.length,
    0,
  );
  const askedCount = venue.questions_asked.length;

  const tabs: Array<{ id: DrawerTab; label: string; badge?: string }> = [
    { id: "overview", label: "Overview" },
    {
      id: "questionnaire",
      label: "Questionnaire",
      badge: `${askedCount}/${totalQs}`,
    },
    { id: "notes", label: "Notes" },
    { id: "visits", label: "Pre-visit" },
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-border bg-ivory-warm/30 px-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "relative flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
            tab === t.id
              ? "border-saffron text-saffron"
              : "border-transparent text-ink-muted hover:text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {t.label}
          {t.badge && (
            <span className="rounded-full bg-ink-faint/20 px-1.5 py-0.5 text-[9px]">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────

function OverviewTab({ venue }: { venue: ShortlistVenue }) {
  const update = useVenueStore((s) => s.updateShortlistVenue);

  return (
    <div className="space-y-5 p-6">
      <section>
        <Eyebrow>Vibe</Eyebrow>
        <div className="mt-1 rounded-md border border-border bg-ivory-warm/40 p-3">
          <InlineText
            value={venue.vibe_summary}
            onSave={(n) => update(venue.id, { vibe_summary: n })}
            variant="block"
            allowEmpty
            multilineRows={2}
            placeholder="One-line feel for this venue — the feeling you get walking in."
            emptyLabel="Click to describe the vibe…"
            className="!p-0 font-serif text-[14px] italic leading-relaxed text-ink"
          />
        </div>
      </section>

      <section>
        <Eyebrow>Contact</Eyebrow>
        <div className="mt-1 space-y-2">
          <ContactRow
            icon={<Globe size={12} />}
            value={venue.website}
            placeholder="https://venue.com"
            onSave={(n) => update(venue.id, { website: n })}
            asLink
          />
          <ContactRow
            icon={<Phone size={12} />}
            value={venue.contact_phone}
            placeholder="+91 xxx xxx xxxx"
            onSave={(n) => update(venue.id, { contact_phone: n })}
          />
          <ContactRow
            icon={<Mail size={12} />}
            value={venue.contact_email}
            placeholder="weddings@venue.com"
            onSave={(n) => update(venue.id, { contact_email: n })}
          />
        </div>
      </section>

      <section>
        <Eyebrow>Outreach timeline</Eyebrow>
        <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
          <DateField
            label="Date contacted"
            value={venue.date_contacted}
            onSave={(n) => update(venue.id, { date_contacted: n })}
          />
          <DateField
            label="Site visit date"
            value={venue.site_visit_date}
            onSave={(n) => update(venue.id, { site_visit_date: n })}
          />
        </div>
      </section>

      <section>
        <Eyebrow>Virtual walkthrough</Eyebrow>
        <div className="mt-1 rounded-md border border-border bg-white p-3">
          <input
            type="url"
            value={venue.virtual_tour_url}
            onChange={(e) =>
              update(venue.id, { virtual_tour_url: e.target.value })
            }
            placeholder="https://venue.com/360-tour or YouTube / Vimeo link"
            className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-saffron focus:outline-none"
          />
          {venue.virtual_tour_url.trim() && (
            <a
              href={venue.virtual_tour_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-sm border border-saffron bg-saffron-pale/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-saffron hover:bg-saffron-pale/60"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Play size={11} /> Start virtual tour
              <ExternalLink size={9} />
            </a>
          )}
          {!venue.virtual_tour_url.trim() && (
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] italic text-ink-faint">
              <Video size={11} /> Paste a 360° tour or walkthrough video link
              so you can revisit before your site visit.
            </p>
          )}
        </div>
      </section>

      <section>
        <Eyebrow>Availability</Eyebrow>
        <div className="mt-1 rounded-md border border-border bg-white p-3">
          <InlineText
            value={venue.availability_notes}
            onSave={(n) => update(venue.id, { availability_notes: n })}
            variant="block"
            allowEmpty
            multilineRows={2}
            placeholder="Preferred booking window, currently held dates, etc."
            emptyLabel="Click to add availability notes…"
            className="!p-0 text-[12.5px] leading-relaxed"
          />
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  icon,
  value,
  placeholder,
  onSave,
  asLink,
}: {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onSave: (n: string) => void;
  asLink?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-[12.5px]">
      <span className="text-ink-faint">{icon}</span>
      <div className="flex-1">
        <InlineText
          value={value}
          onSave={onSave}
          allowEmpty
          placeholder={placeholder}
          className="!p-0 text-[12.5px]"
        />
      </div>
      {asLink && value.trim() && (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="text-saffron hover:text-ink"
          aria-label="Open link"
        >
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (n: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
      <Calendar size={12} className="text-ink-faint" />
      <span
        className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onSave(e.target.value)}
        className="ml-auto bg-transparent text-[12px] text-ink focus:outline-none"
      />
    </label>
  );
}

// ── Questionnaire ────────────────────────────────────────────────────────

const QUESTIONNAIRE_FIELD_MAP: Array<{
  fieldKey: keyof ShortlistVenue;
  label: string;
  placeholder: string;
  questionId: string;
}> = [
  {
    fieldKey: "seated_capacity",
    label: "Max seated capacity",
    placeholder: "e.g. 320 seated (ballroom)",
    questionId: "seated",
  },
  {
    fieldKey: "cocktail_capacity",
    label: "Max cocktail capacity",
    placeholder: "e.g. 500 standing",
    questionId: "cocktail",
  },
  {
    fieldKey: "outdoor_ceremony_capacity",
    label: "Outdoor ceremony capacity",
    placeholder: "e.g. 300 on the lawn",
    questionId: "outdoor_ceremony",
  },
  {
    fieldKey: "num_spaces",
    label: "Distinct event spaces",
    placeholder: "e.g. 4 event spaces",
    questionId: "spaces",
  },
  {
    fieldKey: "capacity",
    label: "Capacity (summary)",
    placeholder: "Cap 500",
    questionId: "seated",
  },
  {
    fieldKey: "catering_policy",
    label: "Catering policy",
    placeholder: "In-house, outside, preferred list…",
    questionId: "catering_policy",
  },
  {
    fieldKey: "alcohol_policy",
    label: "Alcohol policy",
    placeholder: "Venue bar / outside / both",
    questionId: "alcohol_policy",
  },
  {
    fieldKey: "corkage_fee",
    label: "Corkage fee",
    placeholder: "$ / bottle",
    questionId: "corkage",
  },
  {
    fieldKey: "fire_policy",
    label: "Havan / fire policy",
    placeholder: "Allowed where?",
    questionId: "fire",
  },
  {
    fieldKey: "permits",
    label: "Permits — who pulls?",
    placeholder: "Venue / couple",
    questionId: "permit",
  },
  {
    fieldKey: "noise_curfew",
    label: "Noise curfew",
    placeholder: "Indoor X AM · outdoor Y PM",
    questionId: "curfew",
  },
  {
    fieldKey: "rooms",
    label: "Rooms on-site",
    placeholder: "e.g. 80 rooms",
    questionId: "rooms",
  },
  {
    fieldKey: "minimum_night_stay",
    label: "Room block / min stay",
    placeholder: "e.g. 2-night min",
    questionId: "room_block",
  },
  {
    fieldKey: "parking_capacity",
    label: "Parking capacity",
    placeholder: "Spots + valet",
    questionId: "parking",
  },
  {
    fieldKey: "load_in_window",
    label: "Load-in window",
    placeholder: "e.g. 24 hrs before",
    questionId: "loadin",
  },
  {
    fieldKey: "loading_dock",
    label: "Service entrance / dock",
    placeholder: "Where and when?",
    questionId: "dock",
  },
  {
    fieldKey: "cost_note",
    label: "Venue fee + per-plate",
    placeholder: "$xxK + $xx/plate",
    questionId: "fee",
  },
  {
    fieldKey: "included_in_fee",
    label: "Included in the fee",
    placeholder: "Tables, chairs, linens, AV…",
    questionId: "included",
  },
];

function QuestionnaireTab({ venue }: { venue: ShortlistVenue }) {
  const update = useVenueStore((s) => s.updateShortlistVenue);
  const toggleAsked = useVenueStore((s) => s.toggleVenueQuestionAsked);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-md border border-gold/30 bg-gold-pale/10 p-4">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-saffron" />
          <Eyebrow>How this works</Eyebrow>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
          Send this questionnaire to the venue, or fill it in as you talk to
          them. Fields here feed the venue card, comparison table, and
          pre-visit prep. Tick each question off as you ask it.
        </p>
      </div>

      {VENUE_QUESTIONNAIRE_CHECKLIST.map((group) => (
        <section key={group.id} className="space-y-3">
          <div>
            <Eyebrow>{group.title}</Eyebrow>
            {group.description && (
              <p className="mt-0.5 text-[11.5px] italic text-ink-muted">
                {group.description}
              </p>
            )}
          </div>

          <ul className="space-y-1.5">
            {group.items.map((item) => {
              const asked = venue.questions_asked.includes(item.id);
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-2 rounded-sm border border-border/60 bg-white px-2.5 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => toggleAsked(venue.id, item.id)}
                    className={cn(
                      "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                      asked
                        ? "border-saffron bg-saffron text-ivory"
                        : "border-border bg-white text-transparent hover:border-saffron",
                    )}
                    aria-label={asked ? "Asked" : "Not asked yet"}
                  >
                    <span className="text-[10px] font-bold">✓</span>
                  </button>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-[12.5px] leading-snug",
                        asked ? "text-ink-muted line-through" : "text-ink",
                      )}
                    >
                      {item.label}
                    </p>
                    {item.hint && (
                      <p className="mt-0.5 text-[11px] italic text-ink-faint">
                        {item.hint}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="space-y-3">
        <Eyebrow>Answers / data</Eyebrow>
        <p className="text-[11.5px] italic text-ink-muted">
          Fill these in as you gather answers — they flow into the venue card
          and comparison table.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {QUESTIONNAIRE_FIELD_MAP.map((f) => (
            <div
              key={f.fieldKey as string}
              className="rounded-md border border-border bg-white px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {f.label}
                </span>
                {venue.questions_asked.includes(f.questionId) && (
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-saffron"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    asked ✓
                  </span>
                )}
              </div>
              <div className="mt-1">
                <InlineText
                  value={(venue[f.fieldKey] as string) || ""}
                  onSave={(n) =>
                    update(venue.id, { [f.fieldKey]: n } as Partial<ShortlistVenue>)
                  }
                  allowEmpty
                  placeholder={f.placeholder}
                  className="!p-0 text-[12.5px]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Notes ─────────────────────────────────────────────────────────────────

function NotesTab({ venue }: { venue: ShortlistVenue }) {
  const update = useVenueStore((s) => s.updateShortlistVenue);

  return (
    <div className="space-y-5 p-6">
      <section>
        <div className="flex items-center gap-1.5">
          <NotebookPen size={12} className="text-saffron" />
          <Eyebrow>Your notes</Eyebrow>
        </div>
        <div className="mt-1.5 rounded-md border border-border bg-white p-4">
          <InlineText
            value={venue.your_notes}
            onSave={(n) => update(venue.id, { your_notes: n })}
            variant="block"
            allowEmpty
            multilineRows={8}
            placeholder="Everything you notice, worry about, love. No structure needed — this is your brain dump."
            emptyLabel="Click to write venue notes…"
            className="!p-0 text-[13.5px] leading-relaxed"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-1.5">
          <FileText size={12} className="text-saffron" />
          <Eyebrow>Planner notes</Eyebrow>
        </div>
        <div className="mt-1.5 rounded-md border border-gold/20 bg-ivory-warm/40 p-4">
          <InlineText
            value={venue.planner_notes}
            onSave={(n) => update(venue.id, { planner_notes: n })}
            variant="block"
            allowEmpty
            multilineRows={5}
            placeholder="Planner's read on this venue."
            emptyLabel="Planner hasn't weighed in yet."
            className="!p-0 font-serif text-[13.5px] italic leading-relaxed"
          />
        </div>
      </section>
    </div>
  );
}

// ── Pre-visit summary ─────────────────────────────────────────────────────

function VisitsTab({ venue }: { venue: ShortlistVenue }) {
  const allVisits = useVenueStore((s) => s.site_visits);
  const visits = useMemo(
    () => allVisits.filter((v) => v.venue_id === venue.id),
    [allVisits, venue.id],
  );

  return (
    <div className="space-y-5 p-6">
      <section>
        <Eyebrow>At-a-glance</Eyebrow>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <Stat
            label="Questions asked"
            value={`${venue.questions_asked.length}`}
          />
          <Stat
            label="Site visits logged"
            value={`${visits.length}`}
          />
          <Stat
            label="Status"
            value={VENUE_STATUS_LABEL[venue.status]}
          />
          <Stat
            label="Compare mode"
            value={venue.compare_checked ? "On" : "Off"}
          />
        </div>
      </section>

      {visits.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/30 p-4 text-[12.5px] italic text-ink-muted">
          No site visits logged for this venue yet. Head to the Site Visits tab
          and log one — the pre-visit prep quiz will prime you on what to look
          for before you walk in.
        </p>
      ) : (
        <section>
          <Eyebrow>Recent visits</Eyebrow>
          <ul className="mt-1.5 space-y-2">
            {visits.map((v) => (
              <li
                key={v.id}
                className="rounded-md border border-border bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-ink">
                    Visit {v.visit_index} · {v.date || "date TBD"}
                  </p>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {v.photos.length} photos · {v.rating ?? "—"}/5
                  </span>
                </div>
                {v.visit_summary ? (
                  <p className="mt-1 font-serif text-[13px] italic leading-relaxed text-ink-muted">
                    {v.visit_summary}
                  </p>
                ) : (
                  <p className="mt-1 text-[11.5px] italic text-ink-faint">
                    No summary yet — generate one on the Site Visits tab.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-[18px] leading-none text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
    </div>
  );
}
