"use client";

// ── Documents tab ──────────────────────────────────────────────────────────
// Lightweight binder for anything the couple needs to find on mehendi day:
// artist portfolio link, signed contract, design sketches, aftercare PDF.
// Entries are URL-based so Drive / Dropbox / CDN links all work; drop a
// file-upload hook in later if ever needed.

import { useMemo, useState } from "react";
import {
  ExternalLink,
  FilePlus2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMehndiStore } from "@/stores/mehndi-store";
import {
  DOCUMENT_KIND_LABEL,
  type DocumentKind,
  type MehndiDocument,
} from "@/types/mehndi";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

const KINDS: DocumentKind[] = [
  "portfolio",
  "contract",
  "sketch",
  "aftercare",
  "other",
];

export function DocumentsTab({ category }: { category: WorkspaceCategory }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Documents"
        title="everything you'll want on the day"
        description="The artist's portfolio, the signed contract, design sketches, the aftercare sheet you'll share with guests. All in one place."
      />
      <DocumentList category={category} />
    </div>
  );
}

function DocumentList({ category }: { category: WorkspaceCategory }) {
  const allDocs = useMehndiStore((s) => s.documents);
  const addDocument = useMehndiStore((s) => s.addDocument);
  const updateDocument = useMehndiStore((s) => s.updateDocument);
  const deleteDocument = useMehndiStore((s) => s.deleteDocument);

  const [filter, setFilter] = useState<DocumentKind | "all">("all");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<DocumentKind>("portfolio");
  const [note, setNote] = useState("");

  const docs = useMemo(
    () =>
      allDocs
        .filter((d) => d.category_id === category.id)
        .filter((d) => filter === "all" || d.kind === filter)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [allDocs, category.id, filter],
  );

  const counts = useMemo(() => {
    const map: Record<DocumentKind, number> = {
      portfolio: 0,
      contract: 0,
      sketch: 0,
      aftercare: 0,
      other: 0,
    };
    for (const d of allDocs) {
      if (d.category_id === category.id) map[d.kind]++;
    }
    return map;
  }, [allDocs, category.id]);

  function handleAdd() {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    addDocument({
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

  return (
    <PanelCard
      icon={<Paperclip size={14} strokeWidth={1.8} />}
      title="Shared binder"
      badge={
        docs.length > 0 ? (
          <span className="font-mono text-[10.5px] tabular-nums text-ink-muted">
            {docs.length} item{docs.length === 1 ? "" : "s"}
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
              ? `All · ${allDocs.filter((d) => d.category_id === category.id).length}`
              : `${DOCUMENT_KIND_LABEL[k]} · ${counts[k]}`}
          </button>
        ))}
      </div>

      {docs.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-3 py-4 text-center text-[12.5px] italic text-ink-muted">
          Nothing here yet. Drop a portfolio link first — it&apos;s the
          fastest way to remember why you picked this artist.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {docs.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              onUpdate={(patch) => updateDocument(doc.id, patch)}
              onDelete={() => deleteDocument(doc.id)}
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
            placeholder="Title (e.g. Signed contract)"
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
            onChange={(e) => setKind(e.target.value as DocumentKind)}
            className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {DOCUMENT_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <FilePlus2 size={12} strokeWidth={2} />
            Add
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
  document: MehndiDocument;
  onUpdate: (patch: Partial<MehndiDocument>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 rounded-sm bg-saffron-pale/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron">
        {DOCUMENT_KIND_LABEL[document.kind]}
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
            <ExternalLink size={10} strokeWidth={2} />
            Open
          </a>
        </div>
        <input
          value={document.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-[10.5px] text-ink-faint hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
        />
        {document.note && (
          <input
            value={document.note}
            onChange={(e) => onUpdate({ note: e.target.value })}
            className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
          />
        )}
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
