"use client";

// ── GuestPreview ────────────────────────────────────────────────────────
// "See it as your guests see it." A compact entry button that lives in
// the sidebar pocket and opens a modal simulating what a guest knows
// right now: which stationery has gone out, whether the wedding website
// is published, what's filled in on each event card, and the health of
// the guest list / dietary flags.
//
// All data is read-only and computed from existing stores — no new
// tables. The point is to surface gaps the couple hasn't thought about
// yet, with quick "set it now →" links that route them back to the
// right workspace.

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  Eye,
  ExternalLink,
  MapPin,
  Shirt,
  Utensils,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEventsStore } from "@/stores/events-store";
import { useStationeryStore } from "@/stores/stationery-store";
import { useRsvpStore, getEventStats } from "@/stores/rsvp-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { EventRecord } from "@/types/events";
import type { StationeryItemStatus } from "@/types/stationery";
import { cn } from "@/lib/utils";

const SENT_STATUSES: StationeryItemStatus[] = [
  "printed",
  "shipped",
];

function eventName(e: EventRecord): string {
  return (
    e.customName?.trim() ||
    e.vibeEventName?.trim() ||
    EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ||
    e.type
  );
}

interface FieldRow {
  label: string;
  ok: boolean;
  hint?: string;
  cta?: { label: string; href: string };
  icon?: React.ReactNode;
}

function eventFields(event: EventRecord): FieldRow[] {
  return [
    {
      label: "Date",
      ok: !!event.eventDate,
      icon: <Calendar size={11} strokeWidth={1.8} />,
      hint: event.eventDate ?? undefined,
      cta: !event.eventDate
        ? { label: "Set date →", href: "/events" }
        : undefined,
    },
    {
      label: "Venue",
      ok: !!event.venueName,
      icon: <MapPin size={11} strokeWidth={1.8} />,
      hint: event.venueName ?? undefined,
      cta: !event.venueName
        ? { label: "Add venue →", href: "/events" }
        : undefined,
    },
    {
      label: "Dress code",
      ok: !!event.dressCode?.trim(),
      icon: <Shirt size={11} strokeWidth={1.8} />,
      hint: event.dressCode?.trim() || undefined,
      cta: !event.dressCode?.trim()
        ? { label: "Set dress code →", href: "/events" }
        : undefined,
    },
    {
      label: "Meal plan",
      ok: event.lovedHospitalityIds.length > 0 || !!event.guestFeelBrief,
      icon: <Utensils size={11} strokeWidth={1.8} />,
      cta:
        event.lovedHospitalityIds.length === 0 && !event.guestFeelBrief
          ? { label: "Note meal style →", href: "/events" }
          : undefined,
    },
  ];
}

export function GuestPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="dash-row group w-full justify-start"
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        <span
          aria-hidden
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--dash-blush-light)] text-[color:var(--dash-blush-deep)]"
        >
          <Eye size={13} strokeWidth={1.8} />
        </span>
        <span className="flex flex-col items-start text-left">
          <span
            className="text-[12.5px] font-medium text-[color:var(--dash-text)]"
            style={{
              fontFamily: "Inter, var(--font-sans), sans-serif",
            }}
          >
            See it as your guests see it
          </span>
          <span className="text-[11px] italic text-[color:var(--dash-text-muted)]">
            What do they actually know?
          </span>
        </span>
      </button>

      {open && <GuestPreviewModal onClose={() => setOpen(false)} />}
    </>
  );
}

function GuestPreviewModal({ onClose }: { onClose: () => void }) {
  const events = useEventsStore((s) => s.events);
  const suite = useStationeryStore((s) => s.suite);
  const rsvpEvents = useRsvpStore((s) => s.events);
  const guests = useRsvpStore((s) => s.guests);
  const rsvps = useRsvpStore((s) => s.rsvps);

  const stationeryStatus = useMemo(() => {
    const findKind = (kind: string) =>
      suite.find((i) => i.kind === kind && i.enabled);
    const std = findKind("save_the_date");
    const inv = findKind("main_invitation");
    return {
      saveTheDate: std,
      saveTheDateSent: !!std && SENT_STATUSES.includes(std.status),
      invitation: inv,
      invitationSent: !!inv && SENT_STATUSES.includes(inv.status),
    };
  }, [suite]);

  const guestStats = useMemo(() => {
    if (rsvpEvents.length === 0)
      return { invited: 0, confirmed: 0, pending: 0, declined: 0 };
    let invited = 0;
    let confirmed = 0;
    let pending = 0;
    let declined = 0;
    for (const ev of rsvpEvents) {
      const s = getEventStats(ev.id, guests, rsvps);
      invited += s.invited;
      confirmed += s.confirmed;
      pending += s.pending;
      declined += s.declined;
    }
    return { invited, confirmed, pending, declined };
  }, [rsvpEvents, guests, rsvps]);

  const totalRosterSize = guests.length;
  const notInvited = Math.max(0, totalRosterSize - guestStats.invited);

  const dietaryFlags = useMemo(() => {
    return guests.filter((g) => g.dietary.length > 0).length;
  }, [guests]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[10px] bg-[color:var(--dash-canvas)] p-6 shadow-[0_30px_80px_-20px_rgba(196,146,155,0.45)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close guest preview"
          className="absolute right-4 top-4 rounded-full p-1 text-[color:var(--dash-text-faint)] transition-colors hover:bg-[color:var(--dash-blush-light)] hover:text-[color:var(--dash-blush-deep)]"
        >
          <X size={16} />
        </button>

        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[color:var(--dash-text-faint)]">
          <Eye size={11} />
          <span style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}>
            Guest perspective
          </span>
        </div>
        <h2
          id="guest-preview-title"
          className="dash-spread-title"
        >
          What your guests <em>actually know</em>
        </h2>
        <p className="dash-spread-sub">
          A read-only look at the wedding through your guests' eyes — what's
          gone out, what's missing, what they're going to ask about.
        </p>

        {/* What they've received */}
        <section className="mt-5">
          <h3
            className="mb-2 text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--dash-blush-deep)]"
            style={{
              fontFamily: "Inter, var(--font-sans), sans-serif",
              fontWeight: 600,
            }}
          >
            What guests have received
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReceivedTile
              ok={stationeryStatus.saveTheDateSent}
              label="Save the date"
              hint={
                stationeryStatus.saveTheDateSent
                  ? "Sent — guests have your wedding date in their inbox."
                  : stationeryStatus.saveTheDate
                    ? "Designed but not yet sent. Guests don't have a date to hold."
                    : "Not in your suite yet. Guests won't see your date until invitations."
              }
              cta={{ label: "Open Stationery →", href: "/studio/stationery" }}
            />
            <ReceivedTile
              ok={stationeryStatus.invitationSent}
              label="Wedding invitation"
              hint={
                stationeryStatus.invitationSent
                  ? "Sent — guests know venue, time, and dress code."
                  : "Not sent. Guests don't have the details they need to plan."
              }
              cta={{ label: "Open Stationery →", href: "/studio/stationery" }}
            />
            <ReceivedTile
              ok={false}
              label="Wedding website"
              hint="Not yet published. Guests have nowhere to look up details on their own."
              cta={{ label: "Open Studio →", href: "/studio" }}
            />
            <ReceivedTile
              ok={guestStats.invited > 0}
              label="RSVP system live"
              hint={
                guestStats.invited > 0
                  ? `${guestStats.invited} guests have an RSVP record.`
                  : "Guests can't RSVP yet — invitations haven't gone out."
              }
              cta={{ label: "Open Guests →", href: "/guests" }}
            />
          </div>
        </section>

        {/* Per-event detail */}
        <section className="mt-6">
          <h3
            className="mb-2 text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--dash-blush-deep)]"
            style={{
              fontFamily: "Inter, var(--font-sans), sans-serif",
              fontWeight: 600,
            }}
          >
            What guests know per event
          </h3>
          {events.length === 0 ? (
            <div className="dash-card px-4 py-4 text-[13px] italic text-[color:var(--dash-text-muted)]">
              No events yet — guests don't know which celebrations to plan
              for.{" "}
              <Link
                href="/events"
                className="text-[color:var(--dash-blush-deep)] hover:underline"
              >
                Add your first event →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((event) => (
                <EventReadiness key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Guest list health */}
        <section className="mt-6">
          <h3
            className="mb-2 text-[10.5px] uppercase tracking-[0.2em] text-[color:var(--dash-blush-deep)]"
            style={{
              fontFamily: "Inter, var(--font-sans), sans-serif",
              fontWeight: 600,
            }}
          >
            Guest list health
          </h3>
          {totalRosterSize === 0 ? (
            <p className="text-[13px] italic text-[color:var(--dash-text-muted)]">
              Your roster is empty. Even one name lets you start the
              countdown — start with the people you can't imagine the day
              without.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Stat
                label="Confirmed"
                value={guestStats.confirmed}
                tone="ok"
              />
              <Stat label="Pending RSVP" value={guestStats.pending} tone="warn" />
              <Stat
                label="Not yet invited"
                value={notInvited}
                tone={notInvited > 0 ? "warn" : "ok"}
                hint={
                  notInvited > 0
                    ? "On your roster but no RSVP record yet"
                    : undefined
                }
              />
              <Stat
                label="Dietary flags"
                value={dietaryFlags}
                tone="info"
                hint={
                  dietaryFlags > 0
                    ? "Make sure your caterer knows the count"
                    : "All set"
                }
              />
            </ul>
          )}
        </section>

        {/* Helpful nudges */}
        <section className="mt-6 border-t border-[color:rgba(45,45,45,0.06)] pt-4">
          <p
            className="text-[11.5px] uppercase tracking-[0.2em] text-[color:var(--dash-text-faint)]"
            style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
          >
            Pro tips
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-[color:var(--dash-text-muted)]">
            <li className="flex gap-2">
              <span className="text-[color:var(--dash-blush-deep)]">·</span>
              Guests start asking about parking 2 weeks before. Add parking
              info to your wedding website to head it off.
            </li>
            <li className="flex gap-2">
              <span className="text-[color:var(--dash-blush-deep)]">·</span>
              If you have a hashtag, plant it on the save-the-date — people
              start posting weeks before the day.
            </li>
            <li className="flex gap-2">
              <span className="text-[color:var(--dash-blush-deep)]">·</span>
              An out-of-town schedule beats individual emails — group it on
              one page guests can reshare.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ReceivedTile({
  ok,
  label,
  hint,
  cta,
}: {
  ok: boolean;
  label: string;
  hint: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div
      className={cn(
        "dash-card flex flex-col gap-1.5 px-4 py-3",
        ok && "border-[color:var(--dash-blush)]",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full",
            ok
              ? "bg-[color:var(--dash-blush)] text-white"
              : "bg-[color:var(--dash-blush-light)] text-[color:var(--dash-blush-deep)]",
          )}
        >
          {ok ? <Check size={11} strokeWidth={2.4} /> : <AlertCircle size={11} />}
        </span>
        <span
          className="text-[13px] font-medium text-[color:var(--dash-text)]"
          style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
        >
          {label}
        </span>
      </div>
      <p className="text-[12px] text-[color:var(--dash-text-muted)]">{hint}</p>
      {cta && !ok && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 text-[11.5px] text-[color:var(--dash-blush-deep)] hover:underline"
        >
          {cta.label}
          <ExternalLink size={10} />
        </Link>
      )}
    </div>
  );
}

function EventReadiness({ event }: { event: EventRecord }) {
  const fields = eventFields(event);
  const ready = fields.filter((f) => f.ok).length;
  const total = fields.length;
  const fullyReady = ready === total;
  return (
    <div className="dash-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p
          className="font-serif text-[15px] leading-tight text-[color:var(--dash-text)]"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          {eventName(event)}
        </p>
        <span
          className={cn(
            "text-[10.5px] uppercase tracking-[0.16em]",
            fullyReady
              ? "text-[color:var(--dash-blush-deep)]"
              : "text-[color:var(--dash-text-faint)]",
          )}
          style={{ fontFamily: "Inter, var(--font-sans), sans-serif" }}
        >
          {ready} / {total} guest-ready
        </span>
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {fields.map((field) => (
          <li
            key={field.label}
            className="flex items-center gap-2 text-[12px]"
          >
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded-full",
                field.ok
                  ? "bg-[color:var(--dash-blush)] text-white"
                  : "bg-[color:var(--dash-blush-light)] text-[color:var(--dash-blush-deep)]",
              )}
            >
              {field.ok ? (
                <Check size={9} strokeWidth={2.6} />
              ) : (
                <AlertCircle size={9} />
              )}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                field.ok
                  ? "text-[color:var(--dash-text)]"
                  : "text-[color:var(--dash-text-muted)]",
              )}
            >
              {field.label}
              {field.hint && field.ok && (
                <span className="ml-1 text-[color:var(--dash-text-faint)]">
                  · {field.hint}
                </span>
              )}
            </span>
            {!field.ok && field.cta && (
              <Link
                href={field.cta.href}
                className="shrink-0 text-[11px] text-[color:var(--dash-blush-deep)] hover:underline"
              >
                {field.cta.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "info";
  hint?: string;
}) {
  return (
    <li className="dash-card flex items-center gap-3 px-3 py-2">
      <span
        className={cn(
          "font-serif text-[20px] leading-none",
          tone === "ok" && "text-[color:var(--dash-blush-deep)]",
          tone === "warn" && "text-[color:var(--color-terracotta)]",
          tone === "info" && "text-[color:var(--dash-text)]",
        )}
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        {value}
      </span>
      <span className="flex flex-col text-[11.5px] text-[color:var(--dash-text-muted)]">
        <span className="font-medium uppercase tracking-[0.14em] text-[color:var(--dash-text-faint)]">
          {label}
        </span>
        {hint && <span className="italic">{hint}</span>}
      </span>
    </li>
  );
}
