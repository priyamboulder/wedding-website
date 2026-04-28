"use client";

// ── Stationery documents tab ─────────────────────────────────────────────
// One binder for everything the stationery workflow generates: design
// proofs, printer quotes, content drafts, print specs, shipping
// confirmations. Entries are URL-based so Drive / Dropbox / CDN links all
// work; drop a file-upload hook in later if needed.

import { useMemo, useState } from "react";
import {
  ExternalLink,
  FilePlus2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import {
  STATIONERY_DOCUMENT_KIND_LABEL,
  type StationeryDocument,
  type StationeryDocumentKind,
} from "@/types/stationery";
import {
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";

const KINDS: StationeryDocumentKind[] = [
  "proof",
  "quote",
  "content_draft",
  "print_spec",
  "shipping",
  "other",
];

export function StationeryDocuments() {
  const allDocs = useStationeryStore((s) => s.documents);
  const suite = useStationeryStore((s) => s.suite);
  const addDocument = useStationeryStore((s) => s.addDocument);
  const updateDocument = useStationeryStore((s) => s.updateDocument);
  const deleteDocument = useStationeryStore((s) => s.deleteDocument);

  const [filter, setFilter] = useState<StationeryDocumentKind | "all">("all");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<StationeryDocumentKind>("proof");
  const [note, setNote] = useState("");
  const [itemId, setItemId] = useState<string>("");

  const docs = useMemo(
    () =>
      allDocs
        .filter((d) => filter === "all" || d.kind === filter)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [allDocs, filter],
  );

  const counts = useMemo(() => {
    const map: Record<StationeryDocumentKind, number> = {
      proof: 0,
      quote: 0,
      content_draft: 0,
      print_spec: 0,
      shipping: 0,
      other: 0,
    };
    for (const d of allDocs) map[d.kind]++;
    return map;
  }, [allDocs]);

  function handleAdd() {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    addDocument({
      kind,
      title: t,
      url: u,
      note: note.trim(),
      item_id: itemId || null,
    });
    setTitle("");
    setUrl("");
    setNote("");
    setItemId("");
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Documents"
        title="Everything the stationer, printer, and couple have in writing"
        description="Design proofs, printer quotes, final content drafts, print specs, shipping confirmations — one place to find them when the next person asks."
      />

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
                ? `All · ${allDocs.length}`
                : `${STATIONERY_DOCUMENT_KIND_LABEL[k]} · ${counts[k]}`}
            </button>
          ))}
        </div>

        {docs.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/80 bg-ivory-warm/30 px-3 py-4 text-center font-serif text-[15px] italic text-ink-muted">
            Nothing here yet. Paste the printer&apos;s quote link first — it&apos;s
            the thing you&apos;ll open most often.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {docs.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                itemName={
                  suite.find((i) => i.id === doc.item_id)?.name ?? null
                }
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
              placeholder="Title (e.g. Main invite proof v3)"
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
              onChange={(e) =>
                setKind(e.target.value as StationeryDocumentKind)
              }
              className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {STATIONERY_DOCUMENT_KIND_LABEL[k]}
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
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="md:col-span-2 rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
            >
              <option value="">Not linked to a piece</option>
              {suite.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="md:col-span-4 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron/50 focus:outline-none"
            />
          </div>
        </div>
      </PanelCard>
    </div>
  );
}

function DocumentRow({
  document,
  itemName,
  onUpdate,
  onDelete,
}: {
  document: StationeryDocument;
  itemName: string | null;
  onUpdate: (patch: Partial<StationeryDocument>) => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 rounded-sm bg-saffron-pale/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron">
        {STATIONERY_DOCUMENT_KIND_LABEL[document.kind]}
      </span>
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <input
            value={document.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-medium text-ink hover:border-border focus:border-saffron/50 focus:bg-white focus:outline-none"
          />
          {itemName && (
            <span className="rounded-sm bg-ivory-warm/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
              {itemName}
            </span>
          )}
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
