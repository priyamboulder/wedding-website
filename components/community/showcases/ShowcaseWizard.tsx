"use client";

// ── ShowcaseWizard ──────────────────────────────────────────────────────────
// Multi-step form for couples to create a Real Wedding showcase. Persists
// the in-progress draft to the Zustand store on every change so the user
// can close the tab and come back. Submitting auto-publishes for now —
// status field is wired for a future moderation pass.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Minus,
  PenSquare,
  Plus,
  Save,
  Search,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RealWeddingShowcase,
  ShowcaseBudgetRange,
  ShowcaseBudgetSlice,
  ShowcaseCreatorShoutout,
  ShowcasePhoto,
  ShowcaseProductTag,
  ShowcaseStyleTag,
  ShowcaseTraditionTag,
  ShowcaseVendorReview,
} from "@/types/showcase";
import {
  SHOWCASE_BUDGET_LABEL,
  SHOWCASE_STYLE_LABEL,
  SHOWCASE_TRADITION_LABEL,
} from "@/types/showcase";
import { useShowcasesStore } from "@/stores/showcases-store";
import { STORE_PRODUCTS, STORE_VENDORS } from "@/lib/store-seed";
import { SEED_CREATORS } from "@/lib/creators/seed";

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Story" },
  { id: 3, label: "Looks" },
  { id: 4, label: "Details" },
  { id: 5, label: "Vendors" },
  { id: 6, label: "Shoutouts" },
  { id: 7, label: "Review" },
];

const DEFAULT_BUDGET_SLICES: ShowcaseBudgetSlice[] = [
  { label: "Venue & Catering", percent: 40 },
  { label: "Attire & Jewelry", percent: 20 },
  { label: "Décor & Florals", percent: 15 },
  { label: "Photo & Video", percent: 10 },
  { label: "Stationery & Favors", percent: 5 },
  { label: "Other", percent: 10 },
];

// The wizard stores everything inside a single draft object that mirrors
// the RealWeddingShowcase shape. We keep it typed as Partial in the UI
// state and only fill the required fields at submit time.
type Draft = RealWeddingShowcase;

function newDraftId(): string {
  return `show-user-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 64) || "untitled-wedding"
  );
}

function emptyDraft(): Draft {
  const now = new Date().toISOString();
  const id = newDraftId();
  return {
    id,
    slug: id,
    coupleUserId: "user-local",
    brideName: "",
    partnerName: "",
    title: "",
    weddingDate: now.slice(0, 10),
    locationCity: "",
    venueName: "",
    coverImageUrl: "",
    storyText: "",
    styleTags: [],
    traditionTags: [],
    budgetRange: "not_say",
    guestCountRange: "",
    budgetBreakdown: DEFAULT_BUDGET_SLICES,
    photos: [],
    productTags: [],
    vendorReviews: [],
    creatorShoutouts: [],
    status: "draft",
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    baseSaveCount: 0,
    baseViewCount: 0,
    isFeatured: false,
  };
}

export function ShowcaseWizard() {
  const router = useRouter();
  const saveUserShowcase = useShowcasesStore((s) => s.saveUserShowcase);

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [toast, setToast] = useState<string | null>(null);

  const updateDraft = (patch: Partial<Draft>) =>
    setDraft((prev) => ({
      ...prev,
      ...patch,
      title:
        patch.brideName || patch.partnerName
          ? `${patch.brideName ?? prev.brideName} & ${patch.partnerName ?? prev.partnerName}'s Wedding`.trim()
          : prev.title,
      slug:
        patch.brideName || patch.partnerName
          ? slugify(
              `${patch.brideName ?? prev.brideName}-and-${patch.partnerName ?? prev.partnerName}-${prev.id.slice(-4)}`,
            )
          : prev.slug,
      updatedAt: new Date().toISOString(),
    }));

  const saveDraft = () => {
    saveUserShowcase({ ...draft, status: "draft" });
    setToast("Draft saved");
    window.setTimeout(() => setToast(null), 1800);
  };

  const publish = () => {
    const now = new Date().toISOString();
    const finalShowcase: Draft = {
      ...draft,
      status: "published",
      publishedAt: now,
      updatedAt: now,
    };
    saveUserShowcase(finalShowcase);
    router.push(`/community/real-weddings/${finalShowcase.slug}`);
  };

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-ivory-warm/30">
      {/* Stepper */}
      <div className="sticky top-14 z-20 border-b border-gold/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto px-6 py-3">
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className="flex shrink-0 items-center gap-2 text-left"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] transition-colors",
                    active && "border-ink bg-ink text-ivory",
                    done && "border-gold bg-gold text-ivory",
                    !active && !done && "border-border bg-white text-ink-faint",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {done ? <Check size={12} strokeWidth={2} /> : s.id}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10.5px] uppercase tracking-[0.22em]",
                    active
                      ? "text-ink"
                      : done
                        ? "text-ink-muted"
                        : "text-ink-faint",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s.label}
                </span>
                {s.id !== STEPS.length && (
                  <span
                    aria-hidden
                    className={cn(
                      "mx-1 h-px w-5",
                      done ? "bg-gold" : "bg-border",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {step === 1 && (
          <StepBasics draft={draft} updateDraft={updateDraft} />
        )}
        {step === 2 && <StepStory draft={draft} updateDraft={updateDraft} />}
        {step === 3 && (
          <StepLooks draft={draft} updateDraft={updateDraft} section="looks" />
        )}
        {step === 4 && (
          <StepLooks
            draft={draft}
            updateDraft={updateDraft}
            section="details"
          />
        )}
        {step === 5 && <StepVendors draft={draft} updateDraft={updateDraft} />}
        {step === 6 && (
          <StepShoutouts draft={draft} updateDraft={updateDraft} />
        )}
        {step === 7 && (
          <StepReview
            draft={draft}
            updateDraft={updateDraft}
            onPublish={publish}
          />
        )}
      </main>

      {/* Nav footer */}
      <div className="sticky bottom-0 z-20 border-t border-gold/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-3">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-2 text-[12px] font-medium transition-colors",
              step === 1
                ? "pointer-events-none border-border bg-ivory-warm/50 text-ink-faint"
                : "border-border bg-white text-ink-muted hover:border-gold/30 hover:text-ink",
            )}
          >
            <ChevronLeft size={12} strokeWidth={1.8} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
            >
              <Save size={12} strokeWidth={1.8} />
              Save draft
            </button>
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1.5 rounded-md border border-ink bg-ink px-4 py-2 text-[12px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-ink/90"
              >
                Continue
                <ChevronRight size={12} strokeWidth={1.8} />
              </button>
            ) : (
              <button
                type="button"
                onClick={publish}
                className="flex items-center gap-1.5 rounded-md border border-gold bg-gold px-4 py-2 text-[12px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-gold/90"
              >
                Publish showcase
                <Check size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ivory shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Step 1 — Basics ─────────────────────────────────────────────────────────

function StepBasics({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (p: Partial<Draft>) => void;
}) {
  return (
    <StepShell eyebrow="Step 1" title="The basics">
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Your name"
          value={draft.brideName}
          placeholder="Ananya"
          onChange={(v) => updateDraft({ brideName: v })}
        />
        <TextField
          label="Partner's name"
          value={draft.partnerName}
          placeholder="Rohan"
          onChange={(v) => updateDraft({ partnerName: v })}
        />
        <TextField
          label="Wedding date"
          type="date"
          value={draft.weddingDate}
          onChange={(v) => updateDraft({ weddingDate: v })}
        />
        <TextField
          label="Guest count"
          value={draft.guestCountRange}
          placeholder="e.g. 100–150"
          onChange={(v) => updateDraft({ guestCountRange: v })}
        />
        <TextField
          label="City"
          value={draft.locationCity}
          placeholder="Mumbai, India"
          onChange={(v) => updateDraft({ locationCity: v })}
        />
        <TextField
          label="Venue"
          value={draft.venueName}
          placeholder="Taj Mahal Palace"
          onChange={(v) => updateDraft({ venueName: v })}
        />
      </div>

      <div className="mt-8">
        <FieldLabel>Cover photo URL</FieldLabel>
        <input
          type="url"
          value={draft.coverImageUrl}
          onChange={(e) => updateDraft({ coverImageUrl: e.target.value })}
          placeholder="https://…"
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink transition-colors focus:border-gold/40 focus:outline-none"
        />
        {draft.coverImageUrl && (
          <div className="mt-3 aspect-[16/9] w-full overflow-hidden rounded-lg bg-ivory-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <FieldLabel>Style tags</FieldLabel>
        <p className="mt-0.5 text-[12px] italic text-ink-muted">
          Pick all that apply — shows up on your cover and helps future couples find you.
        </p>
        <TagChips
          value={draft.styleTags}
          options={
            Object.entries(SHOWCASE_STYLE_LABEL) as [
              ShowcaseStyleTag,
              string,
            ][]
          }
          onChange={(v) => updateDraft({ styleTags: v as ShowcaseStyleTag[] })}
        />
      </div>

      <div className="mt-6">
        <FieldLabel>Tradition</FieldLabel>
        <TagChips
          value={draft.traditionTags}
          options={
            Object.entries(SHOWCASE_TRADITION_LABEL) as [
              ShowcaseTraditionTag,
              string,
            ][]
          }
          onChange={(v) =>
            updateDraft({ traditionTags: v as ShowcaseTraditionTag[] })
          }
        />
      </div>

      <div className="mt-6">
        <FieldLabel>Budget range</FieldLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            Object.entries(SHOWCASE_BUDGET_LABEL) as [
              ShowcaseBudgetRange,
              string,
            ][]
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => updateDraft({ budgetRange: v })}
              className={cn(
                "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
                draft.budgetRange === v
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  );
}

// ── Step 2 — Story ──────────────────────────────────────────────────────────

function StepStory({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (p: Partial<Draft>) => void;
}) {
  const [raw, setRaw] = useState(() => draft.storyText);

  const apply = (v: string) => {
    setRaw(v);
    // Escape all HTML entities before wrapping in <p> tags to prevent XSS.
    // The textarea accepts plain text only — no HTML tags are trusted from the user.
    const escape = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const html = v
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((p) => `<p>${escape(p.trim())}</p>`)
      .join("");
    updateDraft({ storyText: html });
  };

  return (
    <StepShell eyebrow="Step 2" title="The story">
      <p className="mt-1 text-[14px] italic text-ink-muted">
        Two to three paragraphs. How you met, how you planned, what made the day feel like yours. Plain text is fine — double blank lines split paragraphs.
      </p>
      <textarea
        value={raw}
        onChange={(e) => apply(e.target.value)}
        rows={16}
        placeholder="We met at…"
        className="mt-6 w-full rounded-lg border border-border bg-white px-4 py-3 font-serif text-[16px] leading-[1.6] text-ink transition-colors focus:border-gold/40 focus:outline-none"
      />
      {draft.storyText && (
        <div className="mt-6 rounded-lg border border-gold/15 bg-ivory-warm/40 p-5">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Preview
          </p>
          <div
            className="mt-2 font-serif text-[15px] leading-[1.7] text-ink prose-showcase"
            dangerouslySetInnerHTML={{ __html: draft.storyText }}
          />
        </div>
      )}
    </StepShell>
  );
}

// ── Step 3 & 4 — Looks / Details (same UX, different section) ──────────────

function StepLooks({
  draft,
  updateDraft,
  section,
}: {
  draft: Draft;
  updateDraft: (p: Partial<Draft>) => void;
  section: "looks" | "details";
}) {
  const [urlInput, setUrlInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const sectionPhotos = draft.photos.filter((p) => p.section === section);
  const sectionTags = draft.productTags.filter((t) => t.section === section);

  const addPhoto = () => {
    if (!urlInput.trim()) return;
    const photo: ShowcasePhoto = {
      id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      imageUrl: urlInput.trim(),
      caption: captionInput.trim() || undefined,
      section,
      sortOrder: sectionPhotos.length,
    };
    updateDraft({ photos: [...draft.photos, photo] });
    setUrlInput("");
    setCaptionInput("");
  };

  const removePhoto = (id: string) => {
    updateDraft({
      photos: draft.photos.filter((p) => p.id !== id),
      productTags: draft.productTags.filter((t) => t.photoId !== id),
    });
  };

  const toggleProductTag = (productId: string) => {
    const existing = sectionTags.find((t) => t.productId === productId);
    if (existing) {
      updateDraft({
        productTags: draft.productTags.filter((t) => t.id !== existing.id),
      });
      return;
    }
    const tag: ShowcaseProductTag = {
      id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId,
      section,
    };
    updateDraft({ productTags: [...draft.productTags, tag] });
  };

  const updateTagNote = (tagId: string, note: string) => {
    updateDraft({
      productTags: draft.productTags.map((t) =>
        t.id === tagId ? { ...t, note } : t,
      ),
    });
  };

  const matchingProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const relevantCategories =
      section === "looks"
        ? ["attire", "jewelry"]
        : ["decor", "stationery", "catering_accessories", "gifting"];
    return STORE_PRODUCTS.filter((p) => {
      if (!relevantCategories.includes(p.category)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }).slice(0, 12);
  }, [productSearch, section]);

  const sectionLabel = section === "looks" ? "The Looks" : "The Details";
  const sectionEyebrow =
    section === "looks" ? "Attire & adornment" : "Décor, stationery & favors";

  return (
    <StepShell
      eyebrow={`Step ${section === "looks" ? "3" : "4"}`}
      title={sectionLabel}
    >
      <p className="mt-1 text-[14px] italic text-ink-muted">
        {sectionEyebrow}. Add photo URLs and tag products from the Ananya store.
      </p>

      {/* Photo adder */}
      <div className="mt-6 rounded-xl border border-gold/20 bg-white p-5">
        <FieldLabel>Add a photo</FieldLabel>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Photo URL"
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
          />
          <input
            type="text"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="Caption (optional)"
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={addPhoto}
            disabled={!urlInput.trim()}
            className="flex items-center justify-center gap-1 rounded-md border border-ink bg-ink px-4 py-2 text-[11.5px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-ink/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus size={12} strokeWidth={2} />
            Add
          </button>
        </div>
        {sectionPhotos.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {sectionPhotos.map((p) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-lg bg-ivory-warm"
              >
                <div className="aspect-[4/5] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>
                {p.caption && (
                  <p className="bg-white px-2 py-1 text-center font-mono text-[9.5px] uppercase tracking-wider text-ink-faint">
                    {p.caption}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-ivory opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X size={11} strokeWidth={1.8} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product tagger */}
      <div className="mt-6 rounded-xl border border-gold/20 bg-white p-5">
        <FieldLabel>Tag products from the Ananya store</FieldLabel>
        <span className="mt-3 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
          <Search size={13} strokeWidth={1.8} className="text-ink-faint" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-transparent text-[13px] text-ink outline-none"
          />
        </span>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {matchingProducts.map((p) => {
            const tagged = sectionTags.find((t) => t.productId === p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProductTag(p.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                  tagged
                    ? "border-gold/40 bg-gold-pale/30"
                    : "border-border bg-white hover:border-gold/20",
                )}
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-ivory-warm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.heroImage}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {p.title}
                  </p>
                  <p
                    className="truncate font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {p.category.replace("_", " ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    tagged
                      ? "border-gold bg-gold text-ivory"
                      : "border-border text-ink-faint",
                  )}
                >
                  {tagged ? (
                    <Check size={12} strokeWidth={2} />
                  ) : (
                    <Plus size={12} strokeWidth={2} />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {sectionTags.length > 0 && (
          <div className="mt-6 space-y-2">
            <FieldLabel>Your notes</FieldLabel>
            {sectionTags.map((t) => {
              const product = STORE_PRODUCTS.find((p) => p.id === t.productId);
              if (!product) return null;
              return (
                <div
                  key={t.id}
                  className="rounded-md border border-border bg-ivory-warm/30 p-3"
                >
                  <p className="text-[12px] font-medium text-ink">
                    {product.title}
                  </p>
                  <input
                    type="text"
                    value={t.note ?? ""}
                    onChange={(e) => updateTagNote(t.id, e.target.value)}
                    placeholder="Optional note — why you loved this piece"
                    className="mt-2 w-full rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-gold/40 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StepShell>
  );
}

// ── Step 5 — Vendors ────────────────────────────────────────────────────────

function StepVendors({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (p: Partial<Draft>) => void;
}) {
  const [query, setQuery] = useState("");

  const addVendor = (vendorId: string) => {
    if (draft.vendorReviews.some((r) => r.vendorId === vendorId)) return;
    const review: ShowcaseVendorReview = {
      id: `vr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      vendorId,
      role: "",
      rating: 5,
      reviewText: "",
    };
    updateDraft({ vendorReviews: [...draft.vendorReviews, review] });
  };

  const removeVendor = (id: string) =>
    updateDraft({
      vendorReviews: draft.vendorReviews.filter((r) => r.id !== id),
    });

  const updateReview = (id: string, patch: Partial<ShowcaseVendorReview>) =>
    updateDraft({
      vendorReviews: draft.vendorReviews.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    });

  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STORE_VENDORS.slice(0, 6);
    return STORE_VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.specialties.some((s) => s.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [query]);

  return (
    <StepShell eyebrow="Step 5" title="The vendors">
      <p className="mt-1 text-[14px] italic text-ink-muted">
        Add each vendor who worked on your wedding, their role, a star rating, and a short review.
      </p>

      <div className="mt-6 rounded-xl border border-gold/20 bg-white p-5">
        <FieldLabel>Find a vendor</FieldLabel>
        <span className="mt-3 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
          <Search size={13} strokeWidth={1.8} className="text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className="w-full bg-transparent text-[13px] text-ink outline-none"
          />
        </span>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {matching.map((v) => {
            const added = draft.vendorReviews.some(
              (r) => r.vendorId === v.id,
            );
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => !added && addVendor(v.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                  added
                    ? "border-gold/40 bg-gold-pale/30"
                    : "border-border bg-white hover:border-gold/20",
                )}
              >
                <div
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-warm font-serif text-[16px] text-ink"
                >
                  {v.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {v.name}
                  </p>
                  <p className="truncate text-[11px] text-ink-muted">
                    {v.tagline}
                  </p>
                </div>
                <span className="text-[11px] text-ink-muted">
                  {added ? "Added" : "+ Add"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {draft.vendorReviews.length > 0 && (
        <div className="mt-6 space-y-4">
          {draft.vendorReviews.map((r) => {
            const vendor = STORE_VENDORS.find((v) => v.id === r.vendorId);
            if (!vendor) return null;
            return (
              <div
                key={r.id}
                className="rounded-xl border border-gold/20 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-[17px] text-ink">
                      {vendor.name}
                    </p>
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {vendor.origin}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVendor(r.id)}
                    className="text-ink-faint hover:text-ink"
                    aria-label="Remove vendor"
                  >
                    <Minus size={14} strokeWidth={1.8} />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Role</FieldLabel>
                    <input
                      type="text"
                      value={r.role}
                      onChange={(e) =>
                        updateReview(r.id, { role: e.target.value })
                      }
                      placeholder="e.g. Wedding planner"
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <FieldLabel>Rating</FieldLabel>
                    <StarPicker
                      value={r.rating}
                      onChange={(n) =>
                        updateReview(r.id, {
                          rating: n as 1 | 2 | 3 | 4 | 5,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <FieldLabel>Review (1–3 sentences)</FieldLabel>
                  <textarea
                    value={r.reviewText}
                    onChange={(e) =>
                      updateReview(r.id, { reviewText: e.target.value })
                    }
                    rows={3}
                    placeholder="Warm, considered, and—"
                    className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StepShell>
  );
}

// ── Step 6 — Creator shoutouts ──────────────────────────────────────────────

function StepShoutouts({
  draft,
  updateDraft,
}: {
  draft: Draft;
  updateDraft: (p: Partial<Draft>) => void;
}) {
  const addShoutout = (creatorId: string) => {
    if (draft.creatorShoutouts.some((s) => s.creatorId === creatorId)) return;
    const shoutout: ShowcaseCreatorShoutout = {
      id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      creatorId,
      shoutoutText: "",
    };
    updateDraft({
      creatorShoutouts: [...draft.creatorShoutouts, shoutout],
    });
  };

  const removeShoutout = (id: string) =>
    updateDraft({
      creatorShoutouts: draft.creatorShoutouts.filter((c) => c.id !== id),
    });

  const updateShoutout = (id: string, text: string) =>
    updateDraft({
      creatorShoutouts: draft.creatorShoutouts.map((c) =>
        c.id === id ? { ...c, shoutoutText: text } : c,
      ),
    });

  return (
    <StepShell eyebrow="Step 6" title="Creator shoutouts">
      <p className="mt-1 text-[14px] italic text-ink-muted">
        Tag the creators whose guides or collections shaped your wedding. They'll be notified and their profile gets your quote under "Couples Love."
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SEED_CREATORS.map((c) => {
          const added = draft.creatorShoutouts.some(
            (s) => s.creatorId === c.id,
          );
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => !added && addShoutout(c.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                added
                  ? "border-gold/40 bg-gold-pale/30"
                  : "border-border bg-white hover:border-gold/20",
              )}
            >
              <span
                aria-hidden
                className="h-10 w-10 shrink-0 rounded-full ring-1 ring-gold/20"
                style={{ background: c.avatarGradient }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">
                  {c.displayName}
                </p>
                <p
                  className="truncate font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {c.handle}
                </p>
              </div>
              <span className="text-[11px] text-ink-muted">
                {added ? "Added" : "+ Add"}
              </span>
            </button>
          );
        })}
      </div>

      {draft.creatorShoutouts.length > 0 && (
        <div className="mt-6 space-y-3">
          {draft.creatorShoutouts.map((s) => {
            const creator = SEED_CREATORS.find((c) => c.id === s.creatorId);
            if (!creator) return null;
            return (
              <div
                key={s.id}
                className="rounded-xl border border-gold/20 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-serif text-[15px] text-ink">
                    {creator.displayName}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeShoutout(s.id)}
                    className="text-ink-faint hover:text-ink"
                    aria-label="Remove shoutout"
                  >
                    <Minus size={14} strokeWidth={1.8} />
                  </button>
                </div>
                <textarea
                  value={s.shoutoutText}
                  onChange={(e) => updateShoutout(s.id, e.target.value)}
                  rows={3}
                  placeholder="What this creator's work meant to your wedding…"
                  className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      )}
    </StepShell>
  );
}

// ── Step 7 — Review & publish ───────────────────────────────────────────────

function StepReview({
  draft,
  updateDraft,
  onPublish,
}: {
  draft: Draft;
  updateDraft: (p: Partial<Draft>) => void;
  onPublish: () => void;
}) {
  const totalPercent = draft.budgetBreakdown.reduce(
    (sum, s) => sum + s.percent,
    0,
  );

  const updateSlice = (i: number, patch: Partial<ShowcaseBudgetSlice>) => {
    const next = [...draft.budgetBreakdown];
    next[i] = { ...next[i], ...patch };
    updateDraft({ budgetBreakdown: next });
  };

  const addSlice = () =>
    updateDraft({
      budgetBreakdown: [
        ...draft.budgetBreakdown,
        { label: "New category", percent: 0 },
      ],
    });

  const removeSlice = (i: number) =>
    updateDraft({
      budgetBreakdown: draft.budgetBreakdown.filter((_, idx) => idx !== i),
    });

  const ready =
    draft.brideName.trim() &&
    draft.partnerName.trim() &&
    draft.coverImageUrl.trim();

  return (
    <StepShell eyebrow="Step 7" title="Review & publish">
      <p className="mt-1 text-[14px] italic text-ink-muted">
        Optional: share a percentage breakdown of your budget. No absolute numbers — just where it all went. Skip if you'd rather not.
      </p>

      {/* Budget slice editor */}
      <div className="mt-6 rounded-xl border border-gold/20 bg-white p-5">
        <div className="flex items-center justify-between">
          <FieldLabel>The Numbers</FieldLabel>
          <p
            className={cn(
              "font-mono text-[11px]",
              totalPercent === 100 ? "text-sage" : "text-ink-muted",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Total: {totalPercent}%
          </p>
        </div>
        <div className="mt-3 space-y-2">
          {draft.budgetBreakdown.map((slice, i) => (
            <div
              key={`${slice.label}-${i}`}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={slice.label}
                onChange={(e) => updateSlice(i, { label: e.target.value })}
                className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={slice.percent}
                onChange={(e) =>
                  updateSlice(i, { percent: Number(e.target.value) })
                }
                className="w-20 rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-gold/40 focus:outline-none"
              />
              <span className="text-[12px] text-ink-faint">%</span>
              <button
                type="button"
                onClick={() => removeSlice(i)}
                className="text-ink-faint hover:text-ink"
                aria-label="Remove category"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSlice}
          className="mt-3 flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-gold/30 hover:text-ink"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add category
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl border border-gold/20 bg-ivory-warm/40 p-5">
        <FieldLabel>Summary</FieldLabel>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <SummaryRow label="Couple" value={`${draft.brideName} & ${draft.partnerName}`} />
          <SummaryRow label="Date" value={draft.weddingDate} />
          <SummaryRow label="Venue" value={draft.venueName} />
          <SummaryRow label="Location" value={draft.locationCity} />
          <SummaryRow label="Guests" value={draft.guestCountRange} />
          <SummaryRow
            label="Budget"
            value={SHOWCASE_BUDGET_LABEL[draft.budgetRange]}
          />
          <SummaryRow
            label="Photos"
            value={`${draft.photos.length} added`}
          />
          <SummaryRow
            label="Tagged products"
            value={`${draft.productTags.length} tagged`}
          />
          <SummaryRow
            label="Vendor reviews"
            value={`${draft.vendorReviews.length} reviewed`}
          />
          <SummaryRow
            label="Creator shoutouts"
            value={`${draft.creatorShoutouts.length} tagged`}
          />
        </dl>
        {!ready && (
          <p className="mt-4 rounded-md border border-rose/30 bg-rose-pale/40 px-3 py-2 text-[12.5px] text-rose">
            A few things are still missing: you need both names and a cover photo to publish.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onPublish}
          disabled={!ready}
          className="flex items-center gap-2 rounded-md border border-gold bg-gold px-5 py-2.5 text-[12px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-gold/90 disabled:pointer-events-none disabled:opacity-50"
        >
          <PenSquare size={12} strokeWidth={1.8} />
          Publish showcase
        </button>
      </div>
    </StepShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-[15px] text-ink">
        {value || <span className="italic text-ink-faint">—</span>}
      </dd>
    </div>
  );
}

// ── Primitives ──────────────────────────────────────────────────────────────

function StepShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gold/20 bg-white p-6 md:p-10">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {eyebrow}
      </p>
      <h1 className="mt-2 font-serif text-[32px] font-medium text-ink md:text-[40px]">
        {title}
      </h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink transition-colors focus:border-gold/40 focus:outline-none"
      />
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function TagChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T[];
  options: [T, string][];
  onChange: (v: T[]) => void;
}) {
  const toggle = (v: T) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map(([v, label]) => {
        const active = value.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
              active
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mt-1 flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} out of 5`}
          className="text-gold"
        >
          <Star
            size={20}
            strokeWidth={1.5}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
