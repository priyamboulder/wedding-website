"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { RELIGIONS } from "@/lib/rishta-circle/types";
import type { Gender, SubmittedBy } from "@/lib/rishta-circle/types";

export interface DirectoryFilterState {
  gender: "all" | Gender;
  religion: "all" | string;
  submittedBy: "all" | SubmittedBy;
  locationQuery: string;
  ageMin: number;
  ageMax: number;
  sort: "newest" | "alphabetical";
}

export const DEFAULT_FILTERS: DirectoryFilterState = {
  gender: "all",
  religion: "all",
  submittedBy: "all",
  locationQuery: "",
  ageMin: 21,
  ageMax: 45,
  sort: "newest",
};

export function DirectoryFilters({
  value,
  onChange,
  resultCount,
}: {
  value: DirectoryFilterState;
  onChange: (next: DirectoryFilterState) => void;
  resultCount: number;
}) {
  const set = <K extends keyof DirectoryFilterState>(
    key: K,
    next: DirectoryFilterState[K],
  ) => onChange({ ...value, [key]: next });

  return (
    <section className="rounded-2xl border border-ink/8 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
          Filter the circle
        </p>
        <p className="text-[12.5px] text-ink-muted">
          {resultCount} {resultCount === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <PillGroup
          label="Gender"
          options={[
            { id: "all", label: "All" },
            { id: "female", label: "Female" },
            { id: "male", label: "Male" },
            { id: "non-binary", label: "Non-binary" },
          ]}
          value={value.gender}
          onChange={(v) => set("gender", v as DirectoryFilterState["gender"])}
        />

        <div>
          <Label>Tradition</Label>
          <select
            value={value.religion}
            onChange={(e) => set("religion", e.target.value)}
            className="mt-2 w-full rounded-full border border-ink/10 bg-white px-4 py-2 text-[13px] text-ink focus:border-gold focus:outline-none"
          >
            <option value="all">All</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Location</Label>
          <div className="relative mt-2">
            <Search
              size={14}
              strokeWidth={1.8}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="text"
              placeholder="City or country"
              value={value.locationQuery}
              onChange={(e) => set("locationQuery", e.target.value)}
              className="w-full rounded-full border border-ink/10 bg-white py-2 pl-9 pr-4 text-[13px] text-ink focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div>
          <Label>Age range</Label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={18}
              max={80}
              value={value.ageMin}
              onChange={(e) => set("ageMin", Number(e.target.value) || 0)}
              className="w-full rounded-full border border-ink/10 bg-white px-3 py-2 text-[13px] text-ink focus:border-gold focus:outline-none"
            />
            <span className="text-[12px] text-ink-muted">to</span>
            <input
              type="number"
              min={18}
              max={99}
              value={value.ageMax}
              onChange={(e) => set("ageMax", Number(e.target.value) || 0)}
              className="w-full rounded-full border border-ink/10 bg-white px-3 py-2 text-[13px] text-ink focus:border-gold focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <PillGroup
          label="Submitted by"
          options={[
            { id: "all", label: "All" },
            { id: "self", label: "Self" },
            { id: "family", label: "Family" },
          ]}
          value={value.submittedBy}
          onChange={(v) =>
            set("submittedBy", v as DirectoryFilterState["submittedBy"])
          }
        />
        <PillGroup
          label="Sort"
          options={[
            { id: "newest", label: "Newest" },
            { id: "alphabetical", label: "A–Z" },
          ]}
          value={value.sort}
          onChange={(v) => set("sort", v as DirectoryFilterState["sort"])}
        />
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
      {children}
    </p>
  );
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] transition-colors",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-ink/12 bg-white text-ink-muted hover:border-ink/30 hover:text-ink",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
