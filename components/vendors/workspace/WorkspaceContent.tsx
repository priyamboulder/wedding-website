"use client";

import { useMemo } from "react";
import {
  Calendar,
  Camera,
  Check,
  ChefHat,
  Clock,
  Droplet,
  Flower2,
  Heart,
  Image as ImageIcon,
  Leaf,
  Palette,
  Scissors,
  Sparkles,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CateringContent,
  FloralsContent,
  GenericContent,
  HMUAContent,
  MehndiContent,
  PhotographyContent,
  VendorWorkspace,
  VendorWorkspaceContent,
} from "@/types/vendor-workspace";
import { DISCIPLINE_LABEL } from "@/types/vendor-workspace";

// ── Public shell ────────────────────────────────────────────────────────────

export function WorkspaceContent({
  workspace,
}: {
  workspace: VendorWorkspace;
}) {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Workspace Content"
        title={`What ${DISCIPLINE_LABEL[workspace.discipline]} will see`}
        description="The vendor lands on these panels when they log in. Every field below is editable — keep it loose until the last moment."
      />

      <DisciplineSwitch content={workspace.content} />
    </section>
  );
}

function DisciplineSwitch({ content }: { content: VendorWorkspaceContent }) {
  switch (content.kind) {
    case "catering":
      return <CateringBody content={content} />;
    case "hmua":
      return <HMUABody content={content} />;
    case "mehndi":
      return <MehndiBody content={content} />;
    case "photography":
      return <PhotographyBody content={content} />;
    case "florals":
      return <FloralsBody content={content} />;
    case "generic":
      return <GenericBody content={content} />;
  }
}

// ── Shared primitives ───────────────────────────────────────────────────────

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header>
      {eyebrow && (
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
      )}
      <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-ink">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
    </header>
  );
}

function PanelCard({
  icon,
  title,
  badge,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-white p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
            {icon}
          </span>
          <h4 className="text-[13.5px] font-medium text-ink">{title}</h4>
        </div>
        {badge}
      </header>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "ink" | "saffron" | "sage" | "rose";
}) {
  const toneClass = {
    ink: "text-ink",
    saffron: "text-saffron",
    sage: "text-sage",
    rose: "text-rose",
  }[tone];
  return (
    <div className="rounded-md border border-border bg-ivory-warm/30 px-3 py-2.5">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn("mt-1 font-serif text-[22px] leading-none", toneClass)}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[10.5px] text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

function Tag({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "saffron" | "sage" | "rose";
}) {
  const toneClass = {
    ink: "bg-ivory-warm text-ink-muted",
    saffron: "bg-saffron-pale/60 text-saffron",
    sage: "bg-sage-pale/60 text-sage",
    rose: "bg-rose-pale/60 text-rose",
  }[tone];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em]",
        toneClass,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-2 text-[12px] italic text-ink-faint">{children}</p>
  );
}

// ── Catering ────────────────────────────────────────────────────────────────

function CateringBody({ content }: { content: CateringContent }) {
  const gc = content.guest_counts;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard icon={<Users size={14} strokeWidth={1.8} />} title="Guest count & dietary">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Total" value={gc.total} tone="ink" />
          <MiniStat label="Veg" value={gc.veg} tone="sage" />
          <MiniStat label="Non-veg" value={gc.non_veg} tone="rose" />
          <MiniStat label="Jain" value={gc.jain} />
          <MiniStat label="Vegan" value={gc.vegan} />
          <MiniStat label="Kids" value={gc.kids} />
        </div>
        <p className="mt-3 text-[11.5px] text-ink-muted">
          Counts sync from the Guests module. Vendor sees dietary only (not contact details).
        </p>
      </PanelCard>

      <PanelCard icon={<Clock size={14} strokeWidth={1.8} />} title="Service timing">
        <ul className="divide-y divide-border">
          {content.service_timing.length === 0 ? (
            <EmptyRow>No service windows staged yet.</EmptyRow>
          ) : (
            content.service_timing.map((t) => (
              <li key={`${t.event}-${t.start}`} className="flex items-center justify-between py-2">
                <span className="text-[13px] text-ink">{t.event}</span>
                <span className="font-mono text-[11.5px] text-ink-muted">
                  {t.start} – {t.end}
                </span>
              </li>
            ))
          )}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Utensils size={14} strokeWidth={1.8} />}
        title="Menu"
        badge={<Tag tone="saffron">{content.courses.length} courses</Tag>}
        className="lg:col-span-2"
      >
        <ol className="space-y-4">
          {content.courses.map((course, i) => (
            <li key={course.id} className="rounded-md border border-border/70 bg-ivory-warm/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Course {i + 1}
                  </p>
                  <h5 className="mt-0.5 font-serif text-[16px] text-ink">{course.name}</h5>
                </div>
                <div className="flex flex-wrap gap-1">
                  {course.dietary_tags.map((t) => (
                    <Tag key={t} tone={t.includes("non") ? "rose" : "sage"}>
                      {t}
                    </Tag>
                  ))}
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {course.dishes.map((d) => (
                  <li key={d} className="text-[12.5px] text-ink-soft">
                    • {d}
                  </li>
                ))}
              </ul>
              {course.notes && (
                <p className="mt-3 rounded-sm border-l-2 border-saffron/40 bg-white/60 px-3 py-1.5 text-[11.5px] italic text-ink-muted">
                  {course.notes}
                </p>
              )}
            </li>
          ))}
        </ol>
      </PanelCard>

      <PanelCard icon={<ChefHat size={14} strokeWidth={1.8} />} title="Staffing">
        <ul className="space-y-1.5">
          {content.staffing.map((s) => (
            <li
              key={s.role}
              className="flex items-center justify-between rounded-md border border-border/60 bg-ivory-warm/20 px-3 py-2"
            >
              <div>
                <span className="text-[13px] text-ink">{s.role}</span>
                {s.notes && (
                  <span className="ml-2 text-[11px] italic text-ink-muted">
                    — {s.notes}
                  </span>
                )}
              </div>
              <span className="font-mono text-[13px] text-ink">×{s.count}</span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard icon={<Truck size={14} strokeWidth={1.8} />} title="Kitchen & logistics">
        <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
          {content.kitchen_logistics.map((k) => (
            <li key={k} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-saffron" />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Calendar size={14} strokeWidth={1.8} />}
        title="Tastings"
        className="lg:col-span-2"
      >
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {content.tastings.map((t, i) => (
            <li
              key={t.date}
              className="rounded-md border border-border bg-white px-3 py-2.5"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Tasting {i + 1}
              </p>
              <p className="mt-0.5 text-[12.5px] text-ink">
                {new Date(t.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <Tag
                tone={
                  t.status === "completed"
                    ? "sage"
                    : t.status === "scheduled"
                      ? "saffron"
                      : "ink"
                }
              >
                {t.status}
              </Tag>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Check size={14} strokeWidth={1.8} />}
        title="Contract deliverables"
        className="lg:col-span-2"
      >
        <ul className="space-y-1.5">
          {content.deliverables.map((d) => (
            <li
              key={d}
              className="flex items-start gap-2 text-[12.5px] text-ink-soft"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm border border-saffron" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  );
}

// ── HMUA ────────────────────────────────────────────────────────────────────

function HMUABody({ content }: { content: HMUAContent }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard
        icon={<Clock size={14} strokeWidth={1.8} />}
        title="Bridal & family timeline"
        badge={<Tag tone="saffron">{content.timeline.length} slots</Tag>}
        className="lg:col-span-2"
      >
        <div className="overflow-hidden rounded-md border border-border/60">
          <table className="w-full text-[12.5px]">
            <thead className="bg-ivory-warm/40">
              <tr>
                <Th>Person</Th>
                <Th>Event</Th>
                <Th>Call</Th>
                <Th>Duration</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {content.timeline.map((row, i) => (
                <tr key={i} className="hover:bg-ivory-warm/20">
                  <Td>{row.person}</Td>
                  <Td className="text-ink-muted">{row.event}</Td>
                  <Td mono>{row.call_time}</Td>
                  <Td mono>{row.duration_mins}m</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard
        icon={<Sparkles size={14} strokeWidth={1.8} />}
        title="Looks & mood references"
        className="lg:col-span-2"
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {content.looks.map((look, i) => (
            <li
              key={i}
              className="rounded-md border border-border/70 bg-ivory-warm/20 p-3.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="text-[13.5px] font-medium text-ink">
                  {look.person}
                </h5>
                <Tag>{look.event}</Tag>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                {look.style}
              </p>
              {look.references.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {look.references.map((r, j) => (
                    <div
                      key={j}
                      className="aspect-square overflow-hidden rounded-sm bg-gradient-to-br from-saffron-pale/40 to-rose-pale/40 ring-1 ring-border"
                    >
                      <div className="flex h-full w-full items-center justify-center text-ink-faint/50">
                        <ImageIcon size={18} strokeWidth={1.4} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {look.notes && (
                <p className="mt-3 rounded-sm border-l-2 border-saffron/40 bg-white/60 px-2.5 py-1.5 text-[11.5px] italic text-ink-muted">
                  {look.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Palette size={14} strokeWidth={1.8} />}
        title="Product preferences"
      >
        <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
          {content.product_preferences.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-saffron" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard icon={<Calendar size={14} strokeWidth={1.8} />} title="Trial sessions">
        <ul className="space-y-1.5">
          {content.trials.map((t, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md border border-border/60 bg-white px-3 py-2"
            >
              <div>
                <p className="text-[12.5px] text-ink">{t.person}</p>
                <p className="font-mono text-[10.5px] text-ink-muted">
                  {new Date(t.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Tag
                tone={
                  t.status === "completed"
                    ? "sage"
                    : t.status === "scheduled"
                      ? "saffron"
                      : "ink"
                }
              >
                {t.status}
              </Tag>
            </li>
          ))}
        </ul>
      </PanelCard>
    </div>
  );
}

// ── Mehndi ──────────────────────────────────────────────────────────────────

function MehndiBody({ content }: { content: MehndiContent }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard
        icon={<Heart size={14} strokeWidth={1.8} />}
        title="Bridal mehndi"
        className="lg:col-span-2"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MiniStat
            label="Intricacy"
            value={content.bridal.intricacy}
            tone="saffron"
          />
          <MiniStat
            label="Application"
            value={`${content.bridal.application_hours}h`}
            tone="ink"
            hint="Dedicated chair time"
          />
          <MiniStat
            label="Motifs"
            value={content.bridal.motifs.length}
            tone="rose"
            hint="Custom requests"
          />
        </div>
        <div className="mt-4 rounded-md border-l-2 border-saffron/50 bg-saffron-pale/30 px-4 py-3">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Coverage
          </p>
          <p className="mt-1 text-[13px] text-ink-soft">
            {content.bridal.coverage}
          </p>
        </div>
        <div className="mt-4">
          <p
            className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Motifs requested
          </p>
          <div className="flex flex-wrap gap-1.5">
            {content.bridal.motifs.map((m) => (
              <Tag key={m} tone="saffron">
                {m}
              </Tag>
            ))}
          </div>
        </div>
      </PanelCard>

      <PanelCard icon={<Users size={14} strokeWidth={1.8} />} title="Guest session">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Guests" value={content.guest_session.guest_count} />
          <MiniStat
            label="Duration"
            value={`${content.guest_session.duration_hours}h`}
          />
        </div>
        <p className="mt-3 text-[12.5px] text-ink-soft">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Where
          </span>
          <br />
          {content.guest_session.location}
        </p>
        <p className="mt-2 text-[12.5px] text-ink-soft">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Event
          </span>
          <br />
          {content.guest_session.event}
        </p>
      </PanelCard>

      <PanelCard
        icon={<ImageIcon size={14} strokeWidth={1.8} />}
        title="Design references"
      >
        <div className="grid grid-cols-3 gap-2">
          {content.design_references.map((_, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-md bg-gradient-to-br from-saffron-pale/50 to-gold-pale/50 ring-1 ring-border"
            >
              <div className="flex h-full w-full items-center justify-center text-saffron/60">
                <Sparkles size={22} strokeWidth={1.2} />
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard
        icon={<Clock size={14} strokeWidth={1.8} />}
        title="Timeline"
        className="lg:col-span-2"
      >
        <ol className="relative space-y-3 border-l border-border/70 pl-5">
          {content.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-saffron bg-white" />
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="text-[13.5px] font-medium text-ink">
                  {t.person_or_group}
                </h5>
                <span className="font-mono text-[11px] text-ink-muted">
                  {t.start_time} · {t.duration}
                </span>
              </div>
              <p className="text-[11.5px] text-ink-muted">{t.event}</p>
            </li>
          ))}
        </ol>
      </PanelCard>
    </div>
  );
}

// ── Photography ─────────────────────────────────────────────────────────────

function PhotographyBody({ content }: { content: PhotographyContent }) {
  const mustCount = content.shot_list.filter((s) => s.priority === "must").length;
  const preferredCount = content.shot_list.filter((s) => s.priority === "preferred").length;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard
        icon={<Camera size={14} strokeWidth={1.8} />}
        title="Shot list"
        badge={
          <div className="flex gap-1.5">
            <Tag tone="rose">{mustCount} must</Tag>
            <Tag tone="saffron">{preferredCount} preferred</Tag>
          </div>
        }
        className="lg:col-span-2"
      >
        <ul className="divide-y divide-border/60">
          {content.shot_list.map((s) => (
            <li key={s.id} className="flex items-start gap-3 py-2.5">
              <Tag
                tone={
                  s.priority === "must"
                    ? "rose"
                    : s.priority === "preferred"
                      ? "saffron"
                      : "ink"
                }
              >
                {s.priority}
              </Tag>
              <div className="flex-1">
                <p className="text-[13px] text-ink">{s.description}</p>
                <p
                  className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.event}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard icon={<Heart size={14} strokeWidth={1.8} />} title="Must-capture moments">
        <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
          {content.must_capture.map((m) => (
            <li key={m} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard icon={<Clock size={14} strokeWidth={1.8} />} title="Coverage hours">
        <ul className="space-y-1.5">
          {content.coverage_hours.map((c) => (
            <li
              key={c.event}
              className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0"
            >
              <span className="text-[13px] text-ink">{c.event}</span>
              <span className="font-mono text-[13px] text-saffron">
                {c.hours}h
              </span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Users size={14} strokeWidth={1.8} />}
        title="Family portraits"
        className="lg:col-span-2"
      >
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {content.family_portraits.map((f) => (
            <li
              key={f.grouping}
              className="rounded-md border border-border/70 bg-ivory-warm/20 px-3 py-2.5"
            >
              <p className="text-[13px] font-medium text-ink">{f.grouping}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {f.members}
              </p>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Calendar size={14} strokeWidth={1.8} />}
        title="Deliverable timeline"
        className="lg:col-span-2"
      >
        <ol className="relative space-y-3 border-l border-border/70 pl-5">
          {content.deliverable_timeline.map((d, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-saffron bg-white" />
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="text-[13.5px] font-medium text-ink">
                  {d.item}
                </h5>
                <span className="font-mono text-[11px] text-ink-muted">
                  {d.due_date}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </PanelCard>
    </div>
  );
}

// ── Florals ─────────────────────────────────────────────────────────────────

function FloralsBody({ content }: { content: FloralsContent }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard
        icon={<Flower2 size={14} strokeWidth={1.8} />}
        title="Design direction"
        className="lg:col-span-2"
      >
        <p className="rounded-md border-l-2 border-saffron/40 bg-saffron-pale/20 px-4 py-3 text-[13.5px] italic leading-relaxed text-ink-soft">
          "{content.design_direction}"
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {content.mood_board.map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br from-rose-pale/40 via-saffron-pale/40 to-sage-pale/40 ring-1 ring-border"
            >
              <div className="flex h-full w-full items-center justify-center text-saffron/60">
                <Leaf size={24} strokeWidth={1.2} />
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard icon={<Droplet size={14} strokeWidth={1.8} />} title="Color palette">
        <div className="flex flex-wrap gap-2">
          {content.color_palette.map((c) => (
            <div key={c} className="flex flex-col items-center gap-1">
              <div
                className="h-14 w-14 rounded-md ring-1 ring-border shadow-sm"
                style={{ backgroundColor: c }}
              />
              <span
                className="font-mono text-[10px] uppercase tracking-wider text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {c}
              </span>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard icon={<Scissors size={14} strokeWidth={1.8} />} title="Arrangements">
        <ul className="space-y-1.5">
          {content.arrangements.map((a) => (
            <li
              key={a.type}
              className="flex items-start justify-between gap-3 border-b border-border/40 py-1.5 last:border-0"
            >
              <div>
                <span className="text-[13px] text-ink">{a.type}</span>
                {a.notes && (
                  <p className="text-[11px] italic text-ink-muted">{a.notes}</p>
                )}
              </div>
              <span className="font-mono text-[13px] text-saffron">
                ×{a.count}
              </span>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Flower2 size={14} strokeWidth={1.8} />}
        title="Coverage per event"
        className="lg:col-span-2"
      >
        <ul className="space-y-2.5">
          {content.coverage.map((c, i) => (
            <li
              key={i}
              className="rounded-md border border-border/70 bg-ivory-warm/20 p-3.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="text-[13.5px] font-medium text-ink">
                  {c.area}
                </h5>
                <Tag>{c.event}</Tag>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                {c.arrangement}
              </p>
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<Truck size={14} strokeWidth={1.8} />}
        title="Delivery & setup"
        className="lg:col-span-2"
      >
        <div className="overflow-hidden rounded-md border border-border/60">
          <table className="w-full text-[12.5px]">
            <thead className="bg-ivory-warm/40">
              <tr>
                <Th>Event</Th>
                <Th>Setup</Th>
                <Th>Teardown</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {content.delivery_setup.map((d, i) => (
                <tr key={i} className="hover:bg-ivory-warm/20">
                  <Td>{d.event}</Td>
                  <Td mono>{d.setup_time}</Td>
                  <Td mono>{d.teardown}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}

// ── Generic fallback ────────────────────────────────────────────────────────

function GenericBody({ content }: { content: GenericContent }) {
  return (
    <PanelCard icon={<Sparkles size={14} strokeWidth={1.8} />} title="Scope & notes">
      {content.notes ? (
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
          {content.notes}
        </p>
      ) : (
        <EmptyRow>No scope notes yet — add context for this vendor's work.</EmptyRow>
      )}
      {content.scope_items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {content.scope_items.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 text-[12.5px] text-ink-soft"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-saffron" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Table primitives ────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  className,
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2 text-[12.5px] text-ink",
        mono && "font-mono text-[11.5px] text-ink-muted",
        className,
      )}
      style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
    >
      {children}
    </td>
  );
}
