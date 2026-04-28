"use client";

// ── Event Detail View ────────────────────────────────────────────────────
// Per-event workspace that renders inside EventsWorkspaceShell so its
// header, action bar, and tab bar visually match the Photography /
// WorkspaceCanvas shell used elsewhere in the product.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import { useEventsStore } from "@/stores/events-store";
import type { EventRecord } from "@/types/events";
import type { EventTabId } from "@/lib/workspace/events-completion";
import { displayNameFor } from "./event-display";
import { EventHeaderBar } from "./EventHeaderBar";
import {
  EventsWorkspaceShell,
  type EventsShellAction,
  type EventsShellTab,
} from "./EventsWorkspaceShell";
import { VibePaletteTab } from "./tabs/VibePaletteTab";
import { AttireTab } from "./tabs/AttireTab";
import { GuestFeelTab } from "./tabs/GuestFeelTab";
import { TheBriefTab } from "./tabs/TheBriefTab";

const TABS: EventsShellTab<EventTabId>[] = [
  { id: "vibe", label: "Vibe & Palette", icon: Sparkles },
  { id: "attire", label: "Attire", icon: Heart },
  { id: "guest", label: "Guest feel", icon: User },
  { id: "brief", label: "The Brief", icon: FileText },
];

interface Props {
  event: EventRecord;
  siblings: EventRecord[];
  activeTab: EventTabId;
  onChangeTab: (tab: EventTabId) => void;
  onBackToStory: () => void;
  onSelectEvent: (id: string) => void;
}

export function EventDetailView({
  event,
  siblings,
  activeTab,
  onChangeTab,
  onBackToStory,
  onSelectEvent,
}: Props) {
  const [flashId] = useState(event.id);
  const setEventCustomNameTheme = useEventsStore(
    (s) => s.setEventCustomNameTheme,
  );

  const typeOption = EVENT_TYPE_OPTIONS.find((o) => o.id === event.type);
  const name = displayNameFor(event);
  const theme = event.customTheme ?? event.vibeTheme ?? "";

  const { prev, next, position } = useMemo(() => {
    const sorted = [...siblings].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((e) => e.id === event.id);
    if (idx === -1)
      return { prev: null, next: null, position: { at: 0, of: sorted.length } };
    return {
      prev: sorted[idx - 1] ?? null,
      next: sorted[idx + 1] ?? null,
      position: { at: idx + 1, of: sorted.length },
    };
  }, [siblings, event.id]);

  const actions: EventsShellAction[] = [
    {
      icon: <Send size={13} strokeWidth={1.8} />,
      label: "Invite vendor",
    },
    {
      icon: <Heart size={13} strokeWidth={1.8} />,
      label: "Shortlist",
      primary: true,
    },
  ];

  const breadcrumb = (
    <>
      <button
        type="button"
        onClick={onBackToStory}
        className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-ink-muted transition-colors hover:bg-ivory-warm/50 hover:text-ink"
      >
        <ArrowLeft
          size={13}
          strokeWidth={1.8}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to the story
      </button>

      <div className="flex items-center gap-4">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Chapter {String(position.at).padStart(2, "0")} of{" "}
          {String(position.of).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => prev && onSelectEvent(prev.id)}
            disabled={!prev}
            aria-label={
              prev ? `Previous chapter: ${displayNameFor(prev)}` : "No previous chapter"
            }
            className="inline-flex items-center justify-center rounded-md border border-border bg-white p-1.5 text-ink-muted transition-colors hover:border-gold/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink-muted"
          >
            <ChevronLeft size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => next && onSelectEvent(next.id)}
            disabled={!next}
            aria-label={
              next ? `Next chapter: ${displayNameFor(next)}` : "No next chapter"
            }
            className="inline-flex items-center justify-center rounded-md border border-border bg-white p-1.5 text-ink-muted transition-colors hover:border-gold/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink-muted"
          >
            <ChevronRight size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </>
  );

  const eyebrowText = `Workspace · Events / ${name}`;

  const titleContent = (
    <input
      value={name}
      onChange={(e) =>
        setEventCustomNameTheme(event.id, e.target.value, theme)
      }
      placeholder={typeOption?.name ?? "Chapter name"}
      aria-label="Chapter name"
      className="min-w-0 flex-1 border-0 bg-transparent font-serif text-[46px] font-bold leading-[1.05] tracking-[-0.005em] text-ink outline-none placeholder:text-ink-faint"
    />
  );

  const sublineContent = (
    <input
      value={theme}
      onChange={(e) =>
        setEventCustomNameTheme(event.id, name, e.target.value)
      }
      placeholder={typeOption?.blurb ?? "A one-line theme…"}
      aria-label="Chapter theme"
      className="w-full border-0 bg-transparent font-serif text-[17px] italic text-ink-muted outline-none placeholder:text-ink-faint"
    />
  );

  return (
    <div key={flashId} className="flex flex-1 flex-col overflow-hidden">
      <EventsWorkspaceShell<EventTabId>
        eyebrow={eyebrowText}
        title={name}
        titleContent={titleContent}
        titleIcon={CalendarDays}
        subline={theme || typeOption?.blurb || "Shape this chapter"}
        sublineContent={sublineContent}
        breadcrumb={breadcrumb}
        actions={actions}
        tabs={TABS}
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        secondaryStrip={<EventHeaderBar event={event} />}
      >
        <div className={cn("space-y-5")}>
          {activeTab === "vibe" && <VibePaletteTab event={event} />}
          {activeTab === "attire" && <AttireTab event={event} />}
          {activeTab === "guest" && <GuestFeelTab event={event} />}
          {activeTab === "brief" && <TheBriefTab event={event} />}
        </div>
      </EventsWorkspaceShell>
    </div>
  );
}
