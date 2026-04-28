"use client";

// ── Meetups panel ───────────────────────────────────────────────────────────
// Main Meetups sub-tab. City selector + month filter + type filter up top,
// upcoming meetup list below, "host your own" CTA + my-RSVPs section at the
// bottom. Tapping a card opens MeetupDetail; tapping the CTA opens
// CreateMeetupFlow.

import { useEffect, useMemo, useState } from "react";
import { Headphones, MapPin, Mic, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEETUP_TYPES, type MeetupType } from "@/types/community";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";
import { MeetupCard } from "./MeetupCard";
import { MeetupDetail } from "./MeetupDetail";
import { CreateMeetupFlow } from "./CreateMeetupFlow";
import { HuddleCard } from "./huddles/HuddleCard";
import { HuddleCreateModal } from "./huddles/HuddleCreateModal";
import { HuddleLobby } from "./huddles/HuddleLobby";

export function MeetupsPanel() {
  const ensureSeeded = useCommunityMeetupsStore((s) => s.ensureSeeded);
  const ensureHuddlesSeeded = useCommunityHuddlesStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureSeeded();
    ensureHuddlesSeeded();
  }, [ensureSeeded, ensureHuddlesSeeded]);

  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );

  const meetups = useCommunityMeetupsStore((s) => s.meetups);
  const rsvps = useCommunityMeetupsStore((s) => s.rsvps);

  const huddles = useCommunityHuddlesStore((s) => s.huddles);
  const setActiveHuddle = useCommunityHuddlesStore((s) => s.setActiveHuddle);
  const startScheduledHuddle = useCommunityHuddlesStore(
    (s) => s.startScheduledHuddle,
  );
  const toggleInterest = useCommunityHuddlesStore((s) => s.toggleInterest);

  const [huddleCreateOpen, setHuddleCreateOpen] = useState(false);
  const [joiningHuddleId, setJoiningHuddleId] = useState<string | null>(null);

  const liveHuddles = useMemo(
    () => huddles.filter((h) => h.status === "live"),
    [huddles],
  );
  const scheduledHuddles = useMemo(
    () =>
      huddles
        .filter((h) => h.status === "waiting" && !!h.scheduled_at)
        .sort(
          (a, b) =>
            new Date(a.scheduled_at!).getTime() -
            new Date(b.scheduled_at!).getTime(),
        ),
    [huddles],
  );

  const joiningHuddle = joiningHuddleId
    ? huddles.find((h) => h.id === joiningHuddleId)
    : undefined;

  const defaultCity =
    myProfile?.hometown?.split(",")[0]?.trim().toLowerCase() ?? "";

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    for (const m of meetups) {
      if (m.is_virtual) continue;
      if (m.city) cities.add(m.city);
    }
    return Array.from(cities).sort();
  }, [meetups]);

  const [cityFilter, setCityFilter] = useState<string>(""); // "" = all
  const [monthFilter, setMonthFilter] = useState<string>(""); // "YYYY-MM"
  const [typeFilter, setTypeFilter] = useState<MeetupType | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const now = Date.now();

  const upcoming = useMemo(() => {
    return meetups
      .filter((m) => {
        if (m.status === "cancelled") return false;
        if (new Date(m.starts_at).getTime() < now - 1000 * 60 * 60 * 12) return false;
        if (cityFilter && m.city.toLowerCase() !== cityFilter.toLowerCase())
          return false;
        if (typeFilter && m.meetup_type !== typeFilter) return false;
        if (monthFilter) {
          const monthIso = m.starts_at.slice(0, 7);
          if (monthIso !== monthFilter) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
  }, [meetups, cityFilter, typeFilter, monthFilter, now]);

  // My RSVPs section — upcoming meetups I'm going to / considering.
  const myRsvpedMeetups = useMemo(() => {
    if (!myProfileId) return [];
    const myRsvps = rsvps.filter(
      (r) =>
        r.profile_id === myProfileId &&
        (r.status === "going" || r.status === "maybe"),
    );
    const byId = new Map(meetups.map((m) => [m.id, m]));
    return myRsvps
      .map((r) => ({ meetup: byId.get(r.meetup_id), status: r.status }))
      .filter((x): x is { meetup: NonNullable<typeof x.meetup>; status: typeof x.status } =>
        !!x.meetup && new Date(x.meetup.starts_at).getTime() > now - 1000 * 60 * 60 * 12,
      )
      .sort(
        (a, b) =>
          new Date(a.meetup.starts_at).getTime() -
          new Date(b.meetup.starts_at).getTime(),
      );
  }, [rsvps, meetups, myProfileId, now]);

  return (
    <>
      <div className="px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl space-y-10">
          {/* Huddles — live + scheduled */}
          {(liveHuddles.length > 0 || scheduledHuddles.length > 0) && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Headphones size={11} strokeWidth={1.8} />
                  — huddles —
                </p>
                <button
                  type="button"
                  onClick={() => setHuddleCreateOpen(true)}
                  disabled={!myProfileId}
                  className={cn(
                    "inline-flex items-center gap-1 text-[12px] font-medium transition-colors",
                    myProfileId
                      ? "text-ink-muted hover:text-ink"
                      : "cursor-not-allowed text-ink-faint",
                  )}
                >
                  <Mic size={12} strokeWidth={1.8} />
                  start a huddle
                </button>
              </div>
              <p className="mt-1 text-[12.5px] text-ink-muted">
                live audio rooms — hop in while you're doing dishes. no
                camera-ready required.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                {liveHuddles.map((h) => (
                  <HuddleCard
                    key={h.id}
                    huddle={h}
                    onJoin={() => setJoiningHuddleId(h.id)}
                  />
                ))}
                {scheduledHuddles.map((h) => (
                  <HuddleCard
                    key={h.id}
                    huddle={h}
                    onJoin={() => {
                      // Only the host can "start now" on a scheduled huddle.
                      if (h.host_id === myProfileId) {
                        startScheduledHuddle(h.id);
                        setActiveHuddle(h.id);
                      }
                    }}
                    onRemindMe={() => {
                      if (!myProfileId) return;
                      toggleInterest(h.id, myProfileId);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* My RSVPs — only visible if there are any */}
          {myRsvpedMeetups.length > 0 && (
            <section>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — your upcoming —
              </p>
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                {myRsvpedMeetups.map(({ meetup }) => (
                  <MeetupCard
                    key={meetup.id}
                    meetup={meetup}
                    onOpen={() => setSelectedId(meetup.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — meetups{defaultCity ? ` near ${defaultCity}` : ""} —
              </p>
            </div>

            <Filters
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              availableCities={availableCities}
            />

            {upcoming.length === 0 ? (
              <EmptyState city={cityFilter || defaultCity} onCreate={() => setCreateOpen(true)} />
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {upcoming.map((m) => (
                  <MeetupCard
                    key={m.id}
                    meetup={m}
                    onOpen={() => setSelectedId(m.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Host CTA */}
          <section>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — or host your own —
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-ivory-warm/40 via-white to-ivory-warm/20 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron/10 text-saffron">
                  <Sparkles size={18} strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-[22px] font-medium leading-[1.15] text-ink">
                    grab coffee. host a brunch. rally the market crew.
                  </h3>
                  <p className="mt-2 max-w-[460px] text-[14px] leading-[1.65] text-ink-muted">
                    you'd be surprised how many brides are looking for the exact
                    same thing. even a coffee date counts.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    disabled={!myProfileId}
                    className={cn(
                      "mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors",
                      myProfileId
                        ? "bg-ink text-ivory hover:bg-ink-soft"
                        : "cursor-not-allowed bg-ink/40 text-ivory",
                    )}
                  >
                    <Plus size={13} strokeWidth={1.8} />
                    start planning
                  </button>
                  {!myProfileId && (
                    <p className="mt-2 text-[11.5px] text-ink-faint">
                      set up your profile first — settings is one tab over.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <MeetupDetail
        meetupId={selectedId}
        onClose={() => setSelectedId(null)}
      />

      <CreateMeetupFlow
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(m) => {
          setCreateOpen(false);
          setSelectedId(m.id);
        }}
      />

      <HuddleCreateModal
        open={huddleCreateOpen}
        onClose={() => setHuddleCreateOpen(false)}
        onCreated={() => setHuddleCreateOpen(false)}
      />

      {joiningHuddle ? (
        <HuddleLobby
          huddle={joiningHuddle}
          onCancel={() => setJoiningHuddleId(null)}
          onJoined={() => setJoiningHuddleId(null)}
        />
      ) : null}
    </>
  );
}

// ── Filters ─────────────────────────────────────────────────────────────────

function Filters({
  cityFilter,
  setCityFilter,
  monthFilter,
  setMonthFilter,
  typeFilter,
  setTypeFilter,
  availableCities,
}: {
  cityFilter: string;
  setCityFilter: (v: string) => void;
  monthFilter: string;
  setMonthFilter: (v: string) => void;
  typeFilter: MeetupType | "";
  setTypeFilter: (v: MeetupType | "") => void;
  availableCities: string[];
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5">
        <MapPin size={12} strokeWidth={1.8} className="text-ink-faint" />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-transparent text-[12.5px] text-ink focus:outline-none"
        >
          <option value="">all cities</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <input
        type="month"
        value={monthFilter}
        onChange={(e) => setMonthFilter(e.target.value)}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
      />

      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value as MeetupType | "")}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
      >
        <option value="">all types</option>
        {MEETUP_TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.emoji} {t.label}
          </option>
        ))}
      </select>

      {(cityFilter || monthFilter || typeFilter) && (
        <button
          type="button"
          onClick={() => {
            setCityFilter("");
            setMonthFilter("");
            setTypeFilter("");
          }}
          className="text-[11.5px] text-ink-faint transition-colors hover:text-ink"
        >
          clear filters
        </button>
      )}
    </div>
  );
}

function EmptyState({
  city,
  onCreate,
}: {
  city?: string;
  onCreate: () => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/20 px-6 py-12 text-center">
      <p className="font-serif text-[20px] italic text-ink">
        {city
          ? `no meetups in ${city} yet — but you could be the one to start.`
          : "no meetups match that filter yet."}
      </p>
      <p className="mt-2 text-[13px] text-ink-muted">
        even a coffee date counts. try it.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={1.8} />
        create a meetup
      </button>
    </div>
  );
}
