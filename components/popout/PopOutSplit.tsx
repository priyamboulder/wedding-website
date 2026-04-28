"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PopOutSplitProps {
  left: ReactNode;
  right: ReactNode;
  /** Column ratio — "1:1" | "2:1" | "1:2" | "3:2" | "2:3" */
  ratio?: "1:1" | "2:1" | "1:2" | "3:2" | "2:3";
  /** Gap between panels */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const ratioClasses: Record<string, string> = {
  "1:1": "grid-cols-1 md:grid-cols-2",
  "2:1": "grid-cols-1 md:grid-cols-[2fr_1fr]",
  "1:2": "grid-cols-1 md:grid-cols-[1fr_2fr]",
  "3:2": "grid-cols-1 md:grid-cols-[3fr_2fr]",
  "2:3": "grid-cols-1 md:grid-cols-[2fr_3fr]",
};

const gapClasses = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function PopOutSplit({
  left,
  right,
  ratio = "1:1",
  gap = "md",
  className,
}: PopOutSplitProps) {
  return (
    <div
      className={cn(
        "grid",
        ratioClasses[ratio],
        gapClasses[gap],
        className,
      )}
    >
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}
