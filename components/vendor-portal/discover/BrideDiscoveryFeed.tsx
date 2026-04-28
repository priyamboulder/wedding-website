"use client";

// ── Bride discovery feed ────────────────────────────────────────────────────
// Reverse-job-board view: brides on Ananya who've published a "looking" row
// for a category this vendor offers. Auto-filtered to the vendor's portal
// category(s) — a multi-category studio sees pills to toggle which feed to
// view. Filters: city, wedding month, budget, urgency. Each card surfaces
// only the bride context the privacy model permits (see Part 5 of the spec).

import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Sparkles, Users } from "lucide-react";
import { Card, Chip, PrimaryButton, SectionLabel, VENDOR_PALETTE } from "@/components/vendor-portal/ui";
import { ExpressInterestModal } from "@/components/vendor-portal/discover/ExpressInterestModal";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import {
  BUDGET_RANGES,
  URGENCY_OPTIONS,
  VENDOR_INTEREST_DAILY_LIMIT,
  checklistSlugsForPortalCategory,
  getVendorNeedCategory,
} from "@/types/vendor-needs";
import type {
  BudgetRange,
  CommunityVendorNeed,
  VendorNeedCategorySlug,
  VendorNeedUrgency,
} from "@/types/vendor-needs";
import { GUEST_COUNT_LABEL } from "@/lib/community/labels";
import type { CommunityProfile } from "@/types/community";
import type { Vendor, VendorCategory } from "@/types/vendor-unified";

// Map portal category enum → display label for the section header.
const PORTAL_CATEGORY_LABEL: Record<VendorCategory, string> = {
  photography: "photographer",
  hmua: "hair, makeup, mehendi",
  decor_florals: "decor or florals",
  catering: "caterer",
  entertainment: "DJ, music, lighting",
  wardrobe: "outfit",
  stationery: "stationery & invitations",
  pandit_ceremony: "officiant",
};

// Sort options
type SortKey = "urgent_first" | "newest" | "soonest_wedding" | "biggest";

const SORT_LABEL: Record<SortKey, string> = {
  urgent_first: "Most urgent first",
  newest: "Newest",
  soonest_wedding: "Soonest wedding",
  biggest: "Largest wedding",
};

const URGENCY_RANK: Record<VendorNeedUrgency, number> = {
  urgent: 0,
  soon: 1,
  flexible: 2,
};

export function BrideDiscoveryFeed({ vendor }: { vendor: Vendor }) {
  // The vendor portal is single-tenant, but a studio could offer multiple
  // categories. We currently model `vendor.category` as a single value, so
  // there's exactly one matching set of need slugs — but build the toggle
  // model so a future multi-category vendor renders cleanly.
  const portalCategories = useMemo<VendorCategory[]>(
    () => [vendor.category],
    [vendor.category],
  );
  const [activeCategory, setActiveCategory] = useState<VendorCategory>(
    vendor.category,
  );

  const allowedSlugs = useMemo(
    () => new Set(checklistSlugsForPortalCategory(activeCategory)),
    [activeCategory],
  );

  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const allNeeds = useVendorNeedsStore((s) => s.needs);
  const allInterests = useVendorNeedsStore((s) => s.interests);
  const ensureSeeded = useVendorNeedsStore((s) => s.ensureSeeded);
  const expirePending = useVendorNeedsStore((s) => s._expirePending);
  const isDiscoverable = useVendorNeedsStore((s) => s.isDiscoverable);

  useEffect(() => {
    ensureSeeded();
    expirePending();
  }, [ensureSeeded, expirePending]);

  // Filters
  const [cityQuery, setCityQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>(""); // "" | "next_3" | "next_6" | "next_year"
  const [budgetFilter, setBudgetFilter] = useState<BudgetRange | "">("");
  const [urgencyFilter, setUrgencyFilter] = useState<VendorNeedUrgency | "">("");
  const [sort, setSort] = useState<SortKey>("urgent_first");

  // Track which interests this vendor has already sent so cards can render
  // a "you've already reached out" state.
  const interestsByNeedId = useMemo(() => {
    const map = new Map<string, (typeof allInterests)[number]>();
    for (const i of allInterests) {
      if (i.vendor_id === vendor.id) map.set(i.need_id, i);
    }
    return map;
  }, [allInterests, vendor.id]);

  const sentInLast24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return allInterests.filter(
      (i) =>
        i.vendor_id === vendor.id &&
        new Date(i.created_at).getTime() > cutoff,
    ).length;
  }, [allInterests, vendor.id]);
  const remainingToday = Math.max(0, VENDOR_INTEREST_DAILY_LIMIT - sentInLast24h);

  // Build the feed: brides with looking + visible needs in our category.
  const rows = useMemo(() => {
    const out: { profile: CommunityProfile; need: CommunityVendorNeed }[] = [];
    for (const need of allNeeds) {
      if (need.status !== "looking") continue;
      if (!need.is_visible_to_vendors) continue;
      if (!allowedSlugs.has(need.category_slug)) continue;
      const profile = profiles.find((p) => p.id === need.profile_id);
      if (!profile) continue;
      if (!isDiscoverable(profile.id)) continue;
      // City filter
      if (cityQuery.trim()) {
        const q = cityQuery.toLowerCase();
        const city = (profile.wedding_city ?? "").toLowerCase();
        if (!city.includes(q)) continue;
      }
      // Month filter
      if (monthFilter && profile.wedding_date) {
        const wd = new Date(profile.wedding_date).getTime();
        const now = Date.now();
        const days = (n: number) => n * 24 * 60 * 60 * 1000;
        const ok =
          (monthFilter === "next_3" && wd >= now && wd <= now + days(90)) ||
          (monthFilter === "next_6" && wd >= now && wd <= now + days(180)) ||
          (monthFilter === "next_year" && wd >= now && wd <= now + days(365));
        if (!ok) continue;
      }
      // Budget filter
      if (budgetFilter && need.budget_range !== budgetFilter) continue;
      // Urgency filter
      if (urgencyFilter && need.urgency !== urgencyFilter) continue;
      out.push({ profile, need });
    }

    out.sort((a, b) => {
      if (sort === "urgent_first") {
        const ra = URGENCY_RANK[a.need.urgency];
        const rb = URGENCY_RANK[b.need.urgency];
        if (ra !== rb) return ra - rb;
        return (
          new Date(b.need.created_at).getTime() -
          new Date(a.need.created_at).getTime()
        );
      }
      if (sort === "newest") {
        return (
          new Date(b.need.created_at).getTime() -
          new Date(a.need.created_at).getTime()
        );
      }
      if (sort === "soonest_wedding") {
        const da = new Date(a.profile.wedding_date ?? "9999-12-31").getTime();
        const db = new Date(b.profile.wedding_date ?? "9999-12-31").getTime();
        return da - db;
      }
      if (sort === "biggest") {
        const order: Record<string, number> = {
          "500-plus": 0,
          "300-500": 1,
          "200-300": 2,
          "100-200": 3,
          "50-100": 4,
          "under-50": 5,
        };
        const ra = order[a.profile.guest_count_range ?? ""] ?? 99;
        const rb = order[b.profile.guest_count_range ?? ""] ?? 99;
        return ra - rb;
      }
      return 0;
    });

    return out;
  }, [
    allNeeds,
    profiles,
    allowedSlugs,
    isDiscoverable,
    cityQuery,
    monthFilter,
    budgetFilter,
    urgencyFilter,
    sort,
  ]);

  // Modal state
  const [activeRow, setActiveRow] = useState<{
    profile: CommunityProfile;
    need: CommunityVendorNeed;
  } | null>(null);

  const categoryLabel = PORTAL_CATEGORY_LABEL[activeCategory] ?? "vendor";

  return (
    <div className="px-8 py-7">
      {/* Section intro */}
      <div className="mb-5">
        <SectionLabel>Brides looking for a {categoryLabel}</SectionLabel>
        <p
          className="mt-2 max-w-2xl text-[14px] italic"
          style={{
            fontFamily: "'EB Garamond', serif",
            color: "#6a6a6a",
          }}
        >
          these brides are actively searching. express interest and they'll
          see your profile, portfolio, and pricing — they decide whether to
          share contact info back.
        </p>
        <div className="mt-3 inline-flex items-center gap-2">
          <Chip tone="gold">
            {remainingToday} of {VENDOR_INTEREST_DAILY_LIMIT} introductions left today
          </Chip>
        </div>
      </div>

      {/* Multi-category toggle (only renders if vendor has >1 category) */}
      {portalCategories.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {portalCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors"
              style={{
                borderColor:
                  c === activeCategory
                    ? VENDOR_PALETTE.charcoal
                    : "rgba(196,162,101,0.35)",
                backgroundColor:
                  c === activeCategory ? VENDOR_PALETTE.charcoal : "white",
                color: c === activeCategory ? "#FAF8F5" : VENDOR_PALETTE.charcoalSoft,
              }}
            >
              {PORTAL_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-5 px-5 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <Filter label="City">
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="any city"
              className={inputClass}
            />
          </Filter>
          <Filter label="Wedding date">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className={inputClass}
            >
              <option value="">Any time</option>
              <option value="next_3">Next 3 months</option>
              <option value="next_6">Next 6 months</option>
              <option value="next_year">Next year</option>
            </select>
          </Filter>
          <Filter label="Budget">
            <select
              value={budgetFilter}
              onChange={(e) =>
                setBudgetFilter((e.target.value as BudgetRange) || "")
              }
              className={inputClass}
            >
              <option value="">Any budget</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </Filter>
          <Filter label="Urgency">
            <select
              value={urgencyFilter}
              onChange={(e) =>
                setUrgencyFilter((e.target.value as VendorNeedUrgency) || "")
              }
              className={inputClass}
            >
              <option value="">Any urgency</option>
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.emoji} {u.label}
                </option>
              ))}
            </select>
          </Filter>
          <Filter label="Sort by">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={inputClass}
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABEL[k]}
                </option>
              ))}
            </select>
          </Filter>
        </div>
      </Card>

      {/* Results */}
      {rows.length === 0 ? (
        <Card className="px-8 py-14 text-center">
          <p
            className="text-[18px] italic"
            style={{ fontFamily: "'EB Garamond', serif", color: "#6a6a6a" }}
          >
            no brides match these filters right now.
          </p>
          <p className="mt-2 text-[12.5px] text-[#8a8a8a]">
            new brides publish their checklists every week — check back soon.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map(({ profile, need }) => (
            <BrideNeedCard
              key={need.id}
              profile={profile}
              need={need}
              alreadyContacted={interestsByNeedId.get(need.id) ?? null}
              onExpress={() => setActiveRow({ profile, need })}
            />
          ))}
        </div>
      )}

      {/* Express interest modal */}
      <ExpressInterestModal
        open={activeRow !== null}
        onClose={() => setActiveRow(null)}
        vendor={vendor}
        target={activeRow}
      />
    </div>
  );
}

// ── One bride card ──────────────────────────────────────────────────────────

function BrideNeedCard({
  profile,
  need,
  alreadyContacted,
  onExpress,
}: {
  profile: CommunityProfile;
  need: CommunityVendorNeed;
  alreadyContacted:
    | {
        status:
          | "pending"
          | "viewed"
          | "accepted"
          | "declined"
          | "expired";
      }
    | null;
  onExpress: () => void;
}) {
  const cat = getVendorNeedCategory(need.category_slug);
  const budget = need.budget_range
    ? BUDGET_RANGES.find((b) => b.id === need.budget_range)?.label
    : null;
  const urgency = URGENCY_OPTIONS.find((u) => u.id === need.urgency);
  const route = [shortCity(profile.hometown), shortCity(profile.wedding_city)]
    .filter(Boolean)
    .join(" → ");
  const monthYear = formatMonthYear(profile.wedding_date);
  const guestCount = profile.guest_count_range
    ? GUEST_COUNT_LABEL[profile.guest_count_range]
    : null;
  const vibe = profile.quote || profile.wedding_vibe;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start">
        {/* Avatar */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[24px]"
          style={{
            background: profile.cover_seed_gradient
              ? `linear-gradient(135deg, ${profile.cover_seed_gradient[0]}, ${profile.cover_seed_gradient[1]})`
              : VENDOR_PALETTE.champagneSoft,
            color: "white",
            fontFamily: "'Cormorant Garamond', serif",
          }}
          aria-hidden
        >
          {profile.display_name.charAt(0)}
        </div>

        {/* Bride basics + need details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3
              className="text-[22px] leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                color: VENDOR_PALETTE.charcoal,
              }}
            >
              {profile.display_name}
            </h3>
            {urgency && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.18em]"
                style={{
                  backgroundColor:
                    need.urgency === "urgent"
                      ? "#F5E0D6"
                      : need.urgency === "soon"
                        ? "#F5E6D0"
                        : "#E8F0E0",
                  color:
                    need.urgency === "urgent"
                      ? "#9a4a30"
                      : need.urgency === "soon"
                        ? "#8a5a20"
                        : "#4a6b3a",
                }}
              >
                <span aria-hidden>{urgency.emoji}</span>
                {urgency.label}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#6a6a6a]">
            {route && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} strokeWidth={1.8} className="text-[#b5a68e]" />
                {route}
              </span>
            )}
            {monthYear && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} strokeWidth={1.8} className="text-[#b5a68e]" />
                {monthYear}
              </span>
            )}
            {guestCount && (
              <span className="inline-flex items-center gap-1">
                <Users size={11} strokeWidth={1.8} className="text-[#b5a68e]" />
                {guestCount} guests
              </span>
            )}
          </div>

          {/* Need block */}
          <div
            className="mt-4 rounded-xl px-4 py-3"
            style={{ backgroundColor: VENDOR_PALETTE.champagneSoft }}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#9E8245]">
              looking for {cat?.emoji} {cat?.label}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-[#4a4a4a]">
              {budget && <span>Budget: {budget}</span>}
              {need.preferred_style && (
                <>
                  {budget && <span className="text-[#b5a68e]">·</span>}
                  <span>Style: {need.preferred_style}</span>
                </>
              )}
            </div>
            {need.notes && (
              <p
                className="mt-2 text-[14px] italic leading-[1.5]"
                style={{
                  fontFamily: "'EB Garamond', serif",
                  color: VENDOR_PALETTE.charcoal,
                }}
              >
                &ldquo;{need.notes}&rdquo;
              </p>
            )}
          </div>

          {vibe && (
            <p
              className="mt-3 text-[13px] italic leading-[1.5] text-[#6a6a6a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Vibe: &ldquo;{vibe}&rdquo;
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <details className="text-[12px]">
              <summary className="cursor-pointer text-[#6a6a6a] hover:text-[#2C2C2C]">
                view wedding brief
              </summary>
              <div className="mt-3 rounded-lg border border-dashed border-[rgba(196,162,101,0.35)] bg-white px-4 py-3 text-left">
                <WeddingBrief profile={profile} />
              </div>
            </details>
            {alreadyContacted ? (
              <Chip tone={alreadyContacted.status === "accepted" ? "sage" : "gold"}>
                {alreadyContacted.status === "accepted"
                  ? "✓ Accepted"
                  : alreadyContacted.status === "declined"
                    ? "Closed"
                    : alreadyContacted.status === "expired"
                      ? "Expired"
                      : "Sent"}
              </Chip>
            ) : (
              <PrimaryButton onClick={onExpress}>
                <Sparkles size={13} strokeWidth={1.8} />
                Express interest
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Wedding brief (vendor-safe view) ────────────────────────────────────────
// Shows ONLY what the privacy model allows: events list, vibe quote, color
// palette. No last name, hometown specifics beyond city, or contact info.

function WeddingBrief({ profile }: { profile: CommunityProfile }) {
  return (
    <dl className="space-y-2 text-[12.5px] text-[#4a4a4a]">
      {profile.wedding_events.length > 0 && (
        <BriefRow label="Events">
          {profile.wedding_events.join(", ")}
        </BriefRow>
      )}
      {profile.wedding_vibe && (
        <BriefRow label="Vibe">
          <span className="italic">{profile.wedding_vibe}</span>
        </BriefRow>
      )}
      {profile.color_palette.length > 0 && (
        <BriefRow label="Palette">
          <div className="flex items-center gap-1.5">
            {profile.color_palette.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1"
                title={c.name}
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
              </span>
            ))}
          </div>
        </BriefRow>
      )}
      {profile.wedding_song && (
        <BriefRow label="Song">{profile.wedding_song}</BriefRow>
      )}
    </dl>
  );
}

function BriefRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-start gap-2">
      <dt className="text-[10.5px] uppercase tracking-[0.14em] text-[#8a8a8a]">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonthYear(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function shortCity(city?: string): string | undefined {
  if (!city) return undefined;
  return city.split(",")[0]?.trim() || city;
}

// ── Filter helpers ──────────────────────────────────────────────────────────

function Filter({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#8a8a8a]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-[rgba(196,162,101,0.35)] bg-white px-2.5 py-1.5 text-[13px] text-[#2C2C2C] focus:border-[#C4A265] focus:outline-none focus:ring-2 focus:ring-[#F5E6D0]";
