"use client";

// RsvpDraftsModal — a right-side slide-over that lists all pending
// households, grouped by side, each with an AI-drafted follow-up message
// ready to copy into WhatsApp or email.
//
// The parent supplies the data (households + the events each is invited
// to). This component handles fetch, edit, copy-per-card, and copy-all.

import { useEffect, useMemo, useState } from "react";
import { Copy, X, Check, Loader2, RefreshCw, Edit3, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftTone, DraftRsvpMessage, Side } from "./types";

export interface DraftHousehold {
  id: string;
  addressing: string;
  displayName: string;
  side: Side;
  city: string;
  events: Array<{ id: string; label: string; date: string }>;
  primaryRelationship?: string;
}

interface Props {
  households: DraftHousehold[];
  coupleNames: string;
  rsvpDeadline: string;
  onClose: () => void;
}

export function RsvpDraftsModal({
  households,
  coupleNames,
  rsvpDeadline,
  onClose,
}: Props) {
  const [tone, setTone] = useState<DraftTone>("warm");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());

  const load = async (nextTone: DraftTone) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/draft-rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tone: nextTone,
          coupleNames,
          rsvpDeadline,
          households: households.map((h) => ({
            id: h.id,
            addressing: h.addressing,
            side: h.side,
            city: h.city,
            events: h.events,
            primaryRelationship: h.primaryRelationship,
          })),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        messages?: DraftRsvpMessage[];
        error?: string;
      };
      if (!data.ok) throw new Error(data.error ?? "Draft failed");
      const byId: Record<string, string> = {};
      for (const m of data.messages ?? []) {
        byId[m.householdId] = m.message;
      }
      setDrafts(byId);
      setEdits({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const bride: DraftHousehold[] = [];
    const groom: DraftHousehold[] = [];
    const mutual: DraftHousehold[] = [];
    for (const h of households) {
      if (h.side === "bride") bride.push(h);
      else if (h.side === "groom") groom.push(h);
      else mutual.push(h);
    }
    return { bride, groom, mutual };
  }, [households]);

  const currentMessage = (id: string) => edits[id] ?? drafts[id] ?? "";

  const copyOne = async (id: string) => {
    const text = currentMessage(id);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setTimeout(() => {
        setCopiedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1500);
    } catch {
      // noop — clipboard may be unavailable in some browsers
    }
  };

  const copyAll = async () => {
    const blocks: string[] = [];
    for (const h of households) {
      const msg = currentMessage(h.id);
      if (!msg) continue;
      blocks.push(`── ${h.displayName} ──\n${msg}`);
    }
    try {
      await navigator.clipboard.writeText(blocks.join("\n\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-border bg-white shadow-[-8px_0_32px_rgba(26,26,26,0.06)]">
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
              AI drafts
            </p>
            <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
              RSVP follow-ups
            </h3>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              {households.length} pending household
              {households.length === 1 ? "" : "s"} — drafts ready to copy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-faint hover:bg-ivory-warm hover:text-ink"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </header>

        {/* Tone + copy-all */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Tone
          </span>
          {(["formal", "warm", "casual"] as DraftTone[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                load(t);
              }}
              disabled={loading}
              className={cn(
                "rounded-full border px-3 py-0.5 text-[11.5px] font-medium capitalize transition-colors",
                tone === t
                  ? "border-gold bg-ink text-ivory"
                  : "border-border text-ink-muted hover:border-ink/20 hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => load(tone)}
            disabled={loading}
            className="ml-2 flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-ink/20 hover:text-ink disabled:opacity-50"
            aria-label="Regenerate"
          >
            <RefreshCw
              size={11}
              strokeWidth={1.7}
              className={loading ? "animate-spin" : ""}
            />
            Regenerate
          </button>
          <button
            onClick={copyAll}
            disabled={loading || households.length === 0}
            className="ml-auto flex items-center gap-1.5 rounded-md bg-gold px-3 py-1 text-[11.5px] font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {copiedAll ? (
              <>
                <Check size={11} strokeWidth={2} /> Copied
              </>
            ) : (
              <>
                <Copy size={11} strokeWidth={1.8} /> Copy all
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && !Object.keys(drafts).length && (
            <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
              <Loader2 size={13} strokeWidth={1.7} className="animate-spin" />
              Drafting messages…
            </div>
          )}
          {error && (
            <div className="rounded-md border border-rose-light/40 bg-rose-pale/40 px-3 py-2 text-[12.5px] text-rose">
              {error}
            </div>
          )}
          {!loading && households.length === 0 && (
            <div className="text-[13px] text-ink-muted">
              No pending households — you're caught up.
            </div>
          )}

          {[
            { key: "bride" as const, label: "Bride's side" },
            { key: "groom" as const, label: "Groom's side" },
            { key: "mutual" as const, label: "Mutual" },
          ]
            .filter((g) => grouped[g.key].length > 0)
            .map((g) => (
              <section key={g.key} className="mb-6">
                <h4 className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">
                  {g.label} · {grouped[g.key].length}
                </h4>
                <div className="flex flex-col gap-3">
                  {grouped[g.key].map((h) => (
                    <DraftCard
                      key={h.id}
                      household={h}
                      message={currentMessage(h.id)}
                      onEdit={(val) =>
                        setEdits((prev) => ({ ...prev, [h.id]: val }))
                      }
                      onCopy={() => copyOne(h.id)}
                      copied={copiedIds.has(h.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      </aside>
    </>
  );
}

function DraftCard({
  household,
  message,
  onEdit,
  onCopy,
  copied,
}: {
  household: DraftHousehold;
  message: string;
  onEdit: (val: string) => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const eventLabels = household.events.map((e) => e.label).join(" · ");

  return (
    <article className="rounded-md border border-border bg-white px-4 py-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink">
            {household.addressing}
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            {household.city} · {eventLabels}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing((v) => !v)}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              editing
                ? "border-gold bg-gold-pale/30 text-saffron"
                : "border-border text-ink-muted hover:border-ink/20 hover:text-ink",
            )}
            aria-label="Edit draft"
          >
            <Edit3 size={11} strokeWidth={1.7} />
          </button>
          <button
            onClick={onCopy}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
              copied
                ? "border-sage bg-sage-pale/60 text-sage"
                : "border-border text-ink-muted hover:border-ink/20 hover:text-ink",
            )}
          >
            {copied ? (
              <>
                <Check size={11} strokeWidth={2} /> Copied
              </>
            ) : (
              <>
                <Copy size={11} strokeWidth={1.7} /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={message}
          onChange={(e) => onEdit(e.target.value)}
          rows={Math.max(6, message.split("\n").length + 1)}
          className="w-full resize-y rounded border border-gold/30 bg-white px-3 py-2 text-[12.5px] leading-relaxed text-ink focus:border-gold focus:outline-none"
        />
      ) : (
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-ink">
          {message || "…"}
        </pre>
      )}
    </article>
  );
}
