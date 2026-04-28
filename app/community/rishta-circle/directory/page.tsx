"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/shell/TopNav";
import { SubPageHeader } from "@/components/community/rishta-circle/SubPageHeader";
import {
  DEFAULT_FILTERS,
  DirectoryFilters,
  type DirectoryFilterState,
} from "@/components/community/rishta-circle/DirectoryFilters";
import { ProfileCard } from "@/components/community/rishta-circle/ProfileCard";
import { ensureSeeded } from "@/lib/rishta-circle/seed-data";
import { getMembers } from "@/lib/rishta-circle/storage";
import type { Member } from "@/lib/rishta-circle/types";

export default function RishtaCircleDirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filters, setFilters] = useState<DirectoryFilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    ensureSeeded();
    setMembers(getMembers().filter((m) => m.isActive));
  }, []);

  const filtered = useMemo(() => {
    const q = filters.locationQuery.trim().toLowerCase();
    let list = members.filter((m) => {
      if (filters.gender !== "all" && m.gender !== filters.gender) return false;
      if (filters.religion !== "all" && m.religion !== filters.religion)
        return false;
      if (
        filters.submittedBy !== "all" &&
        m.submittedBy !== filters.submittedBy
      )
        return false;
      if (m.age < filters.ageMin || m.age > filters.ageMax) return false;
      if (q) {
        const haystack = `${m.locationCity} ${m.locationState} ${m.locationCountry}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (filters.sort === "alphabetical") {
      list = [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else {
      list = [...list].sort((a, b) => b.approvedAt.localeCompare(a.approvedAt));
    }
    return list;
  }, [members, filters]);

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <SubPageHeader
        eyebrow="Member directory"
        title="browse the circle."
        subline="Every profile has been reviewed. Take your time."
      />
      <main className="px-10 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <DirectoryFilters
            value={filters}
            onChange={setFilters}
            resultCount={filtered.length}
          />

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => (
                <ProfileCard key={m.id} member={m} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink/12 bg-white px-8 py-14 text-center">
      <p className="font-serif text-[22px] font-semibold text-ink">
        No profiles match these filters.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-ink-muted">
        Try widening the age range or changing the tradition. The circle is
        small — relax a filter and see who's there.
      </p>
      <Link
        href="/community/rishta-circle/apply"
        className="mt-6 inline-flex rounded-full border border-gold px-5 py-2 text-[13px] font-medium text-gold hover:bg-gold hover:text-white"
      >
        Know someone who should be here? Invite them.
      </Link>
    </div>
  );
}
