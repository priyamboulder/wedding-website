"use client";

// Field renderers for the guided journey schema. One discriminator
// (`field.kind`) drives which renderer is used. Each renderer reads/writes
// its slice of `formData[sessionKey]` via the path it was given.

import { useState, type ChangeEvent } from "react";
import { C, FONT_MONO, FONT_SANS, FONT_SERIF } from "./styles";
import { readPath, writePath } from "@/lib/guided-journey/storage";
import type {
  Field,
  ImageListField,
  KeywordChipsField,
  ListObjectField,
  ListTextField,
  SelectOption,
} from "@/lib/guided-journey/types";

interface FieldProps {
  field: Field;
  formData: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  onDraftBrief?: () => void;
}

export function FieldRenderer(props: FieldProps) {
  const { field } = props;
  switch (field.kind) {
    case "keyword_chips":
      return <KeywordChips {...props} field={field} />;
    case "intensity_slider":
      return <IntensitySlider {...props} field={field} />;
    case "single_select":
      return <SingleSelect {...props} field={field} />;
    case "multi_select":
      return <MultiSelect {...props} field={field} />;
    case "color_palette":
      return <ColorPalette {...props} field={field} />;
    case "text":
      return <TextInput {...props} field={field} />;
    case "textarea":
      return <TextareaInput {...props} field={field} />;
    case "number":
      return <NumberInput {...props} field={field} />;
    case "boolean":
      return <BooleanInput {...props} field={field} />;
    case "image_list":
      return <ImageList {...props} field={field} />;
    case "list_text":
      return <ListText {...props} field={field} />;
    case "list_object":
      return <ListObject {...props} field={field} />;
    case "brief":
      return <BriefInput {...props} field={field} />;
  }
}

// ─── Common label/helper ─────────────────────────────────────────────────
function FieldFrame({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {label}
        </div>
        {helper && (
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: C.muted,
              marginTop: 4,
              lineHeight: 1.5,
              maxWidth: 620,
            }}
          >
            {helper}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Keyword chips ───────────────────────────────────────────────────────
function KeywordChips({
  field,
  formData,
  onChange,
}: FieldProps & { field: KeywordChipsField }) {
  const selected = (readPath(formData, field.path) as string[]) ?? [];
  const customSelected = selected.filter(
    (s) => !field.suggestions.includes(s),
  );
  const [draft, setDraft] = useState("");

  const toggle = (k: string) => {
    const next = selected.includes(k)
      ? selected.filter((x) => x !== k)
      : [...selected, k];
    onChange(field.path, next);
  };

  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (selected.includes(v)) {
      setDraft("");
      return;
    }
    onChange(field.path, [...selected, v]);
    setDraft("");
  };

  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {field.suggestions.map((k) => {
          const active = selected.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? C.rose : C.line}`,
                backgroundColor: active ? C.rosePale : C.paper,
                color: active ? C.rose : C.inkSoft,
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                cursor: "pointer",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              {prettify(k)}
            </button>
          );
        })}
        {customSelected.map((k) => (
          <button
            key={`custom-${k}`}
            type="button"
            onClick={() => toggle(k)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${C.rose}`,
              backgroundColor: C.rosePale,
              color: C.rose,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {prettify(k)} ×
          </button>
        ))}
      </div>
      {field.allowCustom && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add your own…"
            style={inputStyle()}
          />
          <button
            type="button"
            onClick={addCustom}
            style={ghostButtonStyle()}
          >
            Add
          </button>
        </div>
      )}
    </FieldFrame>
  );
}

// ─── Intensity slider ────────────────────────────────────────────────────
function IntensitySlider({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "intensity_slider" }>;
}) {
  const value =
    (readPath(formData, field.path) as number | undefined) ??
    field.default ??
    50;
  const word = field.toneWords
    ? value < 33
      ? field.toneWords[0]
      : value < 66
        ? field.toneWords[1]
        : field.toneWords[2]
    : null;
  return (
    <FieldFrame label={field.label} helper={field.helper}>
      {word && (
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 18,
            color: C.ink,
            marginBottom: 4,
          }}
        >
          {word}
        </div>
      )}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(field.path, Number(e.target.value))}
        style={{ width: "100%", maxWidth: 480, accentColor: C.rose }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 480,
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.faint,
        }}
      >
        <span>{field.lowLabel}</span>
        <span>{field.highLabel}</span>
      </div>
    </FieldFrame>
  );
}

// ─── Single select ───────────────────────────────────────────────────────
function SingleSelect({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "single_select" }>;
}) {
  const value = readPath(formData, field.path) as string | undefined;
  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {field.options.map((o) => (
          <OptionPill
            key={o.value}
            option={o}
            active={value === o.value}
            onClick={() => onChange(field.path, o.value)}
          />
        ))}
      </div>
    </FieldFrame>
  );
}

// ─── Multi select ────────────────────────────────────────────────────────
function MultiSelect({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "multi_select" }>;
}) {
  const list = (readPath(formData, field.path) as string[]) ?? [];
  const toggle = (v: string) => {
    const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
    onChange(field.path, next);
  };
  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {field.options.map((o) => (
          <OptionPill
            key={o.value}
            option={o}
            active={list.includes(o.value)}
            onClick={() => toggle(o.value)}
          />
        ))}
      </div>
    </FieldFrame>
  );
}

function OptionPill({
  option,
  active,
  onClick,
}: {
  option: SelectOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        border: `1px solid ${active ? C.rose : C.line}`,
        backgroundColor: active ? C.rosePale : C.paper,
        color: active ? C.rose : C.inkSoft,
        fontFamily: FONT_SANS,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {option.label}
    </button>
  );
}

// ─── Color palette ───────────────────────────────────────────────────────
function ColorPalette({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "color_palette" }>;
}) {
  const palette =
    (readPath(formData, field.path) as Record<string, string[]>) ?? {};
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const updateBucket = (bucketKey: string, list: string[]) => {
    onChange(field.path, { ...palette, [bucketKey]: list });
  };

  return (
    <FieldFrame label={field.label} helper={field.helper}>
      {field.buckets.map((b) => {
        const list = palette[b.key] ?? [];
        const draft = drafts[b.key] ?? "";
        return (
          <div
            key={b.key}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.faint,
              }}
            >
              {b.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {list.map((hex, idx) => (
                <button
                  key={`${hex}-${idx}`}
                  type="button"
                  onClick={() =>
                    updateBucket(
                      b.key,
                      list.filter((_, i) => i !== idx),
                    )
                  }
                  title={`Remove ${hex}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    border: `1px solid ${C.line}`,
                    backgroundColor: hex,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
              <input
                type="color"
                value={draft || "#C97B63"}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [b.key]: e.target.value }))
                }
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  border: `1px dashed ${C.line}`,
                  cursor: "pointer",
                  padding: 0,
                  background: C.paper,
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const v = (drafts[b.key] || "").trim();
                  if (!v) return;
                  updateBucket(b.key, [...list, v]);
                  setDrafts((d) => ({ ...d, [b.key]: "" }));
                }}
                style={ghostButtonStyle()}
              >
                Add
              </button>
            </div>
          </div>
        );
      })}
    </FieldFrame>
  );
}

// ─── Text / textarea / number / boolean ──────────────────────────────────
function TextInput({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "text" }>;
}) {
  const value = (readPath(formData, field.path) as string | undefined) ?? "";
  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.path, e.target.value)}
        style={inputStyle()}
      />
    </FieldFrame>
  );
}

function TextareaInput({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "textarea" }>;
}) {
  const value = (readPath(formData, field.path) as string | undefined) ?? "";
  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <textarea
        value={value}
        rows={field.rows ?? 3}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.path, e.target.value)}
        style={{ ...inputStyle(), resize: "vertical", minHeight: 80 }}
      />
    </FieldFrame>
  );
}

function NumberInput({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "number" }>;
}) {
  const raw = readPath(formData, field.path);
  const value = typeof raw === "number" ? raw : "";
  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <input
        type="number"
        value={value}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        onChange={(e) =>
          onChange(
            field.path,
            e.target.value === "" ? undefined : Number(e.target.value),
          )
        }
        style={{ ...inputStyle(), maxWidth: 200 }}
      />
    </FieldFrame>
  );
}

function BooleanInput({
  field,
  formData,
  onChange,
}: FieldProps & {
  field: Extract<Field, { kind: "boolean" }>;
}) {
  const value = readPath(formData, field.path) === true;
  return (
    <label
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        cursor: "pointer",
        padding: "8px 12px",
        backgroundColor: value ? C.rosePale : C.paper,
        border: `1px solid ${value ? C.rose : C.line}`,
        borderRadius: 6,
        maxWidth: "fit-content",
      }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(field.path, e.target.checked)
        }
        style={{ accentColor: C.rose }}
      />
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 13,
          color: value ? C.rose : C.inkSoft,
        }}
      >
        {field.label}
      </span>
    </label>
  );
}

// ─── Image list ──────────────────────────────────────────────────────────
interface ImageItem {
  id: string;
  url: string;
  source?: string;
  note?: string;
  tags?: string[];
  event_tag?: string;
}

function ImageList({
  field,
  formData,
  onChange,
}: FieldProps & { field: ImageListField }) {
  const list = (readPath(formData, field.path) as ImageItem[]) ?? [];
  const [draftUrl, setDraftUrl] = useState("");

  const update = (next: ImageItem[]) => onChange(field.path, next);

  const add = () => {
    const v = draftUrl.trim();
    if (!v) return;
    update([
      ...list,
      {
        id: `img-${Date.now()}`,
        url: v,
        source: "url",
        tags: [],
      },
    ]);
    setDraftUrl("");
  };

  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="url"
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Paste an image, video, or reference URL…"
          style={inputStyle()}
        />
        <button type="button" onClick={add} style={ghostButtonStyle()}>
          Add
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 8,
        }}
      >
        {list.map((item, idx) => (
          <div
            key={item.id}
            style={{
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              backgroundColor: C.paper,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                aspectRatio: "1.4",
                backgroundImage: `url(${escapeUrl(item.url)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: C.champagnePale,
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => update(list.filter((_, i) => i !== idx))}
                title="Remove"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  background: "rgba(255,255,255,0.9)",
                  border: "none",
                  borderRadius: 999,
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <input
                type="text"
                value={item.note ?? ""}
                placeholder="Add a note…"
                onChange={(e) =>
                  update(
                    list.map((it, i) =>
                      i === idx ? { ...it, note: e.target.value } : it,
                    ),
                  )
                }
                style={{ ...inputStyle(), fontSize: 12 }}
              />
              {field.tagOptions && field.tagOptions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {field.tagOptions.map((t) => {
                    const active = (item.tags ?? []).includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          update(
                            list.map((it, i) =>
                              i === idx
                                ? {
                                    ...it,
                                    tags: active
                                      ? (it.tags ?? []).filter((x) => x !== t)
                                      : [...(it.tags ?? []), t],
                                  }
                                : it,
                            ),
                          )
                        }
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: `1px solid ${active ? C.rose : C.line}`,
                          backgroundColor: active ? C.rosePale : C.paper,
                          color: active ? C.rose : C.muted,
                          fontFamily: FONT_SANS,
                          fontSize: 10,
                          cursor: "pointer",
                        }}
                      >
                        {prettify(t)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </FieldFrame>
  );
}

function escapeUrl(url: string): string {
  return url.replace(/"/g, "%22");
}

// ─── List of strings ─────────────────────────────────────────────────────
function ListText({
  field,
  formData,
  onChange,
}: FieldProps & { field: ListTextField }) {
  type Item =
    | string
    | { id: string; moment?: string; description?: string; priority?: string; event?: string };
  const list = (readPath(formData, field.path) as Item[]) ?? [];
  const [draft, setDraft] = useState("");

  const items: Array<{ id: string; text: string; priority?: string }> =
    list.map((it, i) => {
      if (typeof it === "string") return { id: `it-${i}`, text: it };
      const text =
        (it as Record<string, unknown>).moment as string ??
        (it as Record<string, unknown>).description as string ??
        "";
      return {
        id: ((it as { id?: string }).id ?? `it-${i}`) as string,
        text,
        priority: (it as Record<string, unknown>).priority as string | undefined,
      };
    });

  const writeBack = (
    next: Array<{ id: string; text: string; priority?: string }>,
  ) => {
    if (field.priorityToggle) {
      onChange(
        field.path,
        next.map((it) => ({
          id: it.id,
          moment: it.text,
          priority: it.priority ?? "must_have",
        })),
      );
    } else {
      onChange(field.path, next.map((it) => it.text));
    }
  };

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    writeBack([
      ...items,
      { id: `it-${Date.now()}`, text: v, priority: "must_have" },
    ]);
    setDraft("");
  };

  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={field.placeholder ?? "Add an item…"}
          style={inputStyle()}
        />
        <button type="button" onClick={add} style={ghostButtonStyle()}>
          Add
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it, idx) => (
          <div
            key={it.id}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "8px 12px",
              backgroundColor: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
            }}
          >
            <input
              type="text"
              value={it.text}
              onChange={(e) =>
                writeBack(
                  items.map((row, i) =>
                    i === idx ? { ...row, text: e.target.value } : row,
                  ),
                )
              }
              style={{ ...inputStyle(), border: "none", padding: 0, flex: 1 }}
            />
            {field.priorityToggle && (
              <button
                type="button"
                onClick={() =>
                  writeBack(
                    items.map((row, i) =>
                      i === idx
                        ? {
                            ...row,
                            priority:
                              row.priority === "must_have"
                                ? "nice_to_have"
                                : "must_have",
                          }
                        : row,
                    ),
                  )
                }
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: `1px solid ${
                    it.priority === "must_have" ? C.rose : C.line
                  }`,
                  backgroundColor:
                    it.priority === "must_have" ? C.rosePale : C.paper,
                  color: it.priority === "must_have" ? C.rose : C.muted,
                  fontFamily: FONT_MONO,
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {it.priority === "must_have" ? "Must" : "Nice"}
              </button>
            )}
            <button
              type="button"
              onClick={() => writeBack(items.filter((_, i) => i !== idx))}
              style={removeButtonStyle()}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </FieldFrame>
  );
}

// ─── List of objects (per-event arrays etc.) ─────────────────────────────
function ListObject({
  field,
  formData,
  onChange,
}: FieldProps & { field: ListObjectField }) {
  const raw = readPath(formData, field.path);
  let list = (Array.isArray(raw) ? raw : []) as Record<string, unknown>[];
  // Seed preset rows on first render if list is empty.
  if (list.length === 0 && field.presetRows && field.presetRows.length > 0) {
    list = field.presetRows.map((row) => ({ ...row, id: `${field.path}-${row.event_name ?? Math.random()}` }));
  }
  const [openId, setOpenId] = useState<string | null>(null);

  const writeRows = (rows: Record<string, unknown>[]) =>
    onChange(field.path, rows);

  const add = () => {
    const newId = `row-${Date.now()}`;
    writeRows([...list, { id: newId }]);
    setOpenId(newId);
  };

  const updateRow = (idx: number, sub: Record<string, unknown>) =>
    writeRows(list.map((row, i) => (i === idx ? sub : row)));

  return (
    <FieldFrame label={field.label} helper={field.helper}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((row, idx) => {
          const id = (row.id as string) ?? `row-${idx}`;
          const title =
            (field.titleField &&
              ((row as Record<string, unknown>)[field.titleField] as string)) ||
            "Entry " + (idx + 1);
          const isOpen = openId === id;
          return (
            <div
              key={id}
              style={{
                border: `1px solid ${isOpen ? C.rose : C.line}`,
                borderRadius: 6,
                backgroundColor: C.paper,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : id)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT_SERIF,
                  fontSize: 16,
                  color: C.ink,
                  textAlign: "left",
                }}
              >
                <span>{title || "Untitled"}</span>
                <span
                  style={{
                    color: C.faint,
                    fontSize: 14,
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ›
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    borderTop: `1px solid ${C.lineSoft}`,
                    padding: "16px 18px",
                    backgroundColor: C.ivory,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {field.itemFields.map((subField) => (
                    <FieldRenderer
                      key={subField.path}
                      field={subField}
                      formData={row}
                      onChange={(p, v) =>
                        updateRow(idx, writePath(row, p, v))
                      }
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      writeRows(list.filter((_, i) => i !== idx));
                      setOpenId(null);
                    }}
                    style={{
                      ...removeButtonStyle(),
                      width: "fit-content",
                      padding: "6px 12px",
                      fontSize: 12,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Remove this entry
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={add}
          style={{
            ...ghostButtonStyle(),
            alignSelf: "flex-start",
            borderStyle: "dashed",
          }}
        >
          + Add another
        </button>
      </div>
    </FieldFrame>
  );
}

// ─── Brief field with draft helper + approval checkbox ───────────────────
function BriefInput({
  field,
  formData,
  onChange,
  onDraftBrief,
}: FieldProps & {
  field: Extract<Field, { kind: "brief" }>;
}) {
  const value = (readPath(formData, field.path) as string | undefined) ?? "";
  const approved = readPath(formData, "couple_approved") === true;
  const empty = value.trim().length === 0;

  return (
    <FieldFrame label={field.label} helper={field.helper}>
      {empty && onDraftBrief && (
        <div
          style={{
            border: `1px dashed ${C.roseSoft}`,
            backgroundColor: C.rosePale,
            borderRadius: 6,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.rose,
              marginBottom: 6,
            }}
          >
            ✨ We can draft this for you
          </div>
          <p
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 15,
              color: C.inkSoft,
              margin: "0 0 10px",
              lineHeight: 1.5,
              maxWidth: 580,
            }}
          >
            We'll stitch a starter brief from your earlier answers. Edit
            until it sounds like you.
          </p>
          <button
            type="button"
            onClick={onDraftBrief}
            style={{
              padding: "9px 18px",
              backgroundColor: C.rose,
              color: C.paper,
              border: "none",
              borderRadius: 4,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            Draft my brief →
          </button>
        </div>
      )}
      <textarea
        value={value}
        rows={10}
        placeholder="Your brief will live here…"
        onChange={(e) => onChange(field.path, e.target.value)}
        style={{
          ...inputStyle(),
          fontFamily: FONT_SERIF,
          fontSize: 15,
          lineHeight: 1.6,
          minHeight: 220,
          resize: "vertical",
        }}
      />
      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        <input
          type="checkbox"
          checked={approved}
          onChange={(e) => onChange("couple_approved", e.target.checked)}
          style={{ accentColor: C.sage }}
        />
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12.5,
            color: approved ? C.sage : C.muted,
          }}
        >
          We're happy with this brief
        </span>
      </label>
    </FieldFrame>
  );
}

// ─── Style helpers ───────────────────────────────────────────────────────
function inputStyle(): React.CSSProperties {
  return {
    flex: 1,
    padding: "10px 14px",
    border: `1px solid ${C.line}`,
    borderRadius: 6,
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: FONT_SANS,
    fontSize: 13,
    outline: "none",
  };
}

function ghostButtonStyle(): React.CSSProperties {
  return {
    padding: "8px 16px",
    border: `1px solid ${C.line}`,
    borderRadius: 6,
    backgroundColor: C.paper,
    color: C.inkSoft,
    fontFamily: FONT_SANS,
    fontSize: 12.5,
    cursor: "pointer",
  };
}

function removeButtonStyle(): React.CSSProperties {
  return {
    background: "transparent",
    border: "none",
    color: C.faint,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: 4,
  };
}

function prettify(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
