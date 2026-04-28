"use client";

import Link from "next/link";
import { Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/rishta-circle/types";
import { Monogram } from "./Monogram";
import { InterestButton } from "./InterestButton";

function truncate(text: string, max: number) {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

export function ProfileCard({ member }: { member: Member }) {
  const location = [member.locationCity, member.locationCountry]
    .filter(Boolean)
    .join(", ");
  const religionLabel =
    member.religion === "Other" && member.religionOther
      ? member.religionOther
      : member.religion;

  return (
    <article className="group flex flex-col rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {member.profilePhoto ? (
          <img
            src={member.profilePhoto}
            alt={member.fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <Monogram name={member.fullName} size={64} />
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/community/rishta-circle/members/${member.id}`}
            className="block font-serif text-[20px] font-semibold leading-tight text-ink hover:underline"
          >
            {member.fullName}
          </Link>
          <p className="mt-1 text-[13px] text-ink-muted">
            {member.age} · {location}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-1.5 text-[13px]">
        <Row label="Profession" value={member.profession} />
        <Row label="Tradition" value={religionLabel} />
      </dl>

      <p className="mt-4 flex-1 font-serif text-[14px] italic leading-relaxed text-ink-muted">
        {truncate(member.bio, 80)}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        {member.submittedBy === "family" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-saffron/30 bg-saffron-pale/60 px-2.5 py-1",
              "font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-soft",
            )}
          >
            <Users2 size={10} strokeWidth={2} />
            Family
          </span>
        ) : (
          <span />
        )}
        <InterestButton toMemberId={member.id} compact />
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold">
        {label}
      </dt>
      <dd className="truncate text-[13px] text-ink-soft">{value}</dd>
    </div>
  );
}
