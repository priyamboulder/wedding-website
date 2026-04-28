"use client";

// ── Documents tab ─────────────────────────────────────────────────────────
// Simple file storage grouped by category: vendor contracts, receipts,
// inspiration, guest info, other. Upload is stubbed (registers a document
// record) — actual file storage lives outside scope for now.

import { FileText, Trash2, Upload } from "lucide-react";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import type {
  BabyShowerDocCategory,
  BabyShowerDocument,
} from "@/types/baby-shower";
import { Section } from "../../bachelorette/ui";

const CATEGORIES: {
  value: BabyShowerDocCategory;
  label: string;
  blurb: string;
}[] = [
  {
    value: "vendor_contract",
    label: "Vendor contracts",
    blurb: "Caterer, decorator, photographer agreements",
  },
  {
    value: "receipt",
    label: "Receipts",
    blurb: "Paid invoices and receipts",
  },
  {
    value: "inspiration",
    label: "Inspiration",
    blurb: "Reference photos, mood boards, saved images",
  },
  {
    value: "guest_info",
    label: "Guest info",
    blurb: "Imported lists, dietary summaries",
  },
  { value: "other", label: "Other", blurb: "Everything else" },
];

export function DocumentsTab() {
  const documents = useBabyShowerStore((s) => s.documents);
  const addDocument = useBabyShowerStore((s) => s.addDocument);
  const removeDocument = useBabyShowerStore((s) => s.removeDocument);
  const updateDocument = useBabyShowerStore((s) => s.updateDocument);

  function handleUpload(category: BabyShowerDocCategory) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      addDocument(
        file.name,
        category,
        formatBytes(file.size),
      );
      e.target.value = "";
    };
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SHARED WITH YOUR CO-HOSTS
        </p>
        <h2 className="font-serif text-[22px] leading-tight text-ink">
          Documents & inspiration
        </h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">
          Vendor contracts, receipts, reference images, anything else. Grouped
          by category. Upload goes into the selected category; move between
          categories by editing.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const docs = documents.filter((d) => d.category === cat.value);
        return (
          <Section
            key={cat.value}
            eyebrow={cat.label.toUpperCase()}
            title={cat.label}
            description={cat.blurb}
            right={
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink">
                <Upload size={12} strokeWidth={1.8} />
                Upload
                <input
                  type="file"
                  onChange={handleUpload(cat.value)}
                  className="hidden"
                />
              </label>
            }
          >
            {docs.length === 0 ? (
              <p className="text-[12.5px] italic text-ink-faint">
                Nothing uploaded yet.
              </p>
            ) : (
              <ul className="divide-y divide-border/60 overflow-hidden rounded-md border border-border">
                {docs.map((d) => (
                  <DocumentRow
                    key={d.id}
                    document={d}
                    onRemove={() => removeDocument(d.id)}
                    onMove={(newCat) =>
                      updateDocument(d.id, { category: newCat })
                    }
                  />
                ))}
              </ul>
            )}
          </Section>
        );
      })}
    </div>
  );
}

function DocumentRow({
  document,
  onRemove,
  onMove,
}: {
  document: BabyShowerDocument;
  onRemove: () => void;
  onMove: (cat: BabyShowerDocCategory) => void;
}) {
  const uploaded = new Date(document.uploadedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li className="flex items-center gap-3 bg-white px-4 py-3">
      <FileText
        size={18}
        strokeWidth={1.5}
        className="shrink-0 text-ink-faint"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-ink">{document.name}</p>
        <p className="text-[11.5px] text-ink-faint">
          {uploaded} · {document.sizeLabel}
        </p>
      </div>
      <select
        value={document.category}
        onChange={(e) => onMove(e.target.value as BabyShowerDocCategory)}
        className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted focus:border-saffron/60 focus:outline-none"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove document"
        className="text-ink-faint hover:text-rose"
      >
        <Trash2 size={13} strokeWidth={1.6} />
      </button>
    </li>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
