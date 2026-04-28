"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadsStore } from "@/stores/uploads-store";
import type { UploadedFile } from "@/types/popout-infrastructure";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "@/types/popout-infrastructure";

interface FileUploaderProps {
  entityId: string;
  onUpload?: (files: UploadedFile[]) => void;
  className?: string;
}

export function FileUploader({
  entityId,
  onUpload,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFiles = useUploadsStore((s) => s.addFiles);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);

      // Validate
      const invalid = files.filter(
        (f) => !ACCEPTED_MIME_TYPES.includes(f.type as never),
      );
      if (invalid.length > 0) {
        setError(
          `Unsupported file type: ${invalid.map((f) => f.name).join(", ")}`,
        );
        return;
      }
      const tooLarge = files.filter((f) => f.size > MAX_FILE_SIZE);
      if (tooLarge.length > 0) {
        setError(
          `File too large (max 10 MB): ${tooLarge.map((f) => f.name).join(", ")}`,
        );
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed");
        }

        const uploaded: UploadedFile[] = await res.json();
        addFiles(entityId, uploaded);
        onUpload?.(uploaded);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [entityId, addFiles, onUpload],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={isUploading}
        className={cn(
          "w-full rounded-lg border-2 border-dashed p-6",
          "flex flex-col items-center gap-2 transition-all duration-200",
          "cursor-pointer",
          isDragging
            ? "border-gold bg-gold-pale/40 scale-[1.01]"
            : "border-gold/30 bg-ivory-warm/50 hover:border-gold/60 hover:bg-ivory-warm",
          isUploading && "opacity-60 pointer-events-none",
        )}
      >
        <Upload
          className={cn(
            "h-6 w-6 transition-colors",
            isDragging ? "text-gold" : "text-ink-muted",
          )}
        />
        <span className="font-serif text-sm text-ink-muted">
          {isUploading
            ? "Uploading\u2026"
            : isDragging
              ? "Drop files here"
              : "Drop files here or click to browse"}
        </span>
        <span className="text-xs text-ink-faint">
          Images, PDFs, and documents up to 10 MB
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
        }}
      />

      {error && (
        <p className="text-xs text-rose font-medium px-1">{error}</p>
      )}
    </div>
  );
}

// ── Thumbnail helper used by FileGallery ─────────────────────────────────────

export function FileThumbnail({ file }: { file: UploadedFile }) {
  const isImage = file.mime_type.startsWith("image/");
  const isPDF = file.mime_type === "application/pdf";

  if (isImage) {
    return (
      <img
        src={file.url}
        alt={file.filename}
        className="h-full w-full object-cover rounded-md"
      />
    );
  }

  return (
    <div className="h-full w-full rounded-md bg-ivory-warm flex items-center justify-center">
      {isPDF ? (
        <FileText className="h-8 w-8 text-rose" />
      ) : (
        <File className="h-8 w-8 text-ink-muted" />
      )}
    </div>
  );
}
