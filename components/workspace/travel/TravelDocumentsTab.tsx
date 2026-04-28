"use client";

// ── Documents tab ─────────────────────────────────────────────────────────
// Binder for hotel contracts, room block agreements, attrition letters,
// guest travel spreadsheets, welcome bag receipts. URL-based entries so
// Drive / Dropbox / CDN links all work.

import { useMemo, useState } from "react";
import {
  ExternalLink,
  FilePlus2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTravelStore } from "@/stores/travel-store";
import {
  TRAVEL_DOCUMENT_KIND_LABEL,
  type TravelDocument,
  type TravelDocumentKind,
} from "@/types/travel";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

const KINDS: TravelDocumentKind[] = [
  "contract",
  "block_agreement",
  "attrition_terms",
  "guest_spreadsheet",
  "welcome_bag_receipt",
  "other",
];

export function TravelDocumentsTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Documents"
        title="Everything in one place"
        description="Hotel contracts, room block agreements, attrition terms, guest travel sheets, welcome bag receipts. Keep signed copies here so cutoff and penalty clauses are always one click away."
      />
      <DocumentList category={category} />
    </div>
  );
}

function DocumentList({ category }: { category: WorkspaceCategory }) {
  const all = useTravelStore((s) => s.documents);
  const add = useTravelStore((s) => s.addDocument);
  const update = useTravelStore((s) => s.updateDocument);
  const del = useTravelStore((s) => s.deleteDocument);

  const [filter, setFilter] = useState<TravelDocumentKind | "all">("all");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<TravelDocumentKind>("contract");
  const [note, setNote] = useState("");

  const docs = useMemo(
    () =>
      all
        .filter((d) => d.category_id === category.id)
        .filter((d) => filter === "all" || d.kind === filter)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [all, category.id, filter],
  );

  const counts = useMemo(() => {
    const map: Record<TravelDocumentKind, number> = {
      contract: 0,
      block_agreement: 0,
      attrition_terms: 0,
      guest_spreadsheet: 0,
      welcome_bag_receipt: 0,
      other: 0,
    };
    for (const d of all) if (d.category_id === category.id) map[d.kind]++;
    return map;
  }, [all, category.id]);

  function handleAdd() {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    add({
      category_id: category.id,
      kind,
      title: t,
      url: u,
      note: note.trim(),
    });
    setTitle("");
    setUrl("");
    setNote("");
  }

  const total = all.filter((d) => d.category_id === category.id).length;

  return (
    <PanelCard
      icon={<Paperclip size={14} strokeWidth={1.8} />}
      title="Shared binder"
      badge={
        total > 0 ? (
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {total} item{total === 1 ? "" : "s"}
          </span>
        ) : null
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(["all", ...KINDS] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              filter === k
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:text-ink",
            )}
          >
            {k === "all"
              ? `All · ${total}`
              : `${TRAVEL_DOCUMENT_KIND_LABEL[k]} · ${counts[k]}`}
          </button>
        ))}
      </div>

      {docs.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-3 py-4 text-center text-[12.5px] italic text-ink-muted">
          Nothing here yet. Drop the signed block agreement first — that's
          the one with the attrition clause you'll want to re-read.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {docs.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              onUpdate={(patch) => update(doc.id, patch)}
              onDelete={() => del(doc.id)}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-md border border-border bg-ivory-warm/30 p-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-saffron">
          Add a document
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Marriott block agreement)"
            className="md:col-span-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (Drive / Dropbox / CDN)"
            className="md:col-span-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as TravelDocumentKind)}
            className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {TRAVEL_DOCUMENT_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <FilePlus2 size={12} strokeWidth={2} /> Add
          </button>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="md:col-span-6 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          />
        </div>
      </div>
    </PanelCard>
  );
}

function DocumentRow({
  document,
  onUpdate,
  onDelete,
}: {
  document: TravelDocument;
  onUpdate: (patch: Partial<TravelDocument>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 rounded-sm bg-saffron-pale/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron">
        {TRAVEL_DOCUMENT_KIND_LABEL[document.kind]}
      </span>
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <input
            value={document.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-medium text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
          />
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-0.5 text-[11px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <ExternalLink size={10} strokeWidth={2} /> Open
          </a>
        </div>
        <input
          value={document.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[10.5px] text-ink-faint hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
        <input
          value={document.note}
          onChange={(e) => onUpdate({ note: e.target.value })}
          placeholder="Note"
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted placeholder:text-ink-faint hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
      </div>
      <button
        type="button"
        aria-label="Delete document"
        onClick={onDelete}
        className="mt-0.5 rounded p-1 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}
