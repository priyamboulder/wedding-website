"use client";

// ── Documents tab ──────────────────────────────────────────────────────────
// Flight confirmations, hotel bookings, activity vouchers, travel insurance
// policy, passport copies, visa documentation, restaurant reservations.

import { ExternalLink, FileText, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DOCUMENT_CATEGORIES } from "@/lib/honeymoon-seed";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type { DocumentCategory, HoneymoonDocument } from "@/types/honeymoon";
import { cn } from "@/lib/utils";
import { Section, TextInput } from "../../bachelorette/ui";

export function DocumentsTab() {
  const documents = useHoneymoonStore((s) => s.documents);
  const addDocument = useHoneymoonStore((s) => s.addDocument);

  const [activeCat, setActiveCat] = useState<DocumentCategory | "all">("all");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftCategory, setDraftCategory] = useState<DocumentCategory>("flight");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const filtered = useMemo(
    () =>
      activeCat === "all"
        ? documents
        : documents.filter((d) => d.category === activeCat),
    [documents, activeCat],
  );

  function commit() {
    if (!draftLabel.trim()) return;
    addDocument(
      draftLabel.trim(),
      draftCategory,
      draftUrl.trim() || undefined,
      draftNotes.trim() || undefined,
    );
    setDraftLabel("");
    setDraftUrl("");
    setDraftNotes("");
  }

  return (
    <div className="space-y-5">
      <Section
        eyebrow="DOCUMENTS"
        title="Trip paper-trail"
        description="Confirmations, vouchers, passports, visas, and reservations — all in one place so the day-of doesn't turn into a scavenger hunt through inboxes."
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <TabPill
            label="All"
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          />
          {DOCUMENT_CATEGORIES.map((c) => (
            <TabPill
              key={c.value}
              label={c.label}
              active={activeCat === c.value}
              onClick={() => setActiveCat(c.value as DocumentCategory)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center text-[13px] italic text-ink-muted">
            Nothing saved here yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {filtered.map((d) => (
              <DocumentRow key={d.id} document={d} />
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-2 rounded-md border border-border/60 bg-ivory-warm/30 p-3">
          <div className="grid grid-cols-[1fr_160px] gap-2">
            <TextInput
              value={draftLabel}
              onChange={setDraftLabel}
              placeholder="Document label (e.g. Emirates confirmation)"
            />
            <select
              value={draftCategory}
              onChange={(e) =>
                setDraftCategory(e.target.value as DocumentCategory)
              }
              className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <TextInput
              value={draftUrl}
              onChange={setDraftUrl}
              placeholder="URL (optional)"
            />
            <TextInput
              value={draftNotes}
              onChange={setDraftNotes}
              placeholder="Notes (confirmation #, dates…)"
            />
            <button
              type="button"
              onClick={commit}
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <Plus size={11} strokeWidth={2} /> Add
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function DocumentRow({ document }: { document: HoneymoonDocument }) {
  const updateDocument = useHoneymoonStore((s) => s.updateDocument);
  const removeDocument = useHoneymoonStore((s) => s.removeDocument);

  return (
    <li className="flex items-center gap-3 py-2.5">
      <FileText
        size={14}
        strokeWidth={1.6}
        className="shrink-0 text-ink-faint"
      />
      <div className="min-w-0 flex-1">
        <input
          value={document.label}
          onChange={(e) =>
            updateDocument(document.id, { label: e.target.value })
          }
          className="w-full border-none bg-transparent text-[13.5px] text-ink focus:outline-none"
          aria-label="Document label"
        />
        <input
          value={document.notes ?? ""}
          onChange={(e) =>
            updateDocument(document.id, { notes: e.target.value })
          }
          placeholder="Notes (confirmation #, dates…)"
          className="mt-0.5 w-full border-none bg-transparent text-[11.5px] text-ink-muted placeholder:text-ink-faint focus:outline-none"
          aria-label="Notes"
        />
      </div>
      <select
        value={document.category}
        onChange={(e) =>
          updateDocument(document.id, {
            category: e.target.value as DocumentCategory,
          })
        }
        className="rounded-sm border border-transparent bg-transparent px-1 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-border focus:border-saffron/60 focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {DOCUMENT_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      {document.url && (
        <a
          href={document.url}
          target="_blank"
          rel="noreferrer"
          className="text-ink-faint hover:text-saffron"
          aria-label="Open"
        >
          <ExternalLink size={13} strokeWidth={1.6} />
        </a>
      )}
      <button
        type="button"
        onClick={() => removeDocument(document.id)}
        className="text-ink-faint hover:text-rose"
        aria-label="Remove document"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </li>
  );
}

function TabPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
