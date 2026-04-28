"use client";

import { useState, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";

function splitUrls(raw: string): string[] {
  return raw
    .split(/\s+|[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s) || /^[\w-]+\.[\w.-]+/.test(s));
}

export function AddLinkInput({
  taskId,
  module,
}: {
  taskId: string;
  module: string;
}) {
  const { addLink } = useShoppingLinks();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(urls: string[]) {
    if (!urls.length) return;
    setBusy(true);
    setError(null);
    try {
      await Promise.all(
        urls.map((u) =>
          addLink({ taskId, module, url: u }).catch((err) => {
            console.error("[shopping-links] addLink failed:", err);
          }),
        ),
      );
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const urls = splitUrls(value);
      if (urls.length) submit(urls);
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    const urls = splitUrls(pasted);
    if (urls.length > 1) {
      e.preventDefault();
      submit(urls);
    }
    // Single paste: let default happen, then auto-submit on next tick if it looks like a URL
    if (urls.length === 1 && !value.trim()) {
      e.preventDefault();
      setValue(urls[0]);
      submit(urls);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="group flex items-center gap-2 rounded-lg border border-border bg-white/60 px-3 py-2 transition-colors focus-within:border-gold/40 focus-within:bg-white">
        {busy ? (
          <Loader2
            size={14}
            strokeWidth={1.6}
            className="shrink-0 animate-spin text-ink-faint"
          />
        ) : (
          <LinkIcon
            size={14}
            strokeWidth={1.6}
            className="shrink-0 text-ink-faint"
          />
        )}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder="Paste product link…"
          disabled={busy}
          className="flex-1 bg-transparent text-[13px] text-ink-soft outline-none placeholder:text-ink-faint/60 disabled:opacity-60"
        />
        {value.trim() && !busy && (
          <button
            onClick={() => submit(splitUrls(value))}
            className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-ivory transition-opacity hover:opacity-90"
          >
            Add
          </button>
        )}
      </div>
      {error && (
        <p className="px-1 text-[11px] text-rose">{error}</p>
      )}
    </div>
  );
}
