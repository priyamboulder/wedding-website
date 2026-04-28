"use client";

// ── Zone C — The Aesthetic (locked DNA) ─────────────────────────────────────
// Sticky bottom strip (or full panel when no lock yet). Every field editable;
// every edit after lock is audited. Shows amendment history per field.
//
// Also owns the lock modal: when a Zone B direction is locked, this component
// handles the review-before-commit flow — fetches forbidden/cultural_notes
// from the API stub, lets the couple edit, then commits via store.

import { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Download,
  History,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAestheticStore } from "@/stores/aesthetic-store";
import type {
  AestheticDNA as AestheticDNAType,
  AestheticField,
  PaletteSwatch,
  AestheticAmendment,
} from "@/types/aesthetic";

const DEFAULT_ACTOR = "couple";

// ── Public component ────────────────────────────────────────────────────────

export function AestheticDNA({
  pendingLockDirectionId,
  onLockDone,
  onExport,
}: {
  pendingLockDirectionId: string | null;
  onLockDone: () => void;
  onExport: () => void;
}) {
  const dna = useAestheticStore((s) => s.dna);
  const amendments = useAestheticStore((s) => s.amendments);
  const directions = useAestheticStore((s) => s.directions);
  const amendDNA = useAestheticStore((s) => s.amendDNA);
  const unlockDNA = useAestheticStore((s) => s.unlockDNA);
  const lockDirection = useAestheticStore((s) => s.lockDirection);

  const [expanded, setExpanded] = useState(true);

  const lockedDirection = dna
    ? directions.find((d) => d.id === dna.direction_id) ?? null
    : null;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <section
        className={cn(
          "sticky bottom-0 z-30 bg-[color:var(--color-ink)] text-[color:var(--color-ivory)] border-t-2 border-[color:var(--color-gold)]",
        )}
      >
        <div className="px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-gold-light)]">
              Zone C · The Aesthetic
            </div>
            {dna && lockedDirection && (
              <>
                <span className="font-serif text-lg">{lockedDirection.name}</span>
                {dna.amended_at && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-gold-light)]">
                    Amended {formatRelative(dna.amended_at)}
                  </span>
                )}
              </>
            )}
            {!dna && (
              <span className="text-sm text-[color:var(--color-ivory)]/70 italic">
                No direction locked yet — lock one from Zone B above.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {dna && (
              <>
                <button
                  type="button"
                  onClick={onExport}
                  className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-gold-light)] hover:text-[color:var(--color-ivory)]"
                >
                  <Download className="w-3.5 h-3.5" /> Vendor brief
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Unlock the Aesthetic? Downstream surfaces will lose their source of truth. This is meant for starting over.",
                      )
                    ) {
                      unlockDNA();
                    }
                  }}
                  className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-ivory)]/70 hover:text-[color:var(--color-rose-light)]"
                >
                  <Unlock className="w-3.5 h-3.5" /> Unlock
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[color:var(--color-ivory)]/70 hover:text-[color:var(--color-ivory)]"
            >
              {expanded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Collapse
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Expand
                </>
              )}
            </button>
          </div>
        </div>

        {expanded && dna && (
          <DNAPanel
            dna={dna}
            amendments={amendments}
            onAmend={(field, new_value, reason) =>
              amendDNA({
                field,
                new_value,
                reason,
                amended_by: DEFAULT_ACTOR,
              })
            }
          />
        )}
      </section>

      {pendingLockDirectionId && (
        <LockModal
          directionId={pendingLockDirectionId}
          onCancel={onLockDone}
          onConfirm={(payload) => {
            lockDirection(pendingLockDirectionId, {
              forbidden: payload.forbidden,
              cultural_notes: payload.cultural_notes,
              locked_by: DEFAULT_ACTOR,
            });
            onLockDone();
          }}
        />
      )}
    </>
  );
}

// ── DNA panel (fields) ──────────────────────────────────────────────────────

function DNAPanel({
  dna,
  amendments,
  onAmend,
}: {
  dna: AestheticDNAType;
  amendments: AestheticAmendment[];
  onAmend: (field: AestheticField, newValue: unknown, reason: string) => void;
}) {
  return (
    <div className="bg-[color:var(--color-ink-soft)] border-t border-[color:var(--color-ink-muted)]/40">
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <DNAPaletteField
          label="Primary palette"
          field="palette_primary"
          value={dna.palette_primary}
          amendments={amendments.filter(
            (a) => a.field_changed === "palette_primary",
          )}
          onAmend={onAmend}
        />
        <DNAPaletteField
          label="Secondary palette"
          field="palette_secondary"
          value={dna.palette_secondary}
          amendments={amendments.filter(
            (a) => a.field_changed === "palette_secondary",
          )}
          onAmend={onAmend}
        />
        <DNAListField
          label="Textures"
          field="textures"
          value={dna.textures}
          amendments={amendments.filter(
            (a) => a.field_changed === "textures",
          )}
          onAmend={onAmend}
        />
        <DNAListField
          label="Mood"
          field="mood_tags"
          value={dna.mood_tags}
          amendments={amendments.filter(
            (a) => a.field_changed === "mood_tags",
          )}
          onAmend={onAmend}
        />
        <DNAListField
          label="Forbidden"
          field="forbidden"
          value={dna.forbidden}
          amendments={amendments.filter(
            (a) => a.field_changed === "forbidden",
          )}
          onAmend={onAmend}
          critical
        />
        <DNAListField
          label="Implied moves"
          field="implied_moves"
          value={dna.implied_moves}
          amendments={amendments.filter(
            (a) => a.field_changed === "implied_moves",
          )}
          onAmend={onAmend}
        />
        <div className="xl:col-span-3">
          <DNATextField
            label="Cultural notes"
            field="cultural_notes"
            value={dna.cultural_notes}
            amendments={amendments.filter(
              (a) => a.field_changed === "cultural_notes",
            )}
            onAmend={onAmend}
          />
        </div>
      </div>
    </div>
  );
}

// ── Field: palette ──────────────────────────────────────────────────────────

function FieldShell({
  label,
  amendments,
  critical,
  onEdit,
  isEditing,
  onSave,
  onCancel,
  saveDisabled,
  children,
  reasonRequired,
  onReasonChange,
  reason,
}: {
  label: string;
  amendments: AestheticAmendment[];
  critical?: boolean;
  onEdit: () => void;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  children: React.ReactNode;
  reasonRequired?: boolean;
  onReasonChange?: (v: string) => void;
  reason?: string;
}) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div
      className={cn(
        "border rounded-sm p-3 bg-[color:var(--color-ink)]",
        critical
          ? "border-[color:var(--color-gold)]"
          : "border-[color:var(--color-ink-muted)]/30",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-gold-light)] flex items-center gap-1.5">
          {label}
          {critical && <AlertTriangle className="w-3 h-3" />}
        </div>
        <div className="flex items-center gap-2">
          {amendments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ivory)]/60 hover:text-[color:var(--color-ivory)] flex items-center gap-1"
            >
              <History className="w-3 h-3" /> {amendments.length}
            </button>
          )}
          {!isEditing ? (
            <button
              type="button"
              onClick={onEdit}
              className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ivory)]/60 hover:text-[color:var(--color-gold-light)]"
            >
              <Pencil className="w-3 h-3" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSave}
                disabled={saveDisabled}
                className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-gold-light)] hover:text-[color:var(--color-ivory)] disabled:text-[color:var(--color-ink-faint)] flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Amend
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ivory)]/60 hover:text-[color:var(--color-rose-light)]"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
      {children}
      {isEditing && reasonRequired && (
        <input
          value={reason ?? ""}
          onChange={(e) => onReasonChange?.(e.target.value)}
          placeholder="Why are you amending this?"
          className="mt-2 w-full bg-[color:var(--color-ink-soft)] border border-[color:var(--color-ink-muted)]/40 text-[color:var(--color-ivory)] px-2 py-1 text-xs rounded-sm placeholder:text-[color:var(--color-ivory)]/40"
        />
      )}
      {showHistory && amendments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[color:var(--color-ink-muted)]/30 space-y-2">
          {amendments.map((a) => (
            <div key={a.id} className="text-[11px] text-[color:var(--color-ivory)]/70">
              <div className="font-mono">
                {formatAbsolute(a.amended_at)} · {a.amended_by}
              </div>
              {a.reason && <div className="italic">{a.reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DNAPaletteField({
  label,
  field,
  value,
  amendments,
  onAmend,
}: {
  label: string;
  field: AestheticField;
  value: PaletteSwatch[];
  amendments: AestheticAmendment[];
  onAmend: (field: AestheticField, newValue: unknown, reason: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PaletteSwatch[]>(value);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const save = () => {
    onAmend(field, draft, reason);
    setEditing(false);
    setReason("");
  };

  return (
    <FieldShell
      label={label}
      amendments={amendments}
      onEdit={() => setEditing(true)}
      isEditing={editing}
      onSave={save}
      onCancel={() => {
        setEditing(false);
        setDraft(value);
        setReason("");
      }}
      saveDisabled={!reason.trim()}
      reasonRequired
      onReasonChange={setReason}
      reason={reason}
    >
      <div className="flex gap-1.5 flex-wrap">
        {(editing ? draft : value).map((s, i) => (
          <div key={`${s.hex}-${i}`} className="flex flex-col items-center gap-1">
            {editing ? (
              <>
                <input
                  type="color"
                  value={s.hex}
                  onChange={(e) => {
                    const d = [...draft];
                    d[i] = { ...d[i], hex: e.target.value };
                    setDraft(d);
                  }}
                  className="w-10 h-10 rounded-sm cursor-pointer"
                />
                <input
                  value={s.name}
                  onChange={(e) => {
                    const d = [...draft];
                    d[i] = { ...d[i], name: e.target.value };
                    setDraft(d);
                  }}
                  className="w-16 text-[10px] bg-[color:var(--color-ink-soft)] border border-[color:var(--color-ink-muted)]/40 text-[color:var(--color-ivory)] px-1 py-0.5 rounded-sm"
                />
              </>
            ) : (
              <>
                <div
                  className="w-10 h-10 rounded-sm border border-[color:var(--color-ink-muted)]/40"
                  style={{ backgroundColor: s.hex }}
                />
                <div className="font-mono text-[9px] text-[color:var(--color-ivory)]/70">
                  {s.name}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </FieldShell>
  );
}

// ── Field: list of strings ──────────────────────────────────────────────────

function DNAListField({
  label,
  field,
  value,
  amendments,
  onAmend,
  critical,
}: {
  label: string;
  field: AestheticField;
  value: string[];
  amendments: AestheticAmendment[];
  onAmend: (field: AestheticField, newValue: unknown, reason: string) => void;
  critical?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.join("\n"));
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!editing) setDraft(value.join("\n"));
  }, [value, editing]);

  const save = () => {
    const next = draft
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onAmend(field, next, reason);
    setEditing(false);
    setReason("");
  };

  return (
    <FieldShell
      label={label}
      amendments={amendments}
      critical={critical}
      onEdit={() => setEditing(true)}
      isEditing={editing}
      onSave={save}
      onCancel={() => {
        setEditing(false);
        setDraft(value.join("\n"));
        setReason("");
      }}
      saveDisabled={!reason.trim()}
      reasonRequired
      onReasonChange={setReason}
      reason={reason}
    >
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={Math.max(4, value.length)}
          className="w-full bg-[color:var(--color-ink-soft)] border border-[color:var(--color-ink-muted)]/40 text-[color:var(--color-ivory)] px-2 py-1 text-xs rounded-sm font-mono"
        />
      ) : value.length === 0 ? (
        <div className="text-xs italic text-[color:var(--color-ivory)]/50">
          Empty
        </div>
      ) : (
        <ul className="space-y-1 text-xs text-[color:var(--color-ivory)]/90">
          {value.map((v, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[color:var(--color-gold-light)]">
                {critical ? "✕" : "•"}
              </span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      )}
    </FieldShell>
  );
}

// ── Field: paragraph text ───────────────────────────────────────────────────

function DNATextField({
  label,
  field,
  value,
  amendments,
  onAmend,
}: {
  label: string;
  field: AestheticField;
  value: string;
  amendments: AestheticAmendment[];
  onAmend: (field: AestheticField, newValue: unknown, reason: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const save = () => {
    onAmend(field, draft, reason);
    setEditing(false);
    setReason("");
  };

  return (
    <FieldShell
      label={label}
      amendments={amendments}
      onEdit={() => setEditing(true)}
      isEditing={editing}
      onSave={save}
      onCancel={() => {
        setEditing(false);
        setDraft(value);
        setReason("");
      }}
      saveDisabled={!reason.trim()}
      reasonRequired
      onReasonChange={setReason}
      reason={reason}
    >
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="w-full bg-[color:var(--color-ink-soft)] border border-[color:var(--color-ink-muted)]/40 text-[color:var(--color-ivory)] px-2 py-1 text-xs rounded-sm"
        />
      ) : (
        <p className="text-xs leading-relaxed text-[color:var(--color-ivory)]/90 font-serif">
          {value || <span className="italic opacity-60">Empty</span>}
        </p>
      )}
    </FieldShell>
  );
}

// ── Lock modal ──────────────────────────────────────────────────────────────

function LockModal({
  directionId,
  onCancel,
  onConfirm,
}: {
  directionId: string;
  onCancel: () => void;
  onConfirm: (payload: { forbidden: string[]; cultural_notes: string }) => void;
}) {
  const directions = useAestheticStore((s) => s.directions);
  const direction = directions.find((d) => d.id === directionId);

  const [forbidden, setForbidden] = useState<string[]>([]);
  const [culturalNotes, setCulturalNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchDerived() {
      if (!direction?.synthesis) return;
      try {
        const res = await fetch("/api/aesthetic/forbidden", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ synthesis: direction.synthesis }),
        });
        if (!res.ok) throw new Error("failed");
        const json = (await res.json()) as {
          forbidden: string[];
          cultural_notes: string;
        };
        if (cancelled) return;
        setForbidden(json.forbidden);
        setCulturalNotes(json.cultural_notes);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDerived();
    return () => {
      cancelled = true;
    };
  }, [direction]);

  if (!direction || !direction.synthesis) return null;
  const s = direction.synthesis;

  return (
    <div
      className="fixed inset-0 z-50 bg-[color:var(--color-ink)]/60 flex items-center justify-center p-6 overflow-y-auto"
      onClick={onCancel}
    >
      <div
        className="bg-[color:var(--color-ivory)] rounded-sm max-w-3xl w-full my-auto border border-[color:var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[color:var(--color-border)] flex items-start justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
              Lock the Aesthetic
            </div>
            <h3 className="font-serif text-2xl mt-1">{direction.name}</h3>
            <p className="text-sm text-[color:var(--color-ink-muted)] mt-1">
              Once locked, this becomes the source of truth every décor vendor
              reads from. Review what the AI derived — especially the forbidden
              list — before confirming.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Carried over from synthesis — shown read-only here */}
          <CarriedOverSection label="Palette" >
            <div className="flex h-8 rounded-sm overflow-hidden border border-[color:var(--color-border)]">
              {[...s.palette_primary, ...s.palette_secondary].map((c) => (
                <div
                  key={c.hex}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} · ${c.hex}`}
                  className="flex-1"
                />
              ))}
            </div>
          </CarriedOverSection>

          <CarriedOverSection label="Textures">
            <div className="flex flex-wrap gap-1.5">
              {s.textures.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] px-2 py-0.5 bg-white border border-[color:var(--color-border)] rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </CarriedOverSection>

          <CarriedOverSection label="Mood">
            <div className="flex flex-wrap gap-1.5">
              {s.mood_tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] px-2 py-0.5 bg-white border border-[color:var(--color-border)] rounded-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </CarriedOverSection>

          {/* Editable — the AI derives these, the couple confirms */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)] mb-1.5 flex items-center gap-1.5">
              Forbidden (AI-derived, editable)
              <AlertTriangle className="w-3 h-3 text-[color:var(--color-gold)]" />
            </div>
            {loading ? (
              <LoadingRow />
            ) : (
              <textarea
                value={forbidden.join("\n")}
                onChange={(e) =>
                  setForbidden(
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={Math.max(5, forbidden.length + 1)}
                className="w-full bg-white border border-[color:var(--color-border)] px-3 py-2 text-sm rounded-sm font-mono"
              />
            )}
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)] mb-1.5">
              Cultural notes (AI-derived, editable)
            </div>
            {loading ? (
              <LoadingRow />
            ) : (
              <textarea
                value={culturalNotes}
                onChange={(e) => setCulturalNotes(e.target.value)}
                rows={4}
                className="w-full bg-white border border-[color:var(--color-border)] px-3 py-2 text-sm rounded-sm"
              />
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[color:var(--color-border)] flex items-center justify-between bg-[color:var(--color-ivory-warm)]">
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                forbidden,
                cultural_notes: culturalNotes,
              })
            }
            disabled={loading}
            className="flex items-center gap-1.5 bg-[color:var(--color-ink)] text-[color:var(--color-ivory)] px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-wider hover:bg-[color:var(--color-gold)] disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" /> Confirm & lock
          </button>
        </div>
      </div>
    </div>
  );
}

function CarriedOverSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)] mb-1.5">
        {label} · carried from direction
      </div>
      {children}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center gap-2 text-sm text-[color:var(--color-ink-muted)]">
      <Loader2 className="w-4 h-4 animate-spin" /> AI deriving…
    </div>
  );
}

// ── Format helpers ──────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString();
}
