"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Heart, Mail, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { SubPageHeader } from "@/components/community/rishta-circle/SubPageHeader";
import { Monogram } from "@/components/community/rishta-circle/Monogram";
import {
  getCurrentMember,
  getInterests,
  getMember,
  getMembers,
  getMutualMatches,
  setCurrentUserId,
  updateInterestStatus,
} from "@/lib/rishta-circle/storage";
import { ensureSeeded } from "@/lib/rishta-circle/seed-data";
import type { Interest, InterestStatus, Member } from "@/lib/rishta-circle/types";

type Row = { interest: Interest; member: Member };

export default function RishtaCircleDashboardPage() {
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [mutuals, setMutuals] = useState<Member[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    const me = getCurrentMember();
    setCurrentMember(me);
    setMembers(getMembers());
    setInterests(getInterests());
    setMutuals(me ? getMutualMatches(me.id) : []);
  };

  useEffect(() => {
    ensureSeeded();
    refresh();
    setMounted(true);
  }, []);

  const sent: Row[] = currentMember
    ? interests
        .filter((i) => i.fromMemberId === currentMember.id)
        .map((i) => ({ interest: i, member: getMember(i.toMemberId) as Member }))
        .filter((r) => r.member)
    : [];

  const received: Row[] = currentMember
    ? interests
        .filter((i) => i.toMemberId === currentMember.id)
        .map((i) => ({ interest: i, member: getMember(i.fromMemberId) as Member }))
        .filter((r) => r.member)
    : [];

  const updateStatus = (id: string, status: InterestStatus) => {
    updateInterestStatus(id, status);
    refresh();
  };

  if (!mounted) return (
    <div className="min-h-screen bg-ivory">
      <div className="h-14 border-b border-border bg-white" />
      <div className="mx-auto max-w-5xl px-10 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-ivory-warm" />
        <div className="mt-6 h-48 animate-pulse rounded-xl bg-ivory-warm" />
      </div>
    </div>
  );

  if (!currentMember) {
    return <NoCurrentMemberScreen members={members} onPick={() => refresh()} />;
  }

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <SubPageHeader
        eyebrow="My dashboard"
        title="your rishta circle."
        subline={`Signed in as ${currentMember.fullName}. Manage your interests and mutual matches here.`}
      />
      <main className="px-10 py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          <MyProfileSection member={currentMember} onSignOut={() => {
            setCurrentUserId(null);
            refresh();
          }} />

          <DashSection
            title="Mutual matches"
            subtitle="Both sides said yes. Contact details are visible below."
          >
            {mutuals.length === 0 ? (
              <EmptyCard text="No mutual matches yet." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {mutuals.map((m) => (
                  <MutualCard key={m.id} member={m} />
                ))}
              </div>
            )}
          </DashSection>

          <DashSection
            title="Interests received"
            subtitle="Members who have expressed interest in you. Accepting shares your contact details."
          >
            {received.length === 0 ? (
              <EmptyCard text="No one has reached out yet." />
            ) : (
              <ul className="divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-white">
                {received.map((r) => (
                  <InterestRow
                    key={r.interest.id}
                    row={r}
                    showActions={r.interest.status === "pending"}
                    onAccept={() => updateStatus(r.interest.id, "accepted")}
                    onDecline={() => updateStatus(r.interest.id, "declined")}
                  />
                ))}
              </ul>
            )}
          </DashSection>

          <DashSection
            title="Interests sent"
            subtitle="Members you've reached out to. Contact details unlock on mutual yes."
          >
            {sent.length === 0 ? (
              <EmptyCard text="You haven't expressed interest in anyone yet." />
            ) : (
              <ul className="divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-white">
                {sent.map((r) => (
                  <InterestRow key={r.interest.id} row={r} />
                ))}
              </ul>
            )}
          </DashSection>
        </div>
      </main>
    </div>
  );
}

function DashSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
          {title}
        </p>
        <p className="mt-1.5 font-serif text-[15px] italic text-ink-muted">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

function MyProfileSection({
  member,
  onSignOut,
}: {
  member: Member;
  onSignOut: () => void;
}) {
  return (
    <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
        My profile
      </p>
      <div className="mt-4 flex items-center gap-5">
        {member.profilePhoto ? (
          <img
            src={member.profilePhoto}
            alt={member.fullName}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <Monogram name={member.fullName} size={80} />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[22px] font-semibold text-ink">
            {member.fullName}
          </p>
          <p className="mt-1 text-[13.5px] text-ink-muted">
            {member.age} · {member.locationCity}, {member.locationCountry} ·{" "}
            {member.religion}
          </p>
          <p className="mt-2 max-w-xl truncate text-[13px] text-ink-soft">
            {member.bio}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={`/community/rishta-circle/members/${member.id}`}
            className="rounded-full border border-ink/15 px-4 py-2 text-center text-[12.5px] font-medium text-ink hover:border-gold"
          >
            View as others see it
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="text-[12px] text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Switch member
          </button>
        </div>
      </div>
    </section>
  );
}

function InterestRow({
  row,
  showActions = false,
  onAccept,
  onDecline,
}: {
  row: Row;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const { interest, member } = row;
  return (
    <li className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <Link
        href={`/community/rishta-circle/members/${member.id}`}
        className="flex min-w-0 items-center gap-4"
      >
        {member.profilePhoto ? (
          <img
            src={member.profilePhoto}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <Monogram name={member.fullName} size={48} />
        )}
        <div className="min-w-0">
          <p className="font-serif text-[16px] font-semibold text-ink">
            {member.fullName}
          </p>
          <p className="truncate text-[12.5px] text-ink-muted">
            {member.age} · {member.locationCity} · {member.religion}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <StatusPill status={interest.status} />
        {showActions && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="inline-flex items-center gap-1 rounded-full bg-sage px-3 py-1.5 text-[12px] font-medium text-white hover:bg-sage-light"
            >
              <Check size={12} strokeWidth={2} />
              Accept
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="inline-flex items-center gap-1 rounded-full border border-ink/12 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-ink/25 hover:text-ink"
            >
              <X size={12} strokeWidth={2} />
              Decline
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function MutualCard({ member }: { member: Member }) {
  return (
    <div className="rounded-2xl border border-gold/30 bg-gold-pale/30 p-5">
      <div className="flex items-center gap-3">
        {member.profilePhoto ? (
          <img
            src={member.profilePhoto}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <Monogram name={member.fullName} size={56} />
        )}
        <div className="min-w-0">
          <p className="font-serif text-[18px] font-semibold text-ink">
            {member.fullName}
          </p>
          <p className="text-[12.5px] text-ink-muted">
            {member.locationCity}, {member.locationCountry}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-gold/20 pt-4">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold">
          Contact
        </p>
        {member.contactEmail && (
          <p className="flex items-center gap-1.5 text-[13px] text-ink">
            <Mail size={12} strokeWidth={2} className="text-ink-muted" />
            {member.contactEmail}
          </p>
        )}
        {member.contactPhone && (
          <p className="flex items-center gap-1.5 text-[13px] text-ink">
            <Phone size={12} strokeWidth={2} className="text-ink-muted" />
            {member.contactPhone}
          </p>
        )}
        {!member.contactEmail && !member.contactPhone && (
          <p className="text-[12.5px] italic text-ink-muted">
            No contact details on file.
          </p>
        )}
      </div>
      <Link
        href={`/community/rishta-circle/members/${member.id}`}
        className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-gold underline-offset-4 hover:underline"
      >
        View profile →
      </Link>
    </div>
  );
}

function StatusPill({ status }: { status: InterestStatus }) {
  const label =
    status === "accepted"
      ? "Accepted"
      : status === "declined"
        ? "Declined"
        : "Pending";
  const palette: Record<InterestStatus, string> = {
    pending: "border-ink/12 bg-white text-ink-muted",
    accepted: "border-sage/40 bg-sage-pale text-sage",
    declined: "border-ink/10 bg-ivory-warm text-ink-faint",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em]",
        palette[status],
      )}
    >
      {label}
    </span>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/12 bg-white px-6 py-10 text-center">
      <p className="font-serif text-[15px] italic text-ink-muted">{text}</p>
    </div>
  );
}

function NoCurrentMemberScreen({
  members,
  onPick,
}: {
  members: Member[];
  onPick: () => void;
}) {
  const pick = (id: string) => {
    setCurrentUserId(id);
    onPick();
  };
  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <SubPageHeader
        eyebrow="My dashboard"
        title="sign in as a member."
        subline="Auth isn't wired up yet — pick any approved member to simulate being signed in as them."
      />
      <main className="px-10 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-ink/8 bg-white p-8 shadow-sm">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gold">
            Pick a member
          </p>
          <p className="mt-1.5 font-serif text-[15px] italic text-ink-muted">
            Your choice is stored in <code>innerCircleCurrentUser</code>.
          </p>
          {members.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-ink/12 px-5 py-10 text-center">
              <p className="text-[14px] text-ink-muted">
                No approved members yet. Submit an application, then approve it
                in the admin panel.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/community/rishta-circle/apply"
                  className="rounded-full bg-gold px-5 py-2 text-[13px] font-medium text-white hover:bg-gold-light"
                >
                  Apply
                </Link>
                <Link
                  href="/community/rishta-circle/admin"
                  className="rounded-full border border-ink/15 px-5 py-2 text-[13px] font-medium text-ink hover:border-gold"
                >
                  Admin panel
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {members.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => pick(m.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 text-left transition-colors hover:border-gold"
                  >
                    <Monogram name={m.fullName} size={40} />
                    <div className="min-w-0">
                      <p className="font-serif text-[15px] font-semibold text-ink">
                        {m.fullName}
                      </p>
                      <p className="truncate text-[12px] text-ink-muted">
                        {m.age} · {m.locationCity} · {m.religion}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
