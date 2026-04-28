"use client";

// ── Venue · Documents ──────────────────────────────────────────────────────
// The quiet filing cabinet: venue contract, floor plans, vendor rules PDF,
// insurance certificates, fire permit applications, site visit photos.
// Delegates to the shared FilesPanel (scoped to the venue category) for the
// actual storage + upload flow, and keeps a lightweight structured list of
// "known documents" on the venue store for quick-glance status.

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { useVenueStore } from "@/stores/venue-store";
import {
  VENUE_DOCUMENT_KIND_LABEL,
  type VenueDocument,
  type VenueDocumentKind,
} from "@/types/venue";
import {
  Eyebrow,
  PanelCard,
  SectionHeader,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { FilesPanel } from "@/components/workspace/shared/FilesPanel";

export function VenueDocuments({
  category: _category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Documents"
        title="Every paper trail this venue needs"
        description="Contract, floor plans, vendor rules, COIs, permit filings, site visit photos. Drop them here so your planner never has to chase you for a file."
      />
      <GlobalDocumentsLink />
      <KnownDocuments />
      <FilesPanel category="venue" />
    </div>
  );
}

// ── Cross-link to the global Documents section ───────────────────────────
// Everything uploaded via the venue category below also shows up in the main
// Documents surface. This banner makes that connection explicit so the couple
// can jump between the two views without feeling like they have two filing
// cabinets.

function GlobalDocumentsLink() {
  return (
    <Link
      href="/documents"
      className="group flex items-center justify-between gap-3 rounded-md border border-gold/30 bg-gold-pale/10 px-4 py-3 transition-colors hover:border-saffron/50 hover:bg-saffron-pale/20"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-saffron shadow-sm ring-1 ring-gold/20">
          <FolderOpen size={14} strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-[13px] font-medium text-ink">
            All wedding documents live in one place
          </p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Everything you upload here is filed under the venue category in the
            main Documents section — open it to see contracts across every
            vendor.
          </p>
        </div>
      </div>
      <span
        className="flex items-center gap-1 rounded-sm border border-saffron bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-saffron transition-colors group-hover:bg-saffron group-hover:text-ivory"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Open Documents <ArrowUpRight size={10} />
      </span>
    </Link>
  );
}

// ── Known documents ───────────────────────────────────────────────────────
// A curated checklist of named documents the couple should gather. Separate
// from the generic FilesPanel below — think of this as the "official" set.

function KnownDocuments() {
  const documents = useVenueStore((s) => s.documents);
  const addDocument = useVenueStore((s) => s.addDocument);
  const updateDocument = useVenueStore((s) => s.updateDocument);
  const removeDocument = useVenueStore((s) => s.removeDocument);

  const sorted = [...documents].sort((a, b) => a.sort_order - b.sort_order);
  const filledCount = sorted.filter((d) => d.url.trim()).length;

  const [adding, setAdding] = useState(false);

  function add() {
    const today = new Date().toISOString().slice(0, 10);
    addDocument({
      title: "New document",
      kind: "other",
      url: "",
      uploaded_at: today,
      notes: "",
    });
    setAdding(true);
  }

  return (
    <PanelCard
      icon={<FileText size={14} strokeWidth={1.8} />}
      title="Known documents"
      badge={
        <Tag tone={filledCount === sorted.length ? "sage" : "saffron"}>
          {filledCount}/{sorted.length} uploaded
        </Tag>
      }
    >
      {sorted.length === 0 && !adding ? (
        <p className="py-2 text-[12.5px] italic text-ink-faint">
          Nothing tracked yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onChange={(patch) => updateDocument(doc.id, patch)}
              onRemove={() => removeDocument(doc.id)}
            />
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={add}
        className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron hover:text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Plus size={11} strokeWidth={2} />
        Add document
      </button>
    </PanelCard>
  );
}

function DocumentRow({
  doc,
  onChange,
  onRemove,
}: {
  doc: VenueDocument;
  onChange: (patch: Partial<VenueDocument>) => void;
  onRemove: () => void;
}) {
  return (
    <li className="group rounded-md border border-border bg-white p-3">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <div className="min-w-[12rem] flex-1">
          <Eyebrow>Title</Eyebrow>
          <input
            value={doc.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="mt-1 w-full rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[13px] font-medium text-ink outline-none focus:border-saffron"
          />
        </div>
        <div className="w-40">
          <Eyebrow>Kind</Eyebrow>
          <select
            value={doc.kind}
            onChange={(e) =>
              onChange({ kind: e.target.value as VenueDocumentKind })
            }
            className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink outline-none focus:border-saffron"
          >
            {(
              Object.keys(VENUE_DOCUMENT_KIND_LABEL) as VenueDocumentKind[]
            ).map((k) => (
              <option key={k} value={k}>
                {VENUE_DOCUMENT_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <Eyebrow>Uploaded</Eyebrow>
          <input
            type="date"
            value={doc.uploaded_at}
            onChange={(e) => onChange({ uploaded_at: e.target.value })}
            className="mt-1 w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink outline-none focus:border-saffron"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-5 flex-none text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose"
          aria-label="Remove document"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>

      <div className="mt-3">
        <Eyebrow>URL</Eyebrow>
        <div className="mt-1 flex items-center gap-2">
          <input
            value={doc.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="Paste link — Drive, Dropbox, PDF…"
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-saffron"
          />
          {doc.url.trim() && (
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-saffron hover:border-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Open
              <ExternalLink size={10} strokeWidth={1.8} />
            </a>
          )}
        </div>
      </div>

      {doc.notes !== "" || doc.url.trim() ? (
        <div className="mt-2">
          <Eyebrow>Notes</Eyebrow>
          <input
            value={doc.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Anything to flag"
            className="mt-1 w-full rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[12px] italic text-ink-muted outline-none focus:border-saffron"
          />
        </div>
      ) : null}
    </li>
  );
}
