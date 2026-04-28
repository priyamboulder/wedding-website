"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function MediaUploader({ value, onChange, max = 10 }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ingest = async (files: FileList | File[]) => {
    setError(null);
    const list = Array.from(files);
    const accepted = list.filter((f) => ACCEPTED.includes(f.type));
    if (accepted.length < list.length) {
      setError("Some files were skipped (only JPG, PNG, WEBP allowed).");
    }
    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} images reached.`);
      return;
    }
    const toProcess = accepted.slice(0, remaining);
    if (accepted.length > remaining) {
      setError(`Only added ${remaining} — max ${max} images.`);
    }
    const dataUrls = await Promise.all(toProcess.map(fileToDataUrl));
    onChange([...value, ...dataUrls]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      void ingest(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void ingest(e.target.files);
      e.target.value = "";
    }
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isDragging
            ? "border-neutral-700 bg-neutral-50"
            : "border-neutral-300 hover:border-neutral-500"
        }`}
      >
        <p className="text-sm text-neutral-700">
          Drag &amp; drop images here, or <span className="underline">click to browse</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          JPG, PNG, WEBP · up to {max} images · {value.length}/{max} added
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {value.map((src, idx) => (
            <div
              key={`${idx}-${src.slice(0, 32)}`}
              className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(idx);
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
