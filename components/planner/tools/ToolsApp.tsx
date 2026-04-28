"use client";

import { useMemo, useState } from "react";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import {
  BUDGET_TEMPLATES,
  CHECKLIST_TEMPLATES,
  MY_TEMPLATES,
  PROPOSAL_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TIMELINE_TEMPLATES,
  VENDOR_INTRO_TEMPLATES,
  type BudgetTemplate,
  type ChecklistTemplate,
  type MyTemplate,
  type ProposalTemplate,
  type TemplateCategoryId,
  type TimelineBlock,
  type TimelineTemplate,
  type VendorIntroTemplate,
} from "@/lib/planner/templates";

type Selection =
  | { kind: "timeline"; id: string }
  | { kind: "intro"; id: string }
  | { kind: "budget"; id: string }
  | { kind: "checklist"; id: string }
  | { kind: "proposal"; id: string }
  | { kind: "mine"; id: string }
  | null;

export default function ToolsApp() {
  const [activeCategory, setActiveCategory] =
    useState<TemplateCategoryId>("timelines");
  const [selection, setSelection] = useState<Selection>({
    kind: "timeline",
    id: "hindu-north-3",
  });

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Templates & Tools
          </p>
          <h1
            className="mt-2 text-[38px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Your productivity library
          </h1>
          <p
            className="mt-1.5 text-[14px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Built-in templates, customized for South Asian weddings — clone, tweak, and save your own.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] text-[#5a5a5a] hover:bg-[#F5E6D0]/55"
            style={{ borderColor: PLANNER_PALETTE.hairline }}
          >
            <span aria-hidden>↑</span>
            Import
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#FAF8F5]"
            style={{ backgroundColor: PLANNER_PALETTE.charcoal }}
          >
            <span aria-hidden>⊕</span>
            New template
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_minmax(0,440px)]">
        <CategoryNav
          activeId={activeCategory}
          onSelect={(id) => {
            setActiveCategory(id);
            setSelection(defaultSelectionFor(id));
          }}
        />
        <CategoryList
          activeId={activeCategory}
          selection={selection}
          onSelect={setSelection}
        />
        <DetailPanel selection={selection} />
      </div>
    </div>
  );
}

function defaultSelectionFor(id: TemplateCategoryId): Selection {
  switch (id) {
    case "timelines":
      return { kind: "timeline", id: TIMELINE_TEMPLATES[0].id };
    case "vendor-intros":
      return { kind: "intro", id: VENDOR_INTRO_TEMPLATES[0].id };
    case "budgets":
      return { kind: "budget", id: BUDGET_TEMPLATES[0].id };
    case "checklists":
      return { kind: "checklist", id: CHECKLIST_TEMPLATES[0].id };
    case "proposals":
      return { kind: "proposal", id: PROPOSAL_TEMPLATES[0].id };
    case "mine":
      return { kind: "mine", id: MY_TEMPLATES[0].id };
  }
}

// ─── Category nav ──────────────────────────────────────────────────────

function CategoryNav({
  activeId,
  onSelect,
}: {
  activeId: TemplateCategoryId;
  onSelect: (id: TemplateCategoryId) => void;
}) {
  return (
    <aside
      className="rounded-2xl border p-3"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: PLANNER_PALETTE.hairline,
      }}
    >
      <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.26em] text-[#9E8245]">
        Categories
      </p>
      <ul className="space-y-0.5">
        {TEMPLATE_CATEGORIES.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                style={{
                  backgroundColor: active ? PLANNER_PALETTE.champagne : "transparent",
                }}
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px]"
                  style={{
                    backgroundColor: active ? "rgba(255,255,255,0.7)" : "#FBF1DF",
                    color: "#9E8245",
                  }}
                >
                  {c.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[12.5px] font-medium text-[#2C2C2C]">
                      {c.label}
                    </p>
                    <span className="font-mono text-[10.5px] text-[#8a8a8a]">
                      {c.count}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] italic text-[#6a6a6a]">
                    {c.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

// ─── Category list (middle column) ─────────────────────────────────────

function CategoryList({
  activeId,
  selection,
  onSelect,
}: {
  activeId: TemplateCategoryId;
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  const title = TEMPLATE_CATEGORIES.find((c) => c.id === activeId)?.label ?? "";

  return (
    <section
      className="rounded-2xl border"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: PLANNER_PALETTE.hairline,
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5"
        style={{ borderBottom: `1px solid ${PLANNER_PALETTE.hairline}` }}
      >
        <h2
          className="text-[22px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.005em",
          }}
        >
          {title}
        </h2>
      </div>
      <div className="p-4">
        {activeId === "timelines" && (
          <TimelineList selection={selection} onSelect={onSelect} />
        )}
        {activeId === "vendor-intros" && (
          <IntroList selection={selection} onSelect={onSelect} />
        )}
        {activeId === "budgets" && (
          <BudgetList selection={selection} onSelect={onSelect} />
        )}
        {activeId === "checklists" && (
          <ChecklistList selection={selection} onSelect={onSelect} />
        )}
        {activeId === "proposals" && (
          <ProposalList selection={selection} onSelect={onSelect} />
        )}
        {activeId === "mine" && (
          <MineList selection={selection} onSelect={onSelect} />
        )}
      </div>
    </section>
  );
}

function TimelineList({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  return (
    <ul className="space-y-2">
      {TIMELINE_TEMPLATES.map((t) => {
        const active = selection?.kind === "timeline" && selection.id === t.id;
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "timeline", id: t.id })}
              className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors"
              style={{
                backgroundColor: active ? "#FBF4E6" : "#FFFFFF",
                borderColor: active
                  ? "rgba(196,162,101,0.55)"
                  : PLANNER_PALETTE.hairline,
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px]"
                style={{
                  backgroundColor: "#F5E6D0",
                  color: "#7a5a1a",
                }}
              >
                🕰
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[14px] font-medium text-[#2C2C2C]">
                    {t.name}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9E8245]">
                    {t.durationNote}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#6a6a6a]">{t.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.eventsCovered.map((e) => (
                    <EventPill key={e} label={e} />
                  ))}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function IntroList({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  return (
    <ul className="space-y-2">
      {VENDOR_INTRO_TEMPLATES.map((t) => {
        const active = selection?.kind === "intro" && selection.id === t.id;
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "intro", id: t.id })}
              className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left"
              style={{
                backgroundColor: active ? "#FBF4E6" : "#FFFFFF",
                borderColor: active
                  ? "rgba(196,162,101,0.55)"
                  : PLANNER_PALETTE.hairline,
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px]"
                style={{ backgroundColor: "#F5E6D0", color: "#7a5a1a" }}
              >
                ✉
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-medium text-[#2C2C2C]">
                    {t.title}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9E8245]">
                    {t.category}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] italic text-[#6a6a6a]">
                  {firstLine(t.body)}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function BudgetList({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  return (
    <ul className="space-y-2">
      {BUDGET_TEMPLATES.map((b) => {
        const active = selection?.kind === "budget" && selection.id === b.id;
        return (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "budget", id: b.id })}
              className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left"
              style={{
                backgroundColor: active ? "#FBF4E6" : "#FFFFFF",
                borderColor: active
                  ? "rgba(196,162,101,0.55)"
                  : PLANNER_PALETTE.hairline,
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px]"
                style={{ backgroundColor: "#F5E6D0", color: "#7a5a1a" }}
              >
                ◈
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-medium text-[#2C2C2C]">
                    {b.name}
                  </p>
                  <span className="font-mono text-[11px] text-[#2C2C2C]">
                    ${b.total.toLocaleString()}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] italic text-[#6a6a6a]">
                  {b.days} · {b.slices.length} categories
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChecklistList({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  return (
    <ul className="space-y-2">
      {CHECKLIST_TEMPLATES.map((c) => {
        const active = selection?.kind === "checklist" && selection.id === c.id;
        const total = c.phases.reduce((a, p) => a + p.items.length, 0);
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "checklist", id: c.id })}
              className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left"
              style={{
                backgroundColor: active ? "#FBF4E6" : "#FFFFFF",
                borderColor: active
                  ? "rgba(196,162,101,0.55)"
                  : PLANNER_PALETTE.hairline,
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px]"
                style={{ backgroundColor: "#F5E6D0", color: "#7a5a1a" }}
              >
                ✓
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[#2C2C2C]">{c.name}</p>
                <p className="mt-0.5 text-[11.5px] italic text-[#6a6a6a]">
                  {c.phases.length} phases · {total} items
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ProposalList({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  return (
    <ul className="space-y-2">
      {PROPOSAL_TEMPLATES.map((p) => {
        const active = selection?.kind === "proposal" && selection.id === p.id;
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "proposal", id: p.id })}
              className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left"
              style={{
                backgroundColor: active ? "#FBF4E6" : "#FFFFFF",
                borderColor: active
                  ? "rgba(196,162,101,0.55)"
                  : PLANNER_PALETTE.hairline,
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px]"
                style={{ backgroundColor: "#F5E6D0", color: "#7a5a1a" }}
              >
                ❋
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-medium text-[#2C2C2C]">{p.name}</p>
                  <span className="font-mono text-[10.5px] text-[#2C2C2C]">
                    {p.priceFrom}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] italic text-[#6a6a6a]">
                  {p.tier} · {p.includes.length} line items
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MineList({
  selection,
  onSelect,
}: {
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  return (
    <ul className="space-y-2">
      {MY_TEMPLATES.map((t) => {
        const active = selection?.kind === "mine" && selection.id === t.id;
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "mine", id: t.id })}
              className="flex w-full items-start gap-3 rounded-xl border p-3.5 text-left"
              style={{
                backgroundColor: active ? "#FBF4E6" : "#FFFFFF",
                borderColor: active
                  ? "rgba(196,162,101,0.55)"
                  : PLANNER_PALETTE.hairline,
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[14px]"
                style={{ backgroundColor: "#F5E6D0", color: "#7a5a1a" }}
              >
                ★
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-medium text-[#2C2C2C]">{t.name}</p>
                  <span className="font-mono text-[10px] text-[#8a8a8a]">
                    {t.savedOn}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] italic text-[#9E8245]">
                  {t.source}
                </p>
                <p className="mt-1 line-clamp-2 text-[11.5px] text-[#6a6a6a]">
                  {t.note}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function EventPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.16em]"
      style={{
        backgroundColor: "#FBF1DF",
        color: "#7a5a1a",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      {label}
    </span>
  );
}

function firstLine(body: string) {
  return body.split("\n\n").slice(1, 2).join(" ").trim() || body.split("\n")[0];
}

// ─── Detail panel ──────────────────────────────────────────────────────

function DetailPanel({ selection }: { selection: Selection }) {
  if (!selection)
    return (
      <section
        className="grid place-items-center rounded-2xl border p-10 text-center"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: PLANNER_PALETTE.hairline,
        }}
      >
        <p className="text-[14px] italic text-[#8a8a8a]">Select a template to preview</p>
      </section>
    );

  switch (selection.kind) {
    case "timeline":
      return <TimelineDetail id={selection.id} />;
    case "intro":
      return <IntroDetail id={selection.id} />;
    case "budget":
      return <BudgetDetail id={selection.id} />;
    case "checklist":
      return <ChecklistDetail id={selection.id} />;
    case "proposal":
      return <ProposalDetail id={selection.id} />;
    case "mine":
      return <MineDetail id={selection.id} />;
  }
}

function DetailShell({
  kicker,
  title,
  meta,
  children,
  actions = ["Use", "Customize", "Save as mine"],
}: {
  kicker: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  actions?: string[];
}) {
  return (
    <section
      className="flex max-h-[1100px] flex-col overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: PLANNER_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.18)",
      }}
    >
      <header
        className="flex items-start justify-between gap-4 px-5 py-4"
        style={{ borderBottom: `1px solid ${PLANNER_PALETTE.hairline}` }}
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#C4A265]">
            {kicker}
          </p>
          <h3
            className="mt-1 text-[22px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {title}
          </h3>
          {meta && (
            <p className="mt-0.5 text-[12px] italic text-[#6a6a6a]">{meta}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {actions.map((a, i) => (
            <button
              key={a}
              type="button"
              className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                i === 0
                  ? "text-[#FAF8F5]"
                  : "border text-[#2C2C2C] hover:bg-[#F5E6D0]/55"
              }`}
              style={
                i === 0
                  ? { backgroundColor: PLANNER_PALETTE.charcoal }
                  : { borderColor: PLANNER_PALETTE.hairline }
              }
            >
              {a}
            </button>
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
    </section>
  );
}

// ─── Timeline detail ───────────────────────────────────────────────────

function TimelineDetail({ id }: { id: string }) {
  const template = TIMELINE_TEMPLATES.find((t) => t.id === id);
  if (!template) return null;

  if (template.dayPlan.length === 0) {
    return (
      <DetailShell
        kicker={`Timeline · ${template.ceremony}`}
        title={template.name}
        meta={`${template.durationNote} · ${template.eventsCovered.join(", ")}`}
      >
        <p className="text-[13px] leading-relaxed text-[#2C2C2C]">
          {template.summary}
        </p>
        <div
          className="mt-5 rounded-xl border-2 border-dashed p-6 text-center"
          style={{ borderColor: "rgba(196,162,101,0.35)" }}
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
            Draft template
          </p>
          <p className="mt-2 text-[13px] italic text-[#6a6a6a]">
            Time blocks coming soon. Clone into a wedding to start building.
          </p>
        </div>
      </DetailShell>
    );
  }

  const blockCount = template.dayPlan.reduce((a, d) => a + d.blocks.length, 0);

  return (
    <DetailShell
      kicker={`Timeline · ${template.ceremony}`}
      title={template.name}
      meta={`${template.durationNote} · ${blockCount} time blocks`}
    >
      <p className="text-[12.5px] leading-relaxed text-[#4a4a4a]">
        {template.summary}
      </p>
      <div className="mt-4 space-y-5">
        {template.dayPlan.map((d) => (
          <TimelineDayCard key={d.label} day={d} />
        ))}
      </div>
    </DetailShell>
  );
}

function TimelineDayCard({
  day,
}: {
  day: TimelineTemplate["dayPlan"][number];
}) {
  return (
    <div
      className="rounded-xl border"
      style={{
        backgroundColor: "#FCFAF5",
        borderColor: PLANNER_PALETTE.hairline,
      }}
    >
      <div
        className="flex items-baseline justify-between gap-2 px-4 py-2.5"
        style={{ borderBottom: `1px solid ${PLANNER_PALETTE.hairline}` }}
      >
        <p
          className="text-[16px] text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
          }}
        >
          {day.label}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9E8245]">
          {day.date}
        </span>
      </div>
      <ol className="divide-y" style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}>
        {day.blocks.map((b, i) => (
          <TimelineBlockRow key={i} block={b} />
        ))}
      </ol>
    </div>
  );
}

function TimelineBlockRow({ block }: { block: TimelineBlock }) {
  const toneColor =
    block.tone === "ceremony"
      ? "#8B4513"
      : block.tone === "meal"
        ? "#9E8245"
        : block.tone === "vendor"
          ? "#5a5a5a"
          : block.tone === "party"
            ? "#B5651D"
            : "#8a8a8a";
  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <span
        className="min-w-[72px] shrink-0 pt-0.5 font-mono text-[11px] tracking-wider text-[#2C2C2C]"
      >
        {block.time}
      </span>
      <span
        aria-hidden
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: toneColor }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#2C2C2C]">{block.title}</p>
        {block.detail && (
          <p className="mt-0.5 text-[11.5px] italic text-[#6a6a6a]">
            {block.detail}
          </p>
        )}
      </div>
    </li>
  );
}

// ─── Intro detail ──────────────────────────────────────────────────────

function IntroDetail({ id }: { id: string }) {
  const t = VENDOR_INTRO_TEMPLATES.find((x) => x.id === id);
  if (!t) return null;
  return (
    <DetailShell
      kicker={`Vendor intro · ${t.category}`}
      title={t.title}
      meta={`Auto-fills ${t.fields.length} fields from wedding + vendor data`}
    >
      <div
        className="rounded-xl border p-4 text-[13px] leading-relaxed text-[#2C2C2C]"
        style={{
          backgroundColor: "#FCFAF5",
          borderColor: PLANNER_PALETTE.hairline,
          fontFamily: "'EB Garamond', serif",
          whiteSpace: "pre-wrap",
        }}
      >
        {highlightFields(t.body)}
      </div>
      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E8245]">
          Auto-fill fields
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {t.fields.map((f) => (
            <span
              key={f}
              className="rounded-full px-2 py-0.5 font-mono text-[10.5px] text-[#7a5a1a]"
              style={{
                backgroundColor: "#FBF1DF",
                boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </DetailShell>
  );
}

function highlightFields(body: string) {
  const parts = body.split(/(\{[a-z]+\})/g);
  return parts.map((p, i) => {
    if (/^\{[a-z]+\}$/.test(p)) {
      return (
        <span
          key={i}
          className="rounded px-1 font-mono text-[12px] text-[#7a5a1a]"
          style={{
            backgroundColor: "#F5E6D0",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {p}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

// ─── Budget detail ─────────────────────────────────────────────────────

function BudgetDetail({ id }: { id: string }) {
  const b = BUDGET_TEMPLATES.find((x) => x.id === id);
  if (!b) return null;
  const sorted = useMemo(
    () => [...b.slices].sort((a, b2) => b2.pct - a.pct),
    [b.slices],
  );
  return (
    <DetailShell
      kicker="Budget allocation"
      title={b.name}
      meta={`${b.days} · Total $${b.total.toLocaleString()}`}
    >
      <div className="space-y-2.5">
        {sorted.map((s) => (
          <BudgetSliceRow key={s.category} slice={s} />
        ))}
      </div>
    </DetailShell>
  );
}

function BudgetSliceRow({
  slice,
}: {
  slice: BudgetTemplate["slices"][number];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-[#2C2C2C]">{slice.category}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11.5px] text-[#9E8245]">
            {slice.pct}%
          </span>
          <span className="font-mono text-[12px] text-[#2C2C2C]">
            ${slice.amount.toLocaleString()}
          </span>
        </div>
      </div>
      <div
        className="mt-1.5 h-[6px] overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(44,44,44,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, slice.pct * 3)}%`,
            backgroundColor: PLANNER_PALETTE.gold,
          }}
        />
      </div>
      {slice.note && (
        <p className="mt-0.5 text-[11px] italic text-[#8a8a8a]">{slice.note}</p>
      )}
    </div>
  );
}

// ─── Checklist detail ──────────────────────────────────────────────────

function ChecklistDetail({ id }: { id: string }) {
  const c = CHECKLIST_TEMPLATES.find((x) => x.id === id);
  if (!c) return null;
  return (
    <DetailShell
      kicker="Checklist"
      title={c.name}
      meta={`${c.phases.length} phases · customizable per wedding`}
    >
      <div className="space-y-4">
        {c.phases.map((p) => (
          <div
            key={p.label}
            className="rounded-xl border"
            style={{
              backgroundColor: "#FCFAF5",
              borderColor: PLANNER_PALETTE.hairline,
            }}
          >
            <div
              className="flex items-center justify-between gap-2 px-4 py-2"
              style={{ borderBottom: `1px solid ${PLANNER_PALETTE.hairline}` }}
            >
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                {p.label}
              </p>
              <span className="font-mono text-[10.5px] text-[#8a8a8a]">
                {p.items.length} items
              </span>
            </div>
            <ul className="divide-y" style={{ borderColor: PLANNER_PALETTE.hairlineSoft }}>
              {p.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 px-4 py-2">
                  <span
                    aria-hidden
                    className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px]"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#9E8245",
                      boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.5)",
                    }}
                  >
                    ✓
                  </span>
                  <p className="text-[12.5px] text-[#2C2C2C]">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DetailShell>
  );
}

// ─── Proposal detail ───────────────────────────────────────────────────

function ProposalDetail({ id }: { id: string }) {
  const p = PROPOSAL_TEMPLATES.find((x) => x.id === id);
  if (!p) return null;
  return (
    <DetailShell
      kicker={`Proposal · ${p.tier}`}
      title={p.name}
      meta={p.priceFrom}
      actions={["Export PDF", "Customize", "Save as mine"]}
    >
      <p className="text-[13px] leading-relaxed text-[#4a4a4a]">{p.summary}</p>
      <div className="mt-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
          Includes
        </p>
        <ul className="mt-2 space-y-1.5">
          {p.includes.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[#2C2C2C]">
              <span
                aria-hidden
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: PLANNER_PALETTE.gold }}
              />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </DetailShell>
  );
}

// ─── My template detail ───────────────────────────────────────────────

function MineDetail({ id }: { id: string }) {
  const m = MY_TEMPLATES.find((x) => x.id === id);
  if (!m) return null;
  return (
    <DetailShell
      kicker={m.source}
      title={m.name}
      meta={`Saved ${m.savedOn}`}
      actions={["Apply", "Edit", "Duplicate"]}
    >
      <p className="text-[13px] leading-relaxed text-[#2C2C2C]">{m.note}</p>
      <div
        className="mt-5 rounded-xl border-2 border-dashed p-5 text-center"
        style={{ borderColor: "rgba(196,162,101,0.35)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#9E8245]">
          Customized template
        </p>
        <p className="mt-2 text-[12px] italic text-[#6a6a6a]">
          Opens the saved version with your tweaks applied.
        </p>
      </div>
    </DetailShell>
  );
}
