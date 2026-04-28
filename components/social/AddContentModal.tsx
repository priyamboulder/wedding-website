"use client";

import { useEffect, useState } from "react";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type { ContentType, SocialContentItem } from "@/lib/social/types";
import TagInput from "./TagInput";
import MediaUploader from "./MediaUploader";

type Props = {
  open: boolean;
  onClose: () => void;
  editing: SocialContentItem | null;
};

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "engagement", label: "Engagement" },
  { value: "behind_the_scenes", label: "Behind the Scenes" },
  { value: "testimonial", label: "Testimonial" },
  { value: "portfolio_highlight", label: "Portfolio Highlight" },
  { value: "tip_or_advice", label: "Tip or Advice" },
  { value: "promotion", label: "Promotion" },
  { value: "announcement", label: "Announcement" },
  { value: "festival_or_seasonal", label: "Festival / Seasonal" },
];

const WEDDING_EVENTS = ["Mehendi", "Sangeet", "Haldi", "Ceremony", "Reception", "Cocktail", "Other"];

type FormState = {
  title: string;
  description: string;
  content_type: ContentType;
  media_urls: string[];
  tags: string[];
  metadata: Record<string, any>;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  content_type: "wedding",
  media_urls: [],
  tags: [],
  metadata: {},
};

function fromItem(item: SocialContentItem): FormState {
  return {
    title: item.title,
    description: item.description,
    content_type: item.content_type,
    media_urls: [...item.media_urls],
    tags: [...item.tags],
    metadata: { ...item.metadata },
  };
}

export default function AddContentModal({ open, onClose, editing }: Props) {
  const { createContentItem, updateContentItem } = useSocialData();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? fromItem(editing) : EMPTY);
    setError(null);
  }, [open, editing]);

  if (!open) return null;

  const setMeta = (key: string, value: any) => {
    setForm((s) => ({ ...s, metadata: { ...s.metadata, [key]: value } }));
  };

  const toggleEvent = (event: string) => {
    const current: string[] = form.metadata.events ?? [];
    const next = current.includes(event)
      ? current.filter((e) => e !== event)
      : [...current, event];
    setMeta("events", next);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateContentItem(editing.id, {
          title: form.title.trim(),
          description: form.description,
          content_type: form.content_type,
          media_urls: form.media_urls,
          tags: form.tags,
          metadata: form.metadata,
        });
      } else {
        await createContentItem({
          title: form.title.trim(),
          description: form.description,
          content_type: form.content_type,
          media_urls: form.media_urls,
          tags: form.tags,
          metadata: form.metadata,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const isWeddingLike = form.content_type === "wedding" || form.content_type === "engagement";
  const isTestimonial = form.content_type === "testimonial";
  const isPromotion = form.content_type === "promotion";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {editing ? "Edit content" : "Add content"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
                Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="e.g., Ananya & Rohan — Mumbai Wedding"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
                Content type <span className="text-rose-600">*</span>
              </label>
              <select
                value={form.content_type}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    content_type: e.target.value as ContentType,
                    metadata: {},
                  }))
                }
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Describe the event, moment, or content in detail. The more context you give, the better the AI-generated posts will be. Include: what happened, the mood/aesthetic, standout details, what made it special."
                rows={5}
                className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
                Media
              </label>
              <MediaUploader
                value={form.media_urls}
                onChange={(next) => setForm((s) => ({ ...s, media_urls: next }))}
              />
            </div>

            {isWeddingLike && (
              <div className="space-y-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-600">
                  {form.content_type === "wedding" ? "Wedding" : "Engagement"} details
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Couple names</label>
                    <input
                      type="text"
                      value={form.metadata.couple_names ?? ""}
                      onChange={(e) => setMeta("couple_names", e.target.value)}
                      placeholder="Ananya & Rohan"
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Venue</label>
                    <input
                      type="text"
                      value={form.metadata.venue ?? ""}
                      onChange={(e) => setMeta("venue", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">City</label>
                    <input
                      type="text"
                      value={form.metadata.city ?? ""}
                      onChange={(e) => setMeta("city", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Date</label>
                    <input
                      type="date"
                      value={form.metadata.date ?? ""}
                      onChange={(e) => setMeta("date", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Guest count</label>
                    <input
                      type="number"
                      min={0}
                      value={form.metadata.guest_count ?? ""}
                      onChange={(e) =>
                        setMeta(
                          "guest_count",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-neutral-600">Events</label>
                  <div className="flex flex-wrap gap-2">
                    {WEDDING_EVENTS.map((event) => {
                      const selected = (form.metadata.events ?? []).includes(event);
                      return (
                        <button
                          key={event}
                          type="button"
                          onClick={() => toggleEvent(event)}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            selected
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                          }`}
                        >
                          {event}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Style notes</label>
                  <textarea
                    value={form.metadata.style_notes ?? ""}
                    onChange={(e) => setMeta("style_notes", e.target.value)}
                    rows={2}
                    placeholder="Aesthetic, mood, color palette…"
                    className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                  />
                </div>
              </div>
            )}

            {isTestimonial && (
              <div className="space-y-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-600">
                  Testimonial details
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Client name</label>
                    <input
                      type="text"
                      value={form.metadata.client_name ?? ""}
                      onChange={(e) => setMeta("client_name", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Service provided</label>
                    <input
                      type="text"
                      value={form.metadata.service_provided ?? ""}
                      onChange={(e) => setMeta("service_provided", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Client quote</label>
                  <textarea
                    value={form.metadata.client_quote ?? ""}
                    onChange={(e) => setMeta("client_quote", e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-neutral-600">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const active = (form.metadata.rating ?? 0) >= n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMeta("rating", n)}
                          className={`text-2xl leading-none transition-colors ${
                            active ? "text-amber-400" : "text-neutral-300 hover:text-amber-300"
                          }`}
                          aria-label={`${n} star`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {isPromotion && (
              <div className="space-y-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-600">
                  Promotion details
                </p>
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Offer details</label>
                  <textarea
                    value={form.metadata.offer_details ?? ""}
                    onChange={(e) => setMeta("offer_details", e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Valid until</label>
                    <input
                      type="date"
                      value={form.metadata.valid_until ?? ""}
                      onChange={(e) => setMeta("valid_until", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-600">Promo code</label>
                    <input
                      type="text"
                      value={form.metadata.promo_code ?? ""}
                      onChange={(e) => setMeta("promo_code", e.target.value)}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
                Tags
              </label>
              <TagInput
                value={form.tags}
                onChange={(next) => setForm((s) => ({ ...s, tags: next }))}
                placeholder="Add a tag and press Enter"
              />
            </div>

            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add content"}
          </button>
        </div>
      </div>
    </div>
  );
}
