"use client";

import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToPDF } from "@/lib/popout-infrastructure/pdf-export";
import type { ChecklistItem } from "@/types/checklist";
import type { PDFExportOptions } from "@/types/popout-infrastructure";
import { DEFAULT_PDF_OPTIONS } from "@/types/popout-infrastructure";

interface ExportButtonProps {
  item: ChecklistItem;
  options?: Partial<PDFExportOptions>;
  className?: string;
}

export function ExportButton({
  item,
  options,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options };
      const blob = await exportToPDF(item, mergedOptions);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setIsExporting(false);
    }
  }, [item, options]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        "border border-border text-ink-muted hover:text-ink-soft hover:border-ink-faint",
        isExporting && "opacity-50 pointer-events-none",
        className,
      )}
      aria-label="Export to PDF"
    >
      <Download className="h-3.5 w-3.5" />
      <span>{isExporting ? "Exporting\u2026" : "PDF"}</span>
    </button>
  );
}
