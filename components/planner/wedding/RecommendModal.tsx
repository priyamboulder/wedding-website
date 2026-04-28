"use client";

import { useState } from "react";

export type RecommendTarget = {
  name: string;
  category: string;
  priceRange: string;
  location: string;
  rating?: number;
  workedTogether?: number;
};

export function RecommendModal({
  target,
  onCancel,
  onSend,
}: {
  target: RecommendTarget;
  onCancel: () => void;
  onSend: (note: string) => void;
}) {
  const [note, setNote] = useState(
    "Priya does incredible bridal mehndi. She did Neha & Vikram's wedding last month and everyone loved it. Highly recommend booking her."
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-black/35"
      />
      <div
        className="relative w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: "1px solid rgba(44,44,44,0.08)" }}
      >
        <div
          className="border-b px-6 py-5"
          style={{ borderColor: "rgba(44,44,44,0.08)" }}
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]">
            Recommend vendor to couple
          </p>
          <h2
            className="mt-1 text-[22px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Recommend to Priya & Arjun?
          </h2>
        </div>

        <div className="px-6 py-5">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "#FBF4E6",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
            }}
          >
            <p className="text-[14px] font-medium text-[#2C2C2C]">{target.name}</p>
            <p className="mt-1 text-[12px] text-[#6a6a6a]">
              {target.category}
              <span className="mx-1.5 text-[#b5a68e]">·</span>
              {target.location}
            </p>
            <p className="mt-2 text-[12px] text-[#6a6a6a]">
              {target.rating != null && (
                <>
                  <span style={{ color: "#8a5a20" }}>
                    ★ {target.rating.toFixed(1)}
                  </span>
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                </>
              )}
              <span className="font-mono text-[11.5px]">{target.priceRange}</span>
              {target.workedTogether != null && target.workedTogether > 0 && (
                <>
                  <span className="mx-1.5 text-[#b5a68e]">·</span>
                  <span className="text-[#2C2C2C]">
                    You've worked together {target.workedTogether} times
                  </span>
                </>
              )}
            </p>
          </div>

          <label className="mt-5 block">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
              Add a note for the couple (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-lg border px-3.5 py-2.5 text-[13px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265]"
              style={{
                borderColor: "rgba(44,44,44,0.12)",
                backgroundColor: "#FDFCF9",
                fontFamily: "'EB Garamond', serif",
                fontStyle: "italic",
              }}
            />
          </label>

          <p
            className="mt-3 text-[11.5px] italic text-[#8a8a8a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Your note is visible to the couple but not shared with the vendor.
          </p>
        </div>

        <div
          className="flex items-center justify-end gap-2 border-t bg-[#FAF8F5] px-6 py-4"
          style={{ borderColor: "rgba(44,44,44,0.08)" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-[12.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSend(note)}
            className="rounded-full px-4 py-2 text-[12.5px] font-medium"
            style={{ backgroundColor: "#2C2C2C", color: "#FAF8F5" }}
          >
            Send Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}
