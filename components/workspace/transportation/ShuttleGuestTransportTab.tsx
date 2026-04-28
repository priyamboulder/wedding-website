"use client";

// ── Shuttle & Guest Transport ──────────────────────────────────────────────
// All guest movements in one place: hotel↔venue shuttles, airport pickups,
// VIP moves for elders and out-of-town family. One discriminator on
// meta.kind splits the three tables; all three live on the same tab so
// planners can scan everyone's movements at once.
//
// Persists as WorkspaceItems on tab "shuttle_transport":
//   • block_type "shuttle" + meta.kind "shuttle"       → Hotel ↔ venue
//   • block_type "shuttle" + meta.kind "airport_pickup" → Airport pickups
//   • block_type "vip_move" + meta.kind "vip_move"     → VIP / family moves

import { useMemo } from "react";
import {
  BusFront,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import {
  PanelCard,
  Eyebrow,
  MiniStat,
  Tag,
} from "@/components/workspace/blocks/primitives";

interface ShuttleMeta {
  kind?: "shuttle" | "airport_pickup" | "vip_move";
  route?: string;
  event?: string;
  depart?: string;
  arrive?: string;
  time?: string;
  count?: number;
  flight?: string;
  notes?: string;
  person?: string;
  // Populated by the ✦ auto-grouper on airport pickups. `group` is a human
  // label like "Group 1"; `group_key` is the bucket id used to recompute.
  group?: string;
  group_key?: string;
}

// ── Time parsing for pickup auto-grouping ──────────────────────────────────
// Expects strings like "Apr 9, 2:30 PM" or "2:30 PM". Returns a stable key
// for a 2-hour window on the pickup's arrival date, or null if unparseable.
function pickupBucketKey(raw: string): string | null {
  if (!raw) return null;
  const m = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const mer = (m[3] ?? "").toUpperCase();
  if (mer === "PM" && hours < 12) hours += 12;
  if (mer === "AM" && hours === 12) hours = 0;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const totalMin = hours * 60 + minutes;
  const bucket = Math.floor(totalMin / 120); // 2-hour windows
  const datePart = raw.split(",")[0]?.trim().replace(/[0-9:]+\s*(AM|PM|am|pm)/, "").trim();
  return `${datePart || "anyday"}|${bucket}`;
}

export function ShuttleGuestTransportTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const scoped = useMemo(
    () =>
      items.filter(
        (i) => i.category_id === category.id && i.tab === "shuttle_transport",
      ),
    [items, category.id],
  );

  const shuttles = scoped.filter(
    (i) =>
      i.block_type === "shuttle" &&
      ((i.meta as ShuttleMeta).kind ?? "shuttle") === "shuttle",
  );
  const pickups = scoped.filter(
    (i) =>
      i.block_type === "shuttle" &&
      (i.meta as ShuttleMeta).kind === "airport_pickup",
  );
  const vips = scoped.filter((i) => i.block_type === "vip_move");

  const peakCount = shuttles.reduce((n, s) => {
    const c = (s.meta as ShuttleMeta).count ?? 0;
    return c > n ? c : n;
  }, 0);

  const patch = (id: string, p: Record<string, unknown>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  const addShuttle = () =>
    addItem({
      category_id: category.id,
      tab: "shuttle_transport",
      block_type: "shuttle",
      title: "New shuttle",
      meta: { kind: "shuttle" } satisfies ShuttleMeta,
      sort_order: items.length + 1,
    });

  const addPickup = () =>
    addItem({
      category_id: category.id,
      tab: "shuttle_transport",
      block_type: "shuttle",
      title: "New airport pickup",
      meta: { kind: "airport_pickup" } satisfies ShuttleMeta,
      sort_order: items.length + 1,
    });

  const addVip = () =>
    addItem({
      category_id: category.id,
      tab: "shuttle_transport",
      block_type: "vip_move",
      title: "New VIP move",
      meta: { kind: "vip_move" } satisfies ShuttleMeta,
      sort_order: items.length + 1,
    });

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Every guest movement — shuttles, airport pickups, and VIPs. Keep
        departures 15–30 min earlier than the event start to absorb traffic.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Shuttle runs" value={shuttles.length} />
        <MiniStat label="Airport pickups" value={pickups.length} />
        <MiniStat label="VIP moves" value={vips.length} />
        <MiniStat
          label="Peak passengers"
          value={peakCount || "—"}
          hint={peakCount >= 50 ? "Use a coach" : undefined}
          tone={peakCount >= 50 ? "saffron" : "ink"}
        />
      </div>

      {/* ── Hotel ↔ venue shuttles ─────────────────────────────────────── */}
      <PanelCard
        icon={<BusFront size={14} strokeWidth={1.8} />}
        title="Hotel ↔ venue shuttles"
        badge={
          canEdit ? (
            <AddButton onClick={addShuttle}>Add shuttle</AddButton>
          ) : undefined
        }
      >
        {shuttles.length === 0 ? (
          <Empty>
            Start with one row per event day. Most weddings need 3–5 total
            runs (outbound for ceremony, return trip, late-night after
            reception).
          </Empty>
        ) : (
          <Table headers={["Route", "Event", "Depart", "Arrive", "Pax"]}>
            {shuttles.map((r) => {
              const meta = (r.meta ?? {}) as ShuttleMeta;
              return (
                <Row key={r.id} onDelete={canEdit ? () => deleteItem(r.id) : undefined}>
                  <Cell>
                    <TextInput
                      value={r.title}
                      onChange={(v) => updateItem(r.id, { title: v })}
                      disabled={!canEdit}
                      placeholder="Marriott → venue"
                    />
                  </Cell>
                  <Cell>
                    <TextInput
                      value={meta.event ?? ""}
                      onChange={(v) => patch(r.id, { event: v })}
                      disabled={!canEdit}
                      placeholder="Wedding"
                    />
                  </Cell>
                  <Cell>
                    <TimeInput
                      value={meta.depart ?? ""}
                      onChange={(v) => patch(r.id, { depart: v })}
                      disabled={!canEdit}
                    />
                  </Cell>
                  <Cell>
                    <TimeInput
                      value={meta.arrive ?? ""}
                      onChange={(v) => patch(r.id, { arrive: v })}
                      disabled={!canEdit}
                    />
                  </Cell>
                  <Cell>
                    <NumInput
                      value={meta.count}
                      onChange={(v) => patch(r.id, { count: v })}
                      disabled={!canEdit}
                    />
                  </Cell>
                </Row>
              );
            })}
          </Table>
        )}
      </PanelCard>

      {/* ── Airport pickups ──────────────────────────────────────────── */}
      <PickupsSection
        pickups={pickups}
        canEdit={canEdit}
        onAdd={addPickup}
        onPatch={patch}
        onUpdateTitle={(id, v) => updateItem(id, { title: v })}
        onDelete={deleteItem}
      />

      {/* ── VIP & family moves ───────────────────────────────────────── */}
      <PanelCard
        icon={<UserCircle size={14} strokeWidth={1.8} />}
        title="VIP & family moves"
        badge={
          canEdit ? <AddButton onClick={addVip}>Add move</AddButton> : undefined
        }
      >
        {vips.length === 0 ? (
          <Empty>
            Grandparents, bride's parents, out-of-town VIPs. Name-level
            specificity — drivers need to know who to wait for.
          </Empty>
        ) : (
          <Table headers={["Move", "Who", "Event", "Time"]}>
            {vips.map((r) => {
              const meta = (r.meta ?? {}) as ShuttleMeta;
              return (
                <Row key={r.id} onDelete={canEdit ? () => deleteItem(r.id) : undefined}>
                  <Cell>
                    <TextInput
                      value={r.title}
                      onChange={(v) => updateItem(r.id, { title: v })}
                      disabled={!canEdit}
                      placeholder="Grandparents → venue"
                    />
                  </Cell>
                  <Cell>
                    <TextInput
                      value={meta.person ?? ""}
                      onChange={(v) => patch(r.id, { person: v })}
                      disabled={!canEdit}
                      placeholder="Dadi + Nana-Nani"
                    />
                  </Cell>
                  <Cell>
                    <TextInput
                      value={meta.event ?? ""}
                      onChange={(v) => patch(r.id, { event: v })}
                      disabled={!canEdit}
                      placeholder="Wedding"
                    />
                  </Cell>
                  <Cell>
                    <TimeInput
                      value={meta.time ?? ""}
                      onChange={(v) => patch(r.id, { time: v })}
                      disabled={!canEdit}
                    />
                  </Cell>
                </Row>
              );
            })}
          </Table>
        )}
      </PanelCard>
    </div>
  );
}

// ── Airport pickups section with ✦ auto-grouper ────────────────────────────

function PickupsSection({
  pickups,
  canEdit,
  onAdd,
  onPatch,
  onUpdateTitle,
  onDelete,
}: {
  pickups: WorkspaceItem[];
  canEdit: boolean;
  onAdd: () => void;
  onPatch: (id: string, p: Partial<ShuttleMeta>) => void;
  onUpdateTitle: (id: string, v: string) => void;
  onDelete: (id: string) => void;
}) {
  const candidates = pickups
    .map((p) => ({
      id: p.id,
      key: pickupBucketKey(((p.meta ?? {}) as ShuttleMeta).time ?? ""),
    }))
    .filter((c): c is { id: string; key: string } => c.key !== null);
  const bucketIds = Array.from(new Set(candidates.map((c) => c.key)));
  const groupable = bucketIds.length > 0 && candidates.length >= 2;
  const alreadyGrouped = pickups.every(
    (p) => !!((p.meta ?? {}) as ShuttleMeta).group,
  );

  const autoGroup = () => {
    if (!canEdit) return;
    // Stable ordering by chronological bucket key for consistent numbering.
    const sorted = [...bucketIds].sort();
    const labelByKey = new Map<string, string>(
      sorted.map((k, i) => [k, `Group ${i + 1}`]),
    );
    for (const { id, key } of candidates) {
      onPatch(id, { group: labelByKey.get(key), group_key: key });
    }
    // Clear group on pickups without a parseable time.
    for (const p of pickups) {
      if (candidates.find((c) => c.id === p.id)) continue;
      onPatch(p.id, { group: undefined, group_key: undefined });
    }
  };

  const clearGroups = () => {
    if (!canEdit) return;
    for (const p of pickups) {
      onPatch(p.id, { group: undefined, group_key: undefined });
    }
  };

  const pickupCount = pickups.length;

  return (
    <PanelCard
      icon={<Plane size={14} strokeWidth={1.8} />}
      title="Airport pickups"
      badge={
        canEdit ? (
          <AddButton onClick={onAdd}>Add pickup</AddButton>
        ) : undefined
      }
    >
      {/* ✦ AI whisper — only shown when there's work to group */}
      {groupable && canEdit && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-saffron/40 bg-saffron-pale/25 px-3 py-2">
          <Sparkles size={13} strokeWidth={1.8} className="text-saffron" />
          <p className="flex-1 text-[12px] text-ink">
            {pickupCount} guest{pickupCount === 1 ? "" : "s"} flying in.
            {alreadyGrouped
              ? " Shared-shuttle windows are assigned."
              : ` Group into ${bucketIds.length} pickup window${bucketIds.length === 1 ? "" : "s"} by arrival time.`}
          </p>
          {alreadyGrouped ? (
            <button
              type="button"
              onClick={clearGroups}
              className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Clear groups
            </button>
          ) : (
            <button
              type="button"
              onClick={autoGroup}
              className="inline-flex items-center gap-1 rounded-sm border border-saffron bg-white px-2 py-1 text-[11px] text-saffron hover:bg-saffron hover:text-white"
            >
              <Sparkles size={11} strokeWidth={1.8} />
              Auto-group
            </button>
          )}
        </div>
      )}

      {pickups.length === 0 ? (
        <Empty>
          Each flight-in guest becomes one row. Group arrivals within a
          2-hour window into a shared shuttle to save cost.
        </Empty>
      ) : (
        <Table headers={["Guest", "Flight", "Arrives", "Transport"]}>
          {pickups.map((r) => {
            const meta = (r.meta ?? {}) as ShuttleMeta;
            return (
              <Row key={r.id} onDelete={canEdit ? () => onDelete(r.id) : undefined}>
                <Cell>
                  <div className="flex items-center gap-1.5">
                    <TextInput
                      value={r.title}
                      onChange={(v) => onUpdateTitle(r.id, v)}
                      disabled={!canEdit}
                      placeholder="Nani + Nana"
                    />
                    {meta.group && <Tag tone="saffron">{meta.group}</Tag>}
                  </div>
                </Cell>
                <Cell>
                  <TextInput
                    value={meta.flight ?? ""}
                    onChange={(v) => onPatch(r.id, { flight: v })}
                    disabled={!canEdit}
                    placeholder="AI 101 · DEL→DFW"
                  />
                </Cell>
                <Cell>
                  <TextInput
                    value={meta.time ?? ""}
                    onChange={(v) => onPatch(r.id, { time: v })}
                    disabled={!canEdit}
                    placeholder="Apr 9, 2:30 PM"
                  />
                </Cell>
                <Cell>
                  <TextInput
                    value={meta.notes ?? ""}
                    onChange={(v) => onPatch(r.id, { notes: v })}
                    disabled={!canEdit}
                    placeholder="Private car · Shared shuttle"
                  />
                </Cell>
              </Row>
            );
          })}
        </Table>
      )}
    </PanelCard>
  );
}

// ── Small table primitives (scoped to this tab) ────────────────────────────

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-[12px] italic text-ink-faint">{children}</p>;
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
    >
      <Plus size={12} strokeWidth={1.8} />
      {children}
    </button>
  );
}

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border/60">
      <div
        className="grid border-b border-border/60 bg-ivory-warm/30 px-3 py-2"
        style={{
          gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr)) 24px`,
        }}
      >
        {headers.map((h) => (
          <Eyebrow key={h}>{h}</Eyebrow>
        ))}
        <span />
      </div>
      <ul className="divide-y divide-border/60">{children}</ul>
    </div>
  );
}

function Row({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete?: () => void;
}) {
  const cells = Array.isArray(children) ? children.length : 1;
  return (
    <li
      className="group grid items-center gap-2 px-3 py-2"
      style={{
        gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr)) 24px`,
      }}
    >
      {children}
      <div className="flex justify-end">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            aria-label="Remove"
          >
            <Trash2 size={12} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </li>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}

function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
    />
  );
}

function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
      style={{ fontFamily: "var(--font-mono)" }}
    />
  );
}

function NumInput({
  value,
  onChange,
  disabled,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : undefined)
      }
      disabled={disabled}
      className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
      style={{ fontFamily: "var(--font-mono)" }}
    />
  );
}
