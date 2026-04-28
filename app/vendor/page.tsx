"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  Chip,
  PageHeader,
  StatTile,
} from "@/components/vendor-portal/ui";
import {
  CALENDAR_ENTRIES,
  WEDDINGS,
  PORTAL_ANALYTICS,
} from "@/lib/vendor-portal/seed";
import { usePortalVendor, PORTAL_VENDOR_ID } from "@/lib/vendor-portal/current-vendor";
import { useInquiryStore } from "@/stores/inquiry-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import type { InquiryStatus } from "@/types/inquiry";

const DEMO_TODAY = new Date("2026-04-20");

type ChipTone = "neutral" | "gold" | "sage" | "rose" | "teal";

const INQUIRY_STATUS_LABEL: Record<InquiryStatus, { label: string; tone: ChipTone }> = {
  submitted: { label: "New", tone: "rose" },
  viewed: { label: "Viewed", tone: "teal" },
  responded: { label: "Replied", tone: "gold" },
  booked: { label: "Booked", tone: "sage" },
  declined: { label: "Declined", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

function formatWeddingDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CALENDAR_KIND_LABEL: Record<string, { label: string; tone: ChipTone }> = {
  wedding: { label: "Wedding", tone: "rose" },
  task: { label: "Task", tone: "gold" },
  consultation: { label: "Consultation", tone: "teal" },
  blocked: { label: "Blocked", tone: "neutral" },
};

export default function VendorDashboardPage() {
  const vendor = usePortalVendor();
  const allInquiries = useInquiryStore((s) => s.inquiries);
  const inquiries = allInquiries.filter((i) => i.vendor_id === PORTAL_VENDOR_ID);
  const newInquiries = inquiries.filter((i) => i.status === "submitted");
  const activeWeddings = WEDDINGS.filter((w) => w.status !== "delivered");

  const thirtyDays = 30 * 86400000;
  const upcomingIn30 = CALENDAR_ENTRIES.filter((e) => {
    const diff = new Date(e.date).getTime() - DEMO_TODAY.getTime();
    return diff >= 0 && diff <= thirtyDays;
  });

  const schedule = [...CALENDAR_ENTRIES]
    .filter((e) => new Date(e.date).getTime() >= DEMO_TODAY.getTime())
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    .slice(0, 5);

  const recent = [...inquiries]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const inquiriesDelta = newInquiries.length - PORTAL_ANALYTICS.inquiriesLastWeek;
  const deltaText =
    inquiriesDelta === 0
      ? "same as last week"
      : `${inquiriesDelta > 0 ? "+" : ""}${inquiriesDelta} vs last week`;
  const deltaDir: "up" | "down" | "flat" =
    inquiriesDelta > 0 ? "up" : inquiriesDelta < 0 ? "down" : "flat";

  const todayLabel = DEMO_TODAY.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const categoryLabel = CATEGORY_LABELS[vendor.category];
  const city = vendor.location.split(",")[0].trim() || vendor.location;

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={todayLabel}
        title={`${greetingPrefix()}, ${vendor.name}.`}
        description="A calm glance at what's moving this week — inquiries, schedule, and small things that keep your storefront alive."
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="New inquiries"
            value={newInquiries.length}
            sub="this week"
            trend={{ direction: deltaDir, text: deltaText }}
          />
          <StatTile
            label="Active weddings"
            value={activeWeddings.length}
            sub="contracted + in-flight"
          />
          <StatTile
            label="Upcoming events"
            value={upcomingIn30.length}
            sub="next 30 days"
          />
          <StatTile
            label="Rating"
            value={vendor.rating != null ? vendor.rating.toFixed(1) : "—"}
            sub={`${vendor.review_count} reviews`}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader
                title="Recent inquiries"
                hint="Your five latest — click through to open the full conversation."
                action={
                  <Link
                    href="/vendor/inbox"
                    className="text-[12px] text-[#7a5a16] hover:underline"
                  >
                    Open inbox →
                  </Link>
                }
              />
              <ul>
                {recent.map((inq, idx) => {
                  const s = INQUIRY_STATUS_LABEL[inq.status];
                  const isUnread = inq.status === "submitted";
                  return (
                    <li
                      key={inq.id}
                      className={
                        idx !== 0
                          ? "border-t border-[rgba(26,26,26,0.05)]"
                          : ""
                      }
                    >
                      <Link
                        href={`/vendor/inbox?thread=${inq.id}`}
                        className={`flex gap-4 px-5 py-4 transition-colors hover:bg-[#FBF7EC]/70 ${
                          isUnread ? "bg-[#FBF7EC]/40" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center pt-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isUnread ? "bg-[#C97B63]" : "bg-stone-200"
                            }`}
                            aria-hidden
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-medium text-[#1a1a1a]">
                              {inq.couple_name}
                            </p>
                            <Chip tone={s.tone}>{s.label}</Chip>
                            <span className="ml-auto font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                              {timeAgo(inq.updated_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11.5px] text-stone-500">
                            {formatWeddingDate(inq.wedding_date)}
                            {inq.events.length > 0 ? ` · ${inq.events.join(" · ")}` : ""}
                          </p>
                          <p
                            className="mt-1.5 line-clamp-2 text-[14px] italic leading-snug text-stone-600"
                            style={{ fontFamily: "'EB Garamond', serif" }}
                          >
                            "{inq.messages[inq.messages.length - 1]?.body ?? ""}"
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Upcoming schedule"
                hint="Next five events + deliverables from your calendar."
                action={
                  <Link
                    href="/vendor/calendar"
                    className="text-[12px] text-[#7a5a16] hover:underline"
                  >
                    Full calendar →
                  </Link>
                }
              />
              <ul>
                {schedule.map((item, idx) => {
                  const k = CALENDAR_KIND_LABEL[item.kind];
                  const d = new Date(item.date);
                  const parts = item.label.split(" · ");
                  const eventType = parts[0];
                  return (
                    <li
                      key={item.id}
                      className={`${
                        idx !== 0
                          ? "border-t border-[rgba(26,26,26,0.05)]"
                          : ""
                      } px-5 py-3.5`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 shrink-0 text-center">
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                            {d.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </p>
                          <p
                            className="mt-0.5 text-[22px] leading-none text-[#1a1a1a]"
                            style={{
                              fontFamily: "'Playfair Display', serif",
                              fontWeight: 500,
                            }}
                          >
                            {d.getDate()}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] text-[#1a1a1a]">
                            {item.couple ?? "Studio block"}
                          </p>
                          <p className="mt-0.5 text-[12px] text-stone-600">
                            {eventType}
                            {item.city ? ` · ${item.city}` : ""}
                          </p>
                          <div className="mt-1.5">
                            <Chip tone={k.tone}>{k.label}</Chip>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader
            title="Quick actions"
            hint="Small things that keep you in front of the couples actively searching."
          />
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
            <QuickActionLink
              href="/vendor/profile"
              glyph="◐"
              title="Update profile"
              hint="Bio, service area, pricing tiers"
            />
            <QuickActionLink
              href="/vendor/portfolio"
              glyph="▤"
              title="Add portfolio item"
              hint="Upload a gallery, reel, or real wedding"
            />
            <QuickActionLink
              href={`/marketplace/${vendor.slug}`}
              glyph="↗"
              title="View public profile"
              hint="See what couples see"
              external
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-4 p-5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0E4C8] text-[14px] text-[#7a5a16]">
              ✱
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
                Tips & updates · from Ananya
              </p>
              <p
                className="mt-1.5 text-[16px] leading-snug text-[#1a1a1a]"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontStyle: "italic",
                }}
              >
                3 new couples are searching for {categoryLabel.toLowerCase()} in{" "}
                {city} this week. Profiles above 90% completeness surface first
                — you're at {vendor.profile_completeness}%.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
                <Link
                  href="/vendor/portfolio"
                  className="text-[#7a5a16] hover:underline"
                >
                  Finish your portfolio →
                </Link>
                <Link
                  href="/vendor/analytics"
                  className="text-[#7a5a16] hover:underline"
                >
                  See this week's searches →
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function greetingPrefix(): string {
  const h = DEMO_TODAY.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function QuickActionLink({
  href,
  glyph,
  title,
  hint,
  external,
}: {
  href: string;
  glyph: string;
  title: string;
  hint: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0E4C8] text-[13px] text-[#7a5a16]"
        aria-hidden
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-[#1a1a1a]">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-stone-500">{hint}</p>
      </div>
      <span
        className="self-center text-[13px] text-stone-300 transition-colors group-hover:text-[#7a5a16]"
        aria-hidden
      >
        →
      </span>
    </>
  );

  const className =
    "group flex items-center gap-3 rounded-lg border border-[rgba(26,26,26,0.08)] bg-[#FBF9F4] p-3.5 transition-all hover:-translate-y-[1px] hover:border-[rgba(184,134,11,0.35)] hover:bg-[#FBF7EC]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
