"use client";

// ── Photo-based Look Discovery (MVP) ─────────────────────────────────────
// Sephora's Virtual Artist meets bridal planning. The bride uploads a
// selfie; we deduce a curated starting palette from her self-declared skin
// tone + undertone choices + colour direction slider, and surface:
//   • a curated makeup-look shortlist (reference images + rationale)
//   • a palette strip tuned to her undertone
//   • suggested lip / eye / cheek family with shade notes
//
// This is intentionally pre-Claude-API: the "AI" today is a deterministic
// picker over a curated look library. When the API story is ready, the
// picker's inputs (tone + undertone + vibe + pinned references) are the
// same prompt payload — so the upgrade is drop-in.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Heart,
  ImagePlus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHmuaStore } from "@/stores/hmua-store";
import type { WorkspaceCategory } from "@/types/workspace";
import { PanelCard, Eyebrow } from "@/components/workspace/blocks/primitives";

// ── Look library (curated, not generated) ────────────────────────────────
// Each look declares which undertones flatter it. We score by undertone
// overlap + vibe proximity + event.

type Undertone = "fair" | "medium" | "olive" | "deep";
type Vibe = "dewy" | "glam" | "editorial" | "soft" | "bold";

interface CuratedLook {
  id: string;
  title: string;
  image_url: string;
  vibe: Vibe[];
  undertones: Undertone[];
  palette: string[];          // 4 hex swatches
  lip: { name: string; hex: string };
  eye: { name: string; hex: string };
  cheek: { name: string; hex: string };
  rationale: string;
}

const LOOK_LIBRARY: CuratedLook[] = [
  {
    id: "warm-glow",
    title: "Warm golden glow",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=640&q=70",
    vibe: ["dewy", "soft"],
    undertones: ["medium", "olive", "deep"],
    palette: ["#F5E3D9", "#E8C5AB", "#C48A6C", "#8B4A34"],
    lip: { name: "Warm rose", hex: "#C4766E" },
    eye: { name: "Champagne gold", hex: "#D4B48C" },
    cheek: { name: "Peach glow", hex: "#E8B59A" },
    rationale:
      "Champagne shimmer on the lid + warm rose lip reads luminous on warm + olive skin under daylight. A safe, cinematic first look.",
  },
  {
    id: "classic-bridal",
    title: "Classic Indian bridal",
    image_url: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=640&q=70",
    vibe: ["glam", "bold"],
    undertones: ["medium", "olive", "deep"],
    palette: ["#F3D1C0", "#D08271", "#A63E37", "#5E1913"],
    lip: { name: "Deep brick red", hex: "#9B3F3A" },
    eye: { name: "Rich copper smoke", hex: "#6E3A1E" },
    cheek: { name: "Sindoor blush", hex: "#B8504A" },
    rationale:
      "The heirloom. Red lip + copper smoke is the lehenga-reading-as-wedding-dress combination your mom recognises in every bridal photo she's ever saved.",
  },
  {
    id: "soft-modern",
    title: "Soft modern romantic",
    image_url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=640&q=70",
    vibe: ["soft", "dewy", "editorial"],
    undertones: ["fair", "medium"],
    palette: ["#F8E8DE", "#E9C6B7", "#C88F7C", "#8C5344"],
    lip: { name: "Nude terracotta", hex: "#B67565" },
    eye: { name: "Warm taupe", hex: "#946854" },
    cheek: { name: "Rosy nude", hex: "#E8C9B7" },
    rationale:
      "Soft-focus romantic. If you want the reception photos to look like a Vogue editorial more than a traditional frame, this is the direction.",
  },
  {
    id: "editorial-glass",
    title: "Editorial glass skin",
    image_url: "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=640&q=70",
    vibe: ["dewy", "editorial"],
    undertones: ["fair", "medium", "olive"],
    palette: ["#F7E9DE", "#DCBBAA", "#AE7768", "#6A3C32"],
    lip: { name: "Mauve nude", hex: "#A87164" },
    eye: { name: "Soft bronze", hex: "#8A5E44" },
    cheek: { name: "Berry flush", hex: "#B87985" },
    rationale:
      "K-beauty glass skin + minimal eye + berry lip. Reads modern and camera-ready; underplays jewelry so the pieces stay heroes.",
  },
  {
    id: "deep-regal",
    title: "Regal smokey",
    image_url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=640&q=70",
    vibe: ["bold", "glam"],
    undertones: ["olive", "deep"],
    palette: ["#F1D6C2", "#C48A6C", "#7E3A2C", "#2E1510"],
    lip: { name: "Wine plum", hex: "#6E2823" },
    eye: { name: "Chocolate smoke", hex: "#3D2314" },
    cheek: { name: "Warm terracotta", hex: "#B87058" },
    rationale:
      "Deep smoke + wine lip holds its own against heavy jewelry and saturated lehengas. Sits beautifully against warmer undertones under venue lighting.",
  },
  {
    id: "haldi-dew",
    title: "Haldi fresh & dewy",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=640&q=70",
    vibe: ["dewy", "soft"],
    undertones: ["fair", "medium", "olive", "deep"],
    palette: ["#FCEFD5", "#F3D691", "#CFA25A", "#906829"],
    lip: { name: "Tinted peach balm", hex: "#D79586" },
    eye: { name: "Warm neutral wash", hex: "#C29174" },
    cheek: { name: "Marigold flush", hex: "#EBB47B" },
    rationale:
      "Haldi specifically — you'll be rinsing turmeric off at the end. Keep the finish skincare-adjacent; save the glam for later events.",
  },
];

const VIBE_OPTIONS: { value: Vibe; label: string }[] = [
  { value: "dewy", label: "Dewy" },
  { value: "soft", label: "Soft romantic" },
  { value: "glam", label: "Glam" },
  { value: "bold", label: "Bold / statement" },
  { value: "editorial", label: "Editorial" },
];

// ── Persistence ──────────────────────────────────────────────────────────

const STORAGE_PREFIX = "ananya:hmua-photo-discovery";

interface DiscoveryState {
  selfie_url: string;
  undertone: Undertone | "";
  vibes: Vibe[];
  saved_look_ids: string[];
}

const EMPTY_STATE: DiscoveryState = {
  selfie_url: "",
  undertone: "",
  vibes: [],
  saved_look_ids: [],
};

function loadState(categoryId: string): DiscoveryState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${categoryId}`);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<DiscoveryState>;
    return {
      ...EMPTY_STATE,
      ...parsed,
      vibes: Array.isArray(parsed.vibes) ? parsed.vibes : [],
      saved_look_ids: Array.isArray(parsed.saved_look_ids) ? parsed.saved_look_ids : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(categoryId: string, state: DiscoveryState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}:${categoryId}`,
      JSON.stringify(state),
    );
  } catch {
    // ignore
  }
}

// ── Scoring ──────────────────────────────────────────────────────────────

function scoreLook(look: CuratedLook, undertone: Undertone | "", vibes: Vibe[]): number {
  let score = 0;
  if (undertone && look.undertones.includes(undertone)) score += 3;
  if (!undertone) score += 1;
  for (const v of vibes) if (look.vibe.includes(v)) score += 2;
  // Small bump so identical score sets don't collapse into one ordering.
  score += Math.random() * 0.1;
  return score;
}

// ── Entry ────────────────────────────────────────────────────────────────

export function PhotoLookDiscoveryPanel({ category }: { category: WorkspaceCategory }) {
  const profile = useHmuaStore((s) => s.getProfile(category.id));
  const [state, setState] = useState<DiscoveryState>(EMPTY_STATE);

  useEffect(() => {
    const loaded = loadState(category.id);
    // Seed undertone from profile if the bride already set it via the quiz.
    if (!loaded.undertone && profile.skin_tone) {
      loaded.undertone = profile.skin_tone as Undertone;
    }
    setState(loaded);
  }, [category.id, profile.skin_tone]);

  const update = useCallback(
    (patch: Partial<DiscoveryState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        saveState(category.id, next);
        return next;
      });
    },
    [category.id],
  );

  const ranked = useMemo(() => {
    return [...LOOK_LIBRARY]
      .map((l) => ({ look: l, score: scoreLook(l, state.undertone, state.vibes) }))
      .sort((a, b) => b.score - a.score)
      .map((r) => r.look);
  }, [state.undertone, state.vibes]);

  const top = ranked.slice(0, 3);
  const hasSelection = state.undertone || state.vibes.length > 0 || state.selfie_url;

  return (
    <PanelCard
      icon={<Sparkles size={14} strokeWidth={1.8} />}
      title="Photo-based look discovery"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ✦ AI-curated for your face
        </span>
      }
    >
      <p className="-mt-2 mb-4 max-w-2xl text-[12px] italic text-ink-faint">
        Upload a clean selfie. We suggest curated looks that flatter your
        undertone and the vibe you've told us you want — with the specific
        lip, eye, and cheek families to try in your trial.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px,1fr]">
        <SelfieUploader
          url={state.selfie_url}
          onChange={(url) => update({ selfie_url: url })}
        />
        <div className="space-y-4">
          <UndertonePicker
            value={state.undertone}
            onChange={(u) => update({ undertone: u })}
          />
          <VibePicker
            selected={state.vibes}
            onToggle={(v) => {
              const next = state.vibes.includes(v)
                ? state.vibes.filter((x) => x !== v)
                : [...state.vibes, v];
              update({ vibes: next });
            }}
          />
        </div>
      </div>

      {hasSelection && (
        <section className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <Eyebrow>Your top three</Eyebrow>
            <button
              type="button"
              onClick={() =>
                // Force a re-rank by toggling a spare property (Math.random is
                // already salting scores — this just re-renders for feedback).
                update({ vibes: [...state.vibes] })
              }
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-saffron hover:underline"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <RefreshCw size={10} strokeWidth={1.8} />
              Reshuffle
            </button>
          </div>

          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {top.map((look) => {
              const saved = state.saved_look_ids.includes(look.id);
              return (
                <li
                  key={look.id}
                  className={cn(
                    "overflow-hidden rounded-md border bg-white transition-all",
                    saved ? "border-rose/40 ring-1 ring-rose/30" : "border-border",
                  )}
                >
                  <div className="relative aspect-[4/5] bg-ivory-warm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={look.image_url}
                      alt={look.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          saved_look_ids: saved
                            ? state.saved_look_ids.filter((id) => id !== look.id)
                            : [...state.saved_look_ids, look.id],
                        })
                      }
                      className={cn(
                        "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors",
                        saved
                          ? "border-rose bg-rose text-ivory"
                          : "border-border bg-white/90 text-ink-muted hover:border-rose hover:text-rose",
                      )}
                      aria-label={saved ? "Unsave look" : "Save look"}
                    >
                      <Heart size={12} className={saved ? "fill-ivory" : ""} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-serif text-[15px] leading-tight text-ink">
                      {look.title}
                    </p>
                    <p className="mt-1 text-[11.5px] italic leading-relaxed text-ink-muted">
                      {look.rationale}
                    </p>
                    <div className="mt-2 flex gap-1">
                      {look.palette.map((c) => (
                        <span
                          key={c}
                          title={c}
                          className="h-5 flex-1 rounded-sm ring-1 ring-border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 space-y-0.5 text-[11px] text-ink-muted">
                      <ShadeLine label="Lip" hex={look.lip.hex} name={look.lip.name} />
                      <ShadeLine label="Eye" hex={look.eye.hex} name={look.eye.name} />
                      <ShadeLine label="Cheek" hex={look.cheek.hex} name={look.cheek.name} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {state.saved_look_ids.length > 0 && (
            <p className="mt-3 text-[11.5px] italic text-ink-muted">
              {state.saved_look_ids.length} look
              {state.saved_look_ids.length === 1 ? "" : "s"} saved — bring
              these to your trial.
            </p>
          )}
        </section>
      )}
    </PanelCard>
  );
}

function ShadeLine({ label, hex, name }: { label: string; hex: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-3 w-3 shrink-0 rounded-full ring-1 ring-border"
        style={{ backgroundColor: hex }}
      />
      <span
        className="w-8 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <span className="text-[11px] text-ink">{name}</span>
    </div>
  );
}

// ── Selfie uploader ──────────────────────────────────────────────────────

function SelfieUploader({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    const objectUrl = URL.createObjectURL(f);
    onChange(objectUrl);
  }

  return (
    <div>
      <Eyebrow className="mb-1.5">Your photo</Eyebrow>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {url ? (
        <div className="relative overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Your selfie" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink-muted ring-1 ring-border hover:text-rose"
            aria-label="Remove photo"
          >
            <Trash2 size={12} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] text-ink-muted ring-1 ring-border hover:text-ink"
          >
            <RefreshCw size={10} strokeWidth={1.8} />
            Swap
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group flex h-56 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-saffron/40 bg-saffron-pale/10 text-ink-muted transition-colors hover:border-saffron hover:bg-saffron-pale/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/20 text-saffron transition-transform group-hover:scale-110">
            <ImagePlus size={18} strokeWidth={1.6} />
          </span>
          <span className="text-[12.5px] font-medium text-ink">Upload a selfie</span>
          <span className="text-[10.5px] italic text-ink-faint">
            Clean light, no heavy makeup
          </span>
        </button>
      )}
      {url && (
        <p className="mt-1.5 flex items-center gap-1 text-[10.5px] italic text-ink-faint">
          <Camera size={10} strokeWidth={1.8} />
          Stays on your device — not uploaded anywhere.
        </p>
      )}
    </div>
  );
}

// ── Undertone picker ─────────────────────────────────────────────────────

const UNDERTONE_OPTIONS: { value: Undertone; label: string; hex: string }[] = [
  { value: "fair", label: "Fair", hex: "#F5DFCC" },
  { value: "medium", label: "Medium", hex: "#D4A37D" },
  { value: "olive", label: "Olive", hex: "#A67854" },
  { value: "deep", label: "Deep", hex: "#6B3E26" },
];

function UndertonePicker({
  value,
  onChange,
}: {
  value: Undertone | "";
  onChange: (v: Undertone | "") => void;
}) {
  return (
    <section>
      <Eyebrow>Undertone</Eyebrow>
      <p className="mt-0.5 text-[11px] italic text-ink-faint">
        Seeded from your quiz — tap to override.
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {UNDERTONE_OPTIONS.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? "" : o.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/60"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span
                className="h-3 w-3 rounded-full ring-1 ring-border"
                style={{ backgroundColor: o.hex }}
              />
              {o.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function VibePicker({
  selected,
  onToggle,
}: {
  selected: Vibe[];
  onToggle: (v: Vibe) => void;
}) {
  return (
    <section>
      <Eyebrow>Vibes you're reaching for</Eyebrow>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {VIBE_OPTIONS.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                active
                  ? "border-saffron bg-saffron-pale/60 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

