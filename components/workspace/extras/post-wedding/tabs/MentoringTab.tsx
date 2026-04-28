"use client";

// ── Mentoring tab (Post-Wedding) ───────────────────────────────────────────
// "Ask a Married Bride" — opt-in flow for the mentor side. Three states:
//   1. No mentor profile  → invitation + setup form
//   2. Active profile     → dashboard with pending requests, mentees, stats
//   3. Deactivated/paused → minimal view with reactivate CTA
// Dashboard handles accept/decline/complete inline so the mentor never has
// to leave this canvas.

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Mic,
  Pause,
  Play,
  Power,
  Star,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import {
  useMentoringStore,
  type MentorProfileDraft,
} from "@/stores/mentoring-store";
import {
  BUDGET_RANGES,
  EXPERTISE_CATEGORY_LABELS,
  EXPERTISE_TAGS,
  type BudgetRange,
  type ExpertiseCategory,
  type MentorCommPref,
  type MentorProfile,
  type MentorshipMatch,
} from "@/types/mentoring";
import {
  EmptyState,
  PillButton,
  PrimaryButton,
  SecondaryButton,
  Section,
  TextArea,
  TextInput,
} from "../ui";

export function MentoringTab() {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useCommunityProfilesStore((s) =>
    s.myProfileId ? s.profiles.find((p) => p.id === s.myProfileId) : undefined,
  );

  const mentors = useMentoringStore((s) => s.mentors);
  const expireStale = useMentoringStore((s) => s.expireStalePending);
  useEffect(() => {
    expireStale();
  }, [expireStale]);

  const myMentor = useMemo(
    () => (myProfileId ? mentors.find((m) => m.profile_id === myProfileId) : undefined),
    [mentors, myProfileId],
  );

  if (!myProfileId || !myProfile) {
    return (
      <EmptyState
        title="set up your community profile first"
        body="Mentoring runs through your community profile. Head to Community → Brides to set one up, then come back."
      />
    );
  }

  if (!myMentor || !myMentor.is_active) {
    return <MentorInvitation profileId={myProfileId} existing={myMentor} />;
  }

  return <MentorDashboard mentor={myMentor} />;
}

// ── Invitation + setup ─────────────────────────────────────────────────────

function MentorInvitation({
  profileId,
  existing,
}: {
  profileId: string;
  existing: MentorProfile | undefined;
}) {
  const [mode, setMode] = useState<"pitch" | "form">("pitch");
  const createMentorProfile = useMentoringStore((s) => s.createMentorProfile);
  const reactivateMentor = useMentoringStore((s) => s.reactivateMentor);
  const myProfile = useCommunityProfilesStore((s) =>
    s.myProfileId ? s.profiles.find((p) => p.id === s.myProfileId) : undefined,
  );

  if (mode === "pitch") {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-saffron/30 bg-gradient-to-br from-saffron/10 via-ivory-warm/40 to-white px-6 py-7">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — become a mentor —
          </p>
          <h2 className="mt-2 font-serif text-[22px] leading-snug text-ink">
            you&rsquo;ve been through it — help the next bride.
          </h2>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            planning a wedding is overwhelming, and the best advice comes from
            someone who just did it. get matched with brides planning weddings
            like yours — same city, similar style, shared culture — and
            answer the questions they can&rsquo;t google.
          </p>

          <div className="mt-5 grid gap-3 rounded-lg border border-gold/15 bg-white/70 p-4 text-[13px] leading-relaxed text-ink md:grid-cols-2">
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                What you get
              </p>
              <ul className="mt-1.5 space-y-1 text-[12.5px]">
                <li>💛 a mentor badge on your community profile</li>
                <li>💬 connect with brides who need your specific advice</li>
                <li>🎙️ host huddles and join live events as a guest</li>
                <li>🌟 stay part of the community you built during planning</li>
              </ul>
            </div>
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                What you commit to
              </p>
              <p className="mt-1.5 text-[12.5px] italic">
                respond within a few days. be honest and kind. that&rsquo;s it.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <PrimaryButton onClick={() => setMode("form")}>
              {existing ? "Reactivate mentor profile →" : "Set up my mentor profile →"}
            </PrimaryButton>
            {existing && (
              <SecondaryButton
                onClick={() => {
                  reactivateMentor(existing.id);
                }}
              >
                Keep old profile, just reactivate
              </SecondaryButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MentorProfileForm
      initial={existing}
      defaultDisplayName={myProfile?.display_name ?? "You"}
      defaultCity={myProfile?.wedding_city}
      defaultWeddingDate={myProfile?.wedding_date}
      onCancel={() => setMode("pitch")}
      onSave={(draft) => {
        createMentorProfile(profileId, draft);
      }}
    />
  );
}

// ── Profile form ───────────────────────────────────────────────────────────

function MentorProfileForm({
  initial,
  defaultDisplayName,
  defaultCity,
  defaultWeddingDate,
  onCancel,
  onSave,
}: {
  initial: MentorProfile | undefined;
  defaultDisplayName: string;
  defaultCity: string | undefined;
  defaultWeddingDate: string | undefined;
  onCancel: () => void;
  onSave: (draft: MentorProfileDraft) => void;
}) {
  const [expertise, setExpertise] = useState<string[]>(
    initial?.expertise_tags ?? [],
  );
  const [maxMentees, setMaxMentees] = useState<number>(
    initial?.max_active_mentees ?? 3,
  );
  const [comm, setComm] = useState<MentorCommPref[]>(
    initial?.preferred_communication ?? ["chat", "huddle"],
  );
  const [availability, setAvailability] = useState(
    initial?.availability_note ?? "",
  );
  const [wish, setWish] = useState(initial?.one_thing_i_wish ?? "");
  const [bestDecision, setBestDecision] = useState(initial?.best_decision ?? "");
  const [surprise, setSurprise] = useState(initial?.biggest_surprise ?? "");

  const [displayName, setDisplayName] = useState(
    initial?.display_name ?? defaultDisplayName,
  );
  const [city, setCity] = useState(initial?.wedding_city ?? defaultCity ?? "");
  const [weddingDate, setWeddingDate] = useState(
    initial?.wedding_date ?? defaultWeddingDate ?? "",
  );
  const [guestCount, setGuestCount] = useState(
    initial?.guest_count?.toString() ?? "",
  );
  const [culture, setCulture] = useState<string[]>(
    initial?.cultural_tradition ?? ["south_asian"],
  );
  const [style, setStyle] = useState<string[]>(
    initial?.wedding_style ?? ["modern"],
  );
  const [budget, setBudget] = useState<BudgetRange | "">(
    initial?.budget_range ?? "",
  );
  const [numEvents, setNumEvents] = useState(
    initial?.number_of_events?.toString() ?? "",
  );

  const valid = expertise.length >= 3 && expertise.length <= 8;

  const toggle = <T,>(list: T[], v: T, setter: (n: T[]) => void) => {
    if (list.includes(v)) setter(list.filter((x) => x !== v));
    else setter([...list, v]);
  };

  return (
    <div className="space-y-5">
      <div>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — your mentor profile —
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
          this is what planning brides will see when deciding whether to reach
          out to you.
        </p>
      </div>

      {/* Expertise */}
      <Section
        eyebrow="What can you help with?"
        description="Pick 3–8 areas where you have real experience to share."
      >
        <div className="space-y-3">
          {(Object.keys(EXPERTISE_CATEGORY_LABELS) as ExpertiseCategory[]).map(
            (cat) => {
              const tags = EXPERTISE_TAGS.filter((t) => t.category === cat);
              return (
                <div key={cat}>
                  <p
                    className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {EXPERTISE_CATEGORY_LABELS[cat]}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => {
                      const on = expertise.includes(t.slug);
                      return (
                        <PillButton
                          key={t.slug}
                          active={on}
                          onClick={() => toggle(expertise, t.slug, setExpertise)}
                        >
                          {t.label}
                        </PillButton>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
          <p className="text-[11px] text-ink-faint">
            selected {expertise.length} / 8
            {expertise.length < 3 && " — pick at least 3"}
          </p>
        </div>
      </Section>

      {/* Three prompts */}
      <Section
        eyebrow="Three things every bride should know"
        description="Short, honest, specific. These rotate on your card in the directory."
      >
        <div className="space-y-4">
          <LabeledField
            label="The one thing I wish I'd known"
            value={wish}
            onChange={setWish}
            max={300}
            placeholder="e.g. your caterer will always cost more than the quote. always."
          />
          <LabeledField
            label="The best decision I made"
            value={bestDecision}
            onChange={setBestDecision}
            max={300}
            placeholder="e.g. hiring a day-of coordinator. worth every penny."
          />
          <LabeledField
            label="What surprised me most"
            value={surprise}
            onChange={setSurprise}
            max={300}
            placeholder="e.g. how fast the day goes. I barely ate."
          />
        </div>
      </Section>

      {/* Availability */}
      <Section
        eyebrow="Your availability"
        description="How many brides you'll take on at once and how you like to connect."
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-ink">
              Max mentees at a time
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxMentees(n)}
                  className={cn(
                    "h-8 w-8 rounded-full border text-[12px] font-medium transition-colors",
                    maxMentees === n
                      ? "border-ink bg-ink text-ivory"
                      : "border-border bg-white text-ink-muted hover:border-saffron/40",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[12px] font-medium text-ink">
              How to connect
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "chat", label: "Chat", icon: MessageCircle },
                  { id: "huddle", label: "Huddle (audio)", icon: Mic },
                  { id: "video", label: "Video call", icon: Video },
                ] as { id: MentorCommPref; label: string; icon: typeof MessageCircle }[]
              ).map((opt) => {
                const Icon = opt.icon;
                const on = comm.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(comm, opt.id, setComm)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                      on
                        ? "border-saffron bg-saffron/10 text-ink"
                        : "border-border bg-white text-ink-muted hover:border-saffron/40",
                    )}
                  >
                    <Icon size={12} strokeWidth={1.8} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <LabeledField
            label="Availability note (optional)"
            value={availability}
            onChange={setAvailability}
            max={200}
            placeholder="e.g. free most evenings after 7pm CST. not weekends."
            rows={2}
          />
        </div>
      </Section>

      {/* Wedding context */}
      <Section
        eyebrow="Wedding context"
        description="We use this to match you with brides planning similar weddings. Edit anything that's out of date."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Display name">
            <TextInput value={displayName} onChange={setDisplayName} />
          </Field>
          <Field label="Wedding city">
            <TextInput value={city} onChange={setCity} placeholder="Dallas, TX" />
          </Field>
          <Field label="Wedding date">
            <TextInput type="date" value={weddingDate} onChange={setWeddingDate} />
          </Field>
          <Field label="Guest count">
            <TextInput
              type="number"
              value={guestCount}
              onChange={setGuestCount}
              placeholder="150"
            />
          </Field>
          <Field label="Number of events">
            <TextInput
              type="number"
              value={numEvents}
              onChange={setNumEvents}
              placeholder="4"
            />
          </Field>
          <Field label="Budget range">
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as BudgetRange | "")}
              className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              <option value="">Prefer not to say</option>
              {BUDGET_RANGES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 space-y-2">
          <MultiChipField
            label="Cultural tradition"
            options={[
              { id: "south_asian", label: "south asian" },
              { id: "east_asian", label: "east asian" },
              { id: "western", label: "western" },
              { id: "latin_american", label: "latin american" },
              { id: "middle_eastern", label: "middle eastern" },
              { id: "african", label: "african" },
            ]}
            value={culture}
            onChange={setCulture}
          />
          <MultiChipField
            label="Wedding style"
            options={[
              { id: "modern", label: "modern" },
              { id: "traditional", label: "traditional" },
              { id: "fusion", label: "fusion" },
              { id: "minimal", label: "minimal" },
              { id: "maximalist", label: "maximalist" },
            ]}
            value={style}
            onChange={setStyle}
          />
        </div>
      </Section>

      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton
          disabled={!valid}
          onClick={() => {
            onSave({
              expertise_tags: expertise,
              max_active_mentees: maxMentees,
              preferred_communication: comm,
              availability_note: availability.trim() || undefined,
              one_thing_i_wish: wish.trim() || undefined,
              best_decision: bestDecision.trim() || undefined,
              biggest_surprise: surprise.trim() || undefined,
              display_name: displayName.trim(),
              wedding_city: city.trim() || undefined,
              wedding_date: weddingDate || undefined,
              guest_count: guestCount ? Number(guestCount) : undefined,
              cultural_tradition: culture,
              wedding_style: style,
              budget_range: (budget || undefined) as BudgetRange | undefined,
              number_of_events: numEvents ? Number(numEvents) : undefined,
            });
          }}
        >
          Go live as a mentor →
        </PrimaryButton>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function LabeledField({
  label,
  value,
  onChange,
  max,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-ink">{label}</span>
        <span className="text-[10.5px] text-ink-faint">
          {value.length} / {max}
        </span>
      </div>
      <TextArea
        value={value}
        onChange={(v) => onChange(v.slice(0, max))}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function MultiChipField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <p
        className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <PillButton
              key={o.id}
              active={on}
              onClick={() => {
                if (on) onChange(value.filter((v) => v !== o.id));
                else onChange([...value, o.id]);
              }}
            >
              {o.label}
            </PillButton>
          );
        })}
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function MentorDashboard({ mentor }: { mentor: MentorProfile }) {
  const pending = useMentoringStore((s) => s.getPendingForMentor(mentor.id));
  const active = useMentoringStore((s) => s.getActiveMenteesForMentor(mentor.id));
  const past = useMentoringStore((s) => s.getPastForMentor(mentor.id));
  const respond = useMentoringStore((s) => s.respondToRequest);
  const complete = useMentoringStore((s) => s.completeMatch);
  const pauseMentor = useMentoringStore((s) => s.pauseMentor);
  const unpauseMentor = useMentoringStore((s) => s.unpauseMentor);
  const deactivate = useMentoringStore((s) => s.deactivateMentor);

  const [editing, setEditing] = useState(false);
  const update = useMentoringStore((s) => s.updateMentorProfile);
  const myProfile = useCommunityProfilesStore((s) =>
    s.myProfileId ? s.profiles.find((p) => p.id === s.myProfileId) : undefined,
  );

  if (editing) {
    return (
      <MentorProfileForm
        initial={mentor}
        defaultDisplayName={myProfile?.display_name ?? mentor.display_name}
        defaultCity={myProfile?.wedding_city ?? mentor.wedding_city}
        defaultWeddingDate={myProfile?.wedding_date ?? mentor.wedding_date}
        onCancel={() => setEditing(false)}
        onSave={(draft) => {
          update(mentor.id, draft);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-saffron/30 bg-gradient-to-br from-saffron/5 via-ivory-warm/30 to-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              💛 your mentoring
            </p>
            <p className="mt-1 text-[13.5px] text-ink">
              {mentor.is_paused ? (
                <>
                  <span className="font-medium">paused</span> — active
                  mentorships continue but new requests are hidden.
                </>
              ) : (
                <>
                  active mentor · helping{" "}
                  <span className="font-medium">{active.length}</span> of{" "}
                  <span className="font-medium">{mentor.max_active_mentees}</span>{" "}
                  brides
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <SecondaryButton onClick={() => setEditing(true)}>
              Edit profile
            </SecondaryButton>
            {mentor.is_paused ? (
              <SecondaryButton
                icon={<Play size={12} strokeWidth={1.8} />}
                onClick={() => unpauseMentor(mentor.id)}
              >
                Unpause
              </SecondaryButton>
            ) : (
              <SecondaryButton
                icon={<Pause size={12} strokeWidth={1.8} />}
                onClick={() => pauseMentor(mentor.id)}
              >
                Pause
              </SecondaryButton>
            )}
            <SecondaryButton
              tone="danger"
              icon={<Power size={12} strokeWidth={1.8} />}
              onClick={() => {
                if (confirm("Deactivate your mentor profile? Active matches will be completed.")) {
                  deactivate(mentor.id);
                }
              }}
            >
              Deactivate
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* Pending */}
      <Section
        eyebrow={`Pending requests · ${pending.length}`}
        description={
          pending.length === 0
            ? "No open requests right now. When a bride asks, she'll land here."
            : "Respond within a few days. Requests expire after 7."
        }
      >
        {pending.length === 0 ? (
          <p className="text-[12.5px] italic text-ink-faint">nothing waiting.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((m) => (
              <PendingRequestCard
                key={m.id}
                match={m}
                onAccept={() => respond(m.id, "accept")}
                onDecline={() => respond(m.id, "decline")}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Active */}
      <Section
        eyebrow={`Active mentees · ${active.length}`}
        description="Open the chat to pick up the conversation."
      >
        {active.length === 0 ? (
          <p className="text-[12.5px] italic text-ink-faint">
            no active mentees yet.
          </p>
        ) : (
          <div className="space-y-2">
            {active.map((m) => (
              <ActiveMenteeCard
                key={m.id}
                match={m}
                onComplete={() => complete(m.id)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Past */}
      <Section
        eyebrow={`Past mentees · ${past.length}`}
        description="Thank-yous and receipts."
      >
        {past.length === 0 ? (
          <p className="text-[12.5px] italic text-ink-faint">
            you haven&rsquo;t completed any mentorships yet.
          </p>
        ) : (
          <div className="space-y-2">
            {past.map((m) => (
              <PastMenteeRow key={m.id} match={m} />
            ))}
          </div>
        )}
      </Section>

      {/* Stats */}
      <Section eyebrow="Your stats">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="brides helped" value={mentor.total_mentees_helped.toString()} />
          <Stat
            label="avg rating"
            value={
              mentor.avg_rating != null
                ? `${mentor.avg_rating.toFixed(1)} / 5`
                : "—"
            }
          />
          <Stat
            label="active now"
            value={`${active.length} / ${mentor.max_active_mentees}`}
          />
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2.5">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[20px] text-ink">{value}</p>
    </div>
  );
}

function PendingRequestCard({
  match,
  onAccept,
  onDecline,
}: {
  match: MentorshipMatch;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const mentee = useCommunityProfilesStore((s) =>
    s.profiles.find((p) => p.id === match.mentee_profile_id),
  );
  const requestedAgo = Math.round(
    (Date.now() - new Date(match.requested_at).getTime()) / (24 * 60 * 60 * 1000),
  );
  return (
    <div className="rounded-lg border border-border bg-ivory-warm/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">
            {mentee?.display_name ?? "A planning bride"}
            <span className="ml-2 text-[11.5px] font-normal text-ink-muted">
              · {mentee?.wedding_city ?? "unknown city"}
              {mentee?.wedding_date
                ? ` · ${new Date(mentee.wedding_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                : ""}
            </span>
          </p>
          {match.topics_interested_in.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {match.topics_interested_in.map((t) => (
                <TagChip key={t} slug={t} />
              ))}
            </div>
          )}
          {match.request_message && (
            <p className="mt-2 font-serif text-[12.5px] italic leading-relaxed text-ink">
              &ldquo;{match.request_message}&rdquo;
            </p>
          )}
          <p className="mt-2 text-[10.5px] text-ink-faint">
            requested {requestedAgo === 0 ? "today" : `${requestedAgo} day${requestedAgo === 1 ? "" : "s"} ago`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <PrimaryButton size="sm" onClick={onAccept} icon={<Heart size={12} strokeWidth={1.8} />}>
            Accept
          </PrimaryButton>
          <SecondaryButton size="sm" onClick={onDecline}>
            Decline
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function ActiveMenteeCard({
  match,
  onComplete,
}: {
  match: MentorshipMatch;
  onComplete: () => void;
}) {
  const mentee = useCommunityProfilesStore((s) =>
    s.profiles.find((p) => p.id === match.mentee_profile_id),
  );
  const since = match.responded_at
    ? new Date(match.responded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">
            {mentee?.display_name ?? "Mentee"}
            <span className="ml-2 text-[11.5px] font-normal text-ink-muted">
              {mentee?.wedding_city ? `· ${mentee.wedding_city}` : ""}
              {since ? ` · connected ${since}` : ""}
            </span>
          </p>
          {match.topics_interested_in.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {match.topics_interested_in.map((t) => (
                <TagChip key={t} slug={t} />
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {match.connection_id && (
            <a
              href={`/community?tab=connect&sub=brides&view=messages&thread=${match.connection_id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
            >
              <MessageCircle size={12} strokeWidth={1.8} />
              Open chat
            </a>
          )}
          <SecondaryButton
            size="sm"
            onClick={onComplete}
            icon={<CheckCircle2 size={12} strokeWidth={1.8} />}
          >
            Complete
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function PastMenteeRow({ match }: { match: MentorshipMatch }) {
  const mentee = useCommunityProfilesStore((s) =>
    s.profiles.find((p) => p.id === match.mentee_profile_id),
  );
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/60 bg-ivory-warm/20 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-ink">
          {mentee?.display_name ?? "A bride"}
          {match.mentee_rating && (
            <span className="ml-2 text-[11.5px] text-saffron">
              {"★".repeat(match.mentee_rating)}
              <span className="text-ink-faint">
                {"★".repeat(5 - match.mentee_rating)}
              </span>
            </span>
          )}
          {match.status === "declined" && (
            <span className="ml-2 text-[10.5px] text-ink-faint">· declined</span>
          )}
        </p>
        {match.mentee_feedback && (
          <p className="mt-0.5 font-serif text-[12px] italic text-ink-muted">
            &ldquo;{match.mentee_feedback}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function TagChip({ slug }: { slug: string }) {
  const tag = EXPERTISE_TAGS.find((t) => t.slug === slug);
  return (
    <span className="rounded-full border border-saffron/25 bg-saffron/5 px-2 py-0.5 text-[10.5px] text-ink">
      {tag?.label ?? slug}
    </span>
  );
}

// Avoid unused-import lint for Star — keep the icon available in case the
// rating block expands.
void Star;
void X;
