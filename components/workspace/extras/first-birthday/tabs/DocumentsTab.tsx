"use client";

// ── Documents tab ─────────────────────────────────────────────────────────
// Lightweight file/link vault — vendor contracts, receipts, venue info,
// ceremony notes, inspiration, other. Categorized filter + paste-link
// entry. No uploads to a bucket (localStorage only per project memory).

import {
  ExternalLink,
  FileImage,
  FileText,
  NotebookPen,
  Plus,
  Receipt,
  Sparkles,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import type {
  FirstBirthdayDocCategory,
  FirstBirthdayDocument,
} from "@/types/first-birthday";
import { Label, Section, TextInput } from "../../bachelorette/ui";

const CATEGORIES: {
  value: FirstBirthdayDocCategory;
  label: string;
  icon: typeof FileText;
}[] = [
  { value: "vendor_contract", label: "Vendor contract", icon: FileText },
  { value: "receipt", label: "Receipt", icon: Receipt },
  { value: "venue_info", label: "Venue info", icon: Warehouse },
  { value: "ceremony_notes", label: "Ceremony notes", icon: NotebookPen },
  { value: "inspiration", label: "Inspiration", icon: Sparkles },
  { value: "other", label: "Other", icon: FileImage },
];

export function DocumentsTab() {
  const documents = useFirstBirthdayStore((s) => s.documents);
  const addDocument = useFirstBirthdayStore((s) => s.addDocument);
  const updateDocument = useFirstBirthdayStore((s) => s.updateDocument);
  const removeDocument = useFirstBirthdayStore((s) => s.removeDocument);
  const [filter, setFilter] = useState<FirstBirthdayDocCategory | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? documents
        : documents.filter((d) => d.category === filter),
    [documents, filter],
  );

  return (
    <div className="space-y-5">
      <Section
        eyebrow="DOCUMENTS"
        title="Contracts, receipts, and ceremony notes"
        description="Paste confirmation links so everything's in one place. Nothing uploads — this is a link vault."
      >
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="All"
            count={documents.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {CATEGORIES.map((c) => {
            const count = documents.filter((d) => d.category === c.value).length;
            return (
              <FilterPill
                key={c.value}
                label={c.label}
                count={count}
                active={filter === c.value}
                onClick={() => setFilter(c.value)}
              />
            );
          })}
        </div>
      </Section>

      <AddDocumentForm onAdd={addDocument} />

      <Section>
        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-10 text-center">
            <FileText
              size={22}
              strokeWidth={1.4}
              className="mx-auto mb-2 text-ink-faint"
            />
            <p className="text-[13px] text-ink-muted">
              No documents in this view yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onUpdate={(patch) => updateDocument(doc.id, patch)}
                onRemove={() => removeDocument(doc.id)}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px]",
          active ? "bg-ivory/20 text-ivory" : "bg-ivory-warm text-ink-faint",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function AddDocumentForm({
  onAdd,
}: {
  onAdd: (
    label: string,
    category: FirstBirthdayDocCategory,
    url?: string,
    notes?: string,
  ) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] =
    useState<FirstBirthdayDocCategory>("vendor_contract");

  function commit() {
    if (!label.trim()) return;
    onAdd(label.trim(), category, url.trim() || undefined);
    setLabel("");
    setUrl("");
  }

  return (
    <Section>
      <Label>Add a document</Label>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_180px_auto]">
        <TextInput
          value={label}
          onChange={setLabel}
          placeholder="What is it? (e.g. Decorator contract)"
        />
        <TextInput value={url} onChange={setUrl} placeholder="URL (optional)" />
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as FirstBirthdayDocCategory)
          }
          className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={commit}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Save
        </button>
      </div>
    </Section>
  );
}

function DocumentRow({
  doc,
  onUpdate,
  onRemove,
}: {
  doc: FirstBirthdayDocument;
  onUpdate: (patch: Partial<FirstBirthdayDocument>) => void;
  onRemove: () => void;
}) {
  const category = CATEGORIES.find((c) => c.value === doc.category);
  const Icon = category?.icon ?? FileText;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-saffron-pale/60 text-saffron">
        <Icon size={14} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <TextInput value={doc.label} onChange={(v) => onUpdate({ label: v })} />
        <TextInput
          value={doc.url}
          onChange={(v) => onUpdate({ url: v })}
          placeholder="URL (optional)"
          className="mt-1.5"
        />
        <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
          {category?.label ?? "Other"} · added{" "}
          {new Date(doc.addedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {doc.url && (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${doc.label}`}
            className="rounded-md border border-border bg-white p-1.5 text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            <ExternalLink size={13} strokeWidth={1.8} />
          </a>
        )}
        <button
          type="button"
          aria-label="Remove document"
          onClick={onRemove}
          className="rounded-md border border-transparent p-1.5 text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>
    </li>
  );
}
