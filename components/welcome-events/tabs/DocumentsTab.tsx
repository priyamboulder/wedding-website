"use client";

// ── Tab 5 — Documents ─────────────────────────────────────────────────────
// Simple link-based document list — venue reservation, catering order,
// invoices, guest list export. Documents live as label + optional URL, with
// a category tag so the list reads at a glance.

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useWelcomeEventsStore } from "@/stores/welcome-events-store";
import {
  Field,
  IconButton,
  SectionIntro,
  SectionLabel,
  SectionTitle,
  Select,
  TextInput,
} from "../shared";
import type { DocumentCategory } from "@/types/welcome-events";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  reservation: "Reservation",
  catering_order: "Catering order",
  invoice: "Invoice",
  guest_list: "Guest list",
  other: "Other",
};

const CATEGORIES: DocumentCategory[] = [
  "reservation",
  "catering_order",
  "invoice",
  "guest_list",
  "other",
];

export function DocumentsTab() {
  const documents = useWelcomeEventsStore((s) => s.documents);
  const addDocument = useWelcomeEventsStore((s) => s.addDocument);
  const updateDocument = useWelcomeEventsStore((s) => s.updateDocument);
  const removeDocument = useWelcomeEventsStore((s) => s.removeDocument);

  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState<DocumentCategory>("reservation");

  function handleAdd() {
    if (!newLabel.trim()) return;
    addDocument(newLabel.trim(), newCategory, newUrl.trim() || undefined);
    setNewLabel("");
    setNewUrl("");
  }

  return (
    <div className="flex flex-col gap-10 py-10">
      <section>
        <SectionLabel>Documents</SectionLabel>
        <SectionTitle>Paper trail</SectionTitle>
        <SectionIntro>
          Venue reservation, catering order, itemized costs, guest list
          export — everything you'd want handy the night of.
        </SectionIntro>
      </section>

      <section>
        <div className="overflow-hidden rounded-lg border border-ink/10">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-ink/10 bg-ivory-warm/60 text-left">
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Document
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Category
                </th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Link
                </th>
                <th className="w-8 px-2" />
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-ink/5 last:border-b-0"
                >
                  <td className="px-3 py-2">
                    <input
                      value={d.label}
                      onChange={(e) =>
                        updateDocument(d.id, { label: e.target.value })
                      }
                      className="w-full bg-transparent text-ink focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={d.category}
                      onChange={(e) =>
                        updateDocument(d.id, {
                          category: e.target.value as DocumentCategory,
                        })
                      }
                      className="w-full bg-transparent text-ink-soft focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={d.url ?? ""}
                        onChange={(e) =>
                          updateDocument(d.id, {
                            url: e.target.value || undefined,
                          })
                        }
                        placeholder="https://…"
                        className="w-full bg-transparent text-ink-soft placeholder:text-ink-faint focus:outline-none"
                      />
                      {d.url ? (
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ink-muted transition-colors hover:text-ink"
                          aria-label={`Open ${d.label}`}
                        >
                          <ExternalLink size={14} strokeWidth={1.8} />
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <IconButton
                      onClick={() => removeDocument(d.id)}
                      ariaLabel={`Remove ${d.label}`}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </td>
                </tr>
              ))}
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-[13px] italic text-ink-muted"
                  >
                    No documents yet. Drop in the first confirmation below.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Document" className="min-w-[200px] flex-1">
            <TextInput
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Marriott rooftop reservation"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
          </Field>
          <Field label="Category" className="min-w-[170px]">
            <Select
              value={newCategory}
              onChange={(e) =>
                setNewCategory(e.target.value as DocumentCategory)
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Link" className="min-w-[220px] flex-1">
            <TextInput
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://…"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
          </Field>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[13px] text-ivory transition-colors hover:bg-ink-soft"
          >
            <Plus size={14} strokeWidth={1.8} />
            Add
          </button>
        </div>
      </section>
    </div>
  );
}
