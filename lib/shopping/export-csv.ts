import type { ShoppingLink } from "@/lib/link-preview/types";

export interface TaskMeta {
  id: string;
  title: string;
  phaseTitle: string;
}

const CSV_HEADERS = [
  "Title",
  "URL",
  "Module",
  "Task",
  "Price",
  "Currency",
  "Qty",
  "Total",
  "Status",
  "Source",
  "Source Type",
  "Vendor",
  "Variant",
  "Stock Status",
  "Lead Time (days)",
  "Order ID",
  "User Note",
  "Added At",
];

function escapeCell(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv(
  links: ShoppingLink[],
  tasksById: Map<string, TaskMeta>,
  moduleTitles: Map<string, string>,
): string {
  const rows: string[] = [CSV_HEADERS.join(",")];
  for (const l of links) {
    const task = l.taskId ? tasksById.get(l.taskId) : null;
    const total = l.price != null ? l.price * l.quantity : "";
    const moduleLabel = l.module ? moduleTitles.get(l.module) ?? l.module : "—";
    const taskLabel = task
      ? task.title
      : l.detachedTaskId
        ? "(task deleted)"
        : "—";
    const sourceLabel =
      l.sourceType === "ananya_store" ? "Ananya Store" : l.domain;
    const row = [
      l.title,
      l.url,
      moduleLabel,
      taskLabel,
      l.price ?? "",
      l.currency,
      l.quantity,
      total,
      l.status,
      sourceLabel,
      l.sourceType,
      l.vendorName ?? "",
      l.variant?.label ?? "",
      l.stockStatus ?? "",
      l.leadTimeDays ?? "",
      l.orderId ?? "",
      l.userNote,
      l.createdAt,
    ];
    rows.push(row.map(escapeCell).join(","));
  }
  return rows.join("\r\n");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function csvFilename(weddingName: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const slug = slugify(weddingName) || "wedding";
  return `ananya-shopping-${slug}-${yyyy}-${mm}-${dd}.csv`;
}

export function downloadCsv(content: string, filename: string): void {
  if (typeof window === "undefined") return;
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
