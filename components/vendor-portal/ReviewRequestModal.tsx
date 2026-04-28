"use client";

import { useState, type FormEvent } from "react";
import { GhostButton, PrimaryButton } from "./ui";

export type ReviewRequestDraft = {
  coupleName: string;
  email: string;
  eventType: string;
  weddingDate: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (draft: ReviewRequestDraft) => void;
};

const inputClass =
  "block w-full rounded-md border bg-white px-3 py-2 text-[13px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40";
const inputStyle = { borderColor: "rgba(26,26,26,0.14)" };

export default function ReviewRequestModal({ onClose, onSubmit }: Props) {
  const [draft, setDraft] = useState<ReviewRequestDraft>({
    coupleName: "",
    email: "",
    eventType: "",
    weddingDate: "",
  });

  const canSubmit =
    draft.coupleName.trim().length > 0 && /.+@.+\..+/.test(draft.email);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10"
      style={{ backgroundColor: "rgba(26,26,26,0.48)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-xl border bg-[#FBF9F4]"
        style={{ borderColor: "rgba(26,26,26,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] px-6 py-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
              Request a review
            </p>
            <h2
              className="mt-0.5 text-[22px] text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              Invite a past couple
            </h2>
            <p
              className="mt-1 text-[13px] italic text-stone-600"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              We'll send a branded email on your behalf — warm, short, and easy
              to reply to.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-stone-500 hover:bg-white hover:text-[#1a1a1a]"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
              Couple's name
            </label>
            <input
              type="text"
              value={draft.coupleName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, coupleName: e.target.value }))
              }
              placeholder="e.g. Rhea & Jai"
              className={`mt-1.5 ${inputClass}`}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
              Email
            </label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
              placeholder="rhea@example.com"
              className={`mt-1.5 ${inputClass}`}
              style={inputStyle}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                Event type
              </label>
              <input
                type="text"
                value={draft.eventType}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, eventType: e.target.value }))
                }
                placeholder="Wedding + Reception"
                className={`mt-1.5 ${inputClass}`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                Wedding date
              </label>
              <input
                type="text"
                value={draft.weddingDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, weddingDate: e.target.value }))
                }
                placeholder="Jun 2025"
                className={`mt-1.5 ${inputClass}`}
                style={inputStyle}
              />
            </div>
          </div>

          <div
            className="rounded-lg border-l-2 border-[#B8860B] bg-[#FBF7EC] px-4 py-3 text-[13px] leading-relaxed text-stone-700"
            style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
          >
            "Hi {draft.coupleName || "Rhea & Jai"} — it was a joy working with
            you. If you have a few minutes, we'd love your honest words for
            future couples considering us. It would mean the world."
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton type="submit">Send invitation</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
