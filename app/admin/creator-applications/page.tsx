"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ArrowRight, Filter, Search } from "lucide-react";
import { useCreatorApplicationsStore } from "@/stores/creator-applications-store";
import {
  EXPERTISE_LABELS,
  FOLLOWING_LABELS,
  STATUS_LABELS,
  type ApplicationStatus,
  type ExpertiseArea,
  type FollowingRange,
} from "@/types/creator-application";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

type StatusFilter = "all" | ApplicationStatus;
type ExpertiseFilter = "all" | ExpertiseArea;
type FollowingFilter = "all" | FollowingRange;
type SortKey = "newest" | "oldest" | "following";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under review" },
  { key: "more_info_requested", label: "More info" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "waitlisted", label: "Waitlisted" },
];

const FOLLOWING_ORDER: FollowingRange[] = [
  "under_1k",
  "1k_10k",
  "10k_50k",
  "50k_100k",
  "100k_500k",
  "500k_plus",
];

const STATUS_BADGE: Record<ApplicationStatus, { bg: string; text: string }> = {
  pending: { bg: "#FBF4E5", text: "#8B6B1F" },
  under_review: { bg: "#FBF4E5", text: "#8B6B1F" },
  more_info_requested: { bg: "#F4EDE4", text: "#7C5C2E" },
  approved: { bg: "#E7F3EC", text: "#3B6E4A" },
  rejected: { bg: "#F9E9E6", text: "#8B2A22" },
  waitlisted: { bg: "#EDEEF5", text: "#3F4A78" },
};

export default function AdminApplicationsListPage() {
  const applications = useCreatorApplicationsStore(
    useShallow((s) => s.list()),
  );
  const countsByStatus = useCreatorApplicationsStore(
    useShallow((s) => s.countsByStatus()),
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expertiseFilter, setExpertiseFilter] =
    useState<ExpertiseFilter>("all");
  const [followingFilter, setFollowingFilter] =
    useState<FollowingFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = [...applications];
    if (statusFilter !== "all")
      list = list.filter((a) => a.status === statusFilter);
    if (expertiseFilter !== "all")
      list = list.filter((a) => a.primaryExpertise === expertiseFilter);
    if (followingFilter !== "all")
      list = list.filter((a) => a.combinedFollowingRange === followingFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (sortKey === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortKey === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return (
        FOLLOWING_ORDER.indexOf(b.combinedFollowingRange) -
        FOLLOWING_ORDER.indexOf(a.combinedFollowingRange)
      );
    });
    return list;
  }, [applications, statusFilter, expertiseFilter, followingFilter, sortKey, search]);

  // ── Stats ────────────────────────────────────────────────────────
  const now = new Date();
  const thisMonth = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  };
  const approvedThisMonth = applications.filter(
    (a) => a.status === "approved" && a.reviewedAt && thisMonth(a.reviewedAt),
  ).length;
  const rejectedThisMonth = applications.filter(
    (a) => a.status === "rejected" && a.reviewedAt && thisMonth(a.reviewedAt),
  ).length;
  const waitlistedTotal = applications.filter(
    (a) => a.status === "waitlisted",
  ).length;
  const avgHours = (() => {
    const decided = applications.filter(
      (a) => a.reviewedAt && a.createdAt,
    );
    if (decided.length === 0) return null;
    const totalMs = decided.reduce(
      (sum, a) =>
        sum +
        (new Date(a.reviewedAt!).getTime() - new Date(a.createdAt).getTime()),
      0,
    );
    return totalMs / decided.length / 3_600_000;
  })();

  const pendingTotal =
    countsByStatus.pending +
    countsByStatus.under_review +
    countsByStatus.more_info_requested;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
      <div
        className="text-[11px] uppercase tracking-[0.22em] text-[#B8755D]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        Creator Program
      </div>
      <h1
        className="mt-3 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          fontWeight: 400,
        }}
      >
        Creator applications
      </h1>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        <Stat label="Pending" value={pendingTotal} accent />
        <Stat label="Approved this month" value={approvedThisMonth} />
        <Stat label="Rejected this month" value={rejectedThisMonth} />
        <Stat
          label="Avg. time to decision"
          value={avgHours == null ? "—" : formatHours(avgHours)}
        />
      </div>
      {waitlistedTotal > 0 && (
        <p
          className="mt-3 text-[12px] text-[#8B7E6F]"
          style={{ fontFamily: BODY }}
        >
          {waitlistedTotal} waitlisted applicant{waitlistedTotal === 1 ? "" : "s"}.
        </p>
      )}

      <div className="mt-10 rounded-2xl border border-[#E6DFD3] bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E6DFD3] px-5 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((s) => {
              const count =
                s.key === "all"
                  ? applications.length
                  : countsByStatus[s.key as ApplicationStatus];
              const active = statusFilter === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${
                    active
                      ? "bg-[#1C1917] text-white"
                      : "border border-[#E6DFD3] bg-white text-[#1C1917] hover:border-[#B8755D] hover:text-[#B8755D]"
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {s.label}
                  <span
                    className={`text-[10.5px] ${active ? "text-white/70" : "text-[#8B7E6F]"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E6DFD3] px-5 py-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              strokeWidth={1.8}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6F]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full rounded-full border border-[#E6DFD3] bg-white py-2 pl-9 pr-4 text-[12.5px] text-[#1C1917] transition-colors placeholder:text-[#B5AA9A] focus:border-[#B8755D] focus:outline-none"
              style={{ fontFamily: BODY }}
            />
          </div>
          <FilterSelect
            label="Expertise"
            value={expertiseFilter}
            onChange={(v) => setExpertiseFilter(v as ExpertiseFilter)}
            options={[
              { value: "all", label: "All areas" },
              ...(Object.keys(EXPERTISE_LABELS) as ExpertiseArea[]).map(
                (k) => ({
                  value: k,
                  label: EXPERTISE_LABELS[k],
                }),
              ),
            ]}
          />
          <FilterSelect
            label="Following"
            value={followingFilter}
            onChange={(v) => setFollowingFilter(v as FollowingFilter)}
            options={[
              { value: "all", label: "All sizes" },
              ...FOLLOWING_ORDER.map((k) => ({
                value: k,
                label: FOLLOWING_LABELS[k],
              })),
            ]}
          />
          <FilterSelect
            label="Sort"
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "following", label: "Largest following" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <div
            className="px-6 py-16 text-center text-[13px] text-[#8B7E6F]"
            style={{ fontFamily: BODY }}
          >
            No applications match these filters.
          </div>
        ) : (
          <ul className="divide-y divide-[#E6DFD3]">
            {filtered.map((app) => {
              const theme = STATUS_BADGE[app.status];
              return (
                <li key={app.id}>
                  <Link
                    href={`/admin/creator-applications/${app.id}`}
                    className="grid grid-cols-1 gap-4 px-5 py-5 transition-colors hover:bg-[#FBF9F4] md:grid-cols-[1fr_180px_130px_140px_110px_auto] md:items-center"
                  >
                    <div>
                      <div
                        className="text-[14.5px] font-medium text-[#1C1917]"
                        style={{ fontFamily: BODY }}
                      >
                        {app.fullName}
                      </div>
                      <div
                        className="text-[11.5px] text-[#8B7E6F]"
                        style={{ fontFamily: BODY }}
                      >
                        {app.email}
                      </div>
                    </div>
                    <div
                      className="text-[12.5px] text-[#1C1917]"
                      style={{ fontFamily: BODY }}
                    >
                      {EXPERTISE_LABELS[app.primaryExpertise]}
                    </div>
                    <div
                      className="text-[12.5px] text-[#6B6157]"
                      style={{ fontFamily: BODY }}
                    >
                      {FOLLOWING_LABELS[app.combinedFollowingRange]}
                    </div>
                    <div
                      className="text-[12px] text-[#8B7E6F]"
                      style={{ fontFamily: BODY }}
                    >
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <span
                      className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[10.5px] uppercase tracking-[0.14em]"
                      style={{
                        fontFamily: BODY,
                        fontWeight: 500,
                        background: theme.bg,
                        color: theme.text,
                      }}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                    <ArrowRight
                      size={14}
                      strokeWidth={1.8}
                      className="justify-self-end text-[#8B7E6F]"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        accent
          ? "border-[#B8755D]/30 bg-[#B8755D]/5"
          : "border-[#E6DFD3] bg-white"
      }`}
    >
      <div
        className="text-[10.5px] uppercase tracking-[0.16em] text-[#8B7E6F]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {label}
      </div>
      <div
        className={`mt-2 text-[#1C1917] ${accent ? "text-[#B8755D]" : ""}`}
        style={{
          fontFamily: DISPLAY,
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: "-0.015em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white pl-3 pr-1 transition-colors hover:border-[#B8755D]">
      <Filter size={12} strokeWidth={1.8} className="text-[#8B7E6F]" />
      <span
        className="text-[10.5px] uppercase tracking-[0.14em] text-[#8B7E6F]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent py-1.5 pr-4 text-[12px] text-[#1C1917] outline-none"
        style={{ fontFamily: BODY }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatHours(hours: number) {
  if (hours < 48) return `${hours.toFixed(1)} hrs`;
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}
