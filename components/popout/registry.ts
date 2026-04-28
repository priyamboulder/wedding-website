import { type ComponentType } from "react";
import type { ChecklistItem, DecisionTemplateName } from "@/types/checklist";

// ── Bespoke pop-out props ──────────────────────────────────────────────────

export interface BespokePopOutProps {
  item: ChecklistItem;
  onUpdate: (updates: Partial<ChecklistItem>) => void;
  onClose: () => void;
}

/**
 * Look up a bespoke pop-out component by decision_template name.
 * All bespoke templates have been removed — every task now falls back to
 * the generic pop-out. Kept as a function so PopOutRouter keeps compiling.
 */
export function getTemplateComponent(
  _template: DecisionTemplateName,
): ComponentType<BespokePopOutProps> | null {
  return null;
}

/** All registered template names (for the dev-mode switcher). */
export const TEMPLATE_NAMES: Exclude<DecisionTemplateName, "generic">[] = [];
