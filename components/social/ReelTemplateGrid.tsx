"use client";

import { useMemo, useState } from "react";
import type { ReelTemplate, ReelTemplateCategory } from "@/lib/social/types";
import ReelTemplateCard from "./ReelTemplateCard";

type Props = {
  templates: ReelTemplate[];
  onSelect: (template: ReelTemplate) => void;
};

type FilterKey = "all" | ReelTemplateCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "showcase", label: "Showcase" },
  { key: "testimonial", label: "Testimonial" },
  { key: "behind_the_scenes", label: "Behind the Scenes" },
  { key: "announcement", label: "Announcement" },
  { key: "tips", label: "Tips" },
  { key: "intro", label: "Intro" },
];

export default function ReelTemplateGrid({ templates, onSelect }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? templates
        : templates.filter((t) => t.category === filter);
    return [...list].sort((a, b) => a.sort_order - b.sort_order);
  }, [templates, filter]);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <p className="text-sm text-neutral-600">
            No templates in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <ReelTemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
