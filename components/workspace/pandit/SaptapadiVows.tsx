"use client";

// ── Saptapadi / Mangal Phera personal vows composer ───────────────────────
// Each of the seven rounds has a traditional Sanskrit meaning and an optional
// personal English vow the couple speaks after the pandit completes the
// mantra. The Sanskrit is fixed — the personal text is the couple's own.

import { RotateCcw } from "lucide-react";
import { usePanditStore } from "@/stores/pandit-store";
import { Eyebrow } from "@/components/workspace/blocks/primitives";

export function SaptapadiVows() {
  const vows = usePanditStore((s) => s.saptapadi_vows);
  const updateVow = usePanditStore((s) => s.updateSaptapadiVow);
  const resetVows = usePanditStore((s) => s.resetSaptapadiVows);

  const filledCount = vows.filter((v) => v.personal_text.trim().length > 0)
    .length;

  return (
    <div className="rounded-md border border-saffron/30 bg-saffron-pale/10 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <Eyebrow>Personal vows — Saptapadi</Eyebrow>
          <h5 className="mt-1 font-serif text-[15px] leading-tight text-ink">
            Seven rounds, seven promises — in your own words.
          </h5>
          <p className="mt-1 text-[11.5px] text-ink-muted">
            Each round the officiant recites the Sanskrit mantra. After the
            mantra, you pause and speak your own vow aloud. Leave any round
            blank to keep it traditional only.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {filledCount}/7 written
          </span>
          {filledCount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Reset all seven rounds to defaults? Your personal vows will be cleared.",
                  )
                ) {
                  resetVows();
                }
              }}
              className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-ink-muted hover:text-rose"
            >
              <RotateCcw size={10} strokeWidth={1.8} />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {vows.map((v) => (
          <div
            key={v.round}
            className="rounded-md border border-border bg-white p-3"
          >
            <div className="mb-1.5 flex items-baseline gap-2">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Round {v.round}
              </span>
              <span className="font-serif text-[14px] leading-none text-ink">
                {v.theme}
              </span>
            </div>
            <p className="mb-2 text-[11.5px] italic leading-relaxed text-ink-muted">
              “{v.traditional_meaning}”
            </p>
            <textarea
              value={v.personal_text}
              onChange={(e) => updateVow(v.round, e.target.value)}
              rows={2}
              placeholder="Your words, to speak after the Sanskrit mantra…"
              className="w-full resize-y rounded-md border border-border bg-ivory-warm/30 px-3 py-2 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:bg-white focus:outline-none"
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10.5px] italic text-ink-muted">
        These vows appear in your run-of-show export. Share with your
        officiant at your pre-ceremony meeting so they know when to pause.
      </p>
    </div>
  );
}
