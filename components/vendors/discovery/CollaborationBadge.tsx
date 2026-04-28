"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollaborationBadge({
  overlapCount,
  shortlistedNames,
  size = "sm",
}: {
  overlapCount: number;
  shortlistedNames?: string[];
  size?: "sm" | "md";
}) {
  if (overlapCount === 0) return null;

  const title =
    shortlistedNames && shortlistedNames.length > 0
      ? `Worked with ${shortlistedNames.slice(0, 3).join(", ")}${
          shortlistedNames.length > 3 ? `, +${shortlistedNames.length - 3} more` : ""
        } from your shortlist`
      : `Worked with ${overlapCount} ${overlapCount === 1 ? "vendor" : "vendors"} in your shortlist`;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-teal-pale/80 font-mono uppercase tracking-[0.12em] text-teal",
        size === "sm" && "px-2 py-0.5 text-[9.5px]",
        size === "md" && "px-2.5 py-1 text-[10.5px]",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Users size={size === "sm" ? 9 : 10} strokeWidth={1.9} />
      Proven team · {overlapCount}
    </span>
  );
}
