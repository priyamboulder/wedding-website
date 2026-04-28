"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadsStore } from "@/stores/uploads-store";
import { FileThumbnail } from "./FileUploader";

interface FileGalleryProps {
  entityId: string;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileGallery({ entityId, className }: FileGalleryProps) {
  const filesByEntity = useUploadsStore((s) => s.filesByEntity);
  const files = useMemo(() => filesByEntity[entityId] ?? [], [filesByEntity, entityId]);
  const removeFile = useUploadsStore((s) => s.removeFile);

  if (files.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 gap-3",
        className,
      )}
    >
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-ivory-warm"
        >
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full w-full"
          >
            <FileThumbnail file={file} />
          </a>

          {/* Hover overlay with delete */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-start justify-end p-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFile(entityId, file.id);
              }}
              className={cn(
                "rounded-full bg-ivory/90 p-1 shadow-sm",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-rose-pale",
              )}
              aria-label={`Remove ${file.filename}`}
            >
              <X className="h-3.5 w-3.5 text-ink-soft" />
            </button>
          </div>

          {/* Filename + size */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/60 to-transparent px-2 pb-1.5 pt-4">
            <p className="text-[11px] text-ivory truncate font-medium">
              {file.filename}
            </p>
            <p className="text-[10px] text-ivory/70">
              {formatSize(file.size)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
