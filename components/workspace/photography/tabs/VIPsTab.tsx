"use client";

// ── VIPs & Family tab ──────────────────────────────────────────────────────
// A list of specific people the photographer must recognize on the day.
// Grouped by side → tier (immediate → extended → close). Each row supports
// a photo, relationship, accessibility/context note, and must-capture flag.

import { useMemo, useRef, useState } from "react";
import {
  Clock,
  Heart,
  Image as ImageIcon,
  Plus,
  Star,
  Trash2,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import { VIPFlagModal } from "@/components/workspace/photography/VIPFlagModal";
import {
  PHOTO_EVENTS,
  VIP_SIDE_LABEL,
  VIP_TIER_LABEL,
  type PhotoEventId,
  type PhotoGroupShot,
  type PhotoVIP,
  type VIPSide,
  type VIPTier,
} from "@/types/photography";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
  Tag,
} from "@/components/workspace/blocks/primitives";
import { InlineText } from "@/components/workspace/editable/InlineText";
import { HoverRow, IconButton } from "@/components/workspace/editable/HoverActions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";

const TIER_ORDER: VIPTier[] = ["immediate", "extended", "close"];
const SIDE_ORDER: VIPSide[] = ["bride", "groom", "both"];

export function VIPsTab({ category }: { category: WorkspaceCategory }) {
  const allVips = usePhotographyStore((s) => s.vips);
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  const vips = useMemo(
    () =>
      allVips
        .filter((v) => v.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allVips, category.id],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PhotoVIP[]>();
    for (const side of SIDE_ORDER) {
      for (const tier of TIER_ORDER) {
        map.set(`${side}::${tier}`, []);
      }
    }
    for (const v of vips) {
      const key = `${v.side}::${v.tier}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return map;
  }, [vips]);

  const mustCount = vips.filter((v) => v.must_capture).length;

  return (
    <div className="space-y-6">
      {flagModalOpen && (
        <VIPFlagModal
          categoryId={category.id}
          onClose={() => setFlagModalOpen(false)}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            People
          </p>
          <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
            The faces your photographer must know
          </h2>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-ink-muted">
            Upload a photo, give a name and relationship, and flag the people
            you'd be heartbroken not to have beautifully captured.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tag tone="rose">{mustCount} must-capture</Tag>
          <Tag>{vips.length} total</Tag>
          <button
            type="button"
            onClick={() => setFlagModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <Star size={13} strokeWidth={1.8} />
            Flag a VIP
          </button>
        </div>
      </div>

      {vips.length === 0 ? (
        <>
          <PanelCard
            icon={<UserCircle size={14} strokeWidth={1.8} />}
            title="No VIPs yet"
          >
            <EmptyRow>
              Add the people the photographer needs to recognize — especially
              grandparents, far-travelled relatives, and close friends who'll
              be in for short windows.
            </EmptyRow>
          </PanelCard>
          <GroupShotsBuilder category={category} vips={vips} />
        </>
      ) : (
        <div className="space-y-8">
          {SIDE_ORDER.map((side) => {
            const sideTotal = TIER_ORDER.reduce(
              (n, tier) => n + (grouped.get(`${side}::${tier}`)?.length ?? 0),
              0,
            );
            if (sideTotal === 0) return null;
            return (
              <section key={side}>
                <header className="mb-3 flex items-baseline justify-between border-b border-gold/15 pb-2">
                  <h3 className="font-serif text-[16px] text-ink">
                    {VIP_SIDE_LABEL[side]}
                  </h3>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {sideTotal}
                  </span>
                </header>
                <div className="space-y-5">
                  {TIER_ORDER.map((tier) => {
                    const list = grouped.get(`${side}::${tier}`) ?? [];
                    if (list.length === 0) return null;
                    return (
                      <div key={tier}>
                        <Eyebrow className="mb-2">{VIP_TIER_LABEL[tier]}</Eyebrow>
                        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {list.map((v) => (
                            <li key={v.id}>
                              <VIPCard vip={v} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <GroupShotsBuilder category={category} vips={vips} />
        </div>
      )}
    </div>
  );
}

// ── VIP card ──────────────────────────────────────────────────────────────

function VIPCard({ vip }: { vip: PhotoVIP }) {
  const updateVIP = usePhotographyStore((s) => s.updateVIP);
  const deleteVIP = usePhotographyStore((s) => s.deleteVIP);
  const addVIP = usePhotographyStore((s) => s.addVIP);
  const fileInput = useRef<HTMLInputElement>(null);

  function handlePhoto(file: File) {
    const url = URL.createObjectURL(file);
    updateVIP(vip.id, { photo_url: url });
  }

  function handleDelete() {
    const snap = { ...vip };
    deleteVIP(vip.id);
    pushUndo({
      message: `Removed ${vip.name || "VIP"}`,
      undo: () =>
        addVIP({
          category_id: snap.category_id,
          photo_url: snap.photo_url,
          name: snap.name,
          relationship: snap.relationship,
          side: snap.side,
          tier: snap.tier,
          must_capture: snap.must_capture,
          note: snap.note,
          sort_order: snap.sort_order,
        }),
    });
  }

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <HoverRow className="items-start">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group/photo relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-border transition-all hover:ring-saffron"
          aria-label="Upload VIP photo"
        >
          {vip.photo_url ? (
            <img
              src={vip.photo_url}
              alt={vip.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ivory-warm text-ink-faint">
              <UserCircle size={28} strokeWidth={1.4} />
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePhoto(f);
              e.target.value = "";
            }}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/50 text-ivory opacity-0 transition-opacity group-hover/photo:opacity-100">
            <ImageIcon size={16} strokeWidth={1.6} />
          </span>
        </button>

        <HoverRow.Main className="pl-1">
          <InlineText
            value={vip.name}
            onSave={(n) => updateVIP(vip.id, { name: n })}
            placeholder="Name"
            className="!p-0 font-serif text-[15px] text-ink"
          />
          <div className="mt-0.5">
            <InlineText
              value={vip.relationship}
              onSave={(n) => updateVIP(vip.id, { relationship: n })}
              placeholder="Relationship (e.g. Bride's dadi)"
              emptyLabel="Add relationship…"
              allowEmpty
              className="!p-0 text-[12px] text-ink-muted"
            />
          </div>
        </HoverRow.Main>

        <HoverRow.Actions>
          <IconButton label="Delete VIP" tone="rose" onClick={handleDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Eyebrow className="!normal-case">Side</Eyebrow>
        {(["bride", "groom", "both"] as VIPSide[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => updateVIP(vip.id, { side: s })}
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
              vip.side === s
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Eyebrow className="!normal-case">Tier</Eyebrow>
        {(["immediate", "extended", "close"] as VIPTier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => updateVIP(vip.id, { tier: t })}
            className={cn(
              "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
              vip.tier === t
                ? "border-saffron bg-saffron-pale/40 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => updateVIP(vip.id, { must_capture: !vip.must_capture })}
          className={cn(
            "flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
            vip.must_capture
              ? "border-rose bg-rose-pale/40 text-rose"
              : "border-border bg-white text-ink-muted hover:border-rose",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Heart
            size={11}
            strokeWidth={1.8}
            className={vip.must_capture ? "fill-rose" : ""}
          />
          {vip.must_capture ? "Must capture" : "Mark as must-capture"}
        </button>
      </div>

      <div className="mt-3 border-t border-border/60 pt-3">
        <Eyebrow className="mb-1">Context for the photographer</Eyebrow>
        <InlineText
          value={vip.note ?? ""}
          onSave={(n) => updateVIP(vip.id, { note: n })}
          variant="block"
          placeholder="e.g. In wheelchair — plan accessible angles; Flying in from London — limited time."
          emptyLabel="Add a note for the photographer…"
          allowEmpty
        />
      </div>
    </div>
  );
}

// ── Group Shots Builder ───────────────────────────────────────────────────
// Named combinations (e.g., "Immediate Family — Bride's Side", "Kapoor
// Cousins", "College Friends") with avatar chips, assigned event, and
// estimated time.

function estimateMinutes(count: number): number {
  if (count <= 2) return 2;
  if (count <= 6) return 3;
  if (count <= 10) return 4;
  if (count <= 16) return 5;
  return 6;
}

function GroupShotsBuilder({
  category,
  vips,
}: {
  category: WorkspaceCategory;
  vips: PhotoVIP[];
}) {
  const allGroups = usePhotographyStore((s) => s.groupShots);
  const addGroupShot = usePhotographyStore((s) => s.addGroupShot);
  const updateGroupShot = usePhotographyStore((s) => s.updateGroupShot);
  const deleteGroupShot = usePhotographyStore((s) => s.deleteGroupShot);
  const [composerOpen, setComposerOpen] = useState(false);

  const groups = useMemo(
    () =>
      allGroups
        .filter((g) => g.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allGroups, category.id],
  );

  const vipById = useMemo(() => {
    const map = new Map<string, PhotoVIP>();
    for (const v of vips) map.set(v.id, v);
    return map;
  }, [vips]);

  const totalMinutes = groups.reduce(
    (n, g) => n + (g.estimated_minutes ?? estimateMinutes(g.vip_ids.length)),
    0,
  );

  return (
    <PanelCard
      icon={<Users size={14} strokeWidth={1.8} />}
      title="Group shots"
      badge={
        <div className="flex items-center gap-2">
          <Tag>
            {groups.length} {groups.length === 1 ? "combo" : "combos"}
          </Tag>
          {groups.length > 0 && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ~{totalMinutes} min
            </span>
          )}
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted hover:border-saffron hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Plus size={10} /> New combination
          </button>
        </div>
      }
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        Name each group shot the photographer needs — "Immediate Family,"
        "Kapoor Cousins," "College Friends." On the day they'll call each
        group by name and get through them in minutes.
      </p>

      {composerOpen && (
        <GroupShotComposer
          categoryId={category.id}
          vips={vips}
          onAdd={(input) => {
            addGroupShot({ category_id: category.id, ...input });
            setComposerOpen(false);
          }}
          onCancel={() => setComposerOpen(false)}
        />
      )}

      {groups.length === 0 && !composerOpen ? (
        <EmptyRow>
          No group shots yet. Most weddings need 8–16 combinations. Tap "New
          combination" to build your first.
        </EmptyRow>
      ) : (
        <ul className="mt-3 space-y-2">
          {groups.map((g) => (
            <li key={g.id}>
              <GroupShotCard
                group={g}
                vips={vips}
                vipById={vipById}
                onUpdate={(patch) => updateGroupShot(g.id, patch)}
                onDelete={() => deleteGroupShot(g.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

function GroupShotComposer({
  categoryId,
  vips,
  onAdd,
  onCancel,
}: {
  categoryId: string;
  vips: PhotoVIP[];
  onAdd: (input: Omit<PhotoGroupShot, "id" | "sort_order" | "category_id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [vipIds, setVipIds] = useState<string[]>([]);
  const [event, setEvent] = useState<PhotoEventId>("wedding");

  const toggleVip = (id: string) => {
    setVipIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    onAdd({
      name: n,
      vip_ids: vipIds,
      event,
      estimated_minutes: estimateMinutes(vipIds.length),
    });
  };

  return (
    <div className="mb-3 rounded-md border border-gold/25 bg-ivory-warm/40 p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. "Immediate Family — Bride\u2019s Side"'
          className="flex-1 rounded-sm border border-border bg-white px-2 py-1.5 font-serif text-[14px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
        />
        <select
          value={event}
          onChange={(e) => setEvent(e.target.value as PhotoEventId)}
          className="rounded-sm border border-border bg-white px-2 py-1.5 text-[12px] text-ink-muted focus:border-saffron focus:outline-none"
        >
          {PHOTO_EVENTS.filter((e) => e.id !== "general").map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <Eyebrow className="mb-1.5">People</Eyebrow>
        {vips.length === 0 ? (
          <p className="text-[11.5px] italic text-ink-faint">
            Add some people above first.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {vips.map((v) => {
              const on = vipIds.includes(v.id);
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => toggleVip(v.id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                      on
                        ? "border-saffron bg-saffron-pale/50 text-saffron"
                        : "border-border bg-white text-ink-muted hover:border-saffron/40",
                    )}
                  >
                    <UserCircle size={10} strokeWidth={1.8} />
                    {v.name || "(no name)"}
                    <span className="text-ink-faint">
                      · {v.relationship || v.side}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="flex items-center gap-1 text-[11px] text-ink-muted">
          <Clock size={11} strokeWidth={1.8} />
          ~{estimateMinutes(vipIds.length)} min to photograph
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="rounded-sm bg-ink px-3 py-1 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Add combination
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupShotCard({
  group,
  vips,
  vipById,
  onUpdate,
  onDelete,
}: {
  group: PhotoGroupShot;
  vips: PhotoVIP[];
  vipById: Map<string, PhotoVIP>;
  onUpdate: (patch: Partial<PhotoGroupShot>) => void;
  onDelete: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const estimated =
    group.estimated_minutes ?? estimateMinutes(group.vip_ids.length);

  return (
    <div className="rounded-md border border-border bg-white p-3">
      <HoverRow className="items-start">
        <HoverRow.Main>
          <InlineText
            value={group.name}
            onSave={(n) => onUpdate({ name: n })}
            className="!p-0 font-serif text-[14.5px] text-ink"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Eyebrow className="!normal-case">Event</Eyebrow>
            <select
              value={group.event}
              onChange={(e) => onUpdate({ event: e.target.value as PhotoEventId })}
              className="rounded-sm border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink-muted focus:border-saffron focus:outline-none"
            >
              {PHOTO_EVENTS.filter((e) => e.id !== "general").map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}>
              <Clock size={10} strokeWidth={1.8} />
              ~{estimated} min
            </span>
          </div>
        </HoverRow.Main>
        <HoverRow.Actions>
          <IconButton label="Delete combination" tone="rose" onClick={onDelete}>
            <Trash2 size={11} />
          </IconButton>
        </HoverRow.Actions>
      </HoverRow>

      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {group.vip_ids.length === 0 && (
            <span className="text-[11.5px] italic text-ink-faint">
              No people assigned yet.
            </span>
          )}
          {group.vip_ids.map((id) => {
            const v = vipById.get(id);
            if (!v) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onUpdate({
                    vip_ids: group.vip_ids.filter((x) => x !== id),
                  })
                }
                title="Remove from combination"
                className="inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-saffron-pale/30 px-2 py-0.5 text-[11px] text-saffron hover:bg-saffron-pale/60"
              >
                <UserCircle size={10} strokeWidth={1.8} />
                {v.name || "(no name)"}
                <X size={10} strokeWidth={2} />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-white px-2 py-0.5 text-[11px] text-ink-muted hover:border-saffron hover:text-saffron"
          >
            <Plus size={10} strokeWidth={1.8} /> Add person
          </button>
        </div>
        {pickerOpen && (
          <ul className="mt-2 flex flex-wrap gap-1">
            {vips
              .filter((v) => !group.vip_ids.includes(v.id))
              .map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({ vip_ids: [...group.vip_ids, v.id] })
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[10.5px] text-ink-muted hover:border-saffron hover:text-saffron"
                  >
                    <UserCircle size={10} strokeWidth={1.8} />
                    {v.name || "(no name)"}
                    <span className="text-ink-faint">· {v.side}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="mt-3">
        <Eyebrow className="mb-1">Notes</Eyebrow>
        <InlineText
          value={group.notes ?? ""}
          onSave={(n) => onUpdate({ notes: n })}
          variant="block"
          placeholder="e.g. Nani seated — chair in frame; shoot before pheras."
          emptyLabel="Add a note…"
          allowEmpty
          className="!p-0 text-[12px] text-ink-muted"
        />
      </div>
    </div>
  );
}
