"use client";

import type { Tone } from "@/lib/social/types";

type Props = {
  value: Tone;
  onChange: (next: Tone) => void;
};

const TONE_OPTIONS: { id: Tone; label: string }[] = [
  { id: "romantic", label: "Romantic" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
  { id: "cinematic", label: "Cinematic" },
  { id: "minimal", label: "Minimal" },
  { id: "storytelling", label: "Storytelling" },
  { id: "bold", label: "Bold" },
];

export default function ToneSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tone">
      {TONE_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
