"use client";

import type { Platform } from "@/lib/social/types";

type Props = {
  value: Platform[];
  onChange: (next: Platform[]) => void;
};

export const PLATFORM_OPTIONS: { id: Platform; label: string; icon: string }[] = [
  { id: "instagram_post", label: "Instagram Post", icon: "📸" },
  { id: "instagram_reel", label: "Instagram Reel", icon: "🎬" },
  { id: "instagram_story", label: "Instagram Story", icon: "✨" },
  { id: "facebook", label: "Facebook", icon: "👥" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "pinterest", label: "Pinterest", icon: "📌" },
  { id: "twitter", label: "Twitter / X", icon: "🐦" },
];

export default function PlatformSelector({ value, onChange }: Props) {
  const toggle = (id: Platform) => {
    onChange(value.includes(id) ? value.filter((p) => p !== id) : [...value, id]);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {PLATFORM_OPTIONS.map((opt) => {
        const active = value.includes(opt.id);
        return (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              active
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500"
            }`}
          >
            <input
              type="checkbox"
              checked={active}
              onChange={() => toggle(opt.id)}
              className="sr-only"
            />
            <span aria-hidden>{opt.icon}</span>
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
