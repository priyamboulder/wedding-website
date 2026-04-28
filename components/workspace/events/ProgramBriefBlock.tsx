"use client";

// ── Program Brief Block ──────────────────────────────────────────────────
// The editable "wedding story" one-liner that lives under the page title.
// Lighter than BriefTextareaBlock because this sits in the page hero, not
// in a card — it reads like a display pull-quote the couple writes
// themselves. Auto-expands with content; loses focus shows a subtle hairline.

import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function ProgramBriefBlock({ value, onChange, placeholder }: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea to fit its content.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="relative border-t border-ink/5 pt-5">
      <p
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        In your own words
      </p>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="block w-full resize-none border-0 bg-transparent p-0 font-serif text-[22px] italic leading-[1.4] text-ink outline-none placeholder:text-ink-faint placeholder:not-italic focus:outline-none"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          fontWeight: 400,
        }}
      />
    </div>
  );
}
