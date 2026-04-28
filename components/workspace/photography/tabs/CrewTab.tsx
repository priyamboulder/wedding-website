"use client";

// ── Crew tab ──────────────────────────────────────────────────────────────
// The photographer's working team for the day — second shooter, videographer
// coordination, drone operator, assistant. Each row is a simple card with
// role, name, arrival time, and a handoff note.

import { useMemo } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import {
  CREW_ROLE_LABEL,
  type CrewRole,
  type PhotoCrewMember,
} from "@/types/photography";
import type { WorkspaceCategory } from "@/types/workspace";
import { EmptyRow, Eyebrow } from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

const ROLE_ORDER: CrewRole[] = [
  "second_shooter",
  "videographer",
  "drone",
  "assistant",
  "other",
];

export function CrewTab({ category }: { category: WorkspaceCategory }) {
  const allCrew = usePhotographyStore((s) => s.crew);
  const addCrew = usePhotographyStore((s) => s.addCrew);

  const crew = useMemo(
    () =>
      allCrew
        .filter((c) => c.category_id === category.id)
        .sort((a, b) => {
          const ra = ROLE_ORDER.indexOf(a.role);
          const rb = ROLE_ORDER.indexOf(b.role);
          if (ra !== rb) return ra - rb;
          return a.sort_order - b.sort_order;
        }),
    [allCrew, category.id],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Working team
          </p>
          <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
            Who's behind the camera with you
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            Second shooters, video coordination, drone ops, assistants — the
            crew the lead photographer will be handing moments off to. Keep
            arrival times and coverage handoffs tight so nothing slips.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            addCrew({
              category_id: category.id,
              role: "other",
              name: "",
            })
          }
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          <Plus size={13} strokeWidth={1.8} />
          Add crew member
        </button>
      </div>

      {crew.length === 0 ? (
        <EmptyRow>No crew yet. Add a second shooter, videographer, or assistant.</EmptyRow>
      ) : (
        <ul className="space-y-3">
          {crew.map((c) => (
            <li key={c.id}>
              <CrewCard member={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Crew card ────────────────────────────────────────────────────────────

function CrewCard({ member }: { member: PhotoCrewMember }) {
  const updateCrew = usePhotographyStore((s) => s.updateCrew);
  const deleteCrew = usePhotographyStore((s) => s.deleteCrew);
  const addCrew = usePhotographyStore((s) => s.addCrew);

  function handleDelete() {
    const snap: PhotoCrewMember = { ...member };
    deleteCrew(member.id);
    pushUndo({
      message: `Removed ${snap.name || CREW_ROLE_LABEL[snap.role]}`,
      undo: () =>
        addCrew({
          category_id: snap.category_id,
          role: snap.role,
          name: snap.name,
          arrival_time: snap.arrival_time,
          handoff_note: snap.handoff_note,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div className="rounded-md border border-border bg-white p-5">
      <HoverRow className="items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron-pale/50 text-saffron">
          <Users size={16} strokeWidth={1.6} />
        </div>
        <HoverRow.Main>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <select
              value={member.role}
              onChange={(e) =>
                updateCrew(member.id, { role: e.target.value as CrewRole })
              }
              className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted focus:border-saffron focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {CREW_ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <InlineText
              value={member.name ?? ""}
              onSave={(v) => updateCrew(member.id, { name: v })}
              placeholder="Name or studio"
              emptyLabel="Add a name…"
              allowEmpty
              className="!p-0 font-serif text-[16px] text-ink"
            />
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete crew member" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
        <div className="rounded-sm bg-ivory/40 p-3">
          <Eyebrow className="mb-1">Arrival time</Eyebrow>
          <InlineText
            value={member.arrival_time ?? ""}
            onSave={(v) => updateCrew(member.id, { arrival_time: v })}
            placeholder="e.g. With lead"
            emptyLabel="—"
            allowEmpty
            className="!p-0 text-[12.5px] text-ink"
          />
        </div>
        <div className="rounded-sm bg-ivory/40 p-3">
          <Eyebrow className="mb-1">Handoff responsibility</Eyebrow>
          <InlineText
            value={member.handoff_note ?? ""}
            onSave={(v) => updateCrew(member.id, { handoff_note: v })}
            variant="block"
            placeholder="What do they own? Where does the lead hand off?"
            emptyLabel="—"
            allowEmpty
            className="!p-0 text-[12.5px] leading-relaxed text-ink"
          />
        </div>
      </div>
    </div>
  );
}
