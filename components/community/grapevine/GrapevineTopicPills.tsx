"use client";

// ── Topic filter pills ──────────────────────────────────────────────────────
// "All" + the six topic categories. Used for both filtering the feed and
// (in single-select mode) picking a category in the create-thread form.

import { cn } from "@/lib/utils";
import { GRAPEVINE_TOPICS } from "@/lib/community/grapevine";
import type { GrapevineTopicSlug } from "@/types/grapevine";

export type TopicFilter = "all" | GrapevineTopicSlug;

export function GrapevineTopicPills({
  active,
  onChange,
  showAll = true,
  size = "md",
}: {
  active: TopicFilter | GrapevineTopicSlug;
  onChange: (slug: TopicFilter) => void;
  showAll?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {showAll && (
        <Pill
          label="All"
          active={active === "all"}
          onClick={() => onChange("all")}
          size={size}
        />
      )}
      {GRAPEVINE_TOPICS.map((t) => (
        <Pill
          key={t.slug}
          label={t.display_name}
          icon={t.icon}
          active={active === t.slug}
          onClick={() => onChange(t.slug)}
          size={size}
        />
      ))}
    </div>
  );
}

function Pill({
  label,
  icon,
  active,
  onClick,
  size,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
  size: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors",
        size === "sm" ? "px-3 py-1 text-[11.5px]" : "px-3.5 py-1.5 text-[12.5px]",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {label}
    </button>
  );
}
