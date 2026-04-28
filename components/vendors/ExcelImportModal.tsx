"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X, FileSpreadsheet, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VENDOR_FIELDS,
  autoMap,
  buildVendorsFromCsv,
  fieldLabel,
  parseCsv,
  type ImportMapping,
  type VendorField,
} from "@/lib/vendors/csv-import";
import { useVendorsStore } from "@/stores/vendors-store";

type Step = "upload" | "map" | "done";

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExcelImportModal({ open, onClose }: ExcelImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addVendors = useVendorsStore((s) => s.addVendors);

  const reset = useCallback(() => {
    setStep("upload");
    setRows([]);
    setMapping({});
    setImportedCount(0);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const name = file.name.toLowerCase();
    if (!/\.(csv|tsv|txt)$/i.test(name)) {
      setError(
        "Please export your spreadsheet as CSV (File → Save As → CSV) and upload that.",
      );
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setError("This file only has a header row. Add some vendors and try again.");
        return;
      }
      setRows(parsed);
      setMapping(autoMap(parsed[0]));
      setStep("map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file.");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const headers = rows[0] ?? [];
  const previewRows = rows.slice(1, 4);

  const mappedFieldCount = useMemo(
    () => Object.values(mapping).filter(Boolean).length,
    [mapping],
  );

  const onConfirmImport = useCallback(() => {
    const vendors = buildVendorsFromCsv(rows, mapping);
    addVendors(vendors);
    setImportedCount(vendors.length);
    setStep("done");
  }, [addVendors, mapping, rows]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-ink/10 bg-ivory shadow-[0_40px_80px_-20px_rgba(26,26,26,0.4)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-ink/8 px-8 py-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-saffron">
                  Vendor Directory
                </p>
                <h2 className="mt-1 font-serif text-2xl text-ink">
                  Import from Excel
                </h2>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Save your spreadsheet as CSV and drop it here to seed the
                  directory.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-ivory-warm hover:text-ink"
              >
                <X size={15} strokeWidth={1.8} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto panel-scroll px-8 py-7">
              {step === "upload" && (
                <div
                  onDrop={onDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => inputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-ink/15 bg-white px-8 py-14 transition-colors hover:border-saffron/40 hover:bg-saffron-pale/10"
                >
                  <FileSpreadsheet
                    size={32}
                    strokeWidth={1.4}
                    className="text-ink-muted"
                  />
                  <p className="font-serif text-[17px] text-ink">
                    Drop your CSV here, or click to browse
                  </p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
                    .csv · .tsv · first row = headers
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.tsv,.txt,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  {error && (
                    <p className="mt-2 text-center text-[12px] text-rose">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {step === "map" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-[17px] text-ink">
                      Map your columns
                    </h3>
                    <p className="mt-1 text-[12.5px] text-ink-muted">
                      We've guessed where your columns go. Adjust any that look
                      off — rows with no <em>Vendor name</em> mapping will be
                      skipped.
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-ink/8 bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-ivory-warm">
                        <tr>
                          <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                            Your column
                          </th>
                          <th className="w-8" />
                          <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                            Maps to
                          </th>
                          <th className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                            Sample
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {headers.map((header, i) => (
                          <tr
                            key={i}
                            className="border-t border-ink/6"
                          >
                            <td className="px-4 py-3 font-serif text-[14px] text-ink">
                              {header || <em className="text-ink-faint">unnamed</em>}
                            </td>
                            <td className="text-ink-faint">
                              <ArrowRight size={12} strokeWidth={1.6} />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={mapping[i] ?? ""}
                                onChange={(e) =>
                                  setMapping((m) => ({
                                    ...m,
                                    [i]: (e.target.value as VendorField) || null,
                                  }))
                                }
                                className="rounded-md border border-ink/10 bg-white px-2 py-1 font-mono text-[11px] text-ink-soft outline-none focus:border-saffron"
                              >
                                <option value="">— skip column —</option>
                                {VENDOR_FIELDS.map((f) => (
                                  <option key={f} value={f}>
                                    {fieldLabel(f)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="max-w-[200px] truncate px-4 py-3 font-mono text-[11px] text-ink-muted">
                              {previewRows.map((r) => r[i]).filter(Boolean)[0] ??
                                "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-ink-muted">
                    <span>
                      {rows.length - 1} vendor{rows.length - 1 === 1 ? "" : "s"}{" "}
                      ready to import · {mappedFieldCount} column
                      {mappedFieldCount === 1 ? "" : "s"} mapped
                    </span>
                  </div>
                </div>
              )}

              {step === "done" && (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/20">
                    <Check size={24} strokeWidth={2} className="text-sage" />
                  </div>
                  <h3 className="font-serif text-2xl text-ink">
                    {importedCount} vendor
                    {importedCount === 1 ? "" : "s"} imported
                  </h3>
                  <p className="max-w-md text-[13px] text-ink-muted">
                    New vendors are in your directory now. Sparse fields (bio,
                    style tags, price ranges) will fill in as background
                    enrichment runs.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-ink/8 bg-white px-8 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink"
              >
                {step === "done" ? "Close" : "Cancel"}
              </button>
              <div className="flex items-center gap-2">
                {step === "map" && (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setStep("upload");
                    }}
                    className="rounded-md border border-ink/10 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft hover:border-ink/20"
                  >
                    Upload different file
                  </button>
                )}
                {step === "map" && (
                  <button
                    type="button"
                    onClick={onConfirmImport}
                    disabled={
                      !Object.values(mapping).some((f) => f === "name")
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-opacity",
                      Object.values(mapping).some((f) => f === "name")
                        ? "bg-ink text-ivory hover:opacity-90"
                        : "cursor-not-allowed bg-ink/30 text-ivory",
                    )}
                  >
                    <Upload size={12} strokeWidth={1.8} />
                    Import {rows.length - 1} vendor
                    {rows.length - 1 === 1 ? "" : "s"}
                  </button>
                )}
                {step === "done" && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ivory hover:opacity-90"
                  >
                    See your vendors
                    <ArrowRight size={12} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
