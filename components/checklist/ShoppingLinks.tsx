"use client";

import { useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ShoppingBag } from "lucide-react";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";
import { AddLinkInput } from "./AddLinkInput";
import { ShoppingLinkCard } from "./ShoppingLinkCard";

export function ShoppingLinks({
  taskId,
  module,
  hideHeader = false,
}: {
  taskId: string;
  module: string;
  hideHeader?: boolean;
}) {
  const { getLinksForTask, reorderLinks, pendingIds } = useShoppingLinks();
  const links = getLinksForTask(taskId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const ids = useMemo(() => links.map((l) => l.id), [links]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(ids, oldIndex, newIndex);
    reorderLinks(taskId, next);
  }

  const totalSpend = links
    .filter((l) => l.price != null && l.status !== "returned")
    .reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0);

  const primaryCurrency = links.find((l) => l.price != null)?.currency ?? "USD";

  return (
    <div className="space-y-3">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
            <ShoppingBag size={11} strokeWidth={1.8} />
            Shopping
          </h3>
          {totalSpend > 0 && (
            <span
              className="font-mono text-[10.5px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: primaryCurrency,
                maximumFractionDigits: 0,
              }).format(totalSpend)}
              <span className="ml-1 text-ink-faint">
                · {links.length} item{links.length === 1 ? "" : "s"}
              </span>
            </span>
          )}
        </div>
      )}

      <AddLinkInput taskId={taskId} module={module} />

      {links.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {links.map((link) => (
                <ShoppingLinkCard
                  key={link.id}
                  link={link}
                  pending={pendingIds.has(link.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
