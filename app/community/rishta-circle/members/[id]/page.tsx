"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { SubPageHeader } from "@/components/community/rishta-circle/SubPageHeader";
import { Monogram } from "@/components/community/rishta-circle/Monogram";
import { InterestButton } from "@/components/community/rishta-circle/InterestButton";
import {
  getCurrentUserId,
  getInterestBetween,
  getMember,
} from "@/lib/rishta-circle/storage";
import { ensureSeeded } from "@/lib/rishta-circle/seed-data";
import type { Interest, Member } from "@/lib/rishta-circle/types";

export default function RishtaCircleMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inboundInterest, setInboundInterest] = useState<Interest | null>(null);

  useEffect(() => {
    ensureSeeded();
    const m = getMember(id);
    setMember(m);
    const uid = getCurrentUserId();
    if (uid && m) {
      setInboundInterest(getInterestBetween(m.id, uid));
    }
    setMounted(true);
  }, [id]);

  if (mounted && !member) notFound();
  if (!member) return null;

  const location = [member.locationCity, member.locationState, member.locationCountry]
    .filter(Boolean)
    .join(", ");
  const religionLabel =
    member.religion === "Other" && member.religionOther
      ? member.religionOther
      : member.religion;

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <SubPageHeader
        eyebrow="A profile"
        title={member.fullName}
        subline={`${member.age} · ${location}`}
        backHref="/community/rishta-circle/directory"
        backLabel="Back to the directory"
      />
      <main className="px-10 py-14">
        <article className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[280px_1fr]">
          <aside>
            <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {member.profilePhoto ? (
                  <img
                    src={member.profilePhoto}
                    alt={member.fullName}
                    className="h-40 w-40 rounded-full object-cover"
                  />
                ) : (
                  <Monogram name={member.fullName} size={160} />
                )}
                <h2 className="mt-5 font-serif text-[22px] font-semibold text-ink">
                  {member.fullName}
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {member.age} · {member.gender}
                </p>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  Lives
                </p>
                <p className="mt-1 text-[13.5px] text-ink-soft">{location}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  Originally from
                </p>
                <p className="mt-1 text-[13.5px] text-ink-soft">
                  {member.hometown}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  Tradition
                </p>
                <p className="mt-1 text-[13.5px] text-ink-soft">
                  {religionLabel}
                </p>
                {member.submittedBy === "family" && (
                  <p className="mt-5 rounded-full border border-saffron/30 bg-saffron-pale/60 px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-soft">
                    Submitted by{" "}
                    {member.submitterRelationship?.toLowerCase() ?? "family"}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <InterestButton toMemberId={member.id} />
                {inboundInterest && (
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-rose-light/50 bg-rose-pale/50 px-3 py-1.5 text-[12px] text-rose">
                    <Heart size={12} strokeWidth={2} />
                    {member.fullName.split(" ")[0]} has expressed interest
                  </p>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-10">
            <Section label="Bio">
              <p className="font-serif text-[17px] leading-relaxed text-ink-soft">
                {member.bio}
              </p>
            </Section>

            <Section label="Education">
              <p className="text-[14.5px] text-ink">{member.education}</p>
            </Section>

            <Section label="Profession">
              <p className="text-[14.5px] text-ink">{member.profession}</p>
            </Section>

            <Section label="What they're looking for">
              <p className="font-serif text-[16px] leading-relaxed text-ink-soft">
                {member.lookingFor}
              </p>
            </Section>

            {member.familyValues && (
              <Section label="Family values">
                <p className="font-serif text-[16px] leading-relaxed text-ink-soft">
                  {member.familyValues}
                </p>
              </Section>
            )}

            <div className="pt-4">
              <Link
                href="/community/rishta-circle/directory"
                className="text-[13px] font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
              >
                ← Keep browsing the circle
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
        {label}
      </p>
      <div className="mt-3 border-t border-ink/8 pt-4">{children}</div>
    </section>
  );
}
