"use client";

// ── Files tab — shared document library ────────────────────────────────────

import { useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoordinationStore } from "@/stores/coordination-store";
import { formatRelative } from "@/lib/coordination/format";

export function CoordinationFilesTab() {
  const files = useCoordinationStore((s) => s.files);
  const vendors = useCoordinationStore((s) => s.vendors);
  const addFile = useCoordinationStore((s) => s.addFile);
  const removeFile = useCoordinationStore((s) => s.removeFile);

  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <section>
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Shared files
        </h2>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90"
        >
          <Plus size={12} strokeWidth={1.8} />
          Add file
        </button>
      </header>

      {files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/25 bg-gold-pale/10 px-6 py-12 text-center">
          <FileText size={24} strokeWidth={1.2} className="mx-auto text-gold" />
          <h2 className="mt-3 font-serif text-[20px] text-ink">
            No files shared yet
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Share floor plans, inspiration boards, load-in instructions — any
            document your vendors might need.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => {
            const audience = f.visibleToAll
              ? `All vendors (${vendors.length})`
              : `${f.visibleToVendorIds.length} vendor${f.visibleToVendorIds.length === 1 ? "" : "s"}`;
            return (
              <article
                key={f.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-gold/15 bg-white px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={14}
                      strokeWidth={1.6}
                      className="text-ink-muted"
                    />
                    <a
                      href={f.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-serif text-[15px] text-ink underline-offset-2 hover:underline"
                    >
                      {f.name}
                    </a>
                  </div>
                  {f.description ? (
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {f.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-ink-faint">
                    {audience} · uploaded {formatRelative(f.uploadedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const ok = window.confirm("Remove this file?");
                    if (ok) removeFile(f.id);
                  }}
                  className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/60 hover:text-rose"
                >
                  <Trash2 size={12} strokeWidth={1.8} />
                </button>
              </article>
            );
          })}
        </div>
      )}

      {uploadOpen ? (
        <UploadFileModal
          onClose={() => setUploadOpen(false)}
          onAdd={(input) => {
            addFile(input);
            setUploadOpen(false);
          }}
          vendors={vendors}
        />
      ) : null}
    </section>
  );
}

function UploadFileModal({
  onClose,
  onAdd,
  vendors,
}: {
  onClose: () => void;
  onAdd: (input: {
    name: string;
    fileUrl: string;
    fileType: string | null;
    description: string | null;
    visibleToAll: boolean;
    visibleToVendorIds: string[];
  }) => void;
  vendors: ReturnType<typeof useCoordinationStore.getState>["vendors"];
}) {
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");
  const [visibleToAll, setVisibleToAll] = useState(true);
  const [visibleToVendorIds, setVisibleToVendorIds] = useState<string[]>([]);

  const canSubmit = name.trim().length > 0 && fileUrl.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gold/15 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gold/10 bg-white px-6 py-4">
          <h2 className="font-serif text-[22px] text-ink">share a file.</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <Field label="File name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Updated Sangeet floor plan"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>
          <Field label="File URL" required>
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://… (Dropbox / Drive / public link)"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
            <span className="text-[10.5px] italic text-ink-faint">
              Paste a public share link. Vendors open it straight from their
              portal.
            </span>
          </Field>
          <Field label="Description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Updated layout with moved mandap"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
            />
          </Field>

          <Field label="Visibility">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[12.5px]">
                <input
                  type="radio"
                  checked={visibleToAll}
                  onChange={() => setVisibleToAll(true)}
                />
                Visible to all vendors
              </label>
              <label className="flex items-center gap-2 text-[12.5px]">
                <input
                  type="radio"
                  checked={!visibleToAll}
                  onChange={() => setVisibleToAll(false)}
                />
                Only specific vendors
              </label>
              {!visibleToAll ? (
                <div className="ml-6 flex flex-wrap gap-1.5">
                  {vendors.map((v) => {
                    const picked = visibleToVendorIds.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setVisibleToVendorIds((prev) =>
                            prev.includes(v.id)
                              ? prev.filter((x) => x !== v.id)
                              : [...prev, v.id],
                          )
                        }
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                          picked
                            ? "border-gold bg-gold-pale/40 text-gold"
                            : "border-border bg-white text-ink-muted hover:border-ink/25",
                        )}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </Field>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gold/10 bg-white px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canSubmit) return;
              onAdd({
                name: name.trim(),
                fileUrl: fileUrl.trim(),
                fileType: inferFileType(fileUrl),
                description: description.trim() || null,
                visibleToAll,
                visibleToVendorIds: visibleToAll ? [] : visibleToVendorIds,
              });
            }}
            disabled={!canSubmit}
            className="rounded-md bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
          >
            Add file
          </button>
        </div>
      </div>
    </div>
  );
}

function inferFileType(url: string): string | null {
  const match = url.match(/\.([a-z0-9]{2,5})(?:\?|$)/i);
  return match ? match[1].toLowerCase() : null;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label} {required ? <span className="text-rose">*</span> : null}
      </span>
      {children}
    </label>
  );
}
