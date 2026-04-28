"use client";

// ── FilesPanel ──────────────────────────────────────────────────────────────
// Reusable files surface — drag/drop, click-to-upload, paste, version
// history, tags, inline delete + undo, contract auto-detection.
//
//   <FilesPanel category="photography" tab="shortlist" />
//
// Scope rules:
//   - tab set     → shows files where file.tab === tab (tab-scoped view)
//   - tab unset   → shows ALL files for the category (category-level view)
// Uploads always inherit the same scope (tab-scoped or category-level).

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  ChevronRight,
  Download,
  Eye,
  File as FileIcon,
  FileText,
  History,
  Image as ImageIcon,
  Link2,
  Mail,
  Music,
  Paperclip,
  Trash2,
  Upload,
  Video as VideoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilesStore, isStorageKeyResolvable } from "@/stores/files-store";
import {
  MAX_FILE_SIZE_BYTES,
  kindFromMime,
  prettySize,
  type FileKind,
  type WorkspaceFile,
} from "@/types/files";
import type { WorkspaceCategoryTag, WorkspaceTabTag } from "@/types/checklist";
import {
  PanelCard,
  Tag,
  EmptyRow,
  Eyebrow,
} from "@/components/workspace/blocks/primitives";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { DragDropZone } from "@/components/workspace/editable/DragDropZone";
import { ChipInput } from "@/components/workspace/editable/ChipInput";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import { useVendorsStore } from "@/stores/vendors-store";

// Static for now — when multi-wedding lands, wire from AppShell context.
const WEDDING_ID = "default";
const CURRENT_USER = "couple";

export interface FilesPanelProps {
  category: WorkspaceCategoryTag;
  tab?: WorkspaceTabTag;
  // "full" = panel with header, uploader and list (default)
  // "preview" = compact 3-5 row preview embedded inside another tab
  variant?: "full" | "preview";
  previewLimit?: number;
  // When shown on a specific vendor card, pre-scope links so uploads attach
  // automatically.
  defaultVendorId?: string;
  className?: string;
}

export function FilesPanel({
  category,
  tab,
  variant = "full",
  previewLimit = 5,
  defaultVendorId,
  className,
}: FilesPanelProps) {
  const files = useFilesStore((s) => s.files);
  const addFile = useFilesStore((s) => s.addFile);
  const softDelete = useFilesStore((s) => s.softDelete);
  const restoreFile = useFilesStore((s) => s.restoreFile);
  const purge = useFilesStore((s) => s.purge);
  const setTags = useFilesStore((s) => s.setTags);
  const inputRef = useRef<HTMLInputElement>(null);

  const scoped = useMemo(() => {
    return files
      .filter((f) => !f.deleted_at && f.category === category)
      .filter((f) => (tab === undefined ? true : f.tab === tab))
      .filter(
        (f) =>
          !defaultVendorId ||
          f.linked_entities.vendor_ids?.includes(defaultVendorId),
      )
      .sort(
        (a, b) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
      );
  }, [files, category, tab, defaultVendorId]);

  function handleUploadList(list: File[]) {
    const rejected: string[] = [];
    for (const file of list) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejected.push(file.name);
        continue;
      }
      addFile({
        file,
        wedding_id: WEDDING_ID,
        category,
        tab,
        uploaded_by: CURRENT_USER,
        linked_entities: defaultVendorId ? { vendor_ids: [defaultVendorId] } : {},
      });
    }
    if (rejected.length) {
      pushUndo({
        message: `Skipped ${rejected.length} file${rejected.length === 1 ? "" : "s"} over 5 MB`,
      });
    }
  }

  function handleDelete(id: string) {
    softDelete(id);
    pushUndo({
      message: "File removed",
      undo: () => restoreFile(id),
      timeout_ms: 8000,
    });
    setTimeout(() => {
      // Purge from DB if not restored within the undo window.
      const still = useFilesStore
        .getState()
        .files.find((f) => f.id === id);
      if (still?.deleted_at) purge(id);
    }, 10000);
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (list.length) handleUploadList(list);
    e.target.value = "";
  }

  // ── Preview variant ──────────────────────────────────────────────────────
  if (variant === "preview") {
    const rows = scoped.slice(0, previewLimit);
    return (
      <DragDropZone onDropFiles={handleUploadList} overlayLabel="Drop file">
        <div
          className={cn(
            "rounded-lg border border-border bg-white p-4",
            className,
          )}
        >
          <div className="flex items-center justify-between">
            <Eyebrow>Recent files · {category}</Eyebrow>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Upload size={10} /> Upload
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={onPick}
            />
          </div>
          {rows.length === 0 ? (
            <EmptyRow>
              Drag files here, paste a screenshot, or click Upload.
            </EmptyRow>
          ) : (
            <ul className="mt-3 flex flex-col gap-1">
              {rows.map((f) => (
                <li key={f.id}>
                  <FileRowCompact file={f} onDelete={() => handleDelete(f.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DragDropZone>
    );
  }

  // ── Full variant ─────────────────────────────────────────────────────────
  return (
    <PanelCard
      icon={<Paperclip size={14} strokeWidth={1.8} />}
      title={defaultVendorId ? "Files for this vendor" : "Files"}
      badge={scoped.length > 0 ? <Tag>{scoped.length}</Tag> : undefined}
      className={className}
    >
      <DragDropZone
        onDropFiles={handleUploadList}
        acceptClipboardPaste
        overlayLabel="Drop to upload · paste also works"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-white px-3 py-2 text-[12px] text-ink-muted">
            <Upload size={12} />
            <span>Drag files anywhere, paste a screenshot, or</span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-medium text-saffron hover:underline"
            >
              browse
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={onPick}
            />
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
              max 5 MB per file
            </span>
          </div>

          {scoped.length === 0 ? (
            <EmptyRow>No files yet. Drop a contract, quote, or portfolio.</EmptyRow>
          ) : (
            <ul className="flex flex-col gap-2">
              {scoped.map((f) => (
                <li key={f.id}>
                  <FileRowFull
                    file={f}
                    onDelete={() => handleDelete(f.id)}
                    onTagsChange={(tags) => setTags(f.id, tags)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DragDropZone>
    </PanelCard>
  );
}

// ── Row: full ──────────────────────────────────────────────────────────────

function FileRowFull({
  file,
  onDelete,
  onTagsChange,
}: {
  file: WorkspaceFile;
  onDelete: () => void;
  onTagsChange: (tags: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const vendors = useVendorsStore((s) => s.vendors);
  const linkedVendors =
    file.linked_entities.vendor_ids
      ?.map((id) => vendors.find((v) => v.id === id)?.name)
      .filter(Boolean) as string[] ?? [];

  const live = isStorageKeyResolvable(file.storage_key);
  const kind = kindFromMime(file.mime);

  return (
    <div className="rounded-md border border-border bg-white">
      <HoverRow className="p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-white">
          <KindIcon kind={kind} />
        </div>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <button
              type="button"
              onClick={() => {
                if (live) window.open(file.storage_key, "_blank", "noopener,noreferrer");
              }}
              className={cn(
                "text-left text-[13px]",
                live ? "text-ink hover:text-saffron" : "text-ink-faint",
              )}
              title={live ? "Open file" : "File body lost on reload — re-upload to view"}
            >
              {file.filename}
              {file.version > 1 && (
                <span
                  className="ml-1 font-mono text-[10px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  v{file.version}
                </span>
              )}
            </button>
            <span
              className="font-mono text-[10px] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {prettySize(file.size_bytes)} ·{" "}
              {new Date(file.uploaded_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            {file.contract && (
              <Tag tone={file.contract.signed ? "sage" : "amber"}>
                {file.contract.signed ? "signed" : "contract"}
              </Tag>
            )}
            {!live && (
              <Tag tone="rose">re-upload to view</Tag>
            )}
          </div>
          {linkedVendors.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
              <Link2 size={10} />
              {linkedVendors.join(" · ")}
            </div>
          )}
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton
            label={expanded ? "Collapse" : "Expand details"}
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronRight
              size={12}
              className={cn("transition-transform", expanded && "rotate-90")}
            />
          </IconButton>
          {live && (
            <IconButton
              label="Open file"
              onClick={() =>
                window.open(file.storage_key, "_blank", "noopener,noreferrer")
              }
            >
              <Eye size={12} />
            </IconButton>
          )}
          <IconButton label="Delete file" tone="rose" onClick={onDelete}>
            <Trash2 size={12} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      {expanded && (
        <div className="border-t border-border/60 px-3 py-2.5">
          <Eyebrow className="mb-1.5">Tags</Eyebrow>
          <ChipInput
            values={file.tags}
            onChange={onTagsChange}
            placeholder="Add tag… (e.g. contract, quote, portfolio)"
          />
          {file.version > 1 && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <History size={10} />
              Version {file.version} — earlier versions retained
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Row: compact (preview variant) ──────────────────────────────────────────

function FileRowCompact({
  file,
  onDelete,
}: {
  file: WorkspaceFile;
  onDelete: () => void;
}) {
  const live = isStorageKeyResolvable(file.storage_key);
  return (
    <HoverRow className="items-center rounded-sm px-1 py-1 hover:bg-ivory-warm/40">
      <KindIcon kind={kindFromMime(file.mime)} />
      <HoverRow.Main>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "truncate text-[12.5px]",
              live ? "text-ink" : "text-ink-faint",
            )}
          >
            {file.filename}
          </span>
          <span
            className="font-mono text-[10px] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {prettySize(file.size_bytes)}
          </span>
        </div>
      </HoverRow.Main>
      <HoverRow.Actions>
        {live && (
          <IconButton
            label="Open file"
            onClick={() =>
              window.open(file.storage_key, "_blank", "noopener,noreferrer")
            }
          >
            <Download size={11} />
          </IconButton>
        )}
        <IconButton label="Delete" tone="rose" onClick={onDelete}>
          <Trash2 size={11} />
        </IconButton>
      </HoverRow.Actions>
    </HoverRow>
  );
}

// ── Kind icon ──────────────────────────────────────────────────────────────

function KindIcon({ kind }: { kind: FileKind }) {
  const props = { size: 14, strokeWidth: 1.5, className: "text-ink-muted" };
  switch (kind) {
    case "image":
      return <ImageIcon {...props} />;
    case "pdf":
      return <FileText {...props} />;
    case "email":
      return <Mail {...props} />;
    case "audio":
      return <Music {...props} />;
    case "video":
      return <VideoIcon {...props} />;
    default:
      return <FileIcon {...props} />;
  }
}
