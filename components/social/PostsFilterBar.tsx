"use client";

import type { ReactNode } from "react";
import type {
  Platform,
  PostStatus,
  SocialContentItem,
} from "@/lib/social/types";
import { PLATFORM_OPTIONS } from "./PlatformSelector";

export type SortOption = "newest" | "oldest" | "platform_az";

export type PostsFilters = {
  platform: Platform | "all";
  status: PostStatus | "all";
  contentItemId: string | "all";
  sort: SortOption;
  search: string;
};

type Props = {
  filters: PostsFilters;
  onChange: (next: PostsFilters) => void;
  contentItems: SocialContentItem[];
};

const STATUS_OPTIONS: { id: PostStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "approved", label: "Approved" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  behind_the_scenes: "BTS",
  testimonial: "Testimonial",
  portfolio_highlight: "Portfolio",
  tip_or_advice: "Tip",
  promotion: "Promotion",
  announcement: "Announcement",
  festival_or_seasonal: "Seasonal",
};

export default function PostsFilterBar({
  filters,
  onChange,
  contentItems,
}: Props) {
  const set = <K extends keyof PostsFilters>(key: K, value: PostsFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      {/* Platform pills */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Platform
        </p>
        <div className="flex flex-wrap gap-1.5">
          <PillButton
            active={filters.platform === "all"}
            onClick={() => set("platform", "all")}
          >
            All
          </PillButton>
          {PLATFORM_OPTIONS.map((opt) => (
            <PillButton
              key={opt.id}
              active={filters.platform === opt.id}
              onClick={() => set("platform", opt.id)}
            >
              <span aria-hidden className="mr-1">
                {opt.icon}
              </span>
              {opt.label}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Status pills */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <PillButton
              key={opt.id}
              active={filters.status === opt.id}
              onClick={() => set("status", opt.id)}
            >
              {opt.label}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Content / sort / search row */}
      <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_1.3fr]">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Content item
          </label>
          <select
            value={filters.contentItemId}
            onChange={(e) => set("contentItemId", e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="all">All Content</option>
            {contentItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
                {item.content_type
                  ? ` · ${CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Sort
          </label>
          <select
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value as SortOption)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="platform_az">Platform A–Z</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Search captions
          </label>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Search by keyword…"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
      }`}
    >
      {children}
    </button>
  );
}
