"use client";

// ── Share Your Numbers tab ────────────────────────────────────────────────
// Post-Wedding contribution to The Real Numbers dataset. Auto-fills from
// finance-store + community profile, lets the bride tweak per category,
// then publishes anonymously. Reloads as the "edit my submission" view if
// she's already contributed.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealNumbersStore } from "@/stores/real-numbers-store";
import { useFinanceStore } from "@/stores/finance-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useEventsStore } from "@/stores/events-store";
import {
  autoPopulateFromFinance,
  categoryLabel,
  formatUsd,
} from "@/lib/real-numbers";
import {
  CULTURAL_TRADITION_LABEL,
  WEDDING_STYLE_LABEL,
  WORTH_IT_LABEL,
  type CulturalTradition,
  type WeddingStyle,
  type WorthIt,
} from "@/types/real-numbers";
import { FINANCE_CATEGORY_LABEL } from "@/types/finance";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import {
  EmptyState,
  PillButton,
  PrimaryButton,
  SecondaryButton,
  Section,
  TextArea,
  TextInput,
} from "../ui";

// ── Form local state shape ────────────────────────────────────────────────
interface FormItem {
  localId: string;
  vendor_category: string;
  budgeted_cents: number | null;
  actual_cents: number;
  worth_it: WorthIt | null;
}

interface FormState {
  wedding_city: string;
  wedding_state: string;
  wedding_month: number;
  wedding_year: number;
  guest_count: number;
  wedding_duration_days: number;
  number_of_events: number;
  styles: WeddingStyle[];
  cultures: CulturalTradition[];
  advice_text: string;
  items: FormItem[];
}

const ALL_STYLES: WeddingStyle[] = [
  "modern",
  "classic",
  "traditional",
  "intimate",
  "grand",
  "bohemian",
  "minimalist",
  "luxury",
];

const ALL_CULTURES: CulturalTradition[] = [
  "south_asian",
  "western",
  "east_asian",
  "middle_eastern",
  "african",
  "latin_american",
  "fusion",
  "other",
];

const WORTH_OPTIONS: WorthIt[] = ["absolutely", "fair", "overpaid", "skip_next_time"];

const ALL_WORKSPACE_SLUGS = Object.keys(
  FINANCE_CATEGORY_LABEL,
) as WorkspaceCategorySlug[];

let LOCAL_ID_COUNTER = 0;
function localId() {
  LOCAL_ID_COUNTER += 1;
  return `local_${LOCAL_ID_COUNTER}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── Component ─────────────────────────────────────────────────────────────
export function ShareNumbersTab() {
  const ensureSeeded = useRealNumbersStore((s) => s.ensureSeeded);
  const mySubmissionId = useRealNumbersStore((s) => s.mySubmissionId);
  const submissions = useRealNumbersStore((s) => s.submissions);
  const allItems = useRealNumbersStore((s) => s.items);
  const published_count = useMemo(
    () => submissions.filter((s) => s.is_published).length,
    [submissions],
  );
  const mySubmission = useMemo(
    () =>
      mySubmissionId
        ? submissions.find((s) => s.id === mySubmissionId) ?? null
        : null,
    [submissions, mySubmissionId],
  );
  const myItems = useMemo(
    () =>
      mySubmissionId
        ? allItems.filter((x) => x.submission_id === mySubmissionId)
        : [],
    [allItems, mySubmissionId],
  );

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  // Two-phase view: invitation → form → published summary.
  const [mode, setMode] = useState<"invitation" | "form">(
    mySubmission ? "form" : "invitation",
  );

  // If they've already published, default to "form" so they land on the
  // editable view (we'll conditionally show a "published" banner inside).
  useEffect(() => {
    if (mySubmission) setMode("form");
  }, [mySubmission]);

  if (mode === "invitation" && !mySubmission) {
    return (
      <ShareInvitation
        publishedCount={published_count}
        onBegin={() => setMode("form")}
      />
    );
  }

  return (
    <CostSubmissionForm
      existing={mySubmission}
      existingItems={myItems}
      onBack={
        mySubmission
          ? undefined
          : () => setMode("invitation")
      }
    />
  );
}

// ── Invitation screen ─────────────────────────────────────────────────────
function ShareInvitation({
  publishedCount,
  onBegin,
}: {
  publishedCount: number;
  onBegin: () => void;
}) {
  return (
    <Section
      eyebrow="SHARE YOUR NUMBERS"
      title="help the next bride know what to expect"
      description="Every bride deserves to know what weddings actually cost — not vendor estimates, not national averages, but real numbers from real weddings."
    >
      <div className="space-y-5">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          Share your wedding costs anonymously and help brides planning in
          your city budget with confidence.
        </p>

        <ul className="space-y-2 rounded-lg border border-border/60 bg-ivory-warm/30 p-4 text-[13px] text-ink">
          <GuaranteeRow>completely anonymous — your name is never shown</GuaranteeRow>
          <GuaranteeRow>only totals and categories — no vendor names</GuaranteeRow>
          <GuaranteeRow>we&apos;ll pre-fill from your budget tracker</GuaranteeRow>
          <GuaranteeRow>takes about 2 minutes</GuaranteeRow>
        </ul>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] italic text-ink-muted">
            {publishedCount} brides have already shared. You&apos;ll be
            helping the next bride plan smarter.
          </p>
          <PrimaryButton onClick={onBegin} icon={<Sparkles size={13} />}>
            Share my numbers
          </PrimaryButton>
        </div>
      </div>
    </Section>
  );
}

function GuaranteeRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2
        size={14}
        strokeWidth={1.8}
        className="mt-0.5 shrink-0 text-saffron"
      />
      <span>{children}</span>
    </li>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────
function CostSubmissionForm({
  existing,
  existingItems,
  onBack,
}: {
  existing: ReturnType<typeof useRealNumbersStore.getState>["submissions"][number] | null;
  existingItems: ReturnType<typeof useRealNumbersStore.getState>["items"];
  onBack?: () => void;
}) {
  const saveMyDraft = useRealNumbersStore((s) => s.saveMyDraft);
  const publishMine = useRealNumbersStore((s) => s.publishMySubmission);
  const unpublishMine = useRealNumbersStore((s) => s.unpublishMySubmission);
  const deleteMine = useRealNumbersStore((s) => s.deleteMySubmission);

  // Data sources for auto-populate
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);

  const myProfile = useCommunityProfilesStore((s) => {
    const myId = s.myProfileId;
    return myId ? s.profiles.find((p) => p.id === myId) ?? null : null;
  });

  const events = useEventsStore((s) => s.events);

  // Seed the form from existing submission OR from auto-populate.
  const [form, setForm] = useState<FormState>(() =>
    existing
      ? mapExistingToForm(existing, existingItems)
      : buildInitialForm({ budgets, invoices, payments, myProfile, events }),
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // ── Derived totals ──
  const totalBudget = form.items.reduce(
    (sum, it) => sum + (it.budgeted_cents ?? 0),
    0,
  );
  const totalActual = form.items.reduce((s, it) => s + it.actual_cents, 0);
  const variance =
    totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0;

  // ── Handlers ──
  const updateField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleStyle = (s: WeddingStyle) =>
    setForm((f) => ({
      ...f,
      styles: f.styles.includes(s)
        ? f.styles.filter((x) => x !== s)
        : [...f.styles, s],
    }));

  const toggleCulture = (c: CulturalTradition) =>
    setForm((f) => ({
      ...f,
      cultures: f.cultures.includes(c)
        ? f.cultures.filter((x) => x !== c)
        : [...f.cultures, c],
    }));

  const updateItem = (localId: string, patch: Partial<FormItem>) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it) =>
        it.localId === localId ? { ...it, ...patch } : it,
      ),
    }));

  const removeItem = (localId: string) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((it) => it.localId !== localId),
    }));

  const addItem = (slug: string) =>
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        {
          localId: localId(),
          vendor_category: slug,
          budgeted_cents: 0,
          actual_cents: 0,
          worth_it: null,
        },
      ],
    }));

  // Remaining categories the bride can add (not already in the list).
  const usedSlugs = new Set(form.items.map((it) => it.vendor_category));
  const addableSlugs = ALL_WORKSPACE_SLUGS.filter((s) => !usedSlugs.has(s));

  // ── Save / publish handlers ──
  const handleSaveDraft = () => {
    saveMyDraft({
      wedding_city: form.wedding_city.trim(),
      wedding_state: form.wedding_state.trim(),
      wedding_month: form.wedding_month,
      wedding_year: form.wedding_year,
      guest_count: form.guest_count,
      wedding_duration_days: form.wedding_duration_days,
      number_of_events: form.number_of_events,
      wedding_style: form.styles,
      cultural_tradition: form.cultures,
      advice_text: form.advice_text.trim(),
      auto_populated: existing?.auto_populated ?? true,
      items: form.items.map((it) => ({
        vendor_category: it.vendor_category,
        budgeted_cents: it.budgeted_cents,
        actual_cents: it.actual_cents,
        worth_it: it.worth_it,
      })),
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1800);
  };

  const handlePublish = () => {
    if (!validate(form)) return;
    handleSaveDraft();
    publishMine();
  };

  const isPublished = Boolean(existing?.is_published);

  return (
    <div className="space-y-5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Undo2 size={11} strokeWidth={1.8} /> back to invitation
        </button>
      )}

      {isPublished && existing && (
        <PublishedBanner
          helpful={existing.helpful_count}
          onUnpublish={unpublishMine}
        />
      )}

      {/* ── Wedding context ── */}
      <Section
        eyebrow="YOUR WEDDING AT A GLANCE"
        title="these details help other brides find relevant data"
        description="Nothing here identifies you."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="City">
            <TextInput
              value={form.wedding_city}
              onChange={(v) => updateField("wedding_city", v)}
              placeholder="Dallas"
            />
          </Field>
          <Field label="State">
            <TextInput
              value={form.wedding_state}
              onChange={(v) => updateField("wedding_state", v)}
              placeholder="TX"
            />
          </Field>
          <Field label="Month / Year">
            <div className="flex gap-2">
              <select
                value={form.wedding_month}
                onChange={(e) =>
                  updateField("wedding_month", Number(e.target.value))
                }
                className="w-1/2 rounded-md border border-border bg-white px-3 py-1.5 text-[13px]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString("en-US", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <TextInput
                type="number"
                value={String(form.wedding_year)}
                onChange={(v) =>
                  updateField(
                    "wedding_year",
                    Number.parseInt(v, 10) || form.wedding_year,
                  )
                }
              />
            </div>
          </Field>
          <Field label="Guest count">
            <TextInput
              type="number"
              value={String(form.guest_count)}
              onChange={(v) =>
                updateField("guest_count", Number.parseInt(v, 10) || 0)
              }
            />
          </Field>
          <Field label="Number of events">
            <TextInput
              type="number"
              value={String(form.number_of_events)}
              onChange={(v) =>
                updateField("number_of_events", Number.parseInt(v, 10) || 1)
              }
            />
          </Field>
          <Field label="Days">
            <TextInput
              type="number"
              value={String(form.wedding_duration_days)}
              onChange={(v) =>
                updateField("wedding_duration_days", Number.parseInt(v, 10) || 1)
              }
            />
          </Field>
        </div>

        <div className="mt-5 space-y-3">
          <ChipPickerLabel>Style</ChipPickerLabel>
          <div className="flex flex-wrap gap-2">
            {ALL_STYLES.map((s) => (
              <PillButton
                key={s}
                active={form.styles.includes(s)}
                onClick={() => toggleStyle(s)}
              >
                {WEDDING_STYLE_LABEL[s]}
              </PillButton>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <ChipPickerLabel>Cultural tradition</ChipPickerLabel>
          <div className="flex flex-wrap gap-2">
            {ALL_CULTURES.map((c) => (
              <PillButton
                key={c}
                active={form.cultures.includes(c)}
                onClick={() => toggleCulture(c)}
              >
                {CULTURAL_TRADITION_LABEL[c]}
              </PillButton>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Cost items ── */}
      <Section
        eyebrow="WHAT YOU SPENT"
        title="per category, budget vs. actual"
        description="Pre-filled from your budget tracker. Tweak freely — only the category and amount show up publicly."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              <tr>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Budgeted</th>
                <th className="py-2 pr-3">Actual</th>
                <th className="py-2 pr-3">Worth it?</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {form.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-muted">
                    No categories yet. Add one below.
                  </td>
                </tr>
              )}
              {form.items.map((it) => (
                <CostItemRow
                  key={it.localId}
                  item={it}
                  onUpdate={(patch) => updateItem(it.localId, patch)}
                  onRemove={() => removeItem(it.localId)}
                />
              ))}
              <tr className="border-t-2 border-ink/30">
                <td className="py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
                  TOTAL
                </td>
                <td className="py-3 font-mono text-[13px] text-ink">
                  {formatUsd(totalBudget)}
                </td>
                <td className="py-3 font-mono text-[13px] text-ink">
                  {formatUsd(totalActual)}
                </td>
                <td colSpan={2} className="py-3">
                  <VarianceBadge variance={variance} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {addableSlugs.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              + add category:
            </span>
            {addableSlugs.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => addItem(slug)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
              >
                <Plus size={11} strokeWidth={2} />
                {categoryLabel(slug)}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* ── Advice ── */}
      <Section
        eyebrow="ANYTHING YOU'D SHARE WITH A FUTURE BRIDE?"
        title="optional — shown publicly but anonymously"
      >
        <TextArea
          value={form.advice_text}
          onChange={(v) => updateField("advice_text", v)}
          placeholder="What would you tell a bride planning a wedding like yours?"
          rows={4}
        />
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          {form.advice_text.length} / 500
        </p>
      </Section>

      {/* ── Privacy callout + actions ── */}
      <PrivacyCallout />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SecondaryButton onClick={handleSaveDraft}>
            {saveStatus === "saved" ? "Saved ✓" : "Save draft"}
          </SecondaryButton>
          {existing && (
            <SecondaryButton
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  window.confirm(
                    "Delete your submission? This removes it from browsing.",
                  )
                ) {
                  deleteMine();
                }
              }}
              tone="danger"
              icon={<Trash2 size={12} />}
            >
              Delete
            </SecondaryButton>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/community?tab=connect&sub=brides&view=real_numbers"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Browse The Real Numbers <ChevronRight size={11} />
          </Link>
          <PrimaryButton
            onClick={handlePublish}
            icon={<Heart size={13} />}
            disabled={!validate(form)}
          >
            {isPublished ? "Update & republish" : "Publish my numbers"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function mapExistingToForm(
  existing: NonNullable<
    ReturnType<typeof useRealNumbersStore.getState>["submissions"][number]
  >,
  existingItems: ReturnType<typeof useRealNumbersStore.getState>["items"],
): FormState {
  return {
    wedding_city: existing.wedding_city,
    wedding_state: existing.wedding_state,
    wedding_month: existing.wedding_month,
    wedding_year: existing.wedding_year,
    guest_count: existing.guest_count,
    wedding_duration_days: existing.wedding_duration_days,
    number_of_events: existing.number_of_events,
    styles: existing.wedding_style,
    cultures: existing.cultural_tradition,
    advice_text: existing.advice_text,
    items: existingItems.map((it) => ({
      localId: localId(),
      vendor_category: it.vendor_category,
      budgeted_cents: it.budgeted_cents,
      actual_cents: it.actual_cents,
      worth_it: it.worth_it,
    })),
  };
}

function buildInitialForm(ctx: {
  budgets: ReturnType<typeof useFinanceStore.getState>["budgets"];
  invoices: ReturnType<typeof useFinanceStore.getState>["invoices"];
  payments: ReturnType<typeof useFinanceStore.getState>["payments"];
  myProfile: ReturnType<typeof useCommunityProfilesStore.getState>["profiles"][number] | null;
  events: ReturnType<typeof useEventsStore.getState>["events"];
}): FormState {
  const auto = autoPopulateFromFinance({
    budgets: ctx.budgets,
    invoices: ctx.invoices,
    payments: ctx.payments,
  });

  const city = ctx.myProfile?.wedding_city ?? "";
  const dateIso = ctx.myProfile?.wedding_date;
  const d = dateIso ? new Date(dateIso) : null;
  const month = d && !Number.isNaN(d.getTime()) ? d.getMonth() + 1 : 6;
  const year =
    d && !Number.isNaN(d.getTime())
      ? d.getFullYear()
      : new Date().getFullYear();

  const guest_count = profileGuestCount(ctx.myProfile?.guest_count_range);

  // Number of events — count distinct events in the events store.
  const events = ctx.events?.length ?? 0;

  return {
    wedding_city: city,
    wedding_state: "",
    wedding_month: month,
    wedding_year: year,
    guest_count,
    wedding_duration_days: 1,
    number_of_events: events > 0 ? events : 1,
    styles: [],
    cultures: [],
    advice_text: "",
    items: auto.items.map((it) => ({
      localId: localId(),
      vendor_category: it.vendor_category,
      budgeted_cents: it.budgeted_cents,
      actual_cents: it.actual_cents,
      worth_it: null,
    })),
  };
}

function profileGuestCount(
  range:
    | "under-50"
    | "50-100"
    | "100-200"
    | "200-300"
    | "300-500"
    | "500-plus"
    | undefined,
): number {
  switch (range) {
    case "under-50":
      return 40;
    case "50-100":
      return 80;
    case "100-200":
      return 150;
    case "200-300":
      return 250;
    case "300-500":
      return 400;
    case "500-plus":
      return 550;
    default:
      return 100;
  }
}

function validate(form: FormState): boolean {
  if (!form.wedding_city.trim()) return false;
  if (form.guest_count < 2 || form.guest_count > 2000) return false;
  const withActual = form.items.filter((it) => it.actual_cents > 0);
  if (withActual.length < 3) return false;
  return true;
}

// ── Sub-components ────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipPickerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function CostItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: FormItem;
  onUpdate: (patch: Partial<FormItem>) => void;
  onRemove: () => void;
}) {
  return (
    <tr className="border-b border-border/40">
      <td className="py-2 pr-3 text-ink">{categoryLabel(item.vendor_category)}</td>
      <td className="py-2 pr-3">
        <DollarInput
          value={item.budgeted_cents ?? 0}
          onChange={(cents) => onUpdate({ budgeted_cents: cents })}
        />
      </td>
      <td className="py-2 pr-3">
        <DollarInput
          value={item.actual_cents}
          onChange={(cents) => onUpdate({ actual_cents: cents })}
        />
      </td>
      <td className="py-2 pr-3">
        <select
          value={item.worth_it ?? ""}
          onChange={(e) =>
            onUpdate({
              worth_it: (e.target.value || null) as WorthIt | null,
            })
          }
          className="w-full rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink"
        >
          <option value="">—</option>
          {WORTH_OPTIONS.map((w) => (
            <option key={w} value={w}>
              {WORTH_IT_LABEL[w]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 text-right">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove category"
          className="rounded-md p-1 text-ink-muted hover:bg-rose/10 hover:text-rose"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </td>
    </tr>
  );
}

function DollarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (cents: number) => void;
}) {
  const dollars = Math.round(value / 100);
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[12px] text-ink-muted">
        $
      </span>
      <input
        type="number"
        value={dollars}
        onChange={(e) =>
          onChange(Math.max(0, Number.parseInt(e.target.value, 10) || 0) * 100)
        }
        className="w-28 rounded-md border border-border bg-white py-1 pl-5 pr-2 text-right text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
      />
    </div>
  );
}

function VarianceBadge({ variance }: { variance: number }) {
  if (!Number.isFinite(variance) || variance === 0) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        on budget
      </span>
    );
  }
  const over = variance > 0;
  const big = Math.abs(variance) >= 15;
  const tone = over
    ? big
      ? "bg-rose/15 text-rose"
      : "bg-amber-500/15 text-amber-700"
    : "bg-sage/15 text-sage";
  const word = over ? "over budget" : "under budget";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]",
        tone,
      )}
    >
      {variance >= 0 ? "+" : ""}
      {variance.toFixed(1)}% {word}
    </span>
  );
}

function PrivacyCallout() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gold/20 bg-ivory-warm/50 p-4">
      <Lock size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gold" />
      <p className="text-[12.5px] leading-relaxed text-ink">
        This is completely anonymous. Other brides will see your city, guest
        count, style, and costs — never your name, vendor names, or any
        identifying details.
      </p>
    </div>
  );
}

function PublishedBanner({
  helpful,
  onUnpublish,
}: {
  helpful: number;
  onUnpublish: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-sage/30 bg-sage/10 px-5 py-4">
      <CheckCircle2 size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-sage" />
      <div className="flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Shared — thank you
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink">
          Your numbers are helping brides plan their weddings right now.{" "}
          {helpful > 0 && (
            <span>
              <strong>{helpful}</strong> {helpful === 1 ? "bride has" : "brides have"}{" "}
              found your submission helpful.
            </span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={onUnpublish}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Unpublish
      </button>
    </div>
  );
}
