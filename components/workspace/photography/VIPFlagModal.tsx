"use client";

// ── VIP Flag modal ─────────────────────────────────────────────────────────
// Centered overlay modal for flagging a VIP for the photographer. Replaces
// the prior inline "add blank row" interaction which rendered as a bare
// white box in the bottom-left of the screen and broke the workspace's
// visual language.
//
// Flow: guest picker (search + pick from a roster, or type a new name) →
// inline detail expansion (photo upload, context note, priority). One save
// click commits the VIP to the photography store.
//
// The roster defaults to a curated sample of common VIP-candidate
// relationships so the search feels populated from first render. When a
// shared guests store lands, swap `SAMPLE_ROSTER` for a live subscription.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Heart,
  Search,
  Sparkles,
  Star,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import type { PhotoVIP, VIPSide, VIPTier } from "@/types/photography";
import { VIP_SIDE_LABEL, VIP_TIER_LABEL } from "@/types/photography";
import { Eyebrow } from "@/components/workspace/blocks/primitives";

interface GuestRosterRow {
  id: string;
  name: string;
  relationship: string;
  side: VIPSide;
  tier: VIPTier;
}

// Curated guest-list stand-in until a shared guest store exists. Order
// mirrors the shape users hand to their photographer — inner-ring family
// first, then close friends. Kept small enough to scan; the search filters
// keep long rosters usable when the real store lands.
const SAMPLE_ROSTER: GuestRosterRow[] = [
  { id: "g-b-nani", name: "Nani (Bride's maternal grandmother)", relationship: "Bride's maternal grandmother", side: "bride", tier: "immediate" },
  { id: "g-b-dadi", name: "Dadi (Bride's paternal grandmother)", relationship: "Bride's paternal grandmother", side: "bride", tier: "immediate" },
  { id: "g-b-nana", name: "Nana (Bride's maternal grandfather)", relationship: "Bride's maternal grandfather", side: "bride", tier: "immediate" },
  { id: "g-b-dada", name: "Dada (Bride's paternal grandfather)", relationship: "Bride's paternal grandfather", side: "bride", tier: "immediate" },
  { id: "g-b-mami", name: "Mami (Bride's maternal aunt)", relationship: "Bride's maternal aunt", side: "bride", tier: "extended" },
  { id: "g-b-chachi", name: "Chachi (Bride's paternal aunt)", relationship: "Bride's paternal aunt", side: "bride", tier: "extended" },
  { id: "g-b-bhai", name: "Bhai (Bride's brother)", relationship: "Bride's brother", side: "bride", tier: "immediate" },
  { id: "g-b-didi", name: "Didi (Bride's sister)", relationship: "Bride's sister", side: "bride", tier: "immediate" },
  { id: "g-b-mausi", name: "Mausi (Bride's mother's sister)", relationship: "Bride's mother's sister", side: "bride", tier: "extended" },
  { id: "g-b-bff", name: "Bride's closest friend", relationship: "Close friend — bride's side", side: "bride", tier: "close" },
  { id: "g-g-nani", name: "Groom's Nani", relationship: "Groom's maternal grandmother", side: "groom", tier: "immediate" },
  { id: "g-g-dadi", name: "Groom's Dadi", relationship: "Groom's paternal grandmother", side: "groom", tier: "immediate" },
  { id: "g-g-nana", name: "Groom's Nana", relationship: "Groom's maternal grandfather", side: "groom", tier: "immediate" },
  { id: "g-g-dada", name: "Groom's Dada", relationship: "Groom's paternal grandfather", side: "groom", tier: "immediate" },
  { id: "g-g-bhai", name: "Groom's brother", relationship: "Groom's brother", side: "groom", tier: "immediate" },
  { id: "g-g-didi", name: "Groom's sister", relationship: "Groom's sister", side: "groom", tier: "immediate" },
  { id: "g-g-chacha", name: "Groom's Chacha", relationship: "Groom's paternal uncle", side: "groom", tier: "extended" },
  { id: "g-g-mama", name: "Groom's Mama", relationship: "Groom's maternal uncle", side: "groom", tier: "extended" },
  { id: "g-g-bff", name: "Groom's closest friend", relationship: "Close friend — groom's side", side: "groom", tier: "close" },
  { id: "g-officiant", name: "Officiant / Pandit", relationship: "Ceremony priest", side: "both", tier: "close" },
];

// ── Props ──────────────────────────────────────────────────────────────────

interface VIPFlagModalProps {
  categoryId: string;
  onClose: () => void;
}

// Stage 1: pick a person. Stage 2: detail capture (photo, note, priority).
type Stage = "pick" | "detail";

export function VIPFlagModal({ categoryId, onClose }: VIPFlagModalProps) {
  const addVIP = usePhotographyStore((s) => s.addVIP);
  const existingVips = usePhotographyStore((s) => s.vips);

  const [stage, setStage] = useState<Stage>("pick");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GuestRosterRow | null>(null);
  // Custom name typed freely (for guests not on the sample roster).
  const [customName, setCustomName] = useState("");

  // Detail stage state
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");
  const [side, setSide] = useState<VIPSide>("bride");
  const [tier, setTier] = useState<VIPTier>("immediate");
  const [mustCapture, setMustCapture] = useState(true);
  const [relationship, setRelationship] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Already-flagged names (lowercased) so the picker can note dupes.
  const alreadyFlagged = useMemo(
    () =>
      new Set(
        existingVips
          .filter((v) => v.category_id === categoryId)
          .map((v) => v.name.trim().toLowerCase()),
      ),
    [existingVips, categoryId],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_ROSTER;
    return SAMPLE_ROSTER.filter((r) =>
      `${r.name} ${r.relationship}`.toLowerCase().includes(q),
    );
  }, [query]);

  function pickRoster(row: GuestRosterRow) {
    setSelected(row);
    setCustomName(row.name);
    setRelationship(row.relationship);
    setSide(row.side);
    setTier(row.tier);
    setStage("detail");
  }

  function pickCustom() {
    const n = query.trim();
    if (!n) return;
    setSelected(null);
    setCustomName(n);
    setRelationship("");
    setSide("bride");
    setTier("immediate");
    setStage("detail");
  }

  function onPhotoChange(file: File) {
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  }

  function handleSave() {
    if (!customName.trim()) return;
    addVIP({
      category_id: categoryId,
      name: customName.trim(),
      relationship: relationship.trim(),
      side,
      tier,
      must_capture: mustCapture,
      note: note.trim() || undefined,
      photo_url: photoUrl ?? null,
    });
    onClose();
  }

  const canAdvance = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-0 py-0 sm:items-center sm:px-4 sm:py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-flag-modal-title"
    >
      <div
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-[#FAF7F2] shadow-2xl",
          "rounded-t-2xl sm:max-w-xl sm:rounded-xl",
          "animate-[fadeSlideUp_200ms_ease-out] sm:animate-[fadeIn_160ms_ease-out]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="flex items-start justify-between border-b border-border/70 bg-white/60 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron-pale/60 text-saffron"
              aria-hidden
            >
              <Star size={15} strokeWidth={1.8} />
            </span>
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Photography · VIP Flags
              </p>
              <h2
                id="vip-flag-modal-title"
                className="mt-1 font-serif text-[20px] leading-tight text-ink sm:text-[22px]"
              >
                {stage === "pick" ? "Flag a VIP" : "Flag " + (selected?.name ?? customName)}
              </h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                {stage === "pick"
                  ? "Pick someone from your guest list — or type a name to add fresh."
                  : "Add a photo, relationship, and a note so your photographer can find them on the day."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-ink-muted transition-colors hover:bg-ivory-warm/60 hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {stage === "pick" ? (
            <PickStage
              query={query}
              setQuery={setQuery}
              results={results}
              alreadyFlagged={alreadyFlagged}
              onPick={pickRoster}
              onCustom={pickCustom}
              canAdvance={canAdvance}
            />
          ) : (
            <DetailStage
              customName={customName}
              setCustomName={setCustomName}
              relationship={relationship}
              setRelationship={setRelationship}
              side={side}
              setSide={setSide}
              tier={tier}
              setTier={setTier}
              mustCapture={mustCapture}
              setMustCapture={setMustCapture}
              note={note}
              setNote={setNote}
              photoUrl={photoUrl}
              onPhotoChange={onPhotoChange}
              fileInputRef={fileInputRef}
            />
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="flex items-center justify-between border-t border-border/70 bg-white/60 px-5 py-3.5 sm:px-6 sm:py-4">
          {stage === "pick" ? (
            <>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {results.length} {results.length === 1 ? "match" : "matches"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={pickCustom}
                  disabled={!canAdvance}
                  className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add &ldquo;{query.trim() || "name"}&rdquo; as VIP
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStage("pick")}
                className="text-[12px] text-ink-muted hover:text-ink"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!customName.trim()}
                  className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save VIP
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

// ── Pick stage ─────────────────────────────────────────────────────────────

function PickStage({
  query,
  setQuery,
  results,
  alreadyFlagged,
  onPick,
  onCustom,
  canAdvance,
}: {
  query: string;
  setQuery: (q: string) => void;
  results: GuestRosterRow[];
  alreadyFlagged: Set<string>;
  onPick: (row: GuestRosterRow) => void;
  onCustom: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Search field */}
      <label className="relative block">
        <span className="sr-only">Search guests</span>
        <Search
          size={14}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAdvance && results.length === 0) {
              e.preventDefault();
              onCustom();
            }
          }}
          placeholder="Search your guest list, or type a new name…"
          className="w-full rounded-md border border-border bg-white py-2.5 pl-9 pr-3 font-serif text-[14.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
        />
      </label>

      {/* Results */}
      <div>
        <Eyebrow className="mb-2 flex items-center gap-1.5">
          <Sparkles size={10} strokeWidth={1.8} /> From your guest list
        </Eyebrow>
        {results.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-white px-4 py-6 text-center">
            <p className="text-[12.5px] text-ink-muted">
              No match for <span className="font-medium text-ink">&ldquo;{query}&rdquo;</span>.
            </p>
            <button
              type="button"
              onClick={onCustom}
              className="mt-3 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
            >
              Flag as a new VIP
            </button>
          </div>
        ) : (
          <ul className="max-h-[44vh] space-y-1 overflow-y-auto pr-1">
            {results.map((row) => {
              const dup = alreadyFlagged.has(row.name.trim().toLowerCase());
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => !dup && onPick(row)}
                    disabled={dup}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-md border bg-white px-3 py-2.5 text-left transition-all",
                      dup
                        ? "cursor-not-allowed border-border opacity-60"
                        : "border-border hover:border-saffron hover:bg-saffron-pale/10",
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory-warm text-ink-faint">
                      <UserCircle size={18} strokeWidth={1.4} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-serif text-[14px] text-ink">
                        {row.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-ink-muted">
                        {row.relationship} · {VIP_SIDE_LABEL[row.side]}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
                        dup
                          ? "border-sage/40 bg-sage-pale/30 text-sage"
                          : "border-border text-ink-faint group-hover:border-saffron/40 group-hover:text-saffron",
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {dup ? "Flagged" : VIP_TIER_LABEL[row.tier]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Detail stage ───────────────────────────────────────────────────────────

function DetailStage({
  customName,
  setCustomName,
  relationship,
  setRelationship,
  side,
  setSide,
  tier,
  setTier,
  mustCapture,
  setMustCapture,
  note,
  setNote,
  photoUrl,
  onPhotoChange,
  fileInputRef,
}: {
  customName: string;
  setCustomName: (v: string) => void;
  relationship: string;
  setRelationship: (v: string) => void;
  side: VIPSide;
  setSide: (s: VIPSide) => void;
  tier: VIPTier;
  setTier: (t: VIPTier) => void;
  mustCapture: boolean;
  setMustCapture: (b: boolean) => void;
  note: string;
  setNote: (v: string) => void;
  photoUrl?: string;
  onPhotoChange: (f: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-5">
      {/* Photo + name row */}
      <div className="flex items-start gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f && f.type.startsWith("image/")) onPhotoChange(f);
          }}
          className={cn(
            "relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
            dragOver
              ? "border-saffron bg-saffron-pale/20"
              : "border-border bg-white hover:border-saffron/60",
          )}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload photo"
          role="button"
          tabIndex={0}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-ink-faint">
              <Camera size={16} strokeWidth={1.5} />
              <span
                className="font-mono text-[9px] uppercase tracking-[0.1em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Photo
              </span>
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPhotoChange(f);
              e.target.value = "";
            }}
          />
        </div>
        <div className="flex-1 space-y-2.5">
          <div>
            <Eyebrow className="mb-1">Name</Eyebrow>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Nani"
              className="w-full rounded-md border border-border bg-white px-3 py-2 font-serif text-[15px] text-ink focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
            />
          </div>
          <div>
            <Eyebrow className="mb-1">Relationship</Eyebrow>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Bride's maternal grandmother"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
            />
          </div>
          <p className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Upload size={10} strokeWidth={1.8} />
            Drop an image on the circle, or tap to upload. Helps your
            photographer recognise them.
          </p>
        </div>
      </div>

      {/* Side + tier */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Eyebrow className="mb-1.5">Side</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {(["bride", "groom", "both"] as VIPSide[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={cn(
                  "rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                  side === s
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-ink-muted hover:border-ink",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {VIP_SIDE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow className="mb-1.5">Tier</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {(["immediate", "extended", "close"] as VIPTier[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={cn(
                  "rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                  tier === t
                    ? "border-saffron bg-saffron-pale/40 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {VIP_TIER_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Priority */}
      <div>
        <Eyebrow className="mb-1.5">Priority</Eyebrow>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMustCapture(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] transition-colors",
              mustCapture
                ? "border-rose bg-rose-pale/40 text-rose"
                : "border-border bg-white text-ink-muted hover:border-rose",
            )}
          >
            <Heart size={11} strokeWidth={1.8} className={mustCapture ? "fill-rose" : ""} />
            Must capture
          </button>
          <button
            type="button"
            onClick={() => setMustCapture(false)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] transition-colors",
              !mustCapture
                ? "border-ink bg-ivory-warm/40 text-ink"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
          >
            Nice to have
          </button>
        </div>
      </div>

      {/* Context note */}
      <div>
        <Eyebrow className="mb-1.5">Context for the photographer</Eyebrow>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Bride's grandmother, will be in a wheelchair near the front row. Catch her reaction during the vidaai."
          className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
        />
      </div>
    </div>
  );
}
