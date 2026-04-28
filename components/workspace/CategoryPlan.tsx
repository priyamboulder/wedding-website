"use client";

import { useMemo } from "react";
import {
  Calendar,
  ChefHat,
  Clapperboard,
  Car,
  Flower2,
  FlowerIcon,
  ListMusic,
  MapPin,
  Music2,
  Palette as PaletteIcon,
  PenTool,
  Scissors,
  Shirt,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WorkspaceCategory,
  WorkspaceCategorySlug,
  WorkspaceItem,
} from "@/types/workspace";
import {
  ShotListBlock,
  PeopleListBlock,
  KitNotesBlock,
  CoverageHoursBlock,
  DeliverablesBlock,
} from "./blocks/photo-blocks";
import { GenericItemListBlock } from "./blocks/generic-blocks";
import { PanelCard, EmptyRow } from "./blocks/primitives";

// The Plan tab content, specialized per category. All categories render
// inside the same 2-col grid wrapper for visual consistency.

export function CategoryPlan({ category }: { category: WorkspaceCategory }) {
  const allItems = useWorkspaceStore((s) => s.items);
  const items = useMemo(
    () =>
      allItems
        .filter((i) => i.category_id === category.id && i.tab === "plan")
        .sort((a, b) => a.sort_order - b.sort_order),
    [allItems, category.id],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PlanFor slug={category.slug} items={items} />
    </div>
  );
}

function PlanFor({
  slug,
  items,
}: {
  slug: WorkspaceCategorySlug;
  items: WorkspaceItem[];
}) {
  const byType = (t: string) => items.filter((i) => i.block_type === t);

  switch (slug) {
    case "photography":
      return (
        <>
          <ShotListBlock items={byType("shot_list")} />
          <PeopleListBlock items={byType("people_list")} />
          <KitNotesBlock items={byType("kit_notes")} />
          <CoverageHoursBlock items={byType("coverage_hours")} />
          <DeliverablesBlock items={byType("deliverable")} />
        </>
      );

    case "videography":
      return (
        <>
          <ShotListBlock items={byType("shot_list")} />
          <KitNotesBlock items={byType("kit_notes")} />
          <DeliverablesBlock items={byType("deliverable")} />
        </>
      );

    case "catering":
      return (
        <>
          <GenericItemListBlock
            icon={<Utensils size={14} strokeWidth={1.8} />}
            title="Menu by event"
            items={byType("menu_course")}
            className="lg:col-span-2"
            emptyMessage="No menu courses added."
          />
          <GenericItemListBlock
            icon={<Users size={14} strokeWidth={1.8} />}
            title="Dietary counts"
            items={byType("dietary_count")}
            emptyMessage="Pull dietary counts from Guests module."
          />
          <GenericItemListBlock
            icon={<ChefHat size={14} strokeWidth={1.8} />}
            title="Service windows"
            items={byType("service_window")}
            emptyMessage="No service timing set."
          />
        </>
      );

    case "decor_florals":
      return (
        <>
          <GenericItemListBlock
            icon={<Flower2 size={14} strokeWidth={1.8} />}
            title="Floral list"
            items={byType("floral")}
            className="lg:col-span-2"
            emptyMessage="No floral designs staged."
          />
          <GenericItemListBlock
            icon={<PaletteIcon size={14} strokeWidth={1.8} />}
            title="Setup plan per space"
            items={byType("setup_plan")}
            className="lg:col-span-2"
            emptyMessage="No spaces blocked out."
          />
        </>
      );

    case "entertainment":
      return (
        <>
          <GenericItemListBlock
            icon={<ListMusic size={14} strokeWidth={1.8} />}
            title="Set list"
            items={byType("set_list")}
            emptyMessage="No sets planned."
          />
          <GenericItemListBlock
            icon={<Music2 size={14} strokeWidth={1.8} />}
            title="Song requests"
            items={byType("song_request")}
            emptyMessage="No songs requested yet."
          />
        </>
      );

    case "hmua":
      return (
        <>
          <GenericItemListBlock
            icon={<Sparkles size={14} strokeWidth={1.8} />}
            title="Looks per person per event"
            items={byType("look")}
            className="lg:col-span-2"
            emptyMessage="No looks staged."
          />
          <GenericItemListBlock
            icon={<Calendar size={14} strokeWidth={1.8} />}
            title="Trials"
            items={byType("trial")}
            emptyMessage="No trials scheduled."
          />
        </>
      );

    case "venue":
      return (
        <>
          <GenericItemListBlock
            icon={<MapPin size={14} strokeWidth={1.8} />}
            title="Room assignments"
            items={byType("room_assignment")}
            className="lg:col-span-2"
            emptyMessage="No rooms assigned."
          />
          <GenericItemListBlock
            icon={<PenTool size={14} strokeWidth={1.8} />}
            title="Floor plan notes"
            items={byType("floor_note")}
            emptyMessage="No floor-plan notes."
          />
        </>
      );

    case "mehndi":
      return (
        <>
          <GenericItemListBlock
            icon={<FlowerIcon size={14} strokeWidth={1.8} />}
            title="Design inspiration"
            items={byType("design_inspo")}
            className="lg:col-span-2"
            emptyMessage="No designs pinned."
          />
          <GenericItemListBlock
            icon={<Calendar size={14} strokeWidth={1.8} />}
            title="Application schedule"
            items={byType("application_slot")}
            className="lg:col-span-2"
            emptyMessage="No application slots set."
          />
        </>
      );

    case "transportation":
      return (
        <>
          <GenericItemListBlock
            icon={<Car size={14} strokeWidth={1.8} />}
            title="Fleet"
            items={byType("fleet_vehicle")}
            emptyMessage="No vehicles booked."
          />
          <GenericItemListBlock
            icon={<MapPin size={14} strokeWidth={1.8} />}
            title="Pickup schedule"
            items={byType("pickup")}
            emptyMessage="No pickups scheduled."
          />
        </>
      );

    case "stationery":
      return (
        <>
          <GenericItemListBlock
            icon={<PenTool size={14} strokeWidth={1.8} />}
            title="Suite design"
            items={byType("suite_piece")}
            className="lg:col-span-2"
            emptyMessage="No pieces designed yet."
          />
          <GenericItemListBlock
            icon={<PenTool size={14} strokeWidth={1.8} />}
            title="Wording & translation"
            items={byType("wording")}
            className="lg:col-span-2"
            emptyMessage="Wording not drafted."
          />
        </>
      );

    case "pandit_ceremony":
      return (
        <>
          <GenericItemListBlock
            icon={<Sparkles size={14} strokeWidth={1.8} />}
            title="Rituals"
            items={byType("ritual")}
            className="lg:col-span-2"
            emptyMessage="No rituals listed."
          />
          <GenericItemListBlock
            icon={<Scissors size={14} strokeWidth={1.8} />}
            title="Samagri checklist"
            items={byType("samagri")}
            emptyMessage="No samagri items listed."
          />
        </>
      );

    case "wardrobe":
      return (
        <>
          <GenericItemListBlock
            icon={<Shirt size={14} strokeWidth={1.8} />}
            title="Outfit per event per person"
            items={byType("outfit")}
            className="lg:col-span-2"
            emptyMessage="No outfits staged."
          />
          <GenericItemListBlock
            icon={<Calendar size={14} strokeWidth={1.8} />}
            title="Fittings"
            items={byType("fitting")}
            emptyMessage="No fittings scheduled."
          />
          <GenericItemListBlock
            icon={<Sparkles size={14} strokeWidth={1.8} />}
            title="Accessories"
            items={byType("accessory")}
            emptyMessage="No accessories planned."
          />
        </>
      );

    default:
      return (
        <PanelCard
          icon={<Sparkles size={14} strokeWidth={1.8} />}
          title="Plan"
          className="lg:col-span-2"
        >
          <EmptyRow>Plan blocks for this category are coming soon.</EmptyRow>
        </PanelCard>
      );
  }
}

// Small helper used elsewhere to show the "richness" of a category's Plan.
export function planItemCount(items: WorkspaceItem[]): number {
  return items.filter((i) => i.tab === "plan").length;
}

// Clapperboard import guard — TS keeps it alive even if branch unused.
const _ = Clapperboard;
