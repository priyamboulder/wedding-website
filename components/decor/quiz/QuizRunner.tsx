"use client";

// ── Décor quiz runner (5 steps) ─────────────────────────────────────────────
// Renders one step at a time with a clickable list of options. On completion
// seeds style keywords and marks the quiz as done on the store.

import { useState } from "react";
import { useDecorStore } from "@/stores/decor-store";
import { DECOR_COLORS, FONT_DISPLAY, FONT_UI, PrimaryButton, GhostButton } from "../primitives";
import { QUIZ_STEPS, KEYWORDS_BY_FEELING } from "./questions";
import type {
  DecorFeeling,
  FloralRelationship,
  ColorLean,
  Traditionality,
  FocalPriority,
} from "@/types/decor";

export function QuizRunner({ onClose }: { onClose: () => void }) {
  const quiz = useDecorStore((s) => s.quiz);
  const setAnswer = useDecorStore((s) => s.setQuizAnswer);
  const completeQuiz = useDecorStore((s) => s.completeQuiz);
  const addKeyword = useDecorStore((s) => s.addKeyword);

  const [stepIdx, setStepIdx] = useState(0);
  const step = QUIZ_STEPS[stepIdx]!;
  const total = QUIZ_STEPS.length;

  const currentValue = (() => {
    switch (step.kind) {
      case "feeling":
        return quiz.feeling;
      case "florals":
        return quiz.florals;
      case "colors":
        return quiz.colors;
      case "traditionality":
        return quiz.traditionality;
      case "focal":
        return quiz.focal;
    }
  })();

  function handleSelect(value: string) {
    switch (step.kind) {
      case "feeling":
        setAnswer("feeling", value as DecorFeeling);
        break;
      case "florals":
        setAnswer("florals", value as FloralRelationship);
        break;
      case "colors":
        setAnswer("colors", value as ColorLean);
        break;
      case "traditionality":
        setAnswer("traditionality", value as Traditionality);
        break;
      case "focal":
        setAnswer("focal", value as FocalPriority);
        break;
    }
  }

  function handleNext() {
    if (stepIdx < total - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      if (quiz.feeling) {
        KEYWORDS_BY_FEELING[quiz.feeling].forEach((k) => addKeyword(k));
      }
      completeQuiz();
      onClose();
    }
  }

  return (
    <div
      className="rounded-[14px] border p-6 md:p-8"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: DECOR_COLORS.line,
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className="text-[11px] uppercase"
          style={{
            fontFamily: FONT_UI,
            letterSpacing: "0.2em",
            color: DECOR_COLORS.cocoaMuted,
          }}
        >
          Step {stepIdx + 1} of {total}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px]"
          style={{ fontFamily: FONT_UI, color: DECOR_COLORS.cocoaMuted }}
        >
          Close
        </button>
      </div>

      <h3
        className="leading-snug mb-5"
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
          color: DECOR_COLORS.cocoa,
          fontWeight: 700,
        }}
      >
        {step.prompt}
      </h3>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {step.options.map((opt) => {
          const active = currentValue === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className="w-full text-left rounded-lg border px-3.5 py-3 text-[13px] transition-colors"
                style={{
                  fontFamily: FONT_UI,
                  borderColor: active ? DECOR_COLORS.cocoa : DECOR_COLORS.line,
                  backgroundColor: active
                    ? DECOR_COLORS.champagne
                    : "#FFFFFF",
                  color: DECOR_COLORS.cocoa,
                }}
              >
                {opt.title}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between mt-6">
        <GhostButton onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}>
          ← Back
        </GhostButton>
        <PrimaryButton onClick={handleNext} disabled={!currentValue}>
          {stepIdx === total - 1 ? "Save & finish" : "Next →"}
        </PrimaryButton>
      </div>
    </div>
  );
}
