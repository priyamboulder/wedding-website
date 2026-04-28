"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { SubPageHeader } from "@/components/community/rishta-circle/SubPageHeader";
import {
  getApplications,
  updateApplicationStatus,
} from "@/lib/rishta-circle/storage";
import type { Application, ApplicationStatus } from "@/lib/rishta-circle/types";

type Filter = "all" | ApplicationStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
];

export default function RishtaCircleAdminPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = () => {
    setApps(
      getApplications().sort((a, b) =>
        b.submittedAt.localeCompare(a.submittedAt),
      ),
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    return {
      all: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      approved: apps.filter((a) => a.status === "approved").length,
      declined: apps.filter((a) => a.status === "declined").length,
    };
  }, [apps]);

  const visible = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const act = (id: string, status: ApplicationStatus) => {
    updateApplicationStatus(id, status);
    refresh();
  };

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <SubPageHeader
        eyebrow="Admin"
        title="applications."
        subline="Review every application by hand. Approving creates a member record automatically."
      />
      <main className="px-10 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <nav className="flex flex-wrap items-center gap-1.5" aria-label="Filter applications">
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-ink/12 bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[10px]",
                      active ? "bg-white/20" : "bg-ink/8 text-ink-muted",
                    )}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/12 bg-white px-8 py-14 text-center">
              <p className="font-serif text-[18px] text-ink-muted">
                Nothing here yet.
              </p>
              <p className="mt-2 text-[13px] text-ink-faint">
                Applications will appear as soon as they're submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
              <div className="hidden grid-cols-[1.2fr_0.5fr_1.2fr_0.8fr_0.7fr_0.8fr_auto] gap-4 border-b border-ink/8 bg-ivory-warm/50 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted md:grid">
                <span>Name</span>
                <span>Age</span>
                <span>Location</span>
                <span>Tradition</span>
                <span>By</span>
                <span>Submitted</span>
                <span className="text-right">Actions</span>
              </div>
              <ul className="divide-y divide-ink/8">
                {visible.map((app) => (
                  <AdminRow
                    key={app.id}
                    app={app}
                    expanded={expanded === app.id}
                    onToggle={() =>
                      setExpanded((curr) => (curr === app.id ? null : app.id))
                    }
                    onApprove={() => act(app.id, "approved")}
                    onDecline={() => act(app.id, "declined")}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminRow({
  app,
  expanded,
  onToggle,
  onApprove,
  onDecline,
}: {
  app: Application;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const location = [app.locationCity, app.locationCountry]
    .filter(Boolean)
    .join(", ");
  const submittedAt = new Date(app.submittedAt).toLocaleDateString();
  const religionLabel =
    app.religion === "Other" && app.religionOther
      ? app.religionOther
      : app.religion;

  return (
    <li>
      <div className="grid cursor-pointer grid-cols-1 gap-2 px-5 py-4 text-[13.5px] hover:bg-ivory-warm/30 md:grid-cols-[1.2fr_0.5fr_1.2fr_0.8fr_0.7fr_0.8fr_auto] md:items-center md:gap-4"
        onClick={onToggle}
        role="button"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 font-serif text-[15px] font-semibold text-ink">
          {expanded ? (
            <ChevronDown size={14} strokeWidth={2} className="text-ink-muted" />
          ) : (
            <ChevronRight size={14} strokeWidth={2} className="text-ink-muted" />
          )}
          {app.fullName}
        </div>
        <span className="text-ink-muted">{app.age}</span>
        <span className="text-ink-muted">{location}</span>
        <span className="text-ink-muted">{religionLabel}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          {app.submittedBy}
        </span>
        <span className="text-[12.5px] text-ink-muted">{submittedAt}</span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={app.status} />
          {app.status === "pending" && (
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-1 rounded-full bg-sage px-3 py-1 text-[11.5px] font-medium text-white hover:bg-sage-light"
              >
                <Check size={11} strokeWidth={2} />
                Approve
              </button>
              <button
                type="button"
                onClick={onDecline}
                className="inline-flex items-center gap-1 rounded-full border border-rose/40 bg-white px-3 py-1 text-[11.5px] font-medium text-rose hover:bg-rose-pale"
              >
                <X size={11} strokeWidth={2} />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
      {expanded && <AdminDetail app={app} />}
    </li>
  );
}

function AdminDetail({ app }: { app: Application }) {
  const location = [app.locationCity, app.locationState, app.locationCountry]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="border-t border-ink/6 bg-ivory/50 px-5 py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <DetailField label="Full name" value={app.fullName} />
        <DetailField label="Age / Gender" value={`${app.age} · ${app.gender}`} />
        <DetailField label="Location" value={location} />
        <DetailField label="Originally from" value={app.hometown} />
        <DetailField label="Education" value={app.education} />
        <DetailField label="Profession" value={app.profession} />
        <DetailField
          label="Tradition"
          value={
            app.religion === "Other" && app.religionOther
              ? app.religionOther
              : app.religion
          }
        />
        <DetailField
          label="Submitted by"
          value={
            app.submittedBy === "family"
              ? `${app.submitterName} (${app.submitterRelationship}) — ${app.submitterContact}`
              : "Self"
          }
        />
        {(app.contactEmail || app.contactPhone) && (
          <DetailField
            label="Contact"
            value={[app.contactEmail, app.contactPhone].filter(Boolean).join(" · ")}
          />
        )}
      </div>

      <div className="mt-6 space-y-5">
        <DetailBlock label="Bio" value={app.bio} />
        <DetailBlock label="What they're looking for" value={app.lookingFor} />
        {app.familyValues && (
          <DetailBlock label="Family values" value={app.familyValues} />
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
        {label}
      </p>
      <p className="mt-1 text-[13.5px] text-ink">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
        {label}
      </p>
      <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink-soft">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const palette: Record<ApplicationStatus, string> = {
    pending: "border-gold/30 bg-gold-pale/60 text-gold",
    approved: "border-sage/40 bg-sage-pale text-sage",
    declined: "border-ink/10 bg-ivory-warm text-ink-faint",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
        palette[status],
      )}
    >
      {status}
    </span>
  );
}
