"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCurrentCreator } from "@/lib/creators/current-creator";
import { useDropsStore } from "@/stores/drops-store";
import { ProductPicker, type PickedProduct } from "@/components/creator-portal/ProductPicker";

const MODULE_OPTIONS = [
  { id: "phase-3", label: "Attire & Styling" },
  { id: "phase-0", label: "Foundation & Vision" },
  { id: "phase-1", label: "Branding & Identity" },
  { id: "phase-5", label: "Paper & Stationery" },
  { id: "phase-12", label: "Post-Wedding" },
];

const ACCENT_PRESETS = ["#C97B63", "#D4A843", "#5B8E8A", "#9CAF88", "#8B2E2A", "#3B2A4F"];

export function DropEditor({ dropId }: { dropId?: string }) {
  const router = useRouter();
  const creator = useCurrentCreator();
  const existing = useDropsStore((s) => (dropId ? s.getDrop(dropId) : undefined));
  const existingItems = useDropsStore((s) => (dropId ? s.getItems(dropId) : []));
  const createDrop = useDropsStore((s) => s.createDrop);
  const archiveDrop = useDropsStore((s) => s.archiveDrop);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [themeTag, setThemeTag] = useState("Summer");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_PRESETS[0]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [module, setModule] = useState("phase-3");
  const [items, setItems] = useState<PickedProduct[]>([]);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setThemeTag(existing.themeTag);
    setCoverImageUrl(existing.coverImageUrl);
    setAccentColor(existing.accentColor);
    setStartsAt(existing.startsAt.slice(0, 16));
    setEndsAt(existing.endsAt.slice(0, 16));
    setModule(existing.module);
    setItems(
      existingItems.map((i) => ({ productId: i.productId, creatorNote: i.creatorNote })),
    );
  }, [existing, existingItems]);

  if (!creator) return null;

  const submit = (asDraft: boolean) => {
    if (!title.trim() || !startsAt || !endsAt) return;
    if (dropId) {
      // Simple edit: archive + recreate for this stub (drops-store has no update).
      // Alternatively leave archive off. For this demo we just do nothing
      // destructive and treat edits as read-only after creation.
      router.push("/creator/drops");
      return;
    }
    createDrop({
      creatorId: creator.id,
      title,
      description,
      themeTag,
      coverImageUrl,
      accentColor,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      module,
      items: items.map((i) => ({ productId: i.productId, creatorNote: i.creatorNote })),
    });
    void asDraft;
    router.push("/creator/drops");
  };

  const handleArchive = () => {
    if (!dropId) return;
    if (!confirm("Archive this drop?")) return;
    archiveDrop(dropId);
    router.push("/creator/drops");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/creator/drops"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint hover:text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <ArrowLeft size={11} />
        Back to drops
      </Link>

      <h1 className="font-serif text-[26px] text-ink">
        {dropId ? "Edit drop" : "Create a drop"}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-5">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[14px] focus:border-gold/40 focus:outline-none"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-gold/40 focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Theme tag">
            <input
              type="text"
              value={themeTag}
              onChange={(e) => setThemeTag(e.target.value)}
              placeholder="Summer, Monsoon, Winter…"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
            />
          </Field>
          <Field label="Module">
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
            >
              {MODULE_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Cover image URL">
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
          />
        </Field>

        <Field label="Accent color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-9 w-16 rounded-md border border-border"
            />
            <div className="flex flex-wrap gap-1.5">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    accentColor === c ? "border-ink" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Use ${c}`}
                />
              ))}
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Starts at">
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
            />
          </Field>
          <Field label="Ends at">
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
            />
          </Field>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-white p-4">
          <p
            className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Card preview
          </p>
          <div className="max-w-sm overflow-hidden rounded-lg border border-border">
            <div
              className="relative h-32 bg-cover bg-center"
              style={{
                backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
                backgroundColor: accentColor,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span
                className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {themeTag}
              </span>
            </div>
            <div className="p-3" style={{ borderTop: `3px solid ${accentColor}` }}>
              <p className="font-serif text-[15px] text-ink">{title || "Drop title"}</p>
              <p className="mt-0.5 line-clamp-2 text-[11.5px] text-ink-muted">
                {description || "Your description will appear here."}
              </p>
            </div>
          </div>
        </div>

        <ProductPicker picks={items} onChange={setItems} />
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 flex items-center justify-between border-t border-gold/15 bg-white/95 px-6 py-3 backdrop-blur">
        {dropId && (
          <button
            type="button"
            onClick={handleArchive}
            className="text-[12px] text-rose hover:underline"
          >
            Archive drop
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit(true)}
            className="rounded-md border border-border bg-white px-4 py-1.5 text-[12.5px] text-ink hover:bg-ivory-warm"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={!title.trim() || !startsAt || !endsAt}
            className="rounded-md bg-ink px-4 py-1.5 text-[12.5px] text-ivory hover:bg-gold disabled:opacity-40"
          >
            {dropId ? "Save" : "Schedule drop"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
