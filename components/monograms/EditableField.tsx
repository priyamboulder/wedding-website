"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EditableFieldProps {
  label: string;
  display: ReactNode;
  edited?: boolean;
  inline?: boolean;
  children: (ctx: { editing: boolean; finish: () => void; cancel: () => void }) => ReactNode;
  onStartEdit?: () => void;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  style?: CSSProperties;
}

export function EditableField({
  label,
  display,
  edited = false,
  inline = false,
  children,
  onStartEdit,
  className,
  labelClassName,
  valueClassName,
  style,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const finish = () => setEditing(false);
  const cancel = () => setEditing(false);

  const start = () => {
    if (editing) return;
    setEditing(true);
    onStartEdit?.();
  };

  return (
    <div ref={rootRef} className={cn(inline ? "" : "", className)} style={style}>
      <div className="flex items-center gap-2">
        <dt
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint",
            labelClassName,
          )}
        >
          {label}
        </dt>
        {edited && (
          <span
            className="rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: "italic",
              background: "rgba(184, 134, 11, 0.12)",
              color: "#8a6609",
            }}
          >
            Edited
          </span>
        )}
      </div>
      <dd
        className={cn(
          "mt-1 text-sm text-ink",
          !editing &&
            "cursor-text rounded-sm transition-colors hover:bg-gold-pale/20 hover:underline hover:decoration-gold hover:decoration-1 hover:underline-offset-4",
          valueClassName,
        )}
        onClick={editing ? undefined : start}
        role={editing ? undefined : "button"}
        tabIndex={editing ? undefined : 0}
        onKeyDown={
          editing
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  start();
                }
              }
        }
        aria-label={editing ? undefined : `Edit ${label.toLowerCase()}`}
      >
        {editing ? children({ editing, finish, cancel }) : display}
      </dd>
    </div>
  );
}

export default EditableField;
