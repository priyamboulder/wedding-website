"use client";

// ── Vendor category strip ──────────────────────────────────────────────────
// Flat, scannable list of vendor categories. Every row carries icon + name +
// progress at full width so the couple can navigate by name, not by guessing
// at icons. Active row gets a champagne tint and a gold edge accent.
// Taxonomy / sequencing logic lives on the dashboard as concrete next moves
// — this rail is for muscle-memory navigation only.
//
// Rows are drag-reorderable via dnd-kit. Custom order persists through the
// workspace store (Zustand + localStorage). A hover-visible grip handle
// triggers drag on desktop; touch-and-hold triggers drag on mobile. While a
// row is being dragged the rest of the list dims and the lifted row gets a
// shadow + slight scale.

import {
  Cake,
  Camera,
  Car,
  Flower2,
  Gem,
  Gift,
  GripVertical,
  Luggage,
  MapPin,
  Music,
  PenTool,
  RotateCcw,
  Scissors,
  Shirt,
  Sparkles,
  Utensils,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";

export interface VendorCategoryInput {
  id: string;
  slug: WorkspaceCategorySlug;
  name: string;
}

interface Props {
  categories: VendorCategoryInput[];
  activeSlug?: WorkspaceCategorySlug | null;
  onSelect: (slug: WorkspaceCategorySlug) => void;
}

export const CATEGORY_ICONS: Partial<Record<WorkspaceCategorySlug, LucideIcon>> = {
  photography: Camera,
  videography: Video,
  catering: Utensils,
  decor_florals: Flower2,
  entertainment: Music,
  hmua: Sparkles,
  venue: MapPin,
  mehndi: Scissors,
  transportation: Car,
  stationery: PenTool,
  pandit_ceremony: Sparkles,
  wardrobe: Shirt,
  jewelry: Gem,
  cake_sweets: Cake,
  gifting: Gift,
  travel_accommodations: Luggage,
};

export function VendorCategoryStrip({
  categories,
  activeSlug,
  onSelect,
}: Props) {
  const vendorOrder = useWorkspaceStore((s) => s.vendorOrder);
  const setVendorOrder = useWorkspaceStore((s) => s.setVendorOrder);
  const resetVendorOrder = useWorkspaceStore((s) => s.resetVendorOrder);

  // Mouse drag kicks in after a tiny distance so a click never triggers a
  // drag. Touch uses a 200ms hold to avoid hijacking scroll on mobile.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.slug === active.id);
    const newIndex = categories.findIndex((c) => c.slug === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(categories, oldIndex, newIndex).map((c) => c.slug);
    setVendorOrder(next);
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.slug)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-0.5" role="list">
            {categories.map((row) => (
              <SortableCategoryRow
                key={row.slug}
                row={row}
                active={row.slug === activeSlug}
                onSelect={() => onSelect(row.slug)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {vendorOrder && vendorOrder.length > 0 && (
        <button
          type="button"
          onClick={resetVendorOrder}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <RotateCcw size={10} strokeWidth={1.8} />
          Reset to default order
        </button>
      )}
    </div>
  );
}

function SortableCategoryRow({
  row,
  active,
  onSelect,
}: {
  row: VendorCategoryInput;
  active: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.slug });

  const Icon = CATEGORY_ICONS[row.slug] ?? Sparkles;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform
        ? { ...transform, scaleX: isDragging ? 1.02 : 1, scaleY: isDragging ? 1.02 : 1 }
        : null,
    ),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li ref={setNodeRef} style={style} className="group/item">
      <div
        className={cn(
          "relative flex items-center transition-[box-shadow,opacity] duration-150",
          isDragging && "rounded-md bg-white shadow-[0_10px_30px_rgba(26,26,26,0.12)]",
        )}
      >
        {/* Drag handle — subtle, reveals on hover (desktop), always visible on touch */}
        <button
          type="button"
          aria-label={`Reorder ${row.name}`}
          className={cn(
            "flex h-full shrink-0 cursor-grab touch-none items-center justify-center px-1 text-[#C5C0B8] transition-opacity hover:text-ink-muted active:cursor-grabbing",
            isDragging ? "opacity-100" : "opacity-0 group-hover/item:opacity-100 md:opacity-0",
            // Always-visible on touch-capable viewports
            "[@media(hover:none)]:opacity-60",
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={13} strokeWidth={1.6} />
        </button>

        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative flex min-h-[40px] flex-1 items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-150",
            active
              ? "bg-gold-pale/30 text-ink"
              : "text-ink-muted hover:bg-ivory-warm/60 hover:text-ink",
          )}
        >
          {active && (
            <span
              aria-hidden
              className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-gold"
            />
          )}
          <Icon
            size={16}
            strokeWidth={1.6}
            className={cn(
              "shrink-0 transition-colors",
              active ? "text-ink" : "text-ink-faint group-hover:text-ink-muted",
            )}
          />
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight">
            {row.name}
          </span>
        </button>
      </div>
    </li>
  );
}
