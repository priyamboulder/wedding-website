"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCurrentCreator } from "@/lib/creators/current-creator";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import { useCreatorsStore } from "@/stores/creators-store";
import { ProductPicker, type PickedProduct } from "@/components/creator-portal/ProductPicker";
import type { CollectionStatus } from "@/types/creator";

const GRADIENTS = [
  "linear-gradient(135deg, #8B2E2A 0%, #C97B63 40%, #F0E4C8 80%, #D4A843 100%)",
  "linear-gradient(135deg, #2A4F4D 0%, #5B8E8A 45%, #B8C9A8 85%, #E8F0E0 100%)",
  "linear-gradient(135deg, #6B8E4E 0%, #9CAF88 45%, #E8F0E0 100%)",
  "linear-gradient(135deg, #C97B63 0%, #D4A843 60%, #F0E4C8 100%)",
  "linear-gradient(135deg, #3B2A4F 0%, #8B6AAD 50%, #E6DCEF 100%)",
];

const MODULE_OPTIONS = [
  { id: "phase-0", label: "Foundation & Vision" },
  { id: "phase-1", label: "Branding & Identity" },
  { id: "phase-2", label: "Core Bookings" },
  { id: "phase-3", label: "Attire & Styling" },
  { id: "phase-5", label: "Paper & Stationery" },
  { id: "phase-10", label: "Final Month" },
  { id: "phase-12", label: "Post-Wedding" },
];

export function CollectionEditor({ collectionId }: { collectionId?: string }) {
  const router = useRouter();
  const creator = useCurrentCreator();
  const getUserCollection = useCreatorPortalStore((s) => s.getUserCollection);
  const createCollection = useCreatorPortalStore((s) => s.createCollection);
  const updateCollection = useCreatorPortalStore((s) => s.updateCollection);
  const deleteCollection = useCreatorPortalStore((s) => s.deleteCollection);
  const setPicks = useCreatorPortalStore((s) => s.setPicksForCollection);
  const listPicks = useCreatorPortalStore((s) => s.listUserPicksByCollection);
  const seedCollection = useCreatorsStore((s) =>
    collectionId ? s.getCollection(collectionId) : undefined,
  );
  const seedPicks = useCreatorsStore((s) =>
    collectionId ? s.getPicksByCollection(collectionId) : [],
  );

  const existing = collectionId ? getUserCollection(collectionId) ?? seedCollection : undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("phase-3");
  const [isExhibition, setIsExhibition] = useState(false);
  const [exhibitionStart, setExhibitionStart] = useState("");
  const [exhibitionEnd, setExhibitionEnd] = useState("");
  const [coverGradient, setCoverGradient] = useState(GRADIENTS[0]);
  const [status, setStatus] = useState<CollectionStatus>("draft");
  const [picks, setPicksState] = useState<PickedProduct[]>([]);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setModule(existing.module);
    setIsExhibition(existing.isExhibition);
    setExhibitionStart(existing.exhibitionStart?.slice(0, 10) ?? "");
    setExhibitionEnd(existing.exhibitionEnd?.slice(0, 10) ?? "");
    setCoverGradient(existing.coverGradient);
    setStatus(existing.status);
    const relevantPicks = collectionId
      ? [...seedPicks, ...listPicks(collectionId)]
      : [];
    setPicksState(
      relevantPicks.map((p) => ({ productId: p.productId, creatorNote: p.creatorNote })),
    );
  }, [existing, collectionId, listPicks, seedPicks]);

  if (!creator) return null;

  const submit = (overrideStatus?: CollectionStatus) => {
    const nextStatus = overrideStatus ?? status;
    if (!title.trim()) return;

    if (collectionId && existing) {
      updateCollection(collectionId, {
        title,
        description,
        module,
        isExhibition,
        exhibitionStart: isExhibition && exhibitionStart ? new Date(exhibitionStart).toISOString() : null,
        exhibitionEnd: isExhibition && exhibitionEnd ? new Date(exhibitionEnd).toISOString() : null,
        coverGradient,
        status: nextStatus,
      });
      setPicks(collectionId, picks);
    } else {
      const col = createCollection({
        creatorId: creator.id,
        title,
        description,
        module,
        isExhibition,
        exhibitionStart: isExhibition && exhibitionStart ? new Date(exhibitionStart).toISOString() : null,
        exhibitionEnd: isExhibition && exhibitionEnd ? new Date(exhibitionEnd).toISOString() : null,
        coverGradient,
        status: nextStatus,
        sortOrder: 0,
      });
      setPicks(col.id, picks);
    }
    router.push("/creator/collections");
  };

  const handleDelete = () => {
    if (!collectionId) return;
    if (!confirm("Archive this collection?")) return;
    deleteCollection(collectionId);
    router.push("/creator/collections");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/creator/collections"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint hover:text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <ArrowLeft size={11} />
        Back to collections
      </Link>

      <h1 className="font-serif text-[26px] text-ink">
        {collectionId ? "Edit collection" : "New collection"}
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
          <Field label="Wedding module">
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

          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CollectionStatus)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>

        <Field label="Cover">
          <div className="flex flex-wrap gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setCoverGradient(g)}
                className={`h-12 w-20 rounded-md border-2 ${
                  coverGradient === g ? "border-ink" : "border-transparent"
                }`}
                style={{ background: g }}
                aria-label="Select cover"
              />
            ))}
          </div>
        </Field>

        <Field label="Exhibition">
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={isExhibition}
              onChange={(e) => setIsExhibition(e.target.checked)}
              className="rounded border-border"
            />
            Make this a time-bound exhibition
          </label>
          {isExhibition && (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-[11.5px] text-ink-muted">Start date</p>
                <input
                  type="date"
                  value={exhibitionStart}
                  onChange={(e) => setExhibitionStart(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
                />
              </div>
              <div>
                <p className="mb-1 text-[11.5px] text-ink-muted">End date</p>
                <input
                  type="date"
                  value={exhibitionEnd}
                  onChange={(e) => setExhibitionEnd(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
                />
              </div>
            </div>
          )}
        </Field>

        <ProductPicker picks={picks} onChange={setPicksState} />
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 flex items-center justify-between border-t border-gold/15 bg-white/95 px-6 py-3 backdrop-blur">
        {collectionId && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-[12px] text-rose hover:underline"
          >
            Archive collection
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit("draft")}
            className="rounded-md border border-border bg-white px-4 py-1.5 text-[12.5px] text-ink hover:bg-ivory-warm"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => submit("active")}
            disabled={!title.trim()}
            className="rounded-md bg-ink px-4 py-1.5 text-[12.5px] text-ivory hover:bg-gold disabled:opacity-40"
          >
            Publish
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
