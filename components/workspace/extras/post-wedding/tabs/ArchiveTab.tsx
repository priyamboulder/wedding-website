"use client";

// ── Wedding Archive tab ───────────────────────────────────────────────────
// Read-only, auto-aggregated view of the couple's wedding — pulled from the
// other stores. Designed as a keepsake: details, events, vision, team, and
// a by-the-numbers strip. "Share archive" generates a local read-only link
// (token persisted in localStorage) — no backend yet.

import {
  Calendar,
  Copy,
  Heart,
  Link as LinkIcon,
  Star,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import {
  COORDINATION_ROLE_ICON,
  COORDINATION_ROLE_LABEL,
} from "@/types/coordination";
import { useCoordinationStore } from "@/stores/coordination-store";
import { useEventsStore } from "@/stores/events-store";
import { useGuestRosterStore } from "@/stores/guest-roster-store";
import { usePostWeddingStore } from "@/stores/post-wedding-store";
import { getWeddingAnchorDate } from "@/lib/post-wedding-activation";
import {
  PrimaryButton,
  SecondaryButton,
  Section,
  formatDate,
  formatRupees,
} from "../ui";

export function ArchiveTab() {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const vendors = useCoordinationStore((s) => s.vendors);
  const guests = useGuestRosterStore((s) => s.entries);
  const reviews = usePostWeddingStore((s) => s.reviews);
  const gifts = usePostWeddingStore((s) => s.gifts);
  const deliveries = usePostWeddingStore((s) => s.deliveries);

  const weddingDate = getWeddingAnchorDate(events);
  const eventsWithDate = events
    .filter((e) => e.eventDate)
    .sort((a, b) => (a.eventDate! < b.eventDate! ? -1 : 1));
  const firstDate = eventsWithDate[0]?.eventDate ?? null;
  const lastDate = eventsWithDate[eventsWithDate.length - 1]?.eventDate ?? null;

  const primaryVenue =
    events.find((e) => e.type === "ceremony")?.venueName ??
    events.find((e) => e.venueName)?.venueName ??
    null;

  const cashLike = gifts.filter(
    (g) =>
      (g.giftType === "cash" ||
        g.giftType === "check" ||
        g.giftType === "bank_transfer" ||
        g.giftType === "gift_card") &&
      g.amountRupees,
  );
  const cashTotal = cashLike.reduce((n, g) => n + (g.amountRupees ?? 0), 0);
  const sent = gifts.filter((g) => g.thankYouStatus === "sent").length;

  const photoDeliveries = deliveries.filter((d) =>
    ["edited_photos", "photo_prints"].includes(d.deliverableType),
  );
  const totalPhotos = photoDeliveries.reduce(
    (n, d) => n + (d.fileCount ?? 0),
    0,
  );

  // Match reviews to vendor ratings for the team list.
  const ratingByVendorId = new Map(
    reviews
      .filter((r) => r.coordinationVendorId)
      .map((r) => [r.coordinationVendorId as string, r.overallRating] as const),
  );

  const reviewOnlyVendors = reviews.filter((r) => !r.coordinationVendorId);

  const noData =
    events.length === 0 &&
    vendors.length === 0 &&
    gifts.length === 0 &&
    deliveries.length === 0 &&
    reviews.length === 0;

  return (
    <div className="space-y-5">
      <Section
        eyebrow="YOUR WEDDING ARCHIVE"
        title="everything from the planning, the chaos, and the magic"
        description="— in one place, forever. this page updates automatically as you use the rest of ananya."
      >
        {noData ? (
          <p className="text-[13px] leading-relaxed text-ink-muted">
            As you set up your events, vendors, and reviews, they'll appear here
            as a keepsake archive. Nothing to show yet — come back once more of
            your planning is in place.
          </p>
        ) : (
          <ShareArchive />
        )}
      </Section>

      <Section eyebrow="THE DETAILS" tone="muted">
        <dl className="grid gap-3 md:grid-cols-2">
          <ArchiveLine
            icon={<Heart size={14} className="text-saffron" />}
            label="Couple"
            value={couplePhrase(coupleContext)}
          />
          <ArchiveLine
            icon={<Calendar size={14} className="text-saffron" />}
            label="Dates"
            value={datePhrase(firstDate, lastDate, weddingDate)}
          />
          <ArchiveLine
            icon={<LinkIcon size={14} className="text-saffron" />}
            label="Venue"
            value={primaryVenue || "—"}
          />
          <ArchiveLine
            icon={<Users size={14} className="text-saffron" />}
            label="Guests"
            value={
              coupleContext.totalGuestCount
                ? `${coupleContext.totalGuestCount} guests across ${events.length || 0} events`
                : `${guests.length} on the roster`
            }
          />
        </dl>
      </Section>

      {events.length > 0 && (
        <Section eyebrow="THE EVENTS">
          <ul className="grid gap-3 md:grid-cols-2" role="list">
            {events
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <p className="font-serif text-[15px] leading-snug text-ink">
                    {displayEventName(e)}
                  </p>
                  <p
                    className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {[formatDate(e.eventDate), e.venueName].filter(Boolean).join(" · ") ||
                      "no details"}
                  </p>
                  {e.vibeKeywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.vibeKeywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-sm bg-ivory-warm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </Section>
      )}

      {(coupleContext.programBrief || coupleContext.storyText) && (
        <Section eyebrow="THE VISION">
          <blockquote className="border-l-2 border-saffron/50 pl-4 font-serif text-[15.5px] italic leading-relaxed text-ink">
            "{coupleContext.programBrief || coupleContext.storyText}"
          </blockquote>
          {coupleContext.nonNegotiable && (
            <p className="mt-4 text-[13px] text-ink-muted">
              <span
                className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Non-negotiable —
              </span>
              {coupleContext.nonNegotiable}
            </p>
          )}
        </Section>
      )}

      {(vendors.length > 0 || reviewOnlyVendors.length > 0) && (
        <Section eyebrow="THE TEAM">
          <ul className="space-y-2" role="list">
            {vendors.map((v) => {
              const rating = ratingByVendorId.get(v.id);
              return (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-white px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[13.5px] text-ink">
                      {(
                        (COORDINATION_ROLE_ICON as Record<string, string>)[
                          v.role
                        ] ?? "✨"
                      )}{" "}
                      {v.name}
                    </p>
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {v.roleLabel ||
                        (COORDINATION_ROLE_LABEL as Record<string, string>)[
                          v.role
                        ] ||
                        v.role}
                    </p>
                  </div>
                  {rating ? (
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          strokeWidth={1.5}
                          className="fill-gold text-gold"
                        />
                      ))}
                    </span>
                  ) : (
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      not reviewed yet
                    </span>
                  )}
                </li>
              );
            })}
            {reviewOnlyVendors.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-white px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[13.5px] text-ink">
                    {r.vendorName}
                  </p>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.vendorRole}
                  </p>
                </div>
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: r.overallRating }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      strokeWidth={1.5}
                      className="fill-gold text-gold"
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section eyebrow="BY THE NUMBERS" tone="muted">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Events" value={String(events.length)} />
          <Stat label="Vendors" value={String(vendors.length)} />
          <Stat
            label="Guests (invited)"
            value={
              coupleContext.totalGuestCount
                ? String(coupleContext.totalGuestCount)
                : String(guests.length)
            }
          />
          <Stat
            label="Gifts received"
            value={String(gifts.length)}
          />
          <Stat
            label="Cash-equivalent"
            value={cashTotal > 0 ? formatRupees(cashTotal) : "—"}
          />
          <Stat
            label="Thank-yous sent"
            value={gifts.length > 0 ? `${sent} of ${gifts.length}` : "—"}
          />
          <Stat
            label="Deliveries expected"
            value={String(deliveries.length)}
          />
          <Stat
            label="Photos delivered"
            value={totalPhotos > 0 ? String(totalPhotos) : "—"}
          />
        </dl>
      </Section>
    </div>
  );
}

function ArchiveLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <dt
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </dt>
        <dd className="mt-0.5 text-[13.5px] text-ink">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-[18px] leading-snug text-ink">
        {value}
      </dd>
    </div>
  );
}

function couplePhrase(
  ctx: ReturnType<typeof useEventsStore.getState>["coupleContext"],
): string {
  return ctx.traditions.length > 0
    ? `${ctx.traditions.map(labelTradition).join(" + ")} wedding`
    : "A beautiful wedding";
}

function labelTradition(t: string): string {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function datePhrase(
  first: string | null,
  last: string | null,
  anchor: string | null,
): string {
  if (first && last && first !== last) {
    return `${formatDate(first)} – ${formatDate(last)}`;
  }
  if (anchor) return formatDate(anchor);
  return "—";
}

function displayEventName(
  e: ReturnType<typeof useEventsStore.getState>["events"][number],
): string {
  if (e.customName) return e.customName;
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === e.type);
  return opt?.name ?? e.type;
}

// ── Shareable archive ────────────────────────────────────────────────────

const ARCHIVE_TOKEN_KEY = "ananya:post-wedding:archive-token";

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ARCHIVE_TOKEN_KEY);
}

function makeToken(): string {
  const rand = () =>
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
  return `arc_${rand()}`;
}

function ShareArchive() {
  const [token, setToken] = useState<string | null>(() => loadToken());
  const [copied, setCopied] = useState(false);

  function create() {
    const t = makeToken();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ARCHIVE_TOKEN_KEY, t);
    }
    setToken(t);
  }

  function revoke() {
    if (!confirm("Revoke this share link? The old URL will stop working.")) {
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ARCHIVE_TOKEN_KEY);
    }
    setToken(null);
  }

  const url =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/archive/${token}`
      : null;

  function copy() {
    if (!url || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!token || !url) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          generate a shareable link to your wedding archive. share it with
          family and friends as a digital keepsake — the private stuff (budget,
          vendor spend, notes) stays on your side.
        </p>
        <PrimaryButton
          icon={<LinkIcon size={13} strokeWidth={1.8} />}
          onClick={create}
        >
          Create shareable link
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-ink-muted">
        anyone with this link can see the read-only archive.
      </p>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-ivory-warm/40 px-3 py-2">
        <code className="flex-1 truncate font-mono text-[12px] text-ink">
          {url}
        </code>
        <SecondaryButton
          size="sm"
          icon={<Copy size={12} strokeWidth={1.8} />}
          onClick={copy}
        >
          {copied ? "Copied!" : "Copy link"}
        </SecondaryButton>
      </div>
      <div className="flex gap-2">
        <SecondaryButton size="sm" tone="danger" onClick={revoke}>
          Revoke link
        </SecondaryButton>
      </div>
    </div>
  );
}

