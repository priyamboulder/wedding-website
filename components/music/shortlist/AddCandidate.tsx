"use client";

// ── AddCandidate ──────────────────────────────────────────────────────────
// Quick-add composer for a new music candidate. Inline on the board so
// adding a new name doesn't punt the user into a modal. Deliberately
// low-ceremony — name + type + descriptor + a single sample URL gets a
// candidate into the board; everything else is editable later.

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/music-store";
import { MUSIC_VENDOR_TYPES, MUSIC_EVENTS, type MusicEventId, type MusicVendorType } from "@/types/music";

export function AddCandidate({ weddingId }: { weddingId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [vendorType, setVendorType] = useState<MusicVendorType>("dj");
  const [sampleUrl, setSampleUrl] = useState("");
  const [events, setEvents] = useState<MusicEventId[]>([]);

  const addCandidate = useMusicStore((s) => s.addCandidate);
  const currentPartyId = useMusicStore((s) => s.current_party_id);

  function reset() {
    setName("");
    setDescriptor("");
    setVendorType("dj");
    setSampleUrl("");
    setEvents([]);
  }

  function submit() {
    if (!name.trim()) return;
    addCandidate({
      wedding_id: weddingId,
      vendor_type: vendorType,
      name: name.trim(),
      descriptor: descriptor.trim(),
      currency: "INR",
      sample_urls: sampleUrl.trim() ? [sampleUrl.trim()] : [],
      events,
      status: "draft",
      suggested_by: currentPartyId,
    });
    reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-white px-3 py-2 text-[11.5px] text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
      >
        <Plus size={12} strokeWidth={1.8} />
        Add candidate
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-white p-3">
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          New candidate
        </span>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-ink-muted hover:text-ink"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1.5fr]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. DJ Pranav)"
          className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-gold/40"
        />
        <select
          value={vendorType}
          onChange={(e) => setVendorType(e.target.value as MusicVendorType)}
          className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink outline-none focus:border-gold/40"
        >
          {MUSIC_VENDOR_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={descriptor}
          onChange={(e) => setDescriptor(e.target.value)}
          placeholder="One-line descriptor"
          className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-gold/40"
        />
      </div>

      <input
        type="url"
        value={sampleUrl}
        onChange={(e) => setSampleUrl(e.target.value)}
        placeholder="Sample link (Spotify / YouTube / Instagram) — optional"
        className="w-full rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-gold/40"
      />

      <div className="flex flex-wrap gap-1">
        {MUSIC_EVENTS.filter((e) => e.id !== "all").map((ev) => {
          const active = events.includes(ev.id);
          return (
            <button
              key={ev.id}
              type="button"
              onClick={() =>
                setEvents((prev) =>
                  prev.includes(ev.id)
                    ? prev.filter((e) => e !== ev.id)
                    : [...prev, ev.id],
                )
              }
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10.5px] transition-colors",
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-gold/40",
              )}
            >
              {ev.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className={cn(
            "rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
            name.trim()
              ? "border-gold/50 bg-gold-pale/50 text-ink hover:bg-gold-pale/80"
              : "cursor-not-allowed border-border bg-ivory-warm text-ink-faint",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          save candidate
        </button>
      </div>
    </div>
  );
}
