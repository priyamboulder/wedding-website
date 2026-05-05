// Runtime: turns a CategorySchema + persisted state into a list of
// RuntimeSession objects with derived status, hasData, and a one-line
// completion summary. Pure — no React, no localStorage.

import { SESSION_CONFIG } from "./session-config";
import { readPath } from "./storage";
import type {
  CategoryJourneyState,
  CategorySchema,
  Field,
  GuidedSessionStatus,
  RuntimeSession,
  SessionSchema,
} from "./types";

export function buildRuntimeSessions(
  schema: CategorySchema,
  state: CategoryJourneyState,
): RuntimeSession[] {
  return schema.sessions.map((sessionSchema) => {
    const config = SESSION_CONFIG[sessionSchema.key];
    const formData = state.formData[sessionSchema.key] ?? {};
    const hasData = sessionHasData(sessionSchema, formData);
    const isBrief = sessionSchema.fields.some((f) => f.kind === "brief");
    return {
      key: sessionSchema.key,
      index: sessionSchema.index,
      title: config?.title ?? sessionSchema.key,
      subtitle: config?.subtitle ?? "",
      estimatedMinutes: config?.estimated_minutes ?? 2,
      status: deriveStatus(state, sessionSchema.key, hasData),
      hasData,
      summary: hasData ? summarizeSession(sessionSchema, formData) : null,
      fields: sessionSchema.fields,
      isBrief,
    };
  });
}

function deriveStatus(
  state: CategoryJourneyState,
  key: string,
  hasData: boolean,
): GuidedSessionStatus {
  const explicit = state.sessionStatus[key];
  if (explicit) return explicit;
  return hasData ? "in_progress" : "not_started";
}

function sessionHasData(
  session: SessionSchema,
  bag: Record<string, unknown>,
): boolean {
  return session.fields.some((field) => fieldHasValue(field, bag));
}

function fieldHasValue(
  field: Field,
  bag: Record<string, unknown>,
): boolean {
  const v = readPath(bag, field.path);
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number")
    return field.kind === "intensity_slider"
      ? v !== (field.default ?? 50)
      : true;
  if (typeof v === "boolean") return v === true;
  if (Array.isArray(v))
    return v.some((item) => {
      if (item == null) return false;
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item === "object") {
        return Object.values(item).some((val) => {
          if (val == null) return false;
          if (typeof val === "string") return val.trim().length > 0;
          if (typeof val === "number") return true;
          if (typeof val === "boolean") return val;
          if (Array.isArray(val)) return val.length > 0;
          return true;
        });
      }
      return true;
    });
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return false;
}

// One-line recap surfaced on a completed session card.
// Strategy: read the first 1-2 fields with content and stitch a summary.
function summarizeSession(
  session: SessionSchema,
  bag: Record<string, unknown>,
): string | null {
  const fragments: string[] = [];
  for (const field of session.fields) {
    if (fragments.length >= 2) break;
    const fragment = summarizeField(field, bag);
    if (fragment) fragments.push(fragment);
  }
  return fragments.join(" · ") || null;
}

function summarizeField(
  field: Field,
  bag: Record<string, unknown>,
): string | null {
  const v = readPath(bag, field.path);
  switch (field.kind) {
    case "keyword_chips": {
      const list = Array.isArray(v) ? (v as string[]) : [];
      if (list.length === 0) return null;
      return list.slice(0, 3).join(", ");
    }
    case "intensity_slider": {
      if (typeof v !== "number") return null;
      const words = field.toneWords;
      if (words && words.length === 3) {
        if (v < 33) return words[0];
        if (v < 66) return words[1];
        return words[2];
      }
      return `${v}/100`;
    }
    case "single_select": {
      if (typeof v !== "string") return null;
      const opt = field.options.find((o) => o.value === v);
      return opt?.label ?? v;
    }
    case "multi_select": {
      const list = Array.isArray(v) ? (v as string[]) : [];
      if (list.length === 0) return null;
      const labels = list
        .map((val) => field.options.find((o) => o.value === val)?.label ?? val)
        .slice(0, 2);
      return labels.join(", ") + (list.length > 2 ? ` +${list.length - 2}` : "");
    }
    case "color_palette": {
      if (!v || typeof v !== "object") return null;
      const buckets = field.buckets
        .map((b) => {
          const arr = (v as Record<string, unknown>)[b.key];
          return Array.isArray(arr) && arr.length > 0
            ? `${arr.length} ${b.label.toLowerCase()}`
            : null;
        })
        .filter(Boolean);
      return buckets.length > 0 ? (buckets.join(", ") as string) : null;
    }
    case "text":
      return typeof v === "string" && v.trim().length > 0
        ? truncate(v, 50)
        : null;
    case "textarea":
      return typeof v === "string" && v.trim().length > 0
        ? truncate(v, 80)
        : null;
    case "number":
      return typeof v === "number" ? `${v}` : null;
    case "boolean":
      return v === true ? field.label : null;
    case "image_list": {
      const list = Array.isArray(v) ? v : [];
      return list.length > 0
        ? `${list.length} image${list.length === 1 ? "" : "s"}`
        : null;
    }
    case "list_text": {
      const list = Array.isArray(v) ? v : [];
      return list.length > 0
        ? `${list.length} item${list.length === 1 ? "" : "s"}`
        : null;
    }
    case "list_object": {
      const list = Array.isArray(v) ? v : [];
      const filled = list.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          Object.values(item).some(
            (val) =>
              (typeof val === "string" && val.trim().length > 0) ||
              (Array.isArray(val) && val.length > 0) ||
              typeof val === "number" ||
              val === true,
          ),
      );
      return filled.length > 0
        ? `${filled.length} entr${filled.length === 1 ? "y" : "ies"}`
        : null;
    }
    case "brief":
      if (typeof v !== "string") return null;
      return v.trim().length >= 80
        ? `${v.trim().length} characters drafted`
        : v.trim().length > 0
          ? "Draft started"
          : null;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export function nextIncompleteSession(
  sessions: RuntimeSession[],
): RuntimeSession | null {
  return sessions.find((s) => s.status !== "completed") ?? null;
}

export function completionPercentage(sessions: RuntimeSession[]): number {
  if (sessions.length === 0) return 0;
  const done = sessions.filter((s) => s.status === "completed").length;
  return Math.round((done / sessions.length) * 100);
}

// Used by the brief field's "Draft my brief" affordance. Reads cues from
// across earlier sessions and stitches a starter paragraph.
export function draftBriefFromCues(
  state: CategoryJourneyState,
  cuePaths: string[] | undefined,
  fallbackHeading: string,
): string {
  if (!cuePaths || cuePaths.length === 0) return "";
  const phrases: string[] = [];
  for (const fullPath of cuePaths) {
    const [sessionKey, ...rest] = fullPath.split(".");
    const path = rest.join(".");
    const bag = state.formData[sessionKey];
    const v = readPath(bag, path);
    if (v == null) continue;
    if (Array.isArray(v) && v.length > 0) {
      if (typeof v[0] === "string") {
        phrases.push((v as string[]).slice(0, 5).join(", "));
      } else if (typeof v[0] === "object") {
        const labels = (v as Record<string, unknown>[])
          .map((item) => {
            const titleVal = Object.values(item).find(
              (val) => typeof val === "string" && (val as string).trim().length > 0,
            );
            return typeof titleVal === "string" ? titleVal : null;
          })
          .filter(Boolean) as string[];
        if (labels.length > 0) phrases.push(labels.slice(0, 5).join(", "));
      }
    } else if (typeof v === "string" && v.trim().length > 0) {
      phrases.push(v);
    } else if (typeof v === "number") {
      phrases.push(`${v}`);
    } else if (typeof v === "boolean" && v) {
      phrases.push(path.split(".").pop() ?? "");
    }
  }
  if (phrases.length === 0) return "";
  return [
    fallbackHeading,
    "",
    "Highlights from your earlier answers:",
    ...phrases.map((p) => `• ${p}`),
    "",
    "Edit this draft until it sounds like you.",
  ].join("\n");
}
