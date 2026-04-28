"use client";

// ─────────────────────────────────────────────────────────────────────────
// Ananya Photography Workspace — couple-facing creative exploration,
// day-of group photo coordination, and post-wedding album experience.
// Single-file React component. localStorage-backed.
// Design: Cormorant Garamond headings · DM Sans body · ivory/champagne/gold.
// ─────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";

// ─── Palette ─────────────────────────────────────────────────────────────
// Mapped to Ananya's design tokens (globals.css) so photography matches the
// rest of the app. Revision pass: overlay/callout tones lightened toward
// off-white so panels recede behind content. Gold is preserved for small
// label eyebrows and CTAs but not panel fills.
const C = {
  ivory: "#FBF9F4",           // --color-ivory
  ivorySoft: "#FAF7F2",       // was #F5F1E8 — callout panels recede
  overlay: "#FBFAF7",         // lightest fill for banner/callout strips
  paper: "#FFFFFF",
  champagne: "#F2EDE3",       // was #F5F1E8 — subtle border-ivory tint
  champagnePale: "#FBFAF7",   // near-white for highlighted chips
  gold: "#B8860B",            // --color-gold
  goldDeep: "#8B6508",
  goldSoft: "#F0E4C8",        // --color-gold-pale
  ink: "#1A1A1A",             // --color-ink
  inkSoft: "#2E2E2E",         // --color-ink-soft
  muted: "#6B6B6B",           // --color-ink-muted
  faint: "#A3A3A3",           // --color-ink-faint
  line: "rgba(26, 26, 26, 0.08)",   // --color-border
  lineSoft: "rgba(26, 26, 26, 0.04)",
  accent: "#C97B63",          // --color-rose
  leaf: "#9CAF88",            // --color-sage
  danger: "#C97B63",
};

const FONT_SERIF = `"Cormorant Garamond", "Playfair Display", Georgia, serif`;
const FONT_SANS = `Inter, system-ui, sans-serif`;
const FONT_MONO = `"JetBrains Mono", "Fira Code", monospace`;

// ─── Types ───────────────────────────────────────────────────────────────
type Phase = "exploring" | "assigned" | "delivered";

type Reaction = "love" | "skip" | null;

type MoodboardTag = "eyes" | "composition" | "mood" | "detail";

interface MoodImage {
  id: string;
  url: string;
  tag: MoodboardTag;
  note: string;
}

interface EventRef {
  id: string;
  url: string;
  note: string;
  reaction: Reaction;
  source: "ai" | "user";
}

interface EventBlock {
  key: string;
  label: string;
  refs: EventRef[];
  desires: string[];
}

interface Guest {
  id: string;
  name: string;
  relationship: string;
  side: "bride" | "groom" | "both";
  photo?: string;
}

interface GroupPhoto {
  id: string;
  name: string;
  peopleIds: string[];
  timeSlot: string;
  message: string;
  status: "pending" | "notified" | "done";
}

interface VIP {
  id: string;
  guestId: string;
  tier: "immediate" | "extended" | "close";
  mustCapture: boolean;
  note: string;
  photoUrl?: string;
}

type AlbumStatus = "empty" | "uploading" | "uploaded" | "tagged";

interface AlbumPhoto {
  id: string;
  url: string;
  eventKey?: string;
  taggedGuestIds: string[];
  confidence: "high" | "review";
  favorite: boolean;
  source?: "photographer" | "couple";
}

interface ThankYouNote {
  id: string;
  guestId: string;
  photoId: string | null;
  message: string;
  channel: "email" | "text" | "print";
  status: "draft" | "approved" | "sent";
}

type ShareScope = "watermarked" | "full_res";

interface ShareSettings {
  scope: ShareScope;
  allowDownload: boolean;
  expiryDays: number;
}

interface InspirationComment {
  id: string;
  author: "me" | "partner";
  text: string;
  at: number;
}

export interface PhotoState {
  phase: Phase;
  photographerName: string;
  quizDone: boolean;
  brief: string;
  styleKeywords: string[];
  toneScore: number;
  moodboard: MoodImage[];
  activeMoodTag: MoodboardTag | "all";
  events: EventBlock[];
  moments: string[];
  exclusions: string[];
  exclusionsOpen: boolean;
  groupPhotos: GroupPhoto[];
  vips: VIP[];
  albumStatus: AlbumStatus;
  albumProgress: number;
  album: AlbumPhoto[];
  thankYouNotes: ThankYouNote[];
  shareSettings: ShareSettings;
  heartedInspiration: string[];
  inspirationCategory: string;
  inspirationComments: Record<string, InspirationComment[]>;
  inspirationRoutedTo: Record<string, string>;
  taskBannerDismissed: boolean;
}

// ─── Seeds ───────────────────────────────────────────────────────────────
const EVENT_KEYS = [
  { key: "haldi", label: "Haldi" },
  { key: "mehendi", label: "Mehendi" },
  { key: "sangeet", label: "Sangeet" },
  { key: "baraat", label: "Baraat" },
  { key: "wedding", label: "Wedding" },
  { key: "reception", label: "Reception" },
] as const;

const SUGGESTED_KEYWORDS = [
  "joyful",
  "nostalgic",
  "moody",
  "natural-light",
  "candid",
  "editorial",
  "film-grain",
  "golden-hour",
  "documentary",
  "intimate",
  "saturated",
  "painterly",
];

// Placeholder AI reference images — colour-coded unsplash-style URLs.
// Pointer: replace with real curation when that pipeline lands.
const AI_REFS: Record<string, string[]> = {
  haldi: [
    "https://images.unsplash.com/photo-1609042900109-2b04fae5a1b9?w=600",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
    "https://images.unsplash.com/photo-1600721391776-b5cd0e0048a9?w=600",
    "https://images.unsplash.com/photo-1617183428445-0e1adf2c8b03?w=600",
  ],
  mehendi: [
    "https://images.unsplash.com/photo-1610030006930-8b1b18b60b38?w=600",
    "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=600",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=600",
    "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=600",
  ],
  sangeet: [
    "https://images.unsplash.com/photo-1583939411023-14783179e581?w=600",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
    "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
  ],
  baraat: [
    "https://images.unsplash.com/photo-1532377611767-e6d7c7d90b54?w=600",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
    "https://images.unsplash.com/photo-1600189261867-8e7c8f3a4a6d?w=600",
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600",
  ],
  wedding: [
    "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
  ],
  reception: [
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
  ],
};

const MOCK_GUESTS: Guest[] = [
  { id: "g1", name: "Priya Sharma", relationship: "Bride's mother", side: "bride" },
  { id: "g2", name: "Raj Sharma", relationship: "Bride's father", side: "bride" },
  { id: "g3", name: "Aarav Sharma", relationship: "Bride's brother", side: "bride" },
  { id: "g4", name: "Meera Sharma", relationship: "Bride's sister", side: "bride" },
  { id: "g5", name: "Anjali Sharma", relationship: "Bride's grandmother", side: "bride" },
  { id: "g6", name: "Vikram Mehta", relationship: "Groom's father", side: "groom" },
  { id: "g7", name: "Kavita Mehta", relationship: "Groom's mother", side: "groom" },
  { id: "g8", name: "Arjun Mehta", relationship: "Groom's brother", side: "groom" },
  { id: "g9", name: "Neha Kapoor", relationship: "Bride's best friend", side: "bride" },
  { id: "g10", name: "Simran Kaur", relationship: "College friend", side: "bride" },
  { id: "g11", name: "Rohan Iyer", relationship: "Work friend", side: "groom" },
  { id: "g12", name: "Divya Menon", relationship: "Cousin", side: "bride" },
];

const STANDARD_GROUPS: Array<{ name: string; ids: string[]; slot: string }> = [
  { name: "Bride's immediate family", ids: ["g1", "g2", "g3", "g4"], slot: "After ceremony" },
  { name: "Groom's immediate family", ids: ["g6", "g7", "g8"], slot: "After ceremony" },
  { name: "Couple with both families", ids: ["g1", "g2", "g3", "g4", "g6", "g7", "g8"], slot: "After ceremony" },
  { name: "College friends", ids: ["g9", "g10"], slot: "Cocktail hour" },
  { name: "Work friends", ids: ["g11"], slot: "Cocktail hour" },
  { name: "Couple with grandparents", ids: ["g5"], slot: "Before ceremony" },
];

const MOMENT_SUGGESTIONS = [
  "My dad trying not to cry during the Vidaai",
  "The moment we see each other before the ceremony",
  "Mom adjusting my dupatta right before I walk out",
  "Grandparents watching the phere",
  "Guests laughing during the speeches",
  "Quiet second between us during the varmala",
  "Kids sneaking sweets during Mehendi",
  "The first dance, seen from the crowd",
];

// ─── State keys ──────────────────────────────────────────────────────────
export const STORAGE_KEY = "ananya:photography-workspace:v1";

export function defaultState(): PhotoState {
  return {
    phase: "exploring",
    photographerName: "",
    quizDone: false,
    brief: "",
    styleKeywords: [],
    toneScore: 55,
    moodboard: [],
    activeMoodTag: "all",
    events: EVENT_KEYS.map((e) => ({
      key: e.key,
      label: e.label,
      refs: AI_REFS[e.key]!.map((url, i) => ({
        id: `${e.key}-ai-${i}`,
        url,
        note: "",
        reaction: null,
        source: "ai" as const,
      })),
      desires: [],
    })),
    moments: [],
    exclusions: [],
    exclusionsOpen: false,
    groupPhotos: [],
    vips: [],
    albumStatus: "empty",
    albumProgress: 0,
    album: [],
    thankYouNotes: [],
    shareSettings: { scope: "watermarked", allowDownload: true, expiryDays: 30 },
    heartedInspiration: [],
    inspirationCategory: "all",
    inspirationComments: {},
    inspirationRoutedTo: {},
    taskBannerDismissed: false,
  };
}

// ─── Utils ───────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

export function usePersistentState<T>(key: string, initial: T): [T, (u: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal({ ...initial, ...JSON.parse(raw) } as T);
    } catch {}
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);

  return [val, setVal];
}

// ─────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────
export type PhotoTabId = "vision" | "groups" | "album" | "inspiration";
type TabId = PhotoTabId;

export default function PhotographyCoupleWorkspace() {
  const [state, setState] = usePersistentState<PhotoState>(STORAGE_KEY, defaultState());
  const [activeTab, setActiveTab] = useState<TabId>("vision");
  const [quizOpen, setQuizOpen] = useState(false);

  const update = useCallback(
    (patch: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => {
      setState((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
    },
    [setState],
  );

  const statusLine = useMemo(() => {
    if (state.phase === "delivered")
      return "Album arrived — your memories are ready to share";
    if (state.phase === "assigned")
      return `Assigned — ${state.photographerName || "your photographer"} is on it`;
    return "Exploring — tell us what moves you";
  }, [state.phase, state.photographerName]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.ivory,
        color: C.ink,
        fontFamily: FONT_SANS,
        fontSize: 14,
      }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <WorkspaceHeader
            statusLine={statusLine}
            phase={state.phase}
            onPhaseChange={(p) => update({ phase: p })}
            photographerName={state.photographerName}
          />

          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              moodboard: state.moodboard.length,
              groups: state.groupPhotos.length,
              album: state.album.length,
            }}
          />

          {!state.taskBannerDismissed && (
            <TaskReminderBanner
              state={state}
              onDismiss={() => update({ taskBannerDismissed: true })}
              onJumpTo={(tab) => setActiveTab(tab)}
            />
          )}

          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 120px" }}>
            {activeTab === "vision" && (
              <>
                <VisionTab
                  state={state}
                  update={update}
                  onOpenQuiz={() => setQuizOpen(true)}
                />
                <PhotographyContractChecklist />
              </>
            )}
            {activeTab === "groups" && <GroupsTab state={state} update={update} />}
            {activeTab === "album" && <AlbumTab state={state} update={update} />}
            {activeTab === "inspiration" && (
              <InspirationTab state={state} update={update} />
            )}
          </div>
        </div>

        <RightSidebar
          state={state}
          onJumpTo={(tab) => setActiveTab(tab)}
        />
      </div>

      {quizOpen && (
        <QuizModal
          onClose={() => setQuizOpen(false)}
          onComplete={(result) => {
            update({
              quizDone: true,
              brief: result.brief,
              styleKeywords: result.keywords,
              toneScore: result.tone,
            });
            setQuizOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PhotographyContractChecklist() {
  const category = useWorkspaceStore((s) =>
    s.categories.find((c) => c.slug === "photography"),
  );
  if (!category) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <ContractChecklistBlock category={category} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────
function WorkspaceHeader({
  statusLine,
  phase,
  onPhaseChange,
  photographerName,
}: {
  statusLine: string;
  phase: Phase;
  onPhaseChange: (p: Phase) => void;
  photographerName: string;
}) {
  const budgetAllocated = 15000;
  const budgetTotal = 120000;

  return (
    <header
      style={{
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        padding: "36px 40px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
              fontWeight: 500,
            }}
          >
            ✦  Ananya Workspace  ✦
          </div>
          <h1
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 46,
              lineHeight: 1.05,
              margin: "8px 0 6px",
              color: C.ink,
              fontWeight: 700,
              letterSpacing: "-0.005em",
            }}
          >
            Photography
          </h1>
          <p
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 17,
              color: C.muted,
              margin: 0,
            }}
          >
            {statusLine}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <BudgetChip allocated={budgetAllocated} total={budgetTotal} />
          <PlannerBadge />
          <PhaseSwitch current={phase} onChange={onPhaseChange} />
        </div>
      </div>

      {phase === "assigned" && photographerName && (
        <div
          style={{
            marginTop: 18,
            padding: "10px 16px",
            borderRadius: 2,
            border: `1px solid ${C.champagne}`,
            backgroundColor: C.champagnePale,
            fontSize: 12.5,
            color: C.inkSoft,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: C.goldDeep }}>✦</span>
          {photographerName} is reading your brief. Expect a call this week.
        </div>
      )}
    </header>
  );
}

function BudgetChip({ allocated, total }: { allocated: number; total: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        border: `1px solid ${C.champagne}`,
        backgroundColor: C.champagnePale,
        borderRadius: 2,
        fontSize: 12,
        color: C.inkSoft,
      }}
    >
      <span style={{ color: C.goldDeep, fontWeight: 600, letterSpacing: "0.04em" }}>BUDGET</span>
      <span style={{ fontFamily: FONT_SERIF, fontSize: 15, color: C.ink }}>
        ${allocated.toLocaleString()}
      </span>
      <span style={{ color: C.faint }}>of ${total.toLocaleString()}</span>
    </div>
  );
}

function PlannerBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        border: `1px solid ${C.line}`,
        backgroundColor: C.ivory,
        borderRadius: 2,
        fontSize: 11.5,
        color: C.muted,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: C.goldSoft,
          color: C.ink,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_SERIF,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        M
      </span>
      Planner · Meera
    </div>
  );
}

function PhaseSwitch({ current, onChange }: { current: Phase; onChange: (p: Phase) => void }) {
  const phases: Array<{ id: Phase; label: string }> = [
    { id: "exploring", label: "Explore" },
    { id: "assigned", label: "Assigned" },
    { id: "delivered", label: "Delivered" },
  ];
  return (
    <div
      style={{
        display: "inline-flex",
        border: `1px solid ${C.line}`,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: C.ivory,
      }}
      title="Demo: flip to preview each phase"
    >
      {phases.map((p) => {
        const active = p.id === current;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            style={{
              padding: "7px 12px",
              backgroundColor: active ? C.ink : "transparent",
              color: active ? C.ivory : C.muted,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: FONT_SANS,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────────────────
function TabBar({
  active,
  onChange,
  counts,
}: {
  active: string;
  onChange: (t: TabId) => void;
  counts: { moodboard: number; groups: number; album: number };
}) {
  const tabs: Array<{ id: TabId; label: string; hint?: string }> = [
    { id: "vision", label: "Vision & Mood", hint: counts.moodboard ? `${counts.moodboard} pins` : "Start here" },
    { id: "groups", label: "Group Photos", hint: counts.groups ? `${counts.groups} groups` : "Day-of" },
    { id: "album", label: "Album & Gallery", hint: counts.album ? `${counts.album} photos` : "After" },
    { id: "inspiration", label: "Inspiration", hint: "Browse" },
  ];

  return (
    <nav
      style={{
        borderBottom: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        padding: "0 40px",
        display: "flex",
        gap: 0,
      }}
      aria-label="Photography sections"
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: "14px 22px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderBottom: isActive ? `2px solid ${C.goldDeep}` : "2px solid transparent",
              marginBottom: -1,
              display: "flex",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 18,
                color: isActive ? C.ink : C.muted,
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {t.label}
            </span>
            {t.hint && (
              <span
                style={{
                  fontSize: 10.5,
                  color: C.faint,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {t.hint}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Right sidebar — Needs your attention + Circle + Activity
// ─────────────────────────────────────────────────────────────────────────
function RightSidebar({
  state,
  onJumpTo,
}: {
  state: PhotoState;
  onJumpTo: (tab: TabId) => void;
}) {
  const alerts = useMemo(() => collectAlerts(state, onJumpTo), [state, onJumpTo]);

  const circle = [
    { role: "Bride", name: "Ananya", color: C.accent },
    { role: "Groom", name: "Arjun", color: C.leaf },
    { role: "Planner", name: "Meera", color: C.goldDeep },
    {
      role: "Photographer",
      name:
        state.phase === "exploring"
          ? "— not yet assigned —"
          : state.photographerName || "Pending",
      color: C.gold,
    },
  ];

  const activity = [
    state.phase === "delivered" && { t: "Now", msg: `Album delivered · ${state.album.length || 487} photos` },
    state.phase !== "exploring" && { t: "2d ago", msg: "Photographer accepted the brief" },
    { t: "3d ago", msg: "You added 4 pins to Sangeet references" },
    { t: "4d ago", msg: "Brief refined with AI" },
    { t: "6d ago", msg: "Style quiz completed" },
  ].filter(Boolean) as Array<{ t: string; msg: string }>;

  return (
    <aside
      style={{
        width: 290,
        flexShrink: 0,
        borderLeft: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        padding: "32px 24px",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {alerts.length > 0 && (
        <>
          <SectionKicker>
            Needs your attention{" "}
            <span
              style={{
                marginLeft: 4,
                padding: "1px 8px",
                borderRadius: 999,
                backgroundColor: C.accent,
                color: C.paper,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {alerts.length}
            </span>
          </SectionKicker>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {alerts.map((a) => (
              <button
                key={a.id}
                onClick={a.onClick}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 12px",
                  backgroundColor: C.champagnePale,
                  border: `1px solid ${C.champagne}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: C.accent,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 500, lineHeight: 1.35 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>
                    {a.body}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <SectionKicker>The Circle</SectionKicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {circle.map((p) => (
          <div key={p.role} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: p.color,
                color: C.paper,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_SERIF,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {p.name.slice(0, 1)}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {p.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionKicker>Activity</SectionKicker>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {activity.map((a, i) => (
          <div key={i} style={{ fontSize: 12, lineHeight: 1.5 }}>
            <div style={{ color: C.faint, fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {a.t}
            </div>
            <div style={{ color: C.inkSoft }}>{a.msg}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function collectAlerts(
  state: PhotoState,
  onJumpTo: (tab: TabId) => void,
): Array<{ id: string; title: string; body: string; onClick: () => void }> {
  const alerts: Array<{ id: string; title: string; body: string; onClick: () => void }> = [];

  if (!state.quizDone && !state.brief) {
    alerts.push({
      id: "quiz",
      title: "Start your style quiz",
      body: "3 minutes · seeds your brief and palette.",
      onClick: () => onJumpTo("vision"),
    });
  }
  const lovedCount = state.events.reduce(
    (n, e) => n + e.refs.filter((r) => r.reaction === "love").length,
    0,
  );
  if (state.phase !== "delivered" && lovedCount < 4) {
    alerts.push({
      id: "references",
      title: "Mark references you love",
      body: "Your photographer needs a shared visual language.",
      onClick: () => onJumpTo("vision"),
    });
  }
  if (state.groupPhotos.length === 0) {
    alerts.push({
      id: "groups",
      title: "Plan group photos",
      body: "Avoid day-of delays — block the combinations now.",
      onClick: () => onJumpTo("groups"),
    });
  }
  const needsReview = state.album.filter((p) => p.confidence === "review").length;
  if (state.albumStatus === "tagged" && needsReview > 0) {
    alerts.push({
      id: "review",
      title: `${needsReview} face tags need review`,
      body: "Low-confidence matches — a quick pass fixes it.",
      onClick: () => onJumpTo("album"),
    });
  }
  const pendingThanks = state.thankYouNotes.filter((n) => n.status !== "sent").length;
  if (state.phase === "delivered" && pendingThanks > 0) {
    alerts.push({
      id: "thanks",
      title: `${pendingThanks} thank-you notes in draft`,
      body: "Review the AI-written messages and send when you're ready.",
      onClick: () => onJumpTo("album"),
    });
  }
  return alerts;
}

// ─── Task reminder banner ────────────────────────────────────────────────
function TaskReminderBanner({
  state,
  onDismiss,
  onJumpTo,
}: {
  state: PhotoState;
  onDismiss: () => void;
  onJumpTo: (t: TabId) => void;
}) {
  let text = "";
  let target: TabId = "vision";
  if (state.phase === "exploring" && !state.quizDone) {
    text = "Take your 3-minute style quiz — it seeds your entire brief.";
    target = "vision";
  } else if (state.phase === "exploring" && state.moodboard.length < 5) {
    text = "Add a few more pins to your moodboard — we'll match your photographer to your taste.";
    target = "vision";
  } else if (state.phase === "assigned" && state.groupPhotos.length < 5) {
    text = "Plan your group photos — the day-of notifier will save you hours.";
    target = "groups";
  } else if (state.phase === "delivered" && state.albumStatus === "empty") {
    text = "Upload the album your photographer delivered to unlock face tagging and thank-you notes.";
    target = "album";
  } else if (state.phase === "delivered" && state.thankYouNotes.length === 0) {
    text = "Your photos are ready — let's turn them into thank-you notes your guests will treasure.";
    target = "album";
  } else {
    return null;
  }
  return (
    <div
      style={{
        backgroundColor: C.champagnePale,
        borderBottom: `1px solid ${C.champagne}`,
        padding: "10px 40px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 13,
        color: C.inkSoft,
      }}
    >
      <span style={{ color: C.goldDeep, fontSize: 14 }}>✦</span>
      <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 15, flex: 1 }}>
        {text}
      </span>
      <button onClick={() => onJumpTo(target)} style={textButtonStyle()}>
        Take me there →
      </button>
      <button
        onClick={onDismiss}
        style={{ border: "none", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 16 }}
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tab 1 — Vision & Mood
// ─────────────────────────────────────────────────────────────────────────
export function VisionTab({
  state,
  update,
  onOpenQuiz,
}: {
  state: PhotoState;
  update: (patch: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
  onOpenQuiz: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
      {!state.quizDone && <QuizCard onStart={onOpenQuiz} />}

      <KeywordsSection
        selected={state.styleKeywords}
        onChange={(k) => update({ styleKeywords: k })}
      />

      <ToneSection
        score={state.toneScore}
        onChange={(v) => update({ toneScore: v })}
      />

      <MoodboardSection
        images={state.moodboard}
        activeTag={state.activeMoodTag}
        setActiveTag={(t) => update({ activeMoodTag: t })}
        onAdd={(img) => update((s) => ({ moodboard: [...s.moodboard, img] }))}
        onUpdate={(id, patch) =>
          update((s) => ({
            moodboard: s.moodboard.map((m) => (m.id === id ? { ...m, ...patch } : m)),
          }))
        }
        onRemove={(id) =>
          update((s) => ({ moodboard: s.moodboard.filter((m) => m.id !== id) }))
        }
      />

      <EventGallerySection
        events={state.events}
        onUpdate={(events) => update({ events })}
      />

      <MomentsSection
        moments={state.moments}
        onChange={(m) => update({ moments: m })}
      />

      <BriefSection
        brief={state.brief}
        onChange={(v) => update({ brief: v })}
        onRefine={() => {
          update({ brief: refineBrief(state.brief, state.styleKeywords, state.toneScore) });
        }}
      />

      <ExclusionsSection
        open={state.exclusionsOpen}
        setOpen={(o) => update({ exclusionsOpen: o })}
        items={state.exclusions}
        onChange={(e) => update({ exclusions: e })}
      />
    </div>
  );
}

// ─── Quiz card (Vision) ──────────────────────────────────────────────────
// Visually mirrors components/quiz/QuizEntryCard.tsx (the shared card that
// Mehendi, HMUA, Cake, Stationery etc. render) so the Vision & Mood quiz
// entry looks identical across every canvas. The onStart callback still
// drives photography's bespoke QuizModal below rather than the shared
// QuizRunner.
function QuizCard({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-ink/10 bg-white p-5 shadow-[0_1px_2px_rgba(26,26,26,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ✨ Not sure where to start?
          </p>
          <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-ink">
            Your photography style in 5 questions
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
            Five light questions. We'll turn your answers into a draft brief,
            style keywords, and a colour &amp; tone palette — all editable.
          </p>
          <p
            className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            5 questions · ~3 min
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(184,134,11,0.2)] transition-opacity hover:opacity-90"
          >
            Start quiz →
          </button>
          <button
            type="button"
            className="text-[11.5px] text-ink-muted transition-colors hover:text-ink"
          >
            Skip, I'll fill it in myself
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Brief section ───────────────────────────────────────────────────────
function BriefSection({
  brief,
  onChange,
  onRefine,
}: {
  brief: string;
  onChange: (v: string) => void;
  onRefine: () => void;
}) {
  return (
    <SectionShell>
      <SectionHead
        eyebrow="The document your photographer reads first"
        title="Your Photography Brief"
        hint="Describe the feeling you want — not the shots. We'll polish the structure."
        right={
          <button style={textButtonStyle()} onClick={onRefine}>
            ✨ Refine with AI
          </button>
        }
      />
      <textarea
        value={brief}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Click to write a brief — a few sentences about what your wedding photos should feel like. Don't worry about structure; we'll help you polish it."
        style={{
          width: "100%",
          minHeight: 160,
          padding: "16px 18px",
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          backgroundColor: C.paper,
          fontFamily: FONT_SERIF,
          fontSize: 15,
          lineHeight: 1.6,
          color: C.ink,
          resize: "vertical",
          outline: "none",
        }}
      />
    </SectionShell>
  );
}

function refineBrief(current: string, keywords: string[], tone: number): string {
  const base = current.trim();
  const toneWord =
    tone < 33 ? "warm and golden" : tone < 66 ? "balanced, softly editorial" : "cool, moody, and desaturated";
  const kwPart = keywords.length ? `Key notes: ${keywords.slice(0, 5).join(", ")}.` : "";
  const lead = base
    ? `${base}\n\n`
    : "You're drawn to images that feel found, not made — moments where people forget the camera and the photograph just happens. ";
  return `${lead}The overall palette leans ${toneWord}. Prioritise the candid register: in-between expressions, the tail-end of a laugh, hands adjusting a dupatta, the small gestures that carry the emotion of the day. ${kwPart}`.trim();
}

// ─── Keywords ────────────────────────────────────────────────────────────
function KeywordsSection({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (k: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const toggle = (k: string) =>
    onChange(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);

  return (
    <SectionShell>
      <SectionHead
        title="Style keywords"
        hint="Tap the ones that feel right. Add your own."
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {selected.map((k) => (
          <Pill key={k} filled onRemove={() => toggle(k)}>
            {k}
          </Pill>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          paddingTop: 14,
          borderTop: `1px dashed ${C.lineSoft}`,
        }}
      >
        {SUGGESTED_KEYWORDS.filter((k) => !selected.includes(k)).map((k) => (
          <Pill key={k} onClick={() => toggle(k)}>
            {k}
          </Pill>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = draft.trim();
            if (v && !selected.includes(v)) onChange([...selected, v]);
            setDraft("");
          }}
          style={{ display: "inline-flex" }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="+ add your own"
            style={{
              padding: "6px 12px",
              border: `1px dashed ${C.line}`,
              borderRadius: 999,
              backgroundColor: "transparent",
              fontSize: 12,
              color: C.inkSoft,
              outline: "none",
              minWidth: 140,
            }}
          />
        </form>
      </div>
    </SectionShell>
  );
}

// ─── Tone & Colour ───────────────────────────────────────────────────────
// Live preview: a sample wedding photo re-grades in real-time as the slider
// moves from warm & golden to cool, moody & desaturated. CSS `filter` is
// used to approximate how a photographer might grade the image. Swatches
// remain below for reference, but the photo is the hero.
const TONE_PREVIEW_SOURCES: Array<{ id: string; url: string; label: string }> = [
  {
    id: "skin",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
    label: "Skin tones",
  },
  {
    id: "fabric",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900",
    label: "Fabric & detail",
  },
  {
    id: "greens",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900",
    label: "Greenery & light",
  },
];

function cssFilterForScore(score: number): string {
  // score 0 = warm+golden, 50 = balanced, 100 = cool, moody, desaturated.
  const warmth = (50 - score) / 50; // +1 = warm, -1 = cool
  const hue = warmth > 0 ? `${-6 * warmth}deg` : `${12 * -warmth}deg`;
  const saturate = 1 + 0.15 * warmth - 0.35 * Math.max(0, -warmth);
  const bright = 1 + 0.04 * warmth - 0.08 * Math.max(0, -warmth);
  const contrast = 1 + 0.04 * -warmth;
  const sepia = warmth > 0 ? 0.25 * warmth : 0;
  const gray = warmth < 0 ? 0.18 * -warmth : 0;
  return `sepia(${sepia.toFixed(2)}) grayscale(${gray.toFixed(
    2,
  )}) saturate(${saturate.toFixed(2)}) contrast(${contrast.toFixed(
    2,
  )}) brightness(${bright.toFixed(2)}) hue-rotate(${hue})`;
}

function ToneSection({ score, onChange }: { score: number; onChange: (v: number) => void }) {
  const [previewIdx, setPreviewIdx] = useState(0);
  const palette = palettesForScore(score);
  const preview = TONE_PREVIEW_SOURCES[previewIdx]!;
  const filter = cssFilterForScore(score);
  const toneWord =
    score < 33 ? "Warm & golden" : score < 66 ? "Softly editorial" : "Cool & moody";

  return (
    <SectionShell>
      <SectionHead
        title="Colour & tone"
        hint="Slide to see how your photos will feel. The same frame, re-graded in real-time."
      />
      <div
        style={{
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${C.line}`,
          marginBottom: 16,
          backgroundColor: C.paper,
        }}
      >
        <div
          style={{
            position: "relative",
            height: "min(50vh, 360px)",
            backgroundColor: C.ivorySoft,
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={preview.id}
            src={preview.url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter,
              transition: "filter 0.25s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(26, 26, 26, 0.55)",
              color: C.ivory,
              padding: "4px 10px",
              borderRadius: 2,
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {toneWord} · {score}
          </div>
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "inline-flex",
              gap: 4,
              backgroundColor: "rgba(255, 253, 247, 0.85)",
              padding: 4,
              borderRadius: 999,
            }}
          >
            {TONE_PREVIEW_SOURCES.map((src, i) => (
              <button
                key={src.id}
                onClick={() => setPreviewIdx(i)}
                title={src.label}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `1px solid ${i === previewIdx ? C.goldDeep : "transparent"}`,
                  background: i === previewIdx ? C.ink : C.paper,
                  color: i === previewIdx ? C.ivory : C.muted,
                  fontSize: 10,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: C.muted,
              marginBottom: 8,
            }}
          >
            <span>Warm &amp; golden</span>
            <span>Cool, moody &amp; desaturated</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={score}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.goldDeep }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderRadius: 2, overflow: "hidden" }}>
        {palette.map((hex) => (
          <div key={hex} style={{ flex: 1 }}>
            <div style={{ height: 40, backgroundColor: hex }} />
            <div
              style={{
                padding: "4px 4px",
                fontSize: 10,
                fontFamily: "ui-monospace, monospace",
                color: C.muted,
                textAlign: "center",
                backgroundColor: C.overlay,
              }}
            >
              {hex}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function palettesForScore(score: number): string[] {
  if (score < 33) return ["#E8B872", "#C98A4B", "#A85C3B", "#7A3E2B", "#F2E6C9"];
  if (score < 66) return ["#D9BF84", "#B89352", "#8F6B2E", "#6E5A3A", "#F6EFDE"];
  return ["#A8A590", "#7A8074", "#4E5A5B", "#2F3A3E", "#D3CFC1"];
}

// ─── Moodboard ───────────────────────────────────────────────────────────
function MoodboardSection({
  images,
  activeTag,
  setActiveTag,
  onAdd,
  onUpdate,
  onRemove,
}: {
  images: MoodImage[];
  activeTag: MoodboardTag | "all";
  setActiveTag: (t: MoodboardTag | "all") => void;
  onAdd: (m: MoodImage) => void;
  onUpdate: (id: string, p: Partial<MoodImage>) => void;
  onRemove: (id: string) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const tags: Array<{ id: MoodboardTag | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "eyes", label: "Eyes" },
    { id: "composition", label: "Composition" },
    { id: "mood", label: "Mood" },
    { id: "detail", label: "Detail" },
  ];

  const filtered = activeTag === "all" ? images : images.filter((i) => i.tag === activeTag);

  const addUrl = (url: string) => {
    if (!url.trim()) return;
    onAdd({ id: uid(), url: url.trim(), tag: "mood", note: "" });
    setUrlDraft("");
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => onAdd({ id: uid(), url: String(reader.result), tag: "mood", note: "" });
      reader.readAsDataURL(f);
    });
  };

  return (
    <SectionShell>
      <SectionHead
        title="Moodboard"
        hint="Paste URLs, drop files, tag each pin so your photographer knows what to study."
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addUrl(urlDraft);
          }}
          style={{ display: "flex", gap: 6, flex: 1, minWidth: 260 }}
        >
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste an image URL…"
            style={inputStyle()}
          />
          <button type="submit" style={secondaryButtonStyle()}>
            Add
          </button>
        </form>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <button onClick={() => fileRef.current?.click()} style={secondaryButtonStyle()}>
          ⬆ Upload
        </button>
        <div style={{ display: "inline-flex", gap: 4, marginLeft: "auto" }}>
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.id)}
              style={{
                padding: "5px 12px",
                fontSize: 11.5,
                border: `1px solid ${activeTag === t.id ? C.goldDeep : C.line}`,
                backgroundColor: activeTag === t.id ? C.ink : "transparent",
                color: activeTag === t.id ? C.ivory : C.muted,
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📷"
          title="Drop inspiration here."
          body="Tag each pin so your photographer knows what to study — eyes, composition, mood, or detail."
          dashed
          onDrop={onFiles}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
        >
          {filtered.map((img) => (
            <MoodCard
              key={img.id}
              img={img}
              onChange={(p) => onUpdate(img.id, p)}
              onRemove={() => onRemove(img.id)}
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function MoodCard({
  img,
  onChange,
  onRemove,
}: {
  img: MoodImage;
  onChange: (p: Partial<MoodImage>) => void;
  onRemove: () => void;
}) {
  const tagOptions: MoodboardTag[] = ["eyes", "composition", "mood", "detail"];
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/uri-list", img.url);
        e.dataTransfer.setData("text/plain", img.url);
        e.dataTransfer.effectAllowed = "copy";
      }}
      style={{
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 5", backgroundColor: C.overlay }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <button
          onClick={onRemove}
          title="Remove"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            border: "none",
            background: "rgba(46, 36, 24, 0.7)",
            color: C.ivory,
            borderRadius: "50%",
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <select
          value={img.tag}
          onChange={(e) => onChange({ tag: e.target.value as MoodboardTag })}
          style={{
            padding: "4px 8px",
            fontSize: 11,
            border: `1px solid ${C.line}`,
            borderRadius: 2,
            backgroundColor: C.ivorySoft,
            color: C.inkSoft,
            outline: "none",
            textTransform: "capitalize",
          }}
        >
          {tagOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={img.note}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="What I love about this…"
          style={{
            padding: "6px 8px",
            fontSize: 12,
            border: "none",
            borderBottom: `1px solid ${C.lineSoft}`,
            backgroundColor: "transparent",
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            color: C.inkSoft,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

// ─── Event gallery ───────────────────────────────────────────────────────
function EventGallerySection({
  events,
  onUpdate,
}: {
  events: EventBlock[];
  onUpdate: (e: EventBlock[]) => void;
}) {
  const [openKey, setOpenKey] = useState<string>(events[0]?.key ?? "");

  const updateEvent = (key: string, patch: Partial<EventBlock>) =>
    onUpdate(events.map((e) => (e.key === key ? { ...e, ...patch } : e)));

  return (
    <SectionShell>
      <SectionHead
        title="Reference gallery by event"
        hint="Browse our suggestions, add your own, tell us what you love."
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {events.map((e) => {
          const loved = e.refs.filter((r) => r.reaction === "love").length;
          const isOpen = openKey === e.key;
          return (
            <button
              key={e.key}
              onClick={() => setOpenKey(e.key)}
              style={{
                padding: "9px 16px",
                border: `1px solid ${isOpen ? C.goldDeep : C.line}`,
                backgroundColor: isOpen ? C.ink : C.paper,
                color: isOpen ? C.ivory : C.inkSoft,
                borderRadius: 2,
                cursor: "pointer",
                fontFamily: FONT_SERIF,
                fontSize: 15,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {e.label}
              {loved > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 999,
                    backgroundColor: isOpen ? C.goldSoft : C.champagnePale,
                    color: isOpen ? C.ink : C.goldDeep,
                    fontFamily: FONT_SANS,
                  }}
                >
                  ♡ {loved}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {events
        .filter((e) => e.key === openKey)
        .map((e) => (
          <EventBlockView key={e.key} event={e} onUpdate={(patch) => updateEvent(e.key, patch)} />
        ))}
    </SectionShell>
  );
}

function EventBlockView({
  event,
  onUpdate,
}: {
  event: EventBlock;
  onUpdate: (p: Partial<EventBlock>) => void;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [desireDraft, setDesireDraft] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setReaction = (id: string, r: Reaction) =>
    onUpdate({
      refs: event.refs.map((ref) => (ref.id === id ? { ...ref, reaction: r } : ref)),
    });

  const setNote = (id: string, note: string) =>
    onUpdate({ refs: event.refs.map((ref) => (ref.id === id ? { ...ref, note } : ref)) });

  const addUserRef = () => {
    if (!urlDraft.trim()) return;
    onUpdate({
      refs: [
        ...event.refs,
        { id: uid(), url: urlDraft.trim(), note: "", reaction: null, source: "user" },
      ],
    });
    setUrlDraft("");
  };

  const addDesire = (e: React.FormEvent) => {
    e.preventDefault();
    const v = desireDraft.trim();
    if (!v) return;
    onUpdate({ desires: [...event.desires, v] });
    setDesireDraft("");
  };

  const removeDesire = (i: number) =>
    onUpdate({ desires: event.desires.filter((_, idx) => idx !== i) });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((f) => {
        const reader = new FileReader();
        reader.onload = () =>
          onUpdate({
            refs: [
              ...event.refs,
              {
                id: uid(),
                url: String(reader.result),
                note: "",
                reaction: null,
                source: "user",
              },
            ],
          });
        reader.readAsDataURL(f);
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedUrl = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (droppedUrl && /^https?:\/\//.test(droppedUrl.trim())) {
      onUpdate({
        refs: [
          ...event.refs,
          {
            id: uid(),
            url: droppedUrl.trim(),
            note: "",
            reaction: null,
            source: "user",
          },
        ],
      });
      return;
    }
    handleFiles(e.dataTransfer.files);
  };

  const moveRef = (id: string, delta: number) => {
    const idx = event.refs.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const target = idx + delta;
    if (target < 0 || target >= event.refs.length) return;
    const next = [...event.refs];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved!);
    onUpdate({ refs: next });
  };

  return (
    <div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 16,
          color: C.muted,
          marginBottom: 14,
        }}
      >
        What should <strong style={{ color: C.ink }}>{event.label}</strong> photos feel like?
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 12,
          padding: isDragOver ? 10 : 0,
          border: isDragOver ? `1.5px dashed ${C.goldDeep}` : "1.5px dashed transparent",
          backgroundColor: isDragOver ? C.overlay : "transparent",
          borderRadius: 4,
          transition: "padding 0.15s, background 0.15s",
        }}
      >
        {event.refs.map((ref, i) => (
          <EventRefCard
            key={ref.id}
            ref_={ref}
            onReact={setReaction}
            onNote={setNote}
            canMoveLeft={i > 0}
            canMoveRight={i < event.refs.length - 1}
            onMoveLeft={() => moveRef(ref.id, -1)}
            onMoveRight={() => moveRef(ref.id, 1)}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: C.faint,
          marginBottom: 18,
          fontStyle: "italic",
        }}
      >
        Drop images here from your desktop, the moodboard, or the Inspiration tab.
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 24, maxWidth: 480, flexWrap: "wrap" }}>
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder={`Paste an image URL for ${event.label}…`}
          style={inputStyle()}
        />
        <button onClick={addUserRef} style={secondaryButtonStyle()}>
          Add
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <button onClick={() => fileRef.current?.click()} style={secondaryButtonStyle()}>
          ⬆ Upload
        </button>
      </div>

      <SubsectionHead>I definitely want …</SubsectionHead>
      <form onSubmit={addDesire} style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          value={desireDraft}
          onChange={(e) => setDesireDraft(e.target.value)}
          placeholder={`e.g. Candid shots of Mom's expressions during ${event.label}…`}
          style={inputStyle()}
        />
        <button type="submit" style={secondaryButtonStyle()}>
          Add
        </button>
      </form>
      {event.desires.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {event.desires.map((d, i) => (
            <li
              key={i}
              style={{
                padding: "10px 14px",
                backgroundColor: C.overlay,
                border: `1px solid ${C.lineSoft}`,
                borderLeft: `2px solid ${C.goldDeep}`,
                borderRadius: 2,
                fontFamily: FONT_SERIF,
                fontSize: 15,
                color: C.ink,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>
                <span style={{ color: C.goldDeep, marginRight: 8 }}>✦</span>
                {d}
              </span>
              <button
                onClick={() => removeDesire(i)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  cursor: "pointer",
                  fontSize: 14,
                }}
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EventRefCard({
  ref_,
  onReact,
  onNote,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
}: {
  ref_: EventRef;
  onReact: (id: string, r: Reaction) => void;
  onNote: (id: string, note: string) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}) {
  const isLoved = ref_.reaction === "love";
  const isSkipped = ref_.reaction === "skip";
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/uri-list", ref_.url);
        e.dataTransfer.setData("text/plain", ref_.url);
        e.dataTransfer.effectAllowed = "copy";
      }}
      style={{
        border: `1px solid ${isLoved ? C.goldDeep : C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        overflow: "hidden",
        opacity: isSkipped ? 0.4 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4 / 5", backgroundColor: C.ivorySoft }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ref_.url}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {ref_.source === "ai" && (
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              backgroundColor: "rgba(46, 36, 24, 0.75)",
              color: C.ivory,
              padding: "2px 8px",
              borderRadius: 2,
              fontSize: 9.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ✦ Suggested
          </span>
        )}
        {(onMoveLeft || onMoveRight) && (
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              display: "inline-flex",
              gap: 2,
            }}
          >
            {onMoveLeft && (
              <button
                onClick={onMoveLeft}
                disabled={!canMoveLeft}
                title="Move left"
                style={{
                  border: "none",
                  background: "rgba(46, 36, 24, 0.7)",
                  color: C.ivory,
                  borderRadius: 2,
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  cursor: canMoveLeft ? "pointer" : "default",
                  opacity: canMoveLeft ? 1 : 0.4,
                  padding: 0,
                }}
              >
                ←
              </button>
            )}
            {onMoveRight && (
              <button
                onClick={onMoveRight}
                disabled={!canMoveRight}
                title="Move right"
                style={{
                  border: "none",
                  background: "rgba(46, 36, 24, 0.7)",
                  color: C.ivory,
                  borderRadius: 2,
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  cursor: canMoveRight ? "pointer" : "default",
                  opacity: canMoveRight ? 1 : 0.4,
                  padding: 0,
                }}
              >
                →
              </button>
            )}
          </div>
        )}
      </div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onReact(ref_.id, isLoved ? null : "love")}
            style={{
              flex: 1,
              padding: "4px 0",
              fontSize: 11,
              border: `1px solid ${isLoved ? C.goldDeep : C.line}`,
              backgroundColor: isLoved ? C.goldSoft : "transparent",
              color: isLoved ? C.ink : C.muted,
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            ♡ Love
          </button>
          <button
            onClick={() => onReact(ref_.id, isSkipped ? null : "skip")}
            style={{
              flex: 1,
              padding: "4px 0",
              fontSize: 11,
              border: `1px solid ${C.line}`,
              backgroundColor: isSkipped ? C.ivorySoft : "transparent",
              color: C.muted,
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            Not for us
          </button>
        </div>
        {isLoved && (
          <input
            value={ref_.note}
            onChange={(e) => onNote(ref_.id, e.target.value)}
            placeholder="What I love about this…"
            style={{
              padding: "4px 0",
              fontSize: 11.5,
              border: "none",
              borderBottom: `1px solid ${C.lineSoft}`,
              backgroundColor: "transparent",
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              color: C.inkSoft,
              outline: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Moments wishlist ────────────────────────────────────────────────────
function MomentsSection({
  moments,
  onChange,
}: {
  moments: string[];
  onChange: (m: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (!t) return;
    onChange([...moments, t]);
    setDraft("");
  };
  const suggest = () => {
    const fresh = MOMENT_SUGGESTIONS.filter((s) => !moments.includes(s)).slice(0, 3);
    onChange([...moments, ...fresh]);
  };
  return (
    <SectionShell>
      <SectionHead
        title="Expression & moment wishlist"
        hint="Not a shot list — your emotional input. The expressions and beats you want captured."
        right={
          <button style={textButtonStyle()} onClick={suggest}>
            ✨ Suggest moments
          </button>
        }
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
        }}
        style={{ display: "flex", gap: 6, marginBottom: 14 }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. My dad trying not to cry …"
          style={inputStyle()}
        />
        <button type="submit" style={secondaryButtonStyle()}>
          Add
        </button>
      </form>
      {moments.length === 0 ? (
        <EmptyState
          icon="✶"
          title="List the moments you can't miss."
          body="Your photographer reads these first. Tell them the expressions and beats that, if missed, would break your heart."
        />
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {moments.map((m, i) => (
            <li
              key={i}
              style={{
                padding: "12px 16px",
                backgroundColor: C.paper,
                border: `1px solid ${C.line}`,
                borderLeft: `3px solid ${C.goldDeep}`,
                borderRadius: 2,
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: 16,
                color: C.ink,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              "{m}"
              <button
                onClick={() => onChange(moments.filter((_, idx) => idx !== i))}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}

// ─── Exclusions ──────────────────────────────────────────────────────────
function ExclusionsSection({
  open,
  setOpen,
  items,
  onChange,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  items: string[];
  onChange: (i: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <SectionShell>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 22,
            color: C.ink,
          }}
        >
          Please don't include
        </span>
        <span style={{ color: C.muted, fontSize: 18 }}>{open ? "−" : "+"}</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: C.muted,
          }}
        >
          Every couple has preferences — note anything you'd rather leave out.
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 16 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = draft.trim();
              if (v) onChange([...items, v]);
              setDraft("");
            }}
            style={{ display: "flex", gap: 6, marginBottom: 12 }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. No cheesy posed kissing shots…"
              style={inputStyle()}
            />
            <button type="submit" style={secondaryButtonStyle()}>
              Add
            </button>
          </form>
          {items.map((x, i) => (
            <div
              key={i}
              style={{
                padding: "8px 12px",
                backgroundColor: C.ivorySoft,
                border: `1px dashed ${C.line}`,
                borderRadius: 2,
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: C.inkSoft,
              }}
            >
              <span>— {x}</span>
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.muted,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tab 2 — Group Photos
// ─────────────────────────────────────────────────────────────────────────
export function GroupsTab({
  state,
  update,
}: {
  state: PhotoState;
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
}) {
  const [runMode, setRunMode] = useState(false);

  const addGroup = (seed?: { name?: string; ids?: string[]; slot?: string }) => {
    update((s) => ({
      groupPhotos: [
        ...s.groupPhotos,
        {
          id: uid(),
          name: seed?.name ?? "New group",
          peopleIds: seed?.ids ?? [],
          timeSlot: seed?.slot ?? "",
          message: `It's time for your group photo! Please head to the ${
            seed?.slot?.toLowerCase() ?? "photo location"
          }. — Ananya & Arjun via Ananya`,
          status: "pending",
        },
      ],
    }));
  };

  const updateGroup = (id: string, patch: Partial<GroupPhoto>) =>
    update((s) => ({
      groupPhotos: s.groupPhotos.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));

  const removeGroup = (id: string) =>
    update((s) => ({ groupPhotos: s.groupPhotos.filter((g) => g.id !== id) }));

  const moveGroup = (id: string, delta: number) =>
    update((s) => {
      const idx = s.groupPhotos.findIndex((g) => g.id === id);
      if (idx < 0) return {};
      const target = idx + delta;
      if (target < 0 || target >= s.groupPhotos.length) return {};
      const next = [...s.groupPhotos];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved!);
      return { groupPhotos: next };
    });

  const suggestStandard = () => {
    const existing = new Set(state.groupPhotos.map((g) => g.name));
    const fresh = STANDARD_GROUPS.filter((s) => !existing.has(s.name));
    fresh.forEach((s) => addGroup(s));
  };

  const totalPeople = useMemo(() => {
    const set = new Set<string>();
    state.groupPhotos.forEach((g) => g.peopleIds.forEach((id) => set.add(id)));
    return set.size;
  }, [state.groupPhotos]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div
        style={{
          backgroundColor: C.overlay,
          border: `1px solid ${C.lineSoft}`,
          padding: "24px 28px",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: 8,
          }}
        >
          Day-of coordination
        </div>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 24,
            margin: "0 0 6px",
            color: C.ink,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Plan them now, run them fast on the day.
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: C.muted,
            margin: 0,
            maxWidth: 680,
            lineHeight: 1.55,
          }}
        >
          Group photos are the #1 cause of timeline delays. Plan every combination now, and on the
          day, tap a button to text guests when it's their turn.
        </p>
      </div>

      <SectionShell>
        <SectionHead
          title="Group photo builder"
          hint={
            state.groupPhotos.length
              ? `${state.groupPhotos.length} groups · ${totalPeople} people total`
              : "Start with our suggestions, or build your own."
          }
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={suggestStandard} style={textButtonStyle()}>
                ✨ Suggest standard groups
              </button>
              <button onClick={() => addGroup()} style={secondaryButtonStyle()}>
                + New group
              </button>
              {state.groupPhotos.length > 0 && (
                <button
                  onClick={() => setRunMode((v) => !v)}
                  style={runMode ? primaryButtonStyle() : secondaryButtonStyle()}
                >
                  {runMode ? "● Running" : "Run group photos"}
                </button>
              )}
            </div>
          }
        />

        {state.groupPhotos.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Start planning your group shots."
            body="Tap 'Suggest standard groups' for a culturally-aware Indian wedding default set, or build your own."
          />
        ) : runMode ? (
          <RunModeList
            groups={state.groupPhotos}
            guests={MOCK_GUESTS}
            onStatus={(id, status) => updateGroup(id, { status })}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {state.groupPhotos.map((g, i) => (
              <GroupCard
                key={g.id}
                group={g}
                guests={MOCK_GUESTS}
                index={i}
                onChange={(p) => updateGroup(g.id, p)}
                onRemove={() => removeGroup(g.id)}
                onMoveUp={() => moveGroup(g.id, -1)}
                onMoveDown={() => moveGroup(g.id, 1)}
                onNotify={() => updateGroup(g.id, { status: "notified" })}
              />
            ))}
          </div>
        )}
      </SectionShell>

      <VIPSection
        vips={state.vips}
        guests={MOCK_GUESTS}
        onUpdate={(vips) => update({ vips })}
      />
    </div>
  );
}

function GroupCard({
  group,
  guests,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onNotify,
}: {
  group: GroupPhoto;
  guests: Guest[];
  index: number;
  onChange: (p: Partial<GroupPhoto>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onNotify: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [guestQuery, setGuestQuery] = useState("");
  const members = group.peopleIds
    .map((id) => guests.find((g) => g.id === id))
    .filter(Boolean) as Guest[];

  const matches = guestQuery
    ? guests.filter(
        (g) =>
          !group.peopleIds.includes(g.id) &&
          g.name.toLowerCase().includes(guestQuery.toLowerCase()),
      )
    : [];

  const addPerson = (id: string) => {
    onChange({ peopleIds: [...group.peopleIds, id] });
    setGuestQuery("");
  };
  const removePerson = (id: string) =>
    onChange({ peopleIds: group.peopleIds.filter((x) => x !== id) });

  const visibleMembers = expanded ? members : members.slice(0, 10);
  const overflow = members.length - visibleMembers.length;

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 13,
            color: C.faint,
            width: 22,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 17,
            color: C.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
            flex: "0 1 auto",
          }}
        >
          {group.name || "Untitled group"}
        </span>
        {group.timeSlot && (
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              backgroundColor: C.overlay,
              border: `1px solid ${C.lineSoft}`,
              fontSize: 11,
              color: C.muted,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {group.timeSlot}
          </span>
        )}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: -4,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{ display: "inline-flex", marginRight: 8 }}>
            {visibleMembers.slice(0, 8).map((m, i) => (
              <span
                key={m.id}
                title={`${m.name} · ${m.relationship}`}
                style={{
                  marginLeft: i === 0 ? 0 : -6,
                  display: "inline-block",
                  borderRadius: "50%",
                  boxShadow: `0 0 0 1.5px ${C.paper}`,
                }}
              >
                <Avatar name={m.name} side={m.side} size={24} />
              </span>
            ))}
            {overflow > 0 && (
              <span
                style={{
                  marginLeft: -6,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: C.overlay,
                  border: `1px solid ${C.line}`,
                  color: C.muted,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontFamily: FONT_SANS,
                }}
              >
                +{overflow}
              </span>
            )}
          </div>
          <span style={{ fontSize: 11.5, color: C.muted, whiteSpace: "nowrap" }}>
            {members.length} {members.length === 1 ? "person" : "people"}
          </span>
        </div>
        <StatusBadge status={group.status} />
        <span
          style={{
            color: C.muted,
            fontSize: 14,
            flexShrink: 0,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          ›
        </span>
      </div>

      {expanded && (
        <div
          style={{
            padding: "0 14px 16px 14px",
            borderTop: `1px solid ${C.lineSoft}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "14px 0 12px",
              flexWrap: "wrap",
            }}
          >
            <input
              value={group.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Group name"
              style={{
                flex: 1,
                minWidth: 200,
                fontFamily: FONT_SERIF,
                fontSize: 18,
                color: C.ink,
                border: "none",
                borderBottom: `1px dashed ${C.lineSoft}`,
                backgroundColor: "transparent",
                outline: "none",
                padding: "2px 0",
              }}
            />
            <input
              value={group.timeSlot}
              onChange={(e) => onChange({ timeSlot: e.target.value })}
              placeholder="When? e.g. After ceremony"
              style={{
                padding: "4px 10px",
                fontSize: 11.5,
                border: `1px solid ${C.line}`,
                borderRadius: 999,
                backgroundColor: C.overlay,
                color: C.inkSoft,
                outline: "none",
              }}
            />
            <button onClick={onMoveUp} style={iconButtonStyle()} title="Move up">
              ↑
            </button>
            <button onClick={onMoveDown} style={iconButtonStyle()} title="Move down">
              ↓
            </button>
          </div>

          {members.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {members.map((m) => (
                <div
                  key={m.id}
                  title={`${m.name} · ${m.relationship}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 6px 3px 3px",
                    border: `1px solid ${C.line}`,
                    borderRadius: 999,
                    backgroundColor: C.overlay,
                    fontSize: 11.5,
                    color: C.inkSoft,
                  }}
                >
                  <Avatar name={m.name} side={m.side} size={22} />
                  <span>{m.name.split(" ")[0]}</span>
                  <button
                    onClick={() => removePerson(m.id)}
                    title="Remove"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: C.muted,
                      cursor: "pointer",
                      padding: "0 3px",
                      fontSize: 13,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ position: "relative", maxWidth: 320, marginBottom: 14 }}>
            <input
              value={guestQuery}
              onChange={(e) => setGuestQuery(e.target.value)}
              placeholder="+ add from guest list"
              style={inputStyle()}
            />
            {matches.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  backgroundColor: C.paper,
                  border: `1px solid ${C.line}`,
                  borderRadius: 2,
                  boxShadow: "0 6px 16px rgba(46, 36, 24, 0.08)",
                  maxHeight: 200,
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {matches.slice(0, 6).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => addPerson(g.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Avatar name={g.name} side={g.side} />
                    <span style={{ fontSize: 13, color: C.ink }}>{g.name}</span>
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
                      {g.relationship}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={onNotify}
              disabled={group.status === "done" || members.length === 0}
              style={{
                ...primaryButtonStyle(),
                opacity: group.status === "done" || members.length === 0 ? 0.5 : 1,
              }}
            >
              📱 Notify group
            </button>
            <button onClick={() => setEditingMessage((v) => !v)} style={textButtonStyle()}>
              {editingMessage ? "Hide message" : "Edit message"}
            </button>
            <button
              onClick={() =>
                onChange({
                  status: group.status === "done" ? "notified" : "done",
                })
              }
              style={textButtonStyle()}
            >
              {group.status === "done" ? "Undo photo taken" : "Mark photo taken"}
            </button>
            <button onClick={onRemove} style={{ ...textButtonStyle(), color: C.danger, marginLeft: "auto" }}>
              Delete
            </button>
          </div>

          {editingMessage && (
            <textarea
              value={group.message}
              onChange={(e) => onChange({ message: e.target.value })}
              rows={3}
              style={{
                marginTop: 10,
                width: "100%",
                padding: 10,
                border: `1px solid ${C.line}`,
                borderRadius: 2,
                backgroundColor: C.overlay,
                fontSize: 13,
                fontFamily: FONT_SANS,
                color: C.inkSoft,
                resize: "vertical",
                outline: "none",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: GroupPhoto["status"] }) {
  const map: Record<GroupPhoto["status"], { label: string; bg: string; fg: string }> = {
    pending: { label: "Not notified", bg: C.ivorySoft, fg: C.muted },
    notified: { label: "Notified", bg: C.champagnePale, fg: C.goldDeep },
    done: { label: "Photo taken", bg: "#E5EBDB", fg: C.leaf },
  };
  const s = map[status];
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 10.5,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        backgroundColor: s.bg,
        color: s.fg,
        fontWeight: 500,
      }}
    >
      {s.label}
    </span>
  );
}

function RunModeList({
  groups,
  guests,
  onStatus,
}: {
  groups: GroupPhoto[];
  guests: Guest[];
  onStatus: (id: string, status: GroupPhoto["status"]) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {groups.map((g, i) => {
        const members = g.peopleIds.length;
        const done = g.status === "done";
        return (
          <div
            key={g.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              border: `1px solid ${done ? C.leaf : C.line}`,
              backgroundColor: done ? "#F1F5E9" : C.paper,
              borderRadius: 2,
              opacity: done ? 0.6 : 1,
            }}
          >
            <button
              onClick={() => onStatus(g.id, done ? "pending" : "done")}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                border: `1.5px solid ${done ? C.leaf : C.muted}`,
                backgroundColor: done ? C.leaf : "transparent",
                color: C.ivory,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {done ? "✓" : ""}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: 18,
                  color: C.ink,
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {i + 1}. {g.name}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {members} {members === 1 ? "person" : "people"}
                {g.timeSlot ? ` · ${g.timeSlot}` : ""}
              </div>
            </div>
            {g.status === "pending" ? (
              <button onClick={() => onStatus(g.id, "notified")} style={secondaryButtonStyle()}>
                📱 Notify
              </button>
            ) : (
              <StatusBadge status={g.status} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── VIPs ────────────────────────────────────────────────────────────────
function VIPSection({
  vips,
  guests,
  onUpdate,
}: {
  vips: VIP[];
  guests: Guest[];
  onUpdate: (v: VIP[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);
  const available = guests.filter(
    (g) => !vips.some((v) => v.guestId === g.id) && g.name.toLowerCase().includes(query.toLowerCase()),
  );

  const add = (guestId: string) => {
    onUpdate([
      ...vips,
      {
        id: uid(),
        guestId,
        tier: "immediate",
        mustCapture: true,
        note: "",
      },
    ]);
    setQuery("");
    setPickerOpen(false);
  };

  const patch = (id: string, p: Partial<VIP>) =>
    onUpdate(vips.map((v) => (v.id === id ? { ...v, ...p } : v)));
  const remove = (id: string) => onUpdate(vips.filter((v) => v.id !== id));

  return (
    <SectionShell>
      <SectionHead
        title="VIP flags"
        hint="Specific people who need special photo attention. Your photographer sees this up front."
      />
      {vips.length === 0 ? (
        <div
          style={{
            border: `1px dashed ${C.line}`,
            backgroundColor: C.overlay,
            borderRadius: 8,
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, color: C.goldDeep, marginBottom: 10 }}>✦</div>
          <h4
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 20,
              color: C.ink,
              fontWeight: 700,
              margin: "0 0 6px",
            }}
          >
            Flag someone you can't miss.
          </h4>
          <p
            style={{
              fontSize: 13,
              color: C.muted,
              margin: "0 auto 18px",
              maxWidth: 440,
              lineHeight: 1.55,
            }}
          >
            Flag a 'must capture' person from your guest list — add a photo and a note your
            photographer will read before the day.
          </p>
          <button
            onClick={() => {
              setPickerOpen(true);
              setTimeout(() => pickerRef.current?.focus(), 0);
            }}
            style={primaryButtonStyle()}
          >
            + Flag a VIP from guest list
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {vips.map((v) => {
            const g = guests.find((x) => x.id === v.guestId);
            if (!g) return null;
            return (
              <div
                key={v.id}
                style={{
                  border: `1px solid ${C.line}`,
                  borderLeft: `3px solid ${v.mustCapture ? C.goldDeep : C.line}`,
                  backgroundColor: C.paper,
                  borderRadius: 2,
                  padding: 14,
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <VipPhotoSlot
                  photoUrl={v.photoUrl}
                  name={g.name}
                  side={g.side}
                  onChange={(url) => patch(v.id, { photoUrl: url })}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_SERIF, fontSize: 18, color: C.ink }}>
                      {g.name}
                    </span>
                    <span style={{ fontSize: 12, color: C.muted }}>
                      {g.relationship}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <SelectPill
                      value={v.tier}
                      options={[
                        { v: "immediate", label: "Immediate" },
                        { v: "extended", label: "Extended" },
                        { v: "close", label: "Close" },
                      ]}
                      onChange={(tier) => patch(v.id, { tier: tier as VIP["tier"] })}
                    />
                    <span
                      style={{
                        padding: "3px 10px",
                        border: `1px solid ${C.line}`,
                        borderRadius: 999,
                        fontSize: 11,
                        color: C.muted,
                        textTransform: "capitalize",
                      }}
                    >
                      {g.side === "both" ? "Both sides" : `${g.side}'s side`}
                    </span>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 10px",
                        border: `1px solid ${v.mustCapture ? C.goldDeep : C.line}`,
                        borderRadius: 999,
                        fontSize: 11,
                        color: v.mustCapture ? C.goldDeep : C.muted,
                        cursor: "pointer",
                        backgroundColor: v.mustCapture ? C.champagnePale : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={v.mustCapture}
                        onChange={(e) => patch(v.id, { mustCapture: e.target.checked })}
                        style={{ margin: 0 }}
                      />
                      Must capture
                    </label>
                  </div>
                  <textarea
                    value={v.note}
                    onChange={(e) => patch(v.id, { note: e.target.value })}
                    placeholder="Context for your photographer — e.g. 'In wheelchair, plan accessible angles' or 'Emotional during Kanyadaan, shoot tight on face'"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: `1px solid ${C.lineSoft}`,
                      borderRadius: 2,
                      backgroundColor: C.ivorySoft,
                      fontFamily: FONT_SERIF,
                      fontStyle: "italic",
                      fontSize: 14,
                      color: C.inkSoft,
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
                <button
                  onClick={() => remove(v.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: C.muted,
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          position: "relative",
          maxWidth: 360,
          display: vips.length === 0 && !pickerOpen ? "none" : "block",
        }}
      >
        <input
          ref={pickerRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            if (!query) setPickerOpen(false);
          }}
          placeholder="+ flag someone from guest list"
          style={inputStyle()}
        />
        {query && available.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              backgroundColor: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: 2,
              boxShadow: "0 6px 16px rgba(46, 36, 24, 0.08)",
              maxHeight: 220,
              overflowY: "auto",
              zIndex: 10,
            }}
          >
            {available.slice(0, 6).map((g) => (
              <button
                key={g.id}
                onClick={() => add(g.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Avatar name={g.name} side={g.side} />
                <span style={{ fontSize: 13, color: C.ink }}>{g.name}</span>
                <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
                  {g.relationship}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function VipPhotoSlot({
  photoUrl,
  name,
  side,
  onChange,
}: {
  photoUrl?: string;
  name: string;
  side: Guest["side"];
  onChange: (url: string | undefined) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };
  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
      title={photoUrl ? "Replace photo" : "Upload a photo so your photographer can match the face"}
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: `1.5px dashed ${photoUrl ? "transparent" : C.line}`,
        backgroundColor: C.overlay,
        flexShrink: 0,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {photoUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            title="Remove photo"
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 18,
              height: 18,
              border: "none",
              borderRadius: "50%",
              background: "rgba(26, 26, 26, 0.7)",
              color: C.ivory,
              fontSize: 10,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ×
          </button>
        </>
      ) : (
        <Avatar name={name} side={side} size={44} />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: "none" }}
      />
    </div>
  );
}

function Avatar({ name, side, size = 28 }: { name: string; side: Guest["side"]; size?: number }) {
  const palette: Record<Guest["side"], string> = {
    bride: C.accent,
    groom: C.leaf,
    both: C.goldDeep,
  };
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: palette[side],
        color: C.paper,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_SERIF,
        fontSize: size * 0.42,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tab 3 — Album & Gallery (post-wedding)
// ─────────────────────────────────────────────────────────────────────────
export function AlbumTab({
  state,
  update,
}: {
  state: PhotoState;
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
}) {
  const [guestFilters, setGuestFilters] = useState<string[]>([]);
  const [guestSearch, setGuestSearch] = useState<string>("");
  const [albumView, setAlbumView] = useState<"all" | "favorites" | "review">("all");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [galleryPage, setGalleryPage] = useState(0);
  const GALLERY_PAGE_SIZE = 60;
  const toggleGuestFilter = useCallback((id: string) => {
    setGuestFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setGalleryPage(0);
  }, []);
  const clearGuestFilters = useCallback(() => {
    setGuestFilters([]);
    setGalleryPage(0);
  }, []);
  const togglePhotoSelect = useCallback((id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);
  const clearSelection = useCallback(() => setSelectedPhotoIds([]), []);

  const addCouplePhotos = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .forEach((f) => {
          const reader = new FileReader();
          reader.onload = () => {
            const url = String(reader.result);
            update((s) => ({
              album: [
                ...s.album,
                {
                  id: `couple-${uid()}`,
                  url,
                  taggedGuestIds: [],
                  confidence: "high",
                  favorite: false,
                  source: "couple",
                },
              ],
            }));
          };
          reader.readAsDataURL(f);
        });
    },
    [update],
  );

  if (state.phase !== "delivered") {
    return (
      <SectionShell>
        <EmptyState
          icon="📖"
          title="Come back after the wedding."
          body="Once your photographer delivers, this space fills with your full gallery, face tagging, smart sharing, and personalised thank-you notes."
        />
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            style={primaryButtonStyle()}
            onClick={() => update({ phase: "delivered" })}
          >
            ✦ Simulate album delivery
          </button>
        </div>
      </SectionShell>
    );
  }

  if (state.albumStatus === "empty" || state.albumStatus === "uploading") {
    return (
      <AlbumUpload
        uploading={state.albumStatus === "uploading"}
        progress={state.albumProgress}
        onUpload={() => simulateAlbumUpload(update)}
      />
    );
  }

  const filteredAlbum = state.album.filter((p) => {
    if (albumView === "favorites" && !p.favorite) return false;
    if (albumView === "review" && p.confidence !== "review") return false;
    if (guestFilters.length && !guestFilters.some((id) => p.taggedGuestIds.includes(id))) return false;
    return true;
  });
  const pagedAlbum = filteredAlbum.slice(0, (galleryPage + 1) * GALLERY_PAGE_SIZE);
  const hasMorePages = filteredAlbum.length > pagedAlbum.length;

  const guestCounts = MOCK_GUESTS.map((g) => ({
    guest: g,
    count: state.album.filter((p) => p.taggedGuestIds.includes(g.id)).length,
  })).filter((x) => x.count > 0);

  const reviewCount = state.album.filter((p) => p.confidence === "review").length;
  const favoriteCount = state.album.filter((p) => p.favorite).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <AlbumHero state={state} update={update} onAddCouplePhotos={addCouplePhotos} />

      {state.albumStatus === "uploaded" && (
        <FaceRecognitionPrompt onScan={() => simulateFaceTagging(update)} />
      )}

      {state.albumStatus === "tagged" && (
        <>
          <GuestBrowseSection
            guestCounts={guestCounts}
            activeGuestIds={guestFilters}
            onToggle={toggleGuestFilter}
            onClear={clearGuestFilters}
            search={guestSearch}
            onSearch={setGuestSearch}
          />

          <AlbumGallerySection
            photos={pagedAlbum}
            total={state.album.length}
            filteredCount={filteredAlbum.length}
            hasMore={hasMorePages}
            onLoadMore={() => setGalleryPage((p) => p + 1)}
            view={albumView}
            setView={(v) => {
              setAlbumView(v);
              setGalleryPage(0);
            }}
            reviewCount={reviewCount}
            favoriteCount={favoriteCount}
            activeGuestIds={guestFilters}
            onClearFilter={clearGuestFilters}
            selectedIds={selectedPhotoIds}
            onToggleSelect={togglePhotoSelect}
            onClearSelection={clearSelection}
            onTogglePhoto={(id, patch) =>
              update((s) => ({
                album: s.album.map((p) => (p.id === id ? { ...p, ...patch } : p)),
              }))
            }
          />

          <SmartSharingSection state={state} update={update} />

          <ThankYouNotesSection state={state} update={update} />

          <HighlightsSection photos={state.album.filter((p) => p.favorite)} />
        </>
      )}
    </div>
  );
}

function simulateAlbumUpload(
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void,
) {
  update({ albumStatus: "uploading", albumProgress: 0 });
  let pct = 0;
  const interval = setInterval(() => {
    pct += 12;
    if (pct >= 100) {
      clearInterval(interval);
      const sampleUrls = Object.values(AI_REFS).flat();
      const album: AlbumPhoto[] = sampleUrls.slice(0, 24).map((url, i) => ({
        id: `photo-${i}`,
        url,
        eventKey: EVENT_KEYS[i % EVENT_KEYS.length]!.key,
        taggedGuestIds: [],
        confidence: "high",
        favorite: false,
      }));
      update({ albumStatus: "uploaded", albumProgress: 100, album });
    } else {
      update({ albumProgress: pct });
    }
  }, 180);
}

function simulateFaceTagging(
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void,
) {
  update((s) => {
    const guestIds = MOCK_GUESTS.map((g) => g.id);
    const tagged: AlbumPhoto[] = s.album.map((p, i) => {
      const count = 1 + ((i * 7) % 4);
      const ids: string[] = [];
      for (let k = 0; k < count; k++) {
        ids.push(guestIds[(i * 3 + k * 5) % guestIds.length]!);
      }
      return {
        ...p,
        taggedGuestIds: Array.from(new Set(ids)),
        confidence: i % 5 === 0 ? "review" : "high",
      };
    });
    return { album: tagged, albumStatus: "tagged" };
  });
}

function AlbumUpload({
  uploading,
  progress,
  onUpload,
}: {
  uploading: boolean;
  progress: number;
  onUpload: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: C.overlay,
        border: `1.5px dashed ${C.line}`,
        borderRadius: 8,
        padding: "56px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: 12,
        }}
      >
        Album delivered · next step
      </div>
      <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, margin: "0 0 8px", color: C.ink, fontWeight: 700, lineHeight: 1.2 }}>
        Upload your wedding album
      </h2>
      <p
        style={{
          color: C.muted,
          margin: "0 auto 22px",
          fontSize: 13.5,
          maxWidth: 480,
          lineHeight: 1.55,
        }}
      >
        Drop the full folder your photographer delivered. Ananya will tag every guest,
        curate highlights, and help you write thank-you notes.
      </p>
      {!uploading ? (
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onUpload} style={primaryButtonStyle()}>
            Upload album folder
          </button>
          <button onClick={onUpload} style={secondaryButtonStyle()}>
            Select photos…
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 380, margin: "0 auto" }}>
          <div
            style={{
              height: 6,
              backgroundColor: C.ivorySoft,
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: C.goldDeep,
                transition: "width 0.2s",
              }}
            />
          </div>
          <div style={{ fontSize: 13, color: C.inkSoft, fontFamily: FONT_SERIF, fontStyle: "italic" }}>
            Uploading your memories — {progress}%
          </div>
        </div>
      )}
    </div>
  );
}

function AlbumHero({
  state,
  update,
  onAddCouplePhotos,
}: {
  state: PhotoState;
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
  onAddCouplePhotos: (files: FileList | null) => void;
}) {
  const tagged = state.album.filter((p) => p.taggedGuestIds.length > 0).length;
  const coupleCount = state.album.filter((p) => p.source === "couple").length;
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div
      style={{
        backgroundColor: C.overlay,
        border: `1px solid ${C.lineSoft}`,
        padding: "24px 28px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: 8,
          }}
        >
          Delivered
        </div>
        <h2 style={{ fontFamily: FONT_SERIF, fontSize: 24, margin: "0 0 4px", color: C.ink, fontWeight: 700, lineHeight: 1.2 }}>
          Your album is here.
        </h2>
        <p style={{ color: C.muted, margin: 0, fontSize: 13 }}>
          {state.album.length} photos
          {state.albumStatus === "tagged" && tagged > 0 && ` · ${tagged} tagged`}
          {coupleCount > 0 && ` · ${coupleCount} from you`}
          {" · "}delivered today
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            onAddCouplePhotos(e.target.files);
            if (fileRef.current) fileRef.current.value = "";
          }}
          style={{ display: "none" }}
        />
        <button onClick={() => fileRef.current?.click()} style={secondaryButtonStyle()}>
          + Add your own photos
        </button>
        <button style={secondaryButtonStyle()}>⬇ Download all</button>
        <button
          style={secondaryButtonStyle()}
          onClick={() => update({ albumStatus: "empty", album: [], albumProgress: 0 })}
        >
          Re-upload
        </button>
      </div>
    </div>
  );
}

function FaceRecognitionPrompt({ onScan }: { onScan: () => void }) {
  return (
    <SectionShell>
      <div
        style={{
          padding: "28px 32px",
          border: `1px solid ${C.lineSoft}`,
          backgroundColor: C.overlay,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 6,
            }}
          >
            ✨ Next step
          </div>
          <h3 style={{ fontFamily: FONT_SERIF, fontSize: 24, margin: "0 0 6px", color: C.ink, fontWeight: 700 }}>
            Tag every face in your album
          </h3>
          <p style={{ color: C.muted, margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
            Ananya will match every guest from your list to the faces in your photos — so you
            can send each person just their photos and write thank-you notes with the right image.
          </p>
        </div>
        <button onClick={onScan} style={primaryButtonStyle()}>
          Scan for faces
        </button>
      </div>
    </SectionShell>
  );
}

function GuestBrowseSection({
  guestCounts,
  activeGuestIds,
  onToggle,
  onClear,
  search,
  onSearch,
}: {
  guestCounts: Array<{ guest: Guest; count: number }>;
  activeGuestIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? guestCounts.filter(
        ({ guest }) =>
          guest.name.toLowerCase().includes(needle) ||
          guest.relationship.toLowerCase().includes(needle),
      )
    : guestCounts;
  return (
    <SectionShell>
      <SectionHead
        title="Browse by guest"
        hint={
          activeGuestIds.length > 1
            ? `Showing photos with any of ${activeGuestIds.length} selected guests.`
            : "Tap a guest to filter the gallery. Select more than one to combine."
        }
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {activeGuestIds.length > 0 && (
              <button onClick={onClear} style={textButtonStyle()}>
                Clear ({activeGuestIds.length})
              </button>
            )}
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search a name…"
              style={{
                padding: "6px 12px",
                fontSize: 12,
                border: `1px solid ${C.line}`,
                borderRadius: 999,
                backgroundColor: C.paper,
                outline: "none",
                minWidth: 200,
              }}
            />
          </div>
        }
      />
      {guestCounts.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Tag faces to browse by guest."
          body="Upload headshots in the Guests module so Ananya can match names to faces."
        />
      ) : filtered.length === 0 ? (
        <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>
          No guest matches "{search}".
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {filtered.map(({ guest, count }) => {
            const active = activeGuestIds.includes(guest.id);
            return (
              <button
                key={guest.id}
                onClick={() => onToggle(guest.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px 6px 6px",
                  border: `1px solid ${active ? C.goldDeep : C.line}`,
                  backgroundColor: active ? C.ink : C.paper,
                  color: active ? C.ivory : C.inkSoft,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                <Avatar name={guest.name} side={guest.side} />
                <span>{guest.name}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    color: active ? C.goldSoft : C.faint,
                    letterSpacing: "0.04em",
                  }}
                >
                  {count} {count === 1 ? "photo" : "photos"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

function AlbumGallerySection({
  photos,
  total,
  filteredCount,
  hasMore,
  onLoadMore,
  view,
  setView,
  reviewCount,
  favoriteCount,
  activeGuestIds,
  onClearFilter,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onTogglePhoto,
}: {
  photos: AlbumPhoto[];
  total: number;
  filteredCount: number;
  hasMore: boolean;
  onLoadMore: () => void;
  view: "all" | "favorites" | "review";
  setView: (v: "all" | "favorites" | "review") => void;
  reviewCount: number;
  favoriteCount: number;
  activeGuestIds: string[];
  onClearFilter: () => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onTogglePhoto: (id: string, patch: Partial<AlbumPhoto>) => void;
}) {
  const activeGuests = activeGuestIds
    .map((id) => MOCK_GUESTS.find((g) => g.id === id))
    .filter(Boolean) as Guest[];
  const views: Array<{ id: "all" | "favorites" | "review"; label: string; count?: number }> = [
    { id: "all", label: "All", count: total },
    { id: "favorites", label: "♡ Favourites", count: favoriteCount },
    { id: "review", label: "Review needed", count: reviewCount },
  ];
  const selectionActive = selectedIds.length > 0;

  return (
    <SectionShell>
      <SectionHead
        title="Gallery"
        hint="Heart the ones that stop you. Fix any tags the AI wasn't sure about."
        right={
          <div style={{ display: "flex", gap: 6 }}>
            {views.map((v) => {
              const active = view === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  style={{
                    padding: "5px 12px",
                    border: `1px solid ${active ? C.goldDeep : C.line}`,
                    backgroundColor: active ? C.ink : "transparent",
                    color: active ? C.ivory : C.muted,
                    borderRadius: 999,
                    fontSize: 11.5,
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  {v.label}
                  {v.count != null && v.count > 0 && (
                    <span style={{ marginLeft: 6, color: active ? C.goldSoft : C.faint }}>
                      {v.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        }
      />
      {activeGuests.length > 0 && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: C.champagnePale,
            border: `1px solid ${C.champagne}`,
            borderRadius: 2,
            marginBottom: 16,
            fontSize: 13,
            color: C.inkSoft,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "inline-flex" }}>
            {activeGuests.slice(0, 4).map((g, i) => (
              <span
                key={g.id}
                style={{
                  marginLeft: i === 0 ? 0 : -6,
                  borderRadius: "50%",
                  boxShadow: `0 0 0 1.5px ${C.champagnePale}`,
                  display: "inline-block",
                }}
              >
                <Avatar name={g.name} side={g.side} />
              </span>
            ))}
          </div>
          <span>
            Showing photos with{" "}
            <strong>
              {activeGuests.length === 1
                ? activeGuests[0]!.name
                : `any of ${activeGuests.length} guests`}
            </strong>
          </span>
          <button onClick={onClearFilter} style={{ ...textButtonStyle(), marginLeft: "auto" }}>
            Clear filter
          </button>
        </div>
      )}
      {photos.length === 0 ? (
        <EmptyState icon="📷" title="Widen the filter." body="No photos match this view — try a different tab above." />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {photos.map((p) => (
              <AlbumPhotoCard
                key={p.id}
                photo={p}
                onToggle={(patch) => onTogglePhoto(p.id, patch)}
                selectionActive={selectionActive}
                selected={selectedIds.includes(p.id)}
                onToggleSelect={() => onToggleSelect(p.id)}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
              color: C.muted,
            }}
          >
            <span>
              Showing {photos.length} of {filteredCount}
              {filteredCount !== total && ` (of ${total} total)`}
            </span>
            {hasMore && (
              <button onClick={onLoadMore} style={secondaryButtonStyle()}>
                Load more
              </button>
            )}
          </div>
        </>
      )}
      {selectionActive && (
        <SelectionActionBar
          count={selectedIds.length}
          onClear={onClearSelection}
          onSendToGuests={() => {
            alert(`Send ${selectedIds.length} photo(s) to specific guests (wiring pending).`);
          }}
          onAddToThankYou={() => {
            alert(
              `Queued ${selectedIds.length} photo(s) for thank-you notes (wiring pending — lives in Stationery workspace).`,
            );
          }}
          onFavorite={() => {
            selectedIds.forEach((id) => onTogglePhoto(id, { favorite: true }));
            onClearSelection();
          }}
        />
      )}
    </SectionShell>
  );
}

function SelectionActionBar({
  count,
  onClear,
  onSendToGuests,
  onAddToThankYou,
  onFavorite,
}: {
  count: number;
  onClear: () => void;
  onSendToGuests: () => void;
  onAddToThankYou: () => void;
  onFavorite: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        backgroundColor: C.ink,
        color: C.ivory,
        padding: "10px 16px",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        boxShadow: "0 8px 32px rgba(26, 26, 26, 0.25)",
        zIndex: 100,
      }}
    >
      <span style={{ fontFamily: FONT_SERIF, fontSize: 15 }}>
        {count} selected
      </span>
      <span style={{ width: 1, height: 18, backgroundColor: "rgba(251,249,244,0.2)" }} />
      <button
        onClick={onFavorite}
        style={{
          border: "none",
          background: "transparent",
          color: C.ivory,
          cursor: "pointer",
          fontSize: 12.5,
          padding: "4px 8px",
        }}
      >
        ♥ Favourite
      </button>
      <button
        onClick={onSendToGuests}
        style={{
          border: "none",
          background: "transparent",
          color: C.ivory,
          cursor: "pointer",
          fontSize: 12.5,
          padding: "4px 8px",
        }}
      >
        ✉ Send to guests
      </button>
      <button
        onClick={onAddToThankYou}
        style={{
          border: "none",
          background: "transparent",
          color: C.ivory,
          cursor: "pointer",
          fontSize: 12.5,
          padding: "4px 8px",
        }}
      >
        ✦ Add to thank-you notes
      </button>
      <button
        onClick={onClear}
        style={{
          border: "none",
          background: "transparent",
          color: C.goldSoft,
          cursor: "pointer",
          fontSize: 12.5,
          padding: "4px 8px",
          marginLeft: 4,
        }}
      >
        Clear
      </button>
    </div>
  );
}

function AlbumPhotoCard({
  photo,
  onToggle,
  selectionActive,
  selected,
  onToggleSelect,
}: {
  photo: AlbumPhoto;
  onToggle: (patch: Partial<AlbumPhoto>) => void;
  selectionActive: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const tagged = photo.taggedGuestIds
    .map((id) => MOCK_GUESTS.find((g) => g.id === id))
    .filter(Boolean) as Guest[];

  return (
    <div
      onClick={(e) => {
        if (!selectionActive) return;
        e.preventDefault();
        onToggleSelect();
      }}
      style={{
        position: "relative",
        aspectRatio: "4 / 5",
        backgroundColor: C.ivorySoft,
        borderRadius: 2,
        overflow: "hidden",
        border: `${selected ? 2 : 1}px solid ${
          selected ? C.goldDeep : photo.confidence === "review" ? "#C49056" : C.line
        }`,
        cursor: selectionActive ? "pointer" : "default",
        transition: "border-color 0.1s",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt=""
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: selectionActive && !selected ? 0.7 : 1,
          transition: "opacity 0.1s",
        }}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        title={selected ? "Deselect" : "Select"}
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          width: 22,
          height: 22,
          borderRadius: 4,
          border: `1.5px solid ${selected ? C.goldDeep : "rgba(26,26,26,0.35)"}`,
          backgroundColor: selected ? C.goldDeep : "rgba(255, 253, 247, 0.85)",
          color: selected ? C.ivory : "transparent",
          cursor: "pointer",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
          opacity: selectionActive || selected ? 1 : 0,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!selected) (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!selectionActive && !selected)
            (e.currentTarget as HTMLButtonElement).style.opacity = "0";
        }}
      >
        ✓
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle({ favorite: !photo.favorite });
        }}
        title={photo.favorite ? "Remove favourite" : "Add to favourites"}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          backgroundColor: photo.favorite ? C.accent : "rgba(255, 253, 247, 0.85)",
          color: photo.favorite ? C.paper : C.ink,
          cursor: "pointer",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photo.favorite ? "♥" : "♡"}
      </button>

      {photo.confidence === "review" && (
        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "#C49056",
            color: C.paper,
            padding: "2px 8px",
            borderRadius: 2,
            fontSize: 9.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Review
        </span>
      )}

      {photo.source === "couple" && (
        <span
          style={{
            position: "absolute",
            top: photo.confidence === "review" ? 34 : 8,
            left: 8,
            backgroundColor: "rgba(26, 26, 26, 0.72)",
            color: C.ivory,
            padding: "2px 8px",
            borderRadius: 2,
            fontSize: 9.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Couple's pick
        </span>
      )}

      {tagged.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "8px 10px",
            background: "linear-gradient(0deg, rgba(46,36,24,0.85) 0%, rgba(46,36,24,0) 100%)",
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {tagged.slice(0, 3).map((g) => (
            <span
              key={g.id}
              style={{
                fontSize: 10.5,
                color: C.paper,
                backgroundColor: "rgba(255,253,247,0.15)",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              {g.name.split(" ")[0]}
            </span>
          ))}
          {tagged.length > 3 && (
            <span style={{ fontSize: 10.5, color: C.paper, opacity: 0.75, padding: "2px 4px" }}>
              +{tagged.length - 3}
            </span>
          )}
          <span
            style={{
              marginLeft: "auto",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: photo.confidence === "high" ? "#7AA265" : "#C49056",
              alignSelf: "center",
            }}
            title={photo.confidence === "high" ? "High-confidence tags" : "Needs review"}
          />
        </div>
      )}
    </div>
  );
}

function SmartSharingSection({
  state,
  update,
}: {
  state: PhotoState;
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
}) {
  const guestsWithPhotos = MOCK_GUESTS.filter((g) =>
    state.album.some((p) => p.taggedGuestIds.includes(g.id)),
  );

  return (
    <SectionShell>
      <SectionHead
        title="Smart sharing"
        hint="One click sends each guest just the photos they appear in."
        right={
          <button style={primaryButtonStyle()} disabled={guestsWithPhotos.length === 0}>
            📤 Bulk send to {guestsWithPhotos.length} guests
          </button>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            padding: 16,
            border: `1px solid ${C.line}`,
            backgroundColor: C.paper,
            borderRadius: 2,
          }}
        >
          <SubsectionHead>Share settings</SubsectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            <Toggle
              label="Watermarked"
              active={state.shareSettings.scope === "watermarked"}
              onChange={(v) =>
                update({
                  shareSettings: {
                    ...state.shareSettings,
                    scope: v ? "watermarked" : "full_res",
                  },
                })
              }
            />
            <Toggle
              label="Allow download"
              active={state.shareSettings.allowDownload}
              onChange={(v) =>
                update({ shareSettings: { ...state.shareSettings, allowDownload: v } })
              }
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12.5,
                color: C.inkSoft,
              }}
            >
              Link expires in
              <input
                type="number"
                min={1}
                max={365}
                value={state.shareSettings.expiryDays}
                onChange={(e) =>
                  update({
                    shareSettings: {
                      ...state.shareSettings,
                      expiryDays: Number(e.target.value) || 30,
                    },
                  })
                }
                style={{
                  width: 56,
                  padding: "4px 6px",
                  border: `1px solid ${C.line}`,
                  borderRadius: 2,
                  backgroundColor: C.ivorySoft,
                  fontFamily: FONT_SANS,
                  outline: "none",
                }}
              />
              days
            </div>
          </div>
        </div>

        <div
          style={{
            padding: 16,
            border: `1px solid ${C.line}`,
            backgroundColor: C.paper,
            borderRadius: 2,
          }}
        >
          <SubsectionHead>Preview sent message</SubsectionHead>
          <div
            style={{
              padding: 12,
              backgroundColor: C.ivorySoft,
              border: `1px dashed ${C.line}`,
              borderRadius: 2,
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              fontSize: 14,
              color: C.inkSoft,
              lineHeight: 1.55,
            }}
          >
            "Here are your photos from Priya &amp; Arjun's wedding! We'd love for you to have
            these memories. With so much love — P &amp; A"
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button style={secondaryButtonStyle()}>✉ Via email</button>
            <button style={secondaryButtonStyle()}>📱 Via text</button>
            <button style={textButtonStyle()}>Curate per guest…</button>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function Toggle({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12.5,
        color: C.inkSoft,
        cursor: "pointer",
      }}
    >
      <span
        onClick={() => onChange(!active)}
        style={{
          width: 30,
          height: 17,
          borderRadius: 999,
          backgroundColor: active ? C.goldDeep : C.line,
          position: "relative",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: active ? 15 : 2,
            width: 13,
            height: 13,
            borderRadius: "50%",
            backgroundColor: C.paper,
            transition: "left 0.15s",
          }}
        />
      </span>
      {label}
    </label>
  );
}

function ThankYouNotesSection({
  state,
  update,
}: {
  state: PhotoState;
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
}) {
  const generateAll = () => {
    update((s) => {
      const existing = new Set(s.thankYouNotes.map((n) => n.guestId));
      const newNotes: ThankYouNote[] = MOCK_GUESTS.filter((g) => !existing.has(g.id))
        .filter((g) => s.album.some((p) => p.taggedGuestIds.includes(g.id)))
        .map((g) => {
          const photo = s.album.find((p) => p.taggedGuestIds.includes(g.id));
          return {
            id: uid(),
            guestId: g.id,
            photoId: photo?.id ?? null,
            message: draftThankYou(g, photo?.eventKey),
            channel: "email",
            status: "draft",
          };
        });
      return { thankYouNotes: [...s.thankYouNotes, ...newNotes] };
    });
  };

  const drafted = state.thankYouNotes.length;
  const sent = state.thankYouNotes.filter((n) => n.status === "sent").length;

  const patch = (id: string, p: Partial<ThankYouNote>) =>
    update((s) => ({
      thankYouNotes: s.thankYouNotes.map((n) => (n.id === id ? { ...n, ...p } : n)),
    }));

  const remove = (id: string) =>
    update((s) => ({ thankYouNotes: s.thankYouNotes.filter((n) => n.id !== id) }));

  return (
    <SectionShell>
      <SectionHead
        title="Personalised thank-you notes"
        hint="The crown jewel — a photo, a personal message, sent or printed."
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {drafted > 0 && (
              <span
                style={{
                  padding: "6px 12px",
                  fontSize: 11,
                  color: C.muted,
                  letterSpacing: "0.04em",
                }}
              >
                {drafted} drafted · {sent} sent
              </span>
            )}
            <button onClick={generateAll} style={textButtonStyle()}>
              ✨ Generate all with AI
            </button>
          </div>
        }
      />
      {drafted === 0 ? (
        <EmptyState
          icon="💌"
          title="Turn tagged photos into thank-you notes."
          body="We'll pair each guest with a photo they're in and draft a warm, personal note. You own the final word on every one."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {state.thankYouNotes.map((note) => (
            <ThankYouCard
              key={note.id}
              note={note}
              album={state.album}
              onPatch={(p) => patch(note.id, p)}
              onRemove={() => remove(note.id)}
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function draftThankYou(g: Guest, eventKey?: string): string {
  const eventPhrase: Record<string, string> = {
    haldi: "dancing around the haldi",
    mehendi: "at the mehendi",
    sangeet: "on the sangeet floor",
    baraat: "at the baraat",
    wedding: "during the pheras",
    reception: "at the reception",
  };
  const context = eventKey && eventPhrase[eventKey] ? eventPhrase[eventKey] : "at the wedding";
  const openings: Record<Guest["side"], string> = {
    bride: "Dearest",
    groom: "Dear",
    both: "To our beloved",
  };
  const open = openings[g.side];
  return `${open} ${g.name.split(" ")[0]},

Having you ${context} meant more to us than words can hold. This photo captures exactly why — we'll look back at it and remember the joy you brought into our day.

With so much love,
Priya & Arjun`;
}

function ThankYouCard({
  note,
  album,
  onPatch,
  onRemove,
}: {
  note: ThankYouNote;
  album: AlbumPhoto[];
  onPatch: (p: Partial<ThankYouNote>) => void;
  onRemove: () => void;
}) {
  const guest = MOCK_GUESTS.find((g) => g.id === note.guestId);
  const photo =
    album.find((p) => p.id === note.photoId) ??
    album.find((p) => p.taggedGuestIds.includes(note.guestId));
  if (!guest) return null;

  const channels: Array<{ v: ThankYouNote["channel"]; label: string }> = [
    { v: "email", label: "✉ Email" },
    { v: "text", label: "📱 Text" },
    { v: "print", label: "🖨 Print card" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: 16,
        border: `1px solid ${note.status === "sent" ? C.leaf : C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        opacity: note.status === "sent" ? 0.65 : 1,
      }}
    >
      <div
        style={{
          width: 120,
          aspectRatio: "4 / 5",
          backgroundColor: C.ivorySoft,
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
          border: `1px solid ${C.line}`,
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.faint,
              fontSize: 11,
            }}
          >
            No photo yet
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Avatar name={guest.name} side={guest.side} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 17, color: C.ink }}>{guest.name}</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>{guest.relationship}</div>
          </div>
          {note.status === "sent" && (
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 10.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                backgroundColor: "#E5EBDB",
                color: C.leaf,
              }}
            >
              Sent
            </span>
          )}
        </div>

        <textarea
          value={note.message}
          onChange={(e) => onPatch({ message: e.target.value })}
          rows={5}
          style={{
            width: "100%",
            padding: 12,
            border: `1px solid ${C.lineSoft}`,
            borderRadius: 2,
            backgroundColor: C.ivorySoft,
            fontFamily: FONT_SERIF,
            fontSize: 14.5,
            color: C.inkSoft,
            lineHeight: 1.55,
            outline: "none",
            resize: "vertical",
          }}
        />

        <div
          style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}
        >
          {channels.map((c) => (
            <button
              key={c.v}
              onClick={() => onPatch({ channel: c.v })}
              style={{
                padding: "5px 12px",
                border: `1px solid ${note.channel === c.v ? C.goldDeep : C.line}`,
                backgroundColor: note.channel === c.v ? C.champagnePale : "transparent",
                color: note.channel === c.v ? C.goldDeep : C.muted,
                borderRadius: 999,
                fontSize: 11.5,
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          ))}
          <button
            style={{ ...primaryButtonStyle(), marginLeft: "auto" }}
            disabled={note.status === "sent"}
            onClick={() => onPatch({ status: "sent" })}
          >
            {note.status === "sent" ? "Sent" : "Approve & send"}
          </button>
          <button onClick={onRemove} style={{ ...textButtonStyle(), color: C.danger }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function HighlightsSection({ photos }: { photos: AlbumPhoto[] }) {
  const [designerOpen, setDesignerOpen] = useState(false);
  const ready = photos.length >= 12;
  return (
    <SectionShell>
      <SectionHead
        title="Favourites & highlights"
        hint={
          photos.length
            ? `Your ${photos.length}-photo highlights reel. Turn it into a printed album.`
            : "Heart photos in the gallery above — they'll appear here as a curated set."
        }
        right={
          photos.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={secondaryButtonStyle()}>Share highlights link</button>
              <button style={textButtonStyle()}>Use on wedding website →</button>
              <button
                onClick={() => setDesignerOpen(true)}
                style={{
                  ...primaryButtonStyle(),
                  opacity: ready ? 1 : 0.55,
                }}
                disabled={!ready}
                title={ready ? "Build your printed album" : "Heart 12+ photos to unlock"}
              >
                ✦ Send to album designer
              </button>
            </div>
          ) : undefined
        }
      />
      {photos.length === 0 ? (
        <EmptyState
          icon="♡"
          title="Heart photos to start your highlights reel."
          body="Tap the heart on any photo above. Twelve hearts unlocks the printed album designer."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          {photos.map((p) => (
            <div
              key={p.id}
              style={{
                aspectRatio: "4 / 5",
                backgroundColor: C.ivorySoft,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${C.line}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
      {designerOpen && (
        <AlbumDesignerModal photos={photos} onClose={() => setDesignerOpen(false)} />
      )}
    </SectionShell>
  );
}

function AlbumDesignerModal({
  photos,
  onClose,
}: {
  photos: AlbumPhoto[];
  onClose: () => void;
}) {
  const [size, setSize] = useState<"8x8" | "10x10" | "12x12">("10x10");
  const [cover, setCover] = useState<"linen" | "leather" | "silk">("linen");
  const [submitted, setSubmitted] = useState(false);
  const spreads = Math.ceil(photos.length / 4);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(26, 26, 26, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: C.paper,
          borderRadius: 4,
          padding: "32px 36px",
          maxWidth: 560,
          width: "100%",
          border: `1px solid ${C.lineSoft}`,
          boxShadow: "0 20px 60px rgba(26, 26, 26, 0.2)",
        }}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, color: C.goldDeep, marginBottom: 12 }}>✦</div>
            <h3
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 24,
                margin: "0 0 10px",
                color: C.ink,
                fontWeight: 700,
              }}
            >
              Sent to the album studio.
            </h3>
            <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.55, margin: "0 auto 24px", maxWidth: 400 }}>
              Our printing partner will build a proof from your {photos.length}{" "}
              favourites and email it within 3–5 days. Tweak, approve, and it ships to
              your door.
            </p>
            <button onClick={onClose} style={primaryButtonStyle()}>
              Back to the gallery
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.gold,
                marginBottom: 8,
              }}
            >
              Album designer
            </div>
            <h3
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 24,
                margin: "0 0 8px",
                color: C.ink,
                fontWeight: 700,
              }}
            >
              Turn {photos.length} hearts into a printed album.
            </h3>
            <p style={{ color: C.muted, fontSize: 13.5, margin: "0 0 20px", lineHeight: 1.55 }}>
              We'll lay your favourites into {spreads} spreads using a fine-art template
              and send you a proof. Everything's editable before printing.
            </p>

            <div style={{ marginBottom: 16 }}>
              <SubsectionHead>Size</SubsectionHead>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["8x8", "10x10", "12x12"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      padding: "6px 14px",
                      border: `1px solid ${size === s ? C.goldDeep : C.line}`,
                      backgroundColor: size === s ? C.ink : "transparent",
                      color: size === s ? C.ivory : C.inkSoft,
                      borderRadius: 2,
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {s.replace("x", " × ")}"
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <SubsectionHead>Cover material</SubsectionHead>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["linen", "leather", "silk"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCover(c)}
                    style={{
                      padding: "6px 14px",
                      border: `1px solid ${cover === c ? C.goldDeep : C.line}`,
                      backgroundColor: cover === c ? C.ink : "transparent",
                      color: cover === c ? C.ivory : C.inkSoft,
                      borderRadius: 2,
                      cursor: "pointer",
                      fontSize: 12.5,
                      textTransform: "capitalize",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={secondaryButtonStyle()}>
                Cancel
              </button>
              <button onClick={() => setSubmitted(true)} style={primaryButtonStyle()}>
                Build my proof
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tab 4 — Inspiration & References
// ─────────────────────────────────────────────────────────────────────────
const INSPIRATION_CATEGORIES = [
  { id: "all", label: "All styles" },
  { id: "candid_doc", label: "Candid & Documentary" },
  { id: "editorial", label: "Editorial & Posed" },
  { id: "film_vintage", label: "Film & Vintage" },
  { id: "bold_color", label: "Bold & Colorful" },
  { id: "intimate_moody", label: "Intimate & Moody" },
];

interface InspirationPhoto {
  id: string;
  url: string;
  category: string;
  event: string;
  photographer: string;
  tags: string[];
}

const INSPIRATION_LIBRARY: InspirationPhoto[] = (() => {
  const cats = ["candid_doc", "editorial", "film_vintage", "bold_color", "intimate_moody"];
  const photogs = ["Studio Mehta", "Neel Co.", "Oorja Frames", "Nimai House", "Kalki Stills", "Jaipur Lens"];
  const tagMap: Record<string, string[]> = {
    candid_doc: ["candid", "documentary", "joyful"],
    editorial: ["editorial", "posed", "painterly"],
    film_vintage: ["film-grain", "nostalgic", "warm"],
    bold_color: ["saturated", "vibrant", "joyful"],
    intimate_moody: ["intimate", "moody", "film-grain"],
  };
  const photos: InspirationPhoto[] = [];
  let idx = 0;
  EVENT_KEYS.forEach((ev) => {
    cats.forEach((c) => {
      (AI_REFS[ev.key] ?? []).forEach((url) => {
        photos.push({
          id: `insp-${idx++}`,
          url,
          category: c,
          event: ev.key,
          photographer: photogs[idx % photogs.length]!,
          tags: tagMap[c]!,
        });
      });
    });
  });
  return photos.slice(0, 60);
})();

export function InspirationTab({
  state,
  update,
}: {
  state: PhotoState;
  update: (p: Partial<PhotoState> | ((s: PhotoState) => Partial<PhotoState>)) => void;
}) {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [similarOf, setSimilarOf] = useState<InspirationPhoto | null>(null);

  const toggleHeart = (id: string, opening?: InspirationPhoto) => {
    const hadIt = state.heartedInspiration.includes(id);
    update((s) => ({
      heartedInspiration: hadIt
        ? s.heartedInspiration.filter((x) => x !== id)
        : [...s.heartedInspiration, id],
    }));
    if (!hadIt && opening) setSimilarOf(opening);
  };

  const addComment = (photoId: string, text: string) => {
    if (!text.trim()) return;
    const entry: InspirationComment = {
      id: uid(),
      author: "me",
      text: text.trim(),
      at: Date.now(),
    };
    update((s) => ({
      inspirationComments: {
        ...s.inspirationComments,
        [photoId]: [...(s.inspirationComments[photoId] ?? []), entry],
      },
    }));
  };

  const removeComment = (photoId: string, commentId: string) => {
    update((s) => {
      const list = (s.inspirationComments[photoId] ?? []).filter((c) => c.id !== commentId);
      const next = { ...s.inspirationComments };
      if (list.length) next[photoId] = list;
      else delete next[photoId];
      return { inspirationComments: next };
    });
  };

  const routeToEvent = (photo: InspirationPhoto, eventKey: string) => {
    update((s) => {
      const target = s.events.find((e) => e.key === eventKey);
      if (!target) return {};
      if (target.refs.some((r) => r.url === photo.url)) {
        return {
          inspirationRoutedTo: { ...s.inspirationRoutedTo, [photo.id]: eventKey },
        };
      }
      const nextEvents = s.events.map((e) =>
        e.key === eventKey
          ? {
              ...e,
              refs: [
                ...e.refs,
                {
                  id: uid(),
                  url: photo.url,
                  note: "",
                  reaction: "love" as const,
                  source: "user" as const,
                },
              ],
            }
          : e,
      );
      return {
        events: nextEvents,
        inspirationRoutedTo: { ...s.inspirationRoutedTo, [photo.id]: eventKey },
      };
    });
  };

  const filtered = INSPIRATION_LIBRARY.filter((p) => {
    if (state.inspirationCategory !== "all" && p.category !== state.inspirationCategory) return false;
    if (eventFilter !== "all" && p.event !== eventFilter) return false;
    return true;
  });

  const similar = similarOf
    ? INSPIRATION_LIBRARY.filter(
        (p) =>
          p.id !== similarOf.id &&
          (p.category === similarOf.category || p.event === similarOf.event),
      ).slice(0, 6)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div
        style={{
          backgroundColor: C.overlay,
          border: `1px solid ${C.lineSoft}`,
          padding: "24px 28px",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: 8,
          }}
        >
          Style exploration
        </div>
        <h2
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 24,
            margin: "0 0 6px",
            color: C.ink,
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          Browse inspiration
        </h2>
        <p
          style={{
            color: C.muted,
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.55,
            maxWidth: 680,
          }}
        >
          Wander through curated wedding photography by style and event. Heart the frames that
          feel like yours — we'll suggest more like them.
        </p>
      </div>

      <SectionShell>
        <SectionHead title="By style" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INSPIRATION_CATEGORIES.map((c) => {
            const active = state.inspirationCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => update({ inspirationCategory: c.id })}
                style={{
                  padding: "8px 16px",
                  border: `1px solid ${active ? C.goldDeep : C.line}`,
                  backgroundColor: active ? C.ink : C.paper,
                  color: active ? C.ivory : C.inkSoft,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: FONT_SERIF,
                  fontSize: 15,
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead title="By event" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[{ key: "all", label: "All events" }, ...EVENT_KEYS].map((e) => {
            const active = eventFilter === e.key;
            return (
              <button
                key={e.key}
                onClick={() => setEventFilter(e.key)}
                style={{
                  padding: "5px 14px",
                  border: `1px solid ${active ? C.goldDeep : C.line}`,
                  backgroundColor: active ? C.ink : "transparent",
                  color: active ? C.ivory : C.muted,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 11.5,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {e.label}
              </button>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead
          title="Curated gallery"
          hint={`${filtered.length} frames · ${state.heartedInspiration.length} hearted`}
        />
        {filtered.length === 0 ? (
          <EmptyState
            icon="✦"
            title="Widen your filters."
            body="Try 'All styles' or a different event to see more curated frames."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {filtered.map((p) => (
              <InspirationCard
                key={p.id}
                photo={p}
                hearted={state.heartedInspiration.includes(p.id)}
                onHeart={() => toggleHeart(p.id, p)}
                onShowSimilar={() => setSimilarOf(p)}
                comments={state.inspirationComments[p.id] ?? []}
                onAddComment={(text) => addComment(p.id, text)}
                onRemoveComment={(cid) => removeComment(p.id, cid)}
                routedTo={state.inspirationRoutedTo[p.id]}
                onRouteToEvent={(k) => routeToEvent(p, k)}
                events={EVENT_KEYS.map((e) => ({ key: e.key, label: e.label }))}
              />
            ))}
          </div>
        )}
      </SectionShell>

      {similarOf && similar.length > 0 && (
        <SectionShell>
          <SectionHead
            title="More like this"
            hint={`Based on ${
              INSPIRATION_CATEGORIES.find((c) => c.id === similarOf.category)?.label ?? "style"
            }.`}
            right={
              <button onClick={() => setSimilarOf(null)} style={textButtonStyle()}>
                Dismiss
              </button>
            }
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {similar.map((p) => (
              <InspirationCard
                key={p.id}
                photo={p}
                hearted={state.heartedInspiration.includes(p.id)}
                onHeart={() => toggleHeart(p.id)}
                onShowSimilar={() => setSimilarOf(p)}
                comments={state.inspirationComments[p.id] ?? []}
                onAddComment={(text) => addComment(p.id, text)}
                onRemoveComment={(cid) => removeComment(p.id, cid)}
                routedTo={state.inspirationRoutedTo[p.id]}
                onRouteToEvent={(k) => routeToEvent(p, k)}
                events={EVENT_KEYS.map((e) => ({ key: e.key, label: e.label }))}
                compact
              />
            ))}
          </div>
        </SectionShell>
      )}
    </div>
  );
}

function InspirationCard({
  photo,
  hearted,
  onHeart,
  onShowSimilar,
  comments,
  onAddComment,
  onRemoveComment,
  routedTo,
  onRouteToEvent,
  events,
  compact,
}: {
  photo: InspirationPhoto;
  hearted: boolean;
  onHeart: () => void;
  onShowSimilar: () => void;
  comments: InspirationComment[];
  onAddComment: (text: string) => void;
  onRemoveComment: (id: string) => void;
  routedTo?: string;
  onRouteToEvent: (eventKey: string) => void;
  events: Array<{ key: string; label: string }>;
  compact?: boolean;
}) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [routerOpen, setRouterOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const routedLabel = routedTo ? events.find((e) => e.key === routedTo)?.label : undefined;
  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(draft);
    setDraft("");
  };
  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        backgroundColor: C.paper,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/uri-list", photo.url);
          e.dataTransfer.setData("text/plain", photo.url);
          e.dataTransfer.effectAllowed = "copy";
        }}
        style={{ position: "relative", aspectRatio: "4 / 5", backgroundColor: C.ivorySoft }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          onClick={onHeart}
          title={hearted ? "Remove from favourites" : "Add to favourites"}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            backgroundColor: hearted ? C.accent : "rgba(255, 253, 247, 0.85)",
            color: hearted ? C.paper : C.ink,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {hearted ? "♥" : "♡"}
        </button>
        {comments.length > 0 && (
          <button
            onClick={() => setCommentOpen((v) => !v)}
            title={`${comments.length} comment${comments.length === 1 ? "" : "s"}`}
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              border: "none",
              backgroundColor: "rgba(26, 26, 26, 0.65)",
              color: C.ivory,
              borderRadius: 999,
              padding: "3px 9px",
              cursor: "pointer",
              fontSize: 11,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            💬 {comments.length}
          </button>
        )}
        {routedLabel && (
          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 9.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundColor: "rgba(139, 101, 8, 0.85)",
              color: C.ivory,
            }}
          >
            ✓ in {routedLabel}
          </span>
        )}
      </div>
      {!compact && (
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 13, color: C.inkSoft }}>
            {photo.photographer}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
            {photo.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  padding: "1px 7px",
                  border: `1px solid ${C.lineSoft}`,
                  borderRadius: 999,
                  color: C.muted,
                }}
              >
                {t}
              </span>
            ))}
            <button
              onClick={() => setCommentOpen((v) => !v)}
              title="Add comment"
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                color: C.muted,
                fontSize: 11,
                cursor: "pointer",
                padding: "0 2px",
              }}
            >
              💬
            </button>
            <button
              onClick={() => setRouterOpen((v) => !v)}
              title="Add to event references"
              style={{
                border: "none",
                background: "transparent",
                color: C.goldDeep,
                fontSize: 10.5,
                cursor: "pointer",
                padding: "0 2px",
              }}
            >
              → event
            </button>
            <button
              onClick={onShowSimilar}
              style={{
                border: "none",
                background: "transparent",
                color: C.goldDeep,
                fontSize: 10.5,
                cursor: "pointer",
                padding: 0,
              }}
            >
              More like this →
            </button>
          </div>
          {routerOpen && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                border: `1px solid ${C.lineSoft}`,
                backgroundColor: C.overlay,
                borderRadius: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              {events.map((e) => (
                <button
                  key={e.key}
                  onClick={() => {
                    onRouteToEvent(e.key);
                    setRouterOpen(false);
                  }}
                  style={{
                    padding: "3px 10px",
                    fontSize: 11,
                    border: `1px solid ${routedTo === e.key ? C.goldDeep : C.line}`,
                    backgroundColor: routedTo === e.key ? C.ink : C.paper,
                    color: routedTo === e.key ? C.ivory : C.inkSoft,
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                >
                  + {e.label}
                </button>
              ))}
            </div>
          )}
          {commentOpen && (
            <div style={{ marginTop: 10 }}>
              {comments.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "flex-start",
                        fontSize: 12,
                        color: C.inkSoft,
                      }}
                    >
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: 999,
                          backgroundColor: c.author === "me" ? C.ink : C.leaf,
                          color: C.ivory,
                          fontSize: 9.5,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          flexShrink: 0,
                        }}
                      >
                        {c.author === "me" ? "You" : "Partner"}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontFamily: FONT_SERIF,
                          fontStyle: "italic",
                          lineHeight: 1.4,
                        }}
                      >
                        {c.text}
                      </span>
                      <button
                        onClick={() => onRemoveComment(c.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: C.faint,
                          cursor: "pointer",
                          fontSize: 13,
                          padding: "0 2px",
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                style={{ display: "flex", gap: 4 }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Leave a comment…"
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    fontSize: 12,
                    border: `1px solid ${C.line}`,
                    borderRadius: 2,
                    backgroundColor: C.paper,
                    fontFamily: FONT_SANS,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    border: `1px solid ${C.line}`,
                    backgroundColor: C.ink,
                    color: C.ivory,
                    borderRadius: 2,
                    cursor: "pointer",
                  }}
                >
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Quiz modal
// ─────────────────────────────────────────────────────────────────────────
export function QuizModal({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (r: { brief: string; keywords: string[]; tone: number }) => void;
}) {
  const questions: Array<{
    id: string;
    q: string;
    options: Array<{ label: string; kw: string[]; tone: number }>;
  }> = [
    {
      id: "q1",
      q: "When you scroll wedding photos, what makes you stop?",
      options: [
        { label: "A real expression mid-laugh", kw: ["candid", "joyful"], tone: 40 },
        { label: "A dramatic, cinematic frame", kw: ["editorial", "moody"], tone: 70 },
        { label: "Warm sunlight on skin", kw: ["golden-hour", "natural-light"], tone: 20 },
        { label: "A quiet intimate detail", kw: ["intimate", "nostalgic"], tone: 55 },
      ],
    },
    {
      id: "q2",
      q: "Posed group shots feel…",
      options: [
        { label: "Necessary but brief — let's plan them fast", kw: ["candid"], tone: 45 },
        { label: "Beautiful if done like editorial portraits", kw: ["editorial"], tone: 65 },
        { label: "Important — our families want these", kw: [], tone: 50 },
        { label: "Honestly, a little awkward", kw: ["documentary"], tone: 55 },
      ],
    },
    {
      id: "q3",
      q: "Your dream image from your wedding is…",
      options: [
        { label: "Me laughing with my best friend, forgetting the camera", kw: ["candid", "joyful"], tone: 40 },
        { label: "A painterly frame of the mandap at golden hour", kw: ["painterly", "golden-hour"], tone: 30 },
        { label: "A tight shot of our hands during phere", kw: ["intimate", "detail"], tone: 55 },
        { label: "The dance floor in full chaos", kw: ["documentary", "joyful"], tone: 60 },
      ],
    },
    {
      id: "q4",
      q: "Colour-wise, I lean…",
      options: [
        { label: "Warm, golden, saturated", kw: ["golden-hour", "saturated"], tone: 15 },
        { label: "Balanced and natural", kw: ["natural-light"], tone: 50 },
        { label: "Muted and editorial", kw: ["editorial"], tone: 75 },
        { label: "Moody, almost cinematic", kw: ["moody", "film-grain"], tone: 85 },
      ],
    },
    {
      id: "q5",
      q: "If my photographer did one thing perfectly, it would be…",
      options: [
        { label: "Catch expressions I didn't know were happening", kw: ["candid"], tone: 50 },
        { label: "Make our families look their best", kw: [], tone: 45 },
        { label: "Tell the story of the day like a film", kw: ["documentary"], tone: 60 },
        { label: "Frame beauty in small details", kw: ["detail", "intimate"], tone: 55 },
      ],
    },
  ];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const current = questions[step]!;

  const handlePick = (idx: number) => {
    const next = { ...answers, [current.id]: idx };
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      finalize(next);
    }
  };

  const finalize = (final: Record<string, number>) => {
    const kwSet = new Set<string>();
    let toneSum = 0;
    let count = 0;
    questions.forEach((q) => {
      const pick = final[q.id];
      if (pick == null) return;
      const opt = q.options[pick]!;
      opt.kw.forEach((k) => kwSet.add(k));
      toneSum += opt.tone;
      count++;
    });
    const tone = count ? Math.round(toneSum / count) : 50;
    const keywords = Array.from(kwSet).slice(0, 6);
    const brief = refineBrief("", keywords, tone);
    onComplete({ brief, keywords, tone });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(46, 36, 24, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: C.paper,
          borderRadius: 3,
          padding: "40px 44px",
          maxWidth: 560,
          width: "100%",
          border: `1px solid ${C.champagne}`,
          boxShadow: "0 20px 60px rgba(46, 36, 24, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.goldDeep,
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Step {step + 1} of {questions.length}</span>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 18 }}
          >
            ×
          </button>
        </div>
        <h3 style={{ fontFamily: FONT_SERIF, fontSize: 26, margin: "0 0 24px", color: C.ink, fontWeight: 700, lineHeight: 1.2 }}>
          {current.q}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handlePick(i)}
              style={{
                textAlign: "left",
                padding: "14px 18px",
                border: `1px solid ${C.line}`,
                backgroundColor: C.ivorySoft,
                color: C.ink,
                borderRadius: 2,
                fontFamily: FONT_SERIF,
                fontSize: 16,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.goldDeep;
                e.currentTarget.style.backgroundColor = C.champagnePale;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.line;
                e.currentTarget.style.backgroundColor = C.ivorySoft;
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────────────────────────────────
function SectionShell({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}

function SectionHead({
  title,
  hint,
  eyebrow,
  right,
}: {
  title: string;
  hint?: string;
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 18,
        borderBottom: `1px solid ${C.lineSoft}`,
        paddingBottom: 10,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h3
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 22,
            margin: 0,
            color: C.ink,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        {hint && (
          <p
            style={{
              color: C.muted,
              margin: "4px 0 0",
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function SubsectionHead({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Pill({
  children,
  filled,
  onClick,
  onRemove,
}: {
  children: ReactNode;
  filled?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: filled ? "5px 6px 5px 12px" : "5px 12px",
    border: `1px solid ${filled ? C.goldDeep : C.line}`,
    borderRadius: 999,
    backgroundColor: filled ? C.ink : "transparent",
    color: filled ? C.ivory : C.inkSoft,
    fontSize: 12,
    cursor: onClick ? "pointer" : "default",
    fontFamily: FONT_SANS,
    letterSpacing: "0.02em",
  };
  if (onClick) {
    return (
      <button onClick={onClick} style={{ ...base, border: `1px solid ${C.line}` }}>
        + {children}
      </button>
    );
  }
  return (
    <span style={base}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            border: "none",
            background: "transparent",
            color: filled ? C.goldSoft : C.muted,
            cursor: "pointer",
            padding: "0 4px",
            fontSize: 14,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  body,
  dashed,
  onDrop,
}: {
  icon: string;
  title: string;
  body: string;
  dashed?: boolean;
  onDrop?: (files: FileList | null) => void;
}) {
  return (
    <div
      onDragOver={(e) => {
        if (onDrop) e.preventDefault();
      }}
      onDrop={(e) => {
        if (onDrop) {
          e.preventDefault();
          onDrop(e.dataTransfer.files);
        }
      }}
      style={{
        border: `${dashed ? "1.5px dashed" : "1px solid"} ${C.lineSoft}`,
        backgroundColor: C.overlay,
        borderRadius: 2,
        padding: "44px 28px",
        textAlign: "center",
        color: C.muted,
      }}
    >
      <div style={{ fontSize: 30, marginBottom: 10, color: C.goldDeep }}>{icon}</div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 20,
          color: C.ink,
          fontStyle: "italic",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13.5, maxWidth: 440, margin: "0 auto", lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function SelectPill({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ v: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "3px 10px",
        fontSize: 11.5,
        border: `1px solid ${C.line}`,
        borderRadius: 999,
        backgroundColor: C.ivorySoft,
        color: C.inkSoft,
        outline: "none",
        textTransform: "capitalize",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Button styles ───────────────────────────────────────────────────────
function primaryButtonStyle(): CSSProperties {
  return {
    padding: "8px 18px",
    backgroundColor: C.ink,
    color: C.ivory,
    border: "none",
    borderRadius: 2,
    fontSize: 12.5,
    fontFamily: FONT_SANS,
    fontWeight: 500,
    letterSpacing: "0.04em",
    cursor: "pointer",
  };
}

function secondaryButtonStyle(): CSSProperties {
  return {
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: C.inkSoft,
    border: `1px solid ${C.line}`,
    borderRadius: 2,
    fontSize: 12.5,
    fontFamily: FONT_SANS,
    cursor: "pointer",
  };
}

function textButtonStyle(): CSSProperties {
  return {
    padding: "6px 10px",
    backgroundColor: "transparent",
    color: C.goldDeep,
    border: "none",
    borderRadius: 2,
    fontSize: 12,
    fontFamily: FONT_SANS,
    fontWeight: 500,
    cursor: "pointer",
  };
}

function iconButtonStyle(): CSSProperties {
  return {
    width: 24,
    height: 24,
    border: `1px solid ${C.lineSoft}`,
    backgroundColor: C.ivorySoft,
    color: C.muted,
    borderRadius: 2,
    cursor: "pointer",
    fontSize: 11,
    padding: 0,
  };
}

function inputStyle(): CSSProperties {
  return {
    flex: 1,
    padding: "8px 12px",
    border: `1px solid ${C.line}`,
    borderRadius: 2,
    backgroundColor: C.paper,
    fontFamily: FONT_SANS,
    fontSize: 13,
    color: C.ink,
    outline: "none",
    minWidth: 0,
  };
}
