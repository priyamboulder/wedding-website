"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  prefix?: string;
  className?: string;
};

export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  prefix,
  className = "",
}: Props) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div
      className={`flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-neutral-500 ${className}`}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-800"
        >
          {prefix}
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="text-neutral-500 hover:text-neutral-900"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-none bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}
