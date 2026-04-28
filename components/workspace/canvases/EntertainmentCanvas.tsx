"use client";

// ── Music & Entertainment Workspace ─────────────────────────────────────────
// Couple-facing creative exploration space for wedding music, entertainment,
// speeches, and MC direction. Three tabs: Vibe & Sound, Speeches & MC,
// Event Soundscapes. Single-file build — all state, mock data, and
// sub-components colocated. localStorage-backed persistence.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  Flame,
  Heart,
  Info,
  Mic,
  MicOff,
  Minus,
  Music,
  Music2,
  Pause,
  Play,
  Plus,
  Send,
  Sparkles,
  Star,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import type { WorkspaceCategory } from "@/types/workspace";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

type EventId = "haldi" | "mehendi" | "sangeet" | "ceremony" | "reception";

type Genre =
  | "Classic Bollywood"
  | "Modern Bollywood/Punjabi"
  | "Sufi & Qawwali"
  | "Indie/Acoustic"
  | "Western Pop & R&B"
  | "Hip Hop"
  | "EDM/House"
  | "Classical Indian"
  | "Folk/Regional"
  | "Jazz"
  | "Latin"
  | "Country";

type EnergyLabel =
  | "Intimate"
  | "Warm"
  | "Building"
  | "High Energy"
  | "Peak Party";

type SpeechStatus =
  | "Invited"
  | "Accepted"
  | "Draft in progress"
  | "Rehearsed"
  | "Ready";

type SpeechTone =
  | "Funny & roast-style"
  | "Heartfelt & emotional"
  | "Mix of both"
  | "Short & sweet"
  | "Formal & traditional";

type EntertainmentStatus = "Idea" | "Confirmed" | "Rehearsed";

type QuizAnswers = {
  sangeetVision: string;
  musicType: string;
  genres: Genre[];
  wildness: number; // 0-100
  moments: string[];
};

type SoundBrief = { text: string };

type EventEnergy = Record<EventId, number>;

type SongSample = {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string;
};

type SavedSong = {
  sampleId: string;
  eventTag?: EventId | "first-dance" | "baraat" | "entrance" | "other";
  note?: string;
  savedAt: number;
};

type NonNegotiableMoment = {
  id: string;
  moment: string;
  event: EventId | "";
  songArtist: string;
  status: "Song picked" | "Still exploring" | "Need DJ input";
};

type Speech = {
  id: string;
  speaker: string;
  relationship: string;
  event: EventId | "rehearsal" | "";
  timing: string;
  timeLimit: string;
  status: SpeechStatus;
  draft: string;
  guidanceNotes: string;
  tone: SpeechTone;
  sharedWithCouple: boolean;
  coupleNotes: string;
  order: number;
};

type MCTone = {
  humor: number; // 0 serious → 100 roast
  energy: number; // 0 calm → 100 hype
  cultural: number; // 0 trad → 50 fusion → 100 western
  interaction: number; // 0 minimal → 100 involved
};

type MCEventNotes = Record<
  EventId,
  {
    announce: string;
    names: string;
    topicsInclude: string;
    topicsAvoid: string;
    culturalContext: string;
    approvedJokes: string;
    script: string;
  }
>;

type PronunciationEntry = {
  id: string;
  name: string;
  phonetic: string;
  context: string;
  hasAudio: boolean;
};

type EventMoment = {
  opening: string;
  build: string;
  peak: string;
  windDown: string;
};

type EventSoundscape = {
  arc: EventMoment;
  culturalReqs: { id: string; label: string; on: boolean }[];
  mustPlay: string[];
  requestList: string[];
  doNotPlay: string[];
  entertainment: {
    id: string;
    description: string;
    notes: string;
    status: EntertainmentStatus;
  }[];
};

type WorkspaceState = {
  quiz: QuizAnswers | null;
  soundBrief: SoundBrief;
  energyMap: EventEnergy;
  genrePalette: Genre[];
  savedSongs: SavedSong[];
  dismissedSongs: string[];
  nonNegotiable: NonNegotiableMoment[];
  doNotPlay: string[];
  speeches: Speech[];
  coupleSpeechMode: "together" | "separate" | null;
  coupleSpeechDraftA: string;
  coupleSpeechDraftB: string;
  coupleSpeechMerged: string;
  mcTone: MCTone;
  mcNotes: MCEventNotes;
  pronunciation: PronunciationEntry[];
  soundscapes: Record<EventId, EventSoundscape>;
};

// ─────────────────────────────────────────────────────────────────────────
// Constants / Mock data
// ─────────────────────────────────────────────────────────────────────────

const EVENTS: { id: EventId; label: string }[] = [
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "ceremony", label: "Ceremony" },
  { id: "reception", label: "Reception" },
];

const GENRE_OPTIONS: Genre[] = [
  "Classic Bollywood",
  "Modern Bollywood/Punjabi",
  "Sufi & Qawwali",
  "Indie/Acoustic",
  "Western Pop & R&B",
  "Hip Hop",
  "EDM/House",
  "Classical Indian",
  "Folk/Regional",
  "Jazz",
  "Latin",
  "Country",
];

const MOMENT_OPTIONS = [
  "Dhol during Baraat",
  "Couple's first dance",
  "Parent dances",
  "Grand entrance with a song",
  "Vidaai with traditional song",
  "Late-night Bollywood party",
  "Live Sufi set",
  "Acoustic ceremony music",
];

const MUSIC_EXPLORER: Record<string, SongSample[]> = {
  "Romantic & Intimate": [
    { id: "ri1", title: "Tum Hi Ho", artist: "Arijit Singh", mood: "tender", duration: "0:30" },
    { id: "ri2", title: "Perfect", artist: "Ed Sheeran", mood: "sweet", duration: "0:30" },
    { id: "ri3", title: "Raabta", artist: "Arijit Singh", mood: "longing", duration: "0:30" },
    { id: "ri4", title: "All of Me", artist: "John Legend", mood: "timeless", duration: "0:30" },
    { id: "ri5", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva", mood: "devoted", duration: "0:30" },
  ],
  "Bollywood Classic": [
    { id: "bc1", title: "Tujh Mein Rab Dikhta Hai", artist: "Roop Kumar Rathod", mood: "classic", duration: "0:30" },
    { id: "bc2", title: "Kabhi Khushi Kabhie Gham", artist: "Lata Mangeshkar", mood: "anthemic", duration: "0:30" },
    { id: "bc3", title: "Bole Chudiyan", artist: "Amit Kumar", mood: "festive", duration: "0:30" },
    { id: "bc4", title: "Pehla Nasha", artist: "Udit Narayan", mood: "nostalgic", duration: "0:30" },
    { id: "bc5", title: "Dola Re Dola", artist: "Shreya Ghoshal", mood: "grand", duration: "0:30" },
  ],
  "Punjabi/Bhangra Energy": [
    { id: "pb1", title: "Morni Banke", artist: "Guru Randhawa", mood: "hype", duration: "0:30" },
    { id: "pb2", title: "Kala Chashma", artist: "Badshah", mood: "banger", duration: "0:30" },
    { id: "pb3", title: "Lamberghini", artist: "The Doorbeen", mood: "chart", duration: "0:30" },
    { id: "pb4", title: "London Thumakda", artist: "Labh Janjua", mood: "dhol", duration: "0:30" },
    { id: "pb5", title: "Nachde Ne Saare", artist: "Jasleen Royal", mood: "celebration", duration: "0:30" },
  ],
  "Sufi & Soulful": [
    { id: "su1", title: "Tum Se Hi", artist: "Mohit Chauhan", mood: "introspective", duration: "0:30" },
    { id: "su2", title: "Khwaja Mere Khwaja", artist: "A.R. Rahman", mood: "spiritual", duration: "0:30" },
    { id: "su3", title: "Kun Faya Kun", artist: "A.R. Rahman", mood: "transcendent", duration: "0:30" },
    { id: "su4", title: "Iktara", artist: "Kavita Seth", mood: "gentle", duration: "0:30" },
  ],
  "Western Pop & R&B": [
    { id: "wp1", title: "Señorita", artist: "Shawn Mendes & Camila", mood: "sultry", duration: "0:30" },
    { id: "wp2", title: "Uptown Funk", artist: "Bruno Mars", mood: "funk", duration: "0:30" },
    { id: "wp3", title: "Levitating", artist: "Dua Lipa", mood: "disco", duration: "0:30" },
    { id: "wp4", title: "Adore You", artist: "Harry Styles", mood: "dreamy", duration: "0:30" },
  ],
  "Party & EDM": [
    { id: "pe1", title: "Titanium", artist: "David Guetta", mood: "stadium", duration: "0:30" },
    { id: "pe2", title: "Don't You Worry Child", artist: "SHM", mood: "euphoric", duration: "0:30" },
    { id: "pe3", title: "One Kiss", artist: "Calvin Harris", mood: "summer", duration: "0:30" },
    { id: "pe4", title: "Taki Taki", artist: "DJ Snake", mood: "reggaeton", duration: "0:30" },
  ],
  "Acoustic & Unplugged": [
    { id: "ac1", title: "Banana Pancakes", artist: "Jack Johnson", mood: "sunlit", duration: "0:30" },
    { id: "ac2", title: "Thinking Out Loud", artist: "Ed Sheeran", mood: "slow", duration: "0:30" },
    { id: "ac3", title: "Ae Dil Hai Mushkil (Acoustic)", artist: "Arijit Singh", mood: "raw", duration: "0:30" },
    { id: "ac4", title: "Riptide", artist: "Vance Joy", mood: "airy", duration: "0:30" },
  ],
  "Classical & Traditional": [
    { id: "ct1", title: "Raag Yaman", artist: "Pt. Ravi Shankar", mood: "evening raga", duration: "0:30" },
    { id: "ct2", title: "Shehnai Mangalam", artist: "Ustad Bismillah Khan", mood: "auspicious", duration: "0:30" },
    { id: "ct3", title: "Nadaswaram Melam", artist: "Sheik Chinna Moulana", mood: "processional", duration: "0:30" },
    { id: "ct4", title: "Thillana", artist: "M.S. Subbulakshmi", mood: "rhythmic", duration: "0:30" },
  ],
};

const ENERGY_DEFAULT: EventEnergy = {
  haldi: 30,
  mehendi: 45,
  sangeet: 85,
  ceremony: 50,
  reception: 95,
};

const CULTURAL_REQ_DEFAULTS: Record<EventId, { id: string; label: string; on: boolean }[]> = {
  haldi: [
    { id: "h1", label: "Traditional dholki / dholak rhythm during paste application", on: true },
    { id: "h2", label: "Light acoustic Bollywood background music", on: true },
  ],
  mehendi: [
    { id: "m1", label: "Live dholki singers / Punjabi boliyan", on: true },
    { id: "m2", label: "Soft folk playlist during mehendi application", on: true },
  ],
  sangeet: [
    { id: "s1", label: "Full DJ rig with Bollywood / Punjabi mix", on: true },
    { id: "s2", label: "Dhol player joins during peak dance block", on: true },
    { id: "s3", label: "Live Sufi/acoustic set between performances", on: false },
  ],
  ceremony: [
    { id: "c1", label: "Shehnai or Nadaswaram for the ceremony entry", on: true },
    { id: "c2", label: "Mantras amplified clearly during rituals", on: true },
    { id: "c3", label: "Dhol during the Baraat procession", on: true },
    { id: "c4", label: "Traditional Vidaai song on send-off", on: true },
  ],
  reception: [
    { id: "r1", label: "Grand entrance song for couple", on: true },
    { id: "r2", label: "Dinner-hour acoustic / lounge set", on: true },
    { id: "r3", label: "Late-night Bollywood / Punjabi party block", on: true },
  ],
};

const DEFAULT_MC_NOTES: MCEventNotes = EVENTS.reduce((acc, e) => {
  acc[e.id] = {
    announce: "",
    names: "",
    topicsInclude: "",
    topicsAvoid: "",
    culturalContext: "",
    approvedJokes: "",
    script: "",
  };
  return acc;
}, {} as MCEventNotes);

const DEFAULT_SOUNDSCAPES: Record<EventId, EventSoundscape> = EVENTS.reduce((acc, e) => {
  acc[e.id] = {
    arc: { opening: "", build: "", peak: "", windDown: "" },
    culturalReqs: CULTURAL_REQ_DEFAULTS[e.id],
    mustPlay: [],
    requestList: [],
    doNotPlay: [],
    entertainment: [],
  };
  return acc;
}, {} as Record<EventId, EventSoundscape>);

const DEFAULT_STATE: WorkspaceState = {
  quiz: null,
  soundBrief: { text: "" },
  energyMap: ENERGY_DEFAULT,
  genrePalette: [],
  savedSongs: [],
  dismissedSongs: [],
  nonNegotiable: [],
  doNotPlay: [],
  speeches: [],
  coupleSpeechMode: null,
  coupleSpeechDraftA: "",
  coupleSpeechDraftB: "",
  coupleSpeechMerged: "",
  mcTone: { humor: 35, energy: 60, cultural: 50, interaction: 55 },
  mcNotes: DEFAULT_MC_NOTES,
  pronunciation: [],
  soundscapes: DEFAULT_SOUNDSCAPES,
};

// ─────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ananya:music-entertainment:v1";

function loadState(): WorkspaceState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(s: WorkspaceState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────────────────────────────────
// Font tokens — applied inline so the file stays self-contained
// ─────────────────────────────────────────────────────────────────────────

const FONT_SERIF: CSSProperties = { fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif' };
const FONT_SANS: CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif' };

// ─────────────────────────────────────────────────────────────────────────
// Energy helpers
// ─────────────────────────────────────────────────────────────────────────

function energyLabel(v: number): EnergyLabel {
  if (v < 25) return "Intimate";
  if (v < 45) return "Warm";
  if (v < 65) return "Building";
  if (v < 85) return "High Energy";
  return "Peak Party";
}

function energyColor(v: number) {
  if (v < 25) return "#D4A24C"; // saffron soft
  if (v < 45) return "#C97B63"; // rose
  if (v < 65) return "#B8860B"; // gold
  if (v < 85) return "#9C4F2A"; // rust
  return "#7A1F1F"; // deep claret
}

// ─────────────────────────────────────────────────────────────────────────
// Main canvas — thin wrapper over the shared WorkspaceCanvas so Music lines
// up with Photography, Catering, Décor etc. on background, header chrome,
// budget badge, role switcher, and tab underline treatment. Tab bodies
// below are the Music-specific content (quiz, sound brief, energy map,
// speeches, soundscapes).
// ─────────────────────────────────────────────────────────────────────────

type TabId = "vibe" | "speeches" | "soundscapes";

const ENTERTAINMENT_CANVAS_TABS: {
  id: TabId;
  label: string;
  icon: ElementType;
}[] = [
  { id: "vibe", label: "Vibe & Sound", icon: Music2 },
  { id: "speeches", label: "Speeches & MC", icon: Mic },
  { id: "soundscapes", label: "Event Soundscapes", icon: Clock },
];

export function EntertainmentCanvas({ category }: { category: WorkspaceCategory }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<WorkspaceState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const patch = useCallback(
    (next: Partial<WorkspaceState>) => setState((s) => ({ ...s, ...next })),
    [],
  );

  return (
    <WorkspaceCanvas<TabId>
      category={category}
      categoryIcon={Music}
      eyebrowSuffix="Music & Entertainment"
      tabs={ENTERTAINMENT_CANVAS_TABS}
      renderTab={(tab) => (
        <>
          {tab === "vibe" && (
            <VibeAndSoundTab state={state} patch={patch} setState={setState} />
          )}
          {tab === "speeches" && (
            <SpeechesAndMCTab state={state} patch={patch} setState={setState} />
          )}
          {tab === "soundscapes" && (
            <div className="space-y-6">
              <EventSoundscapesTab state={state} patch={patch} setState={setState} />
              <ContractChecklistBlock category={category} />
            </div>
          )}
        </>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-[#1A1A1A]/8 bg-white shadow-[0_1px_2px_rgba(26,26,26,0.03)] ${
        padded ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  note,
  right,
}: {
  eyebrow?: string;
  title: string;
  note?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#B8860B]">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-bold text-[26px] leading-tight text-[#1A1A1A]" style={FONT_SERIF}>
          {title}
        </h2>
        {note && <p className="mt-1 text-[13px] text-[#6B6B6B]">{note}</p>}
      </div>
      {right}
    </div>
  );
}

function Pill({
  children,
  active = false,
  onClick,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-all ${
        active
          ? "border-[#B8860B] bg-[#B8860B] text-white"
          : "border-[#1A1A1A]/12 bg-white text-[#2E2E2E] hover:border-[#B8860B]/60 hover:bg-[#F0E4C8]/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Btn({
  children,
  onClick,
  variant = "ghost",
  size = "sm",
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "outline" | "gold" | "danger";
  size?: "xs" | "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const sizes = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-4 py-2 text-[13px]",
  }[size];
  const variants = {
    primary: "bg-[#1A1A1A] text-white hover:bg-[#2E2E2E]",
    gold: "bg-[#B8860B] text-white hover:bg-[#9c720a]",
    outline: "border border-[#1A1A1A]/18 bg-white text-[#1A1A1A] hover:border-[#B8860B]",
    ghost: "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F5F1E8]",
    danger: "border border-[#C97B63]/30 bg-white text-[#C97B63] hover:bg-[#F5E0D6]/50",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 ${sizes} ${variants} ${className}`}
    >
      {children}
    </button>
  );
}

function AIButton({
  children,
  onClick,
  size = "sm",
}: {
  children: ReactNode;
  onClick?: () => void;
  size?: "xs" | "sm";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#B8860B]/40 bg-gradient-to-r from-[#F0E4C8]/60 to-[#F5E6C8]/60 ${
        size === "xs" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]"
      } font-medium text-[#8a6300] transition-all hover:from-[#F0E4C8] hover:to-[#F5E6C8] hover:shadow-sm`}
    >
      <Sparkles size={12} strokeWidth={1.8} />
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[13px] text-[#1A1A1A] placeholder:text-[#A3A3A3] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]/30 ${className}`}
      style={FONT_SANS}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[13px] leading-relaxed text-[#1A1A1A] placeholder:text-[#A3A3A3] focus:border-[#B8860B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]/30 ${className}`}
      style={FONT_SANS}
    />
  );
}

function EmptyState({ icon, title, hint, action }: { icon: ReactNode; title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[#B8860B]/30 bg-[#F0E4C8]/20 p-8 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white text-[#B8860B]">
        {icon}
      </div>
      <p className="text-[16px] text-[#1A1A1A]" style={FONT_SERIF}>
        {title}
      </p>
      <p className="mx-auto mt-1 max-w-md text-[13px] text-[#6B6B6B]">{hint}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// TAB 1 — VIBE & SOUND
// ═════════════════════════════════════════════════════════════════════════

function VibeAndSoundTab({
  state,
  patch,
  setState,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [quizOpen, setQuizOpen] = useState(false);
  return (
    <div className="space-y-10">
      <QuizEntryCard state={state} onStart={() => setQuizOpen(true)} />
      <SoundBriefCard state={state} patch={patch} />
      <EnergyMapCard state={state} patch={patch} setState={setState} />
      <GenrePaletteCard state={state} patch={patch} />
      <MusicExplorerCard state={state} setState={setState} />
      <NonNegotiableCard state={state} setState={setState} />
      <DoNotPlayCard state={state} setState={setState} />
      {quizOpen && (
        <QuizModal
          initial={state.quiz}
          onClose={() => setQuizOpen(false)}
          onComplete={(answers) => {
            patch({
              quiz: answers,
              genrePalette: Array.from(
                new Set([...state.genrePalette, ...answers.genres]),
              ),
              soundBrief: state.soundBrief.text
                ? state.soundBrief
                : { text: buildBrief(answers) },
              energyMap: buildEnergyMap(answers),
            });
            setQuizOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Quiz entry callout ──────────────────────────────────────────────────
// Matches the "Not sure where to start?" card Photography and Catering use:
// eyebrow, serif title, description, meta line, Start quiz button + skip.
// Post-quiz, flips to a compact "Retake" variant so the seed can be redone.

function QuizEntryCard({
  state,
  onStart,
}: {
  state: WorkspaceState;
  onStart: () => void;
}) {
  if (state.quiz) {
    return (
      <section className="relative overflow-hidden rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5 shadow-[0_1px_2px_rgba(184,134,11,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ✨ Quiz complete
            </p>
            <h3 className="mt-1.5 font-serif font-bold text-[20px] leading-tight text-ink">
              Your wedding soundtrack in 5 answers
            </h3>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              Seeded your Sound Brief, Energy Map, and per-event suggestions
              below — edit anything that doesn't feel right.
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-white px-4 py-2 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Edit3 size={13} /> Retake
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-lg border border-gold/30 bg-gradient-to-br from-ivory-warm/60 to-white p-5 shadow-[0_1px_2px_rgba(184,134,11,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ✨ Not sure where to start?
          </p>
          <h3 className="mt-1.5 font-serif font-bold text-[20px] leading-tight text-ink">
            Your wedding soundtrack in 5 questions
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
            Five light questions. We'll turn your answers into a draft Sound
            Brief, Energy Map, and per-event suggestions — all editable.
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

// ─── Quiz modal ──────────────────────────────────────────────────────────
// The five-question flow now lives in an overlay, matching Photography's
// QuizModal mechanism. Progress dots + Back/Next stay inside the modal so
// they don't bleed into the main workspace view.

function QuizModal({
  initial,
  onClose,
  onComplete,
}: {
  initial: QuizAnswers | null;
  onClose: () => void;
  onComplete: (answers: QuizAnswers) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(
    initial ?? {
      sangeetVision: "",
      musicType: "",
      genres: [],
      wildness: 60,
      moments: [],
    },
  );

  const questions = [
    {
      label: "What's your Sangeet vision?",
      key: "sangeetVision" as const,
      options: [
        "Full choreographed production",
        "Mix of planned & freestyle",
        "Open dance floor all night",
        "Intimate performances only",
      ],
      type: "single" as const,
    },
    {
      label: "Live music, DJ, or both?",
      key: "musicType" as const,
      options: [
        "Live band only",
        "DJ only",
        "Live band + DJ hybrid",
        "Different per event",
      ],
      type: "single" as const,
    },
    {
      label: "What genres define your wedding? (pick up to 5)",
      key: "genres" as const,
      options: GENRE_OPTIONS,
      type: "multi" as const,
      max: 5,
    },
    {
      label: "How wild should the party get?",
      key: "wildness" as const,
      type: "slider" as const,
      leftLabel: "Elegant & composed",
      rightLabel: "Absolute chaos on the dance floor",
    },
    {
      label: "What are your non-negotiable music moments?",
      key: "moments" as const,
      options: MOMENT_OPTIONS,
      type: "multi" as const,
    },
  ];

  const q = questions[step]!;
  const total = questions.length;

  const canProceed = (() => {
    if (q.type === "single") return !!answers[q.key as "sangeetVision" | "musicType"];
    if (q.type === "slider") return true;
    const v = answers[q.key as "genres" | "moments"];
    return Array.isArray(v) && v.length > 0;
  })();

  const handleNext = () => {
    if (step < total - 1) setStep(step + 1);
    else onComplete(answers);
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
        className="w-full max-w-[640px] overflow-hidden rounded-md border border-gold/25 bg-white shadow-[0_20px_60px_rgba(46,36,24,0.2)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-7 pt-6 pb-4">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Guided onboarding · ~3 min
            </p>
            <h3 className="mt-1 font-serif font-bold text-[22px] leading-tight text-ink">
              Your wedding soundtrack in 5 questions
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz"
            className="-mr-1 -mt-1 rounded p-1 text-ink-muted transition-colors hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between px-7 pt-4 pb-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Question {step + 1} of {total}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-6 rounded-full ${i <= step ? "bg-[#B8860B]" : "bg-[#B8860B]/20"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-7 pb-4 pt-4">
          <p className="font-serif text-[18px] leading-snug text-ink">
            {q.label}
          </p>

          {q.type === "single" && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {q.options!.map((opt) => {
                const active = answers[q.key as "sangeetVision" | "musicType"] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [q.key]: opt } as QuizAnswers))
                    }
                    className={`rounded-lg border px-4 py-3 text-left text-[13px] transition-all ${
                      active
                        ? "border-[#B8860B] bg-[#B8860B]/5 text-[#1A1A1A] shadow-sm"
                        : "border-[#1A1A1A]/10 bg-white text-[#2E2E2E] hover:border-[#B8860B]/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {active && <Check size={14} className="text-[#B8860B]" />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "multi" && (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {q.options!.map((opt) => {
                  const arr = answers[q.key as "genres" | "moments"];
                  const active = arr.includes(opt as never);
                  const locked =
                    !active && "max" in q && q.max && arr.length >= (q.max as number);
                  return (
                    <Pill
                      key={opt}
                      active={active}
                      onClick={() => {
                        if (locked) return;
                        setAnswers((a) => {
                          const cur = a[q.key as "genres" | "moments"];
                          const next = active
                            ? cur.filter((x) => x !== opt)
                            : [...cur, opt];
                          return { ...a, [q.key]: next } as QuizAnswers;
                        });
                      }}
                    >
                      {active && <Check size={11} />} {opt}
                    </Pill>
                  );
                })}
              </div>
              {"max" in q && (
                <p className="mt-2 text-[11px] text-[#A3A3A3]">
                  {(answers[q.key as "genres" | "moments"] as string[]).length} / {q.max} selected
                </p>
              )}
            </>
          )}

          {q.type === "slider" && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                <span>{q.leftLabel}</span>
                <span>{q.rightLabel}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={answers.wildness}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, wildness: Number(e.target.value) }))
                }
                className="mt-2 w-full accent-[#B8860B]"
              />
              <p className="mt-2 text-center text-[13px] text-[#1A1A1A]">
                {answers.wildness < 33
                  ? "Composed & intentional"
                  : answers.wildness < 66
                  ? "Lively with moments of calm"
                  : "Full send — keep the floor packed"}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-7 py-4">
          <Btn
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Back
          </Btn>
          <Btn variant="gold" size="md" onClick={handleNext} disabled={!canProceed}>
            {step === total - 1 ? "Generate my sound brief" : "Next"}
            <ChevronRight size={13} />
          </Btn>
        </div>
      </div>
    </div>
  );
}

function buildBrief(q: QuizAnswers): string {
  const topGenres = q.genres.slice(0, 3).join(", ") || "an open palette";
  const party =
    q.wildness >= 75
      ? "a full-production Bollywood party"
      : q.wildness >= 50
      ? "a lively, layered celebration"
      : "an elegant, composed evening";
  const momentList = q.moments.length
    ? q.moments.slice(0, 3).map((m) => m.toLowerCase()).join(", ")
    : "meaningful cultural beats";
  return `Your wedding builds from acoustic and intimate (Haldi, Ceremony) to ${party} (Sangeet, Reception). ${q.musicType} for the big events. Genres: ${topGenres} dominate. Non-negotiables: ${momentList}.`;
}

function buildEnergyMap(q: QuizAnswers): EventEnergy {
  const w = q.wildness / 100;
  return {
    haldi: Math.round(25 + w * 10),
    mehendi: Math.round(40 + w * 10),
    sangeet: Math.round(70 + w * 25),
    ceremony: Math.round(40 + w * 15),
    reception: Math.round(75 + w * 22),
  };
}

// ─── Sound Brief ─────────────────────────────────────────────────────────

function SoundBriefCard({
  state,
  patch,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(state.soundBrief.text);

  useEffect(() => setDraft(state.soundBrief.text), [state.soundBrief.text]);

  const refine = () => {
    const fresh = state.quiz ? buildBrief(state.quiz) : state.soundBrief.text;
    patch({ soundBrief: { text: fresh } });
    setEditing(false);
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="Sound Brief"
        title="The story your music tells"
        note="Auto-drafted from your quiz. Edit freely."
        right={
          <div className="flex gap-2">
            <AIButton onClick={refine}>Refine with AI</AIButton>
            {editing ? (
              <Btn
                variant="gold"
                size="sm"
                onClick={() => {
                  patch({ soundBrief: { text: draft } });
                  setEditing(false);
                }}
              >
                Save
              </Btn>
            ) : (
              <Btn variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit3 size={12} /> Edit
              </Btn>
            )}
          </div>
        }
      />
      {editing ? (
        <Textarea value={draft} onChange={setDraft} rows={5} />
      ) : (
        <p
          className="rounded-lg border-l-2 border-[#B8860B] bg-[#F0E4C8]/30 px-5 py-4 text-[15px] leading-relaxed text-[#1A1A1A]"
          style={FONT_SERIF}
        >
          {state.soundBrief.text ||
            "Take the quiz above and we'll draft your sound story."}
        </p>
      )}
    </Card>
  );
}

// ─── Energy Map ──────────────────────────────────────────────────────────

function EnergyMapCard({
  state,
  patch,
  setState,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<EventId | null>(null);

  const points = EVENTS.map((e, i) => ({
    id: e.id,
    label: e.label,
    x: 60 + i * ((900 - 120) / (EVENTS.length - 1)),
    y: 240 - (state.energyMap[e.id] / 100) * 200,
    v: state.energyMap[e.id],
  }));

  const handleMove = (clientX: number, clientY: number, id: EventId) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const yPct = 1 - Math.min(1, Math.max(0, (clientY - r.top - 20) / (r.height - 40)));
    const v = Math.round(yPct * 100);
    setState((s) => ({ ...s, energyMap: { ...s.energyMap, [id]: Math.max(0, Math.min(100, v)) } }));
  };

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <Card>
      <SectionHeading
        eyebrow="Energy Map"
        title="The emotional arc of your wedding"
        note="Drag each dot to shape the energy per event. DJ and band read this as a visual roadmap."
      />

      <div className="-mx-2 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 960 280"
          className="min-w-[720px] w-full"
          onMouseMove={(e) => dragging && handleMove(e.clientX, e.clientY, dragging)}
          onMouseUp={() => setDragging(null)}
          onMouseLeave={() => setDragging(null)}
          onTouchMove={(e) => {
            if (!dragging) return;
            const t = e.touches[0];
            if (t) handleMove(t.clientX, t.clientY, dragging);
          }}
          onTouchEnd={() => setDragging(null)}
        >
          {/* Grid */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = 240 - (v / 100) * 200;
            return (
              <g key={v}>
                <line x1={50} x2={910} y1={y} y2={y} stroke="#B8860B" strokeOpacity={0.1} strokeDasharray="3 5" />
                <text x={20} y={y + 4} fontSize={10} fill="#A3A3A3">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Arc line (filled beneath) */}
          <path
            d={`${path} L ${points[points.length - 1]!.x} 240 L ${points[0]!.x} 240 Z`}
            fill="url(#energyGrad)"
            opacity={0.25}
          />
          <defs>
            <linearGradient id="energyGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#D4A24C" />
              <stop offset="60%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#9C4F2A" />
            </linearGradient>
          </defs>
          <path d={path} stroke="#B8860B" strokeWidth={2} fill="none" />

          {/* Dots */}
          {points.map((p) => (
            <g key={p.id} style={{ cursor: "grab" }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                fill="white"
                stroke={energyColor(p.v)}
                strokeWidth={3}
                onMouseDown={() => setDragging(p.id)}
                onTouchStart={() => setDragging(p.id)}
              />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fill="#1A1A1A" fontWeight={600}>
                {p.v}
              </text>
              <text x={p.x} y={265} textAnchor="middle" fontSize={12} fill="#1A1A1A" style={{ fontFamily: FONT_SERIF.fontFamily }}>
                {p.label}
              </text>
              <text x={p.x} y={280} textAnchor="middle" fontSize={9} fill="#6B6B6B" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {energyLabel(p.v)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Per-event sliders */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {EVENTS.map((e) => {
          const v = state.energyMap[e.id];
          return (
            <div key={e.id} className="rounded-lg border border-[#1A1A1A]/8 bg-[#FBF9F4] p-3">
              <p className="text-[12px] font-medium text-[#1A1A1A]" style={FONT_SERIF}>
                {e.label}
              </p>
              <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: energyColor(v) }}>
                {energyLabel(v)}
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={v}
                onChange={(ev) =>
                  setState((s) => ({
                    ...s,
                    energyMap: { ...s.energyMap, [e.id]: Number(ev.target.value) },
                  }))
                }
                className="mt-2 w-full"
                style={{ accentColor: energyColor(v) }}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Genre Palette ───────────────────────────────────────────────────────

function GenrePaletteCard({
  state,
  patch,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
}) {
  const [addingOpen, setAddingOpen] = useState(false);
  const [suggestEvent, setSuggestEvent] = useState<EventId | null>(null);
  const [suggestion, setSuggestion] = useState("");

  const suggest = (eventId: EventId) => {
    const e = state.energyMap[eventId];
    const base = state.genrePalette.length ? state.genrePalette : ["Classic Bollywood", "Modern Bollywood/Punjabi"];
    let mix: string[] = [];
    if (eventId === "haldi" || eventId === "ceremony")
      mix = base.filter((g) => /Folk|Acoustic|Classical|Sufi/.test(g)).slice(0, 3);
    else if (eventId === "mehendi") mix = base.filter((g) => /Folk|Sufi|Indie|Classic/.test(g)).slice(0, 3);
    else if (eventId === "sangeet")
      mix = base.filter((g) => /Modern|Punjabi|EDM|Hip/.test(g)).slice(0, 3);
    else mix = base.filter((g) => /Western|EDM|Modern|Latin/.test(g)).slice(0, 3);
    if (!mix.length) mix = base.slice(0, 3);
    setSuggestEvent(eventId);
    setSuggestion(mix.join(" + "));
  };

  const toggle = (g: Genre) => {
    patch({
      genrePalette: state.genrePalette.includes(g)
        ? state.genrePalette.filter((x) => x !== g)
        : [...state.genrePalette, g],
    });
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="Genre Palette"
        title="The sound of your celebration"
        note="Your chosen genres. Add, remove, and get per-event mixes."
      />

      <div className="flex flex-wrap gap-2">
        {state.genrePalette.map((g) => (
          <span
            key={g}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#B8860B]/40 bg-[#F0E4C8]/50 px-3 py-1 text-[12px] text-[#1A1A1A]"
          >
            {g}
            <button onClick={() => toggle(g)} className="text-[#B8860B] hover:text-[#9c720a]" aria-label={`Remove ${g}`}>
              <X size={11} />
            </button>
          </span>
        ))}
        <button
          onClick={() => setAddingOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#B8860B]/50 px-3 py-1 text-[12px] text-[#8a6300] hover:bg-[#F0E4C8]/40"
        >
          <Plus size={11} /> Add genre
        </button>
      </div>

      {addingOpen && (
        <div className="mt-4 flex flex-wrap gap-2 rounded-lg border border-[#1A1A1A]/8 bg-[#FBF9F4] p-3">
          {GENRE_OPTIONS.filter((g) => !state.genrePalette.includes(g)).map((g) => (
            <Pill
              key={g}
              onClick={() => {
                toggle(g);
              }}
            >
              <Plus size={10} /> {g}
            </Pill>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-[#1A1A1A]/8 bg-[#FBF9F4] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-[#6B6B6B]">Suggest genres for</span>
          {EVENTS.map((e) => (
            <AIButton key={e.id} size="xs" onClick={() => suggest(e.id)}>
              {e.label}
            </AIButton>
          ))}
        </div>
        {suggestEvent && (
          <p className="mt-3 rounded border-l-2 border-[#B8860B] bg-white px-3 py-2 text-[13px] text-[#1A1A1A]">
            <span className="font-medium">{EVENTS.find((e) => e.id === suggestEvent)!.label}:</span>{" "}
            {suggestion}
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Music Explorer ──────────────────────────────────────────────────────

function MusicExplorerCard({
  state,
  setState,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(MUSIC_EXPLORER)[0]!);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [tagFor, setTagFor] = useState<string | null>(null);

  const savedIds = new Set(state.savedSongs.map((s) => s.sampleId));
  const dismissedIds = new Set(state.dismissedSongs);

  const toggleHeart = (id: string) => {
    setState((s) => {
      if (s.savedSongs.find((x) => x.sampleId === id)) {
        return { ...s, savedSongs: s.savedSongs.filter((x) => x.sampleId !== id) };
      }
      return { ...s, savedSongs: [...s.savedSongs, { sampleId: id, savedAt: Date.now() }] };
    });
  };

  const dismiss = (id: string) => {
    setState((s) => ({ ...s, dismissedSongs: [...s.dismissedSongs, id] }));
  };

  const tagSong = (id: string, tag: SavedSong["eventTag"]) => {
    setState((s) => ({
      ...s,
      savedSongs: s.savedSongs.map((x) => (x.sampleId === id ? { ...x, eventTag: tag } : x)),
    }));
    setTagFor(null);
  };

  const saveNote = (id: string) => {
    setState((s) => ({
      ...s,
      savedSongs: s.savedSongs.map((x) => (x.sampleId === id ? { ...x, note: noteDraft } : x)),
    }));
    setNoteFor(null);
    setNoteDraft("");
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="Music Explorer"
        title="Discover by vibe"
        note="Play, heart, save, and tag. Build your wedding playlist the way you build a favorites list."
      />

      {/* Category tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {Object.keys(MUSIC_EXPLORER).map((c) => (
          <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>
            {c}
          </Pill>
        ))}
      </div>

      <div className="grid gap-3">
        {MUSIC_EXPLORER[activeCategory]!.filter((s) => !dismissedIds.has(s.id)).map((song) => {
          const saved = state.savedSongs.find((x) => x.sampleId === song.id);
          const isPlaying = playing === song.id;
          return (
            <div
              key={song.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[#1A1A1A]/8 bg-white p-3 transition-colors hover:border-[#B8860B]/30"
            >
              <button
                onClick={() => setPlaying(isPlaying ? null : song.id)}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                  isPlaying ? "bg-[#B8860B] text-white" : "bg-[#F0E4C8] text-[#8a6300]"
                }`}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-[#1A1A1A]" style={FONT_SERIF}>
                  {song.title}
                </p>
                <p className="truncate text-[12px] text-[#6B6B6B]">
                  {song.artist} · {song.mood} · {song.duration}
                </p>
              </div>

              {/* Waveform */}
              <div className="hidden sm:flex h-8 items-center gap-0.5">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{
                      height: `${10 + (Math.sin(i * 0.7 + song.id.length) * 0.5 + 0.5) * 20}px`,
                      background: isPlaying ? "#B8860B" : "#D4A24C66",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleHeart(song.id)}
                  className={`grid h-8 w-8 place-items-center rounded-full hover:bg-[#F5E6C8] ${
                    saved ? "text-[#C97B63]" : "text-[#A3A3A3]"
                  }`}
                  aria-label="Save song"
                >
                  <Heart size={14} fill={saved ? "currentColor" : "none"} strokeWidth={1.8} />
                </button>

                {saved && (
                  <>
                    <button
                      onClick={() => setTagFor(tagFor === song.id ? null : song.id)}
                      className="rounded-md border border-[#1A1A1A]/10 px-2 py-1 text-[11px] text-[#2E2E2E] hover:border-[#B8860B]/40"
                    >
                      {saved.eventTag
                        ? `Tagged: ${saved.eventTag.replace("-", " ")}`
                        : "+ Tag"}
                    </button>
                    <button
                      onClick={() => {
                        setNoteFor(song.id);
                        setNoteDraft(saved.note ?? "");
                      }}
                      className="rounded-md border border-[#1A1A1A]/10 px-2 py-1 text-[11px] text-[#2E2E2E] hover:border-[#B8860B]/40"
                    >
                      {saved.note ? "Note" : "+ Note"}
                    </button>
                    <AIButton size="xs" onClick={() => alert("Generating 4 similar picks…")}>
                      More like this
                    </AIButton>
                  </>
                )}

                <button
                  onClick={() => dismiss(song.id)}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#A3A3A3] hover:bg-[#F5E0D6]/50 hover:text-[#C97B63]"
                  aria-label="Not for us"
                  title="Not for us"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Tag menu */}
              {tagFor === song.id && saved && (
                <div className="w-full rounded-lg border border-[#1A1A1A]/10 bg-[#FBF9F4] p-3">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">
                    Tag to event
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["first-dance", "baraat", "entrance", ...EVENTS.map((e) => e.id), "other"] as const).map(
                      (t) => (
                        <Pill
                          key={t}
                          active={saved.eventTag === t}
                          onClick={() => tagSong(song.id, t)}
                        >
                          {t.replace("-", " ")}
                        </Pill>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Note editor */}
              {noteFor === song.id && (
                <div className="w-full space-y-2">
                  <Textarea
                    value={noteDraft}
                    onChange={setNoteDraft}
                    placeholder="e.g., Love the energy but too fast / This is THE song for our entrance"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Btn size="xs" variant="gold" onClick={() => saveNote(song.id)}>
                      Save note
                    </Btn>
                    <Btn size="xs" variant="ghost" onClick={() => setNoteFor(null)}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}
              {saved?.note && noteFor !== song.id && (
                <p className="w-full rounded border-l-2 border-[#B8860B] bg-[#FBF9F4] px-3 py-2 text-[12px] italic text-[#2E2E2E]">
                  "{saved.note}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Your favorites */}
      {state.savedSongs.length > 0 && (
        <div className="mt-6 rounded-lg border border-[#B8860B]/30 bg-[#F0E4C8]/30 p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#B8860B]">
            Your favorites · {state.savedSongs.length}
          </p>
          <p className="mt-1 text-[13px] text-[#6B6B6B]">
            Saved songs flow into the right event playlists automatically.
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Non-Negotiable Moments ──────────────────────────────────────────────

function NonNegotiableCard({
  state,
  setState,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const add = () => {
    const m: NonNegotiableMoment = {
      id: uid(),
      moment: "",
      event: "",
      songArtist: "",
      status: "Still exploring",
    };
    setState((s) => ({ ...s, nonNegotiable: [...s.nonNegotiable, m] }));
  };

  const update = (id: string, patch: Partial<NonNegotiableMoment>) => {
    setState((s) => ({
      ...s,
      nonNegotiable: s.nonNegotiable.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const remove = (id: string) => {
    setState((s) => ({ ...s, nonNegotiable: s.nonNegotiable.filter((m) => m.id !== id) }));
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="Non-Negotiable Moments"
        title="The must-do music beats"
        note="These are flagged for the DJ and band as the moments that absolutely happen."
        right={
          <Btn variant="gold" size="sm" onClick={add}>
            <Plus size={12} /> Add moment
          </Btn>
        }
      />

      {state.nonNegotiable.length === 0 ? (
        <EmptyState
          icon={<Star size={18} strokeWidth={1.6} />}
          title="No non-negotiables yet"
          hint="Your first dance? The Baraat dhol? The Vidaai song? Add anything that absolutely must happen."
          action={
            <Btn variant="outline" size="sm" onClick={add}>
              <Plus size={12} /> Add your first
            </Btn>
          }
        />
      ) : (
        <div className="space-y-3">
          {state.nonNegotiable.map((m) => (
            <div
              key={m.id}
              className="grid gap-3 rounded-lg border border-[#1A1A1A]/8 bg-white p-4 sm:grid-cols-[1.6fr_1fr_1.4fr_1fr_auto]"
            >
              <Input
                value={m.moment}
                onChange={(v) => update(m.id, { moment: v })}
                placeholder="e.g., Couple's first dance"
              />
              <select
                value={m.event}
                onChange={(e) => update(m.id, { event: e.target.value as EventId })}
                className="rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[13px]"
              >
                <option value="">Event…</option>
                {EVENTS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <Input
                value={m.songArtist}
                onChange={(v) => update(m.id, { songArtist: v })}
                placeholder="Song / artist (if decided)"
              />
              <select
                value={m.status}
                onChange={(e) => update(m.id, { status: e.target.value as NonNegotiableMoment["status"] })}
                className="rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[13px]"
              >
                <option>Song picked</option>
                <option>Still exploring</option>
                <option>Need DJ input</option>
              </select>
              <button
                onClick={() => remove(m.id)}
                className="grid h-9 w-9 place-items-center rounded-md text-[#A3A3A3] hover:bg-[#F5E0D6]/50 hover:text-[#C97B63]"
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Do Not Play List ────────────────────────────────────────────────────

function DoNotPlayCard({
  state,
  setState,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    setState((s) => ({ ...s, doNotPlay: [...s.doNotPlay, draft.trim()] }));
    setDraft("");
  };

  const remove = (i: number) => {
    setState((s) => ({ ...s, doNotPlay: s.doNotPlay.filter((_, idx) => idx !== i) }));
  };

  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3"
      >
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#B8860B]">Do Not Play</p>
          <h2 className="mt-1 font-bold text-[22px] text-[#1A1A1A]" style={FONT_SERIF}>
            Every couple has songs they never want to hear at their wedding
          </h2>
          {state.doNotPlay.length > 0 && (
            <p className="mt-0.5 text-[12px] text-[#6B6B6B]">
              {state.doNotPlay.length} song{state.doNotPlay.length === 1 ? "" : "s"} on the list — sent straight to the DJ
            </p>
          )}
        </div>
        <ChevronDown size={18} className={`shrink-0 text-[#6B6B6B] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-5">
          <div className="flex gap-2">
            <Input value={draft} onChange={setDraft} placeholder="Song or artist" />
            <Btn variant="outline" size="md" onClick={add}>
              <Plus size={12} /> Add
            </Btn>
          </div>
          {state.doNotPlay.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {state.doNotPlay.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded border border-[#1A1A1A]/8 bg-[#FBF9F4] px-3 py-2 text-[13px] text-[#2E2E2E]"
                >
                  <span className="flex items-center gap-2">
                    <MicOff size={12} className="text-[#C97B63]" /> {s}
                  </span>
                  <button onClick={() => remove(i)} className="text-[#A3A3A3] hover:text-[#C97B63]">
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// TAB 2 — SPEECHES & MC
// ═════════════════════════════════════════════════════════════════════════

function SpeechesAndMCTab({
  state,
  patch,
  setState,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8860B]">Section A</p>
        <h2 className="mt-1 mb-5 font-bold text-[32px] text-[#1A1A1A]" style={FONT_SERIF}>
          Speeches
        </h2>
        <SpeechPlannerCard state={state} setState={setState} />
        <div className="mt-6">
          <CoupleSpeechCard state={state} patch={patch} setState={setState} />
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8860B]">Section B</p>
        <h2 className="mt-1 mb-5 font-bold text-[32px] text-[#1A1A1A]" style={FONT_SERIF}>
          MC / Emcee Direction
        </h2>
        <MCToneCard state={state} patch={patch} />
        <div className="mt-6">
          <MCNotesCard state={state} patch={patch} setState={setState} />
        </div>
        <div className="mt-6">
          <PronunciationCard state={state} setState={setState} />
        </div>
      </div>
    </div>
  );
}

// ─── Speech Planner ──────────────────────────────────────────────────────

function SpeechPlannerCard({
  state,
  setState,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [teleFor, setTeleFor] = useState<string | null>(null);
  const [inviteShown, setInviteShown] = useState<string | null>(null);

  const add = () => {
    const s: Speech = {
      id: uid(),
      speaker: "",
      relationship: "",
      event: "",
      timing: "",
      timeLimit: "3 min",
      status: "Invited",
      draft: "",
      guidanceNotes: "",
      tone: "Mix of both",
      sharedWithCouple: false,
      coupleNotes: "",
      order: state.speeches.length,
    };
    setState((p) => ({ ...p, speeches: [...p.speeches, s] }));
    setActiveSpeech(s.id);
  };

  const update = (id: string, patch: Partial<Speech>) => {
    setState((p) => ({
      ...p,
      speeches: p.speeches.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  };

  const remove = (id: string) => {
    setState((p) => ({ ...p, speeches: p.speeches.filter((s) => s.id !== id) }));
    if (activeSpeech === id) setActiveSpeech(null);
  };

  const reorder = (id: string, dir: -1 | 1) => {
    setState((p) => {
      const sorted = [...p.speeches].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= sorted.length) return p;
      [sorted[idx]!.order, sorted[swap]!.order] = [sorted[swap]!.order, sorted[idx]!.order];
      return { ...p, speeches: sorted };
    });
  };

  const suggestLineup = () => {
    setState((p) => {
      const sorted = [...p.speeches];
      // Couple last, parents before couple, friends first — simple heuristic.
      const priority = (r: string) => {
        const x = r.toLowerCase();
        if (x.includes("couple")) return 100;
        if (x.includes("father") || x.includes("mother")) return 80;
        if (x.includes("sibling")) return 60;
        if (x.includes("best") || x.includes("maid")) return 30;
        return 50;
      };
      sorted.sort((a, b) => priority(a.relationship) - priority(b.relationship));
      sorted.forEach((s, i) => (s.order = i));
      return { ...p, speeches: sorted };
    });
  };

  const sorted = [...state.speeches].sort((a, b) => a.order - b.order);

  return (
    <>
      <Card>
        <SectionHeading
          eyebrow="Speech Planner"
          title="Who speaks, when, and for how long"
          note="Add speakers, set the order, track their prep. Invite them to write through the workspace."
          right={
            <div className="flex gap-2">
              {state.speeches.length >= 2 && (
                <AIButton onClick={suggestLineup}>Suggest a speech lineup</AIButton>
              )}
              <Btn variant="gold" size="sm" onClick={add}>
                <Plus size={12} /> Add a speech
              </Btn>
            </div>
          }
        />

        {state.speeches.length === 0 ? (
          <EmptyState
            icon={<Mic size={18} strokeWidth={1.6} />}
            title="No speeches planned yet"
            hint="Who's going to make everyone cry? Add the speakers and we'll help them write."
            action={
              <Btn variant="outline" size="sm" onClick={add}>
                <Plus size={12} /> Add your first speech
              </Btn>
            }
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((s, i) => (
              <div
                key={s.id}
                className="rounded-lg border border-[#1A1A1A]/8 bg-white p-4 transition-colors hover:border-[#B8860B]/30"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F0E4C8] text-[12px] font-medium text-[#8a6300]">
                    {i + 1}
                  </span>
                  <div className="min-w-[140px] flex-1">
                    <Input
                      value={s.speaker}
                      onChange={(v) => update(s.id, { speaker: v })}
                      placeholder="Speaker name"
                    />
                  </div>
                  <select
                    value={s.relationship}
                    onChange={(e) => update(s.id, { relationship: e.target.value })}
                    className="rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[12px]"
                  >
                    <option value="">Relationship…</option>
                    <option>Best man</option>
                    <option>Maid of honor</option>
                    <option>Father of the bride</option>
                    <option>Mother of the groom</option>
                    <option>Friend</option>
                    <option>Sibling</option>
                    <option>Couple themselves</option>
                    <option>Other</option>
                  </select>
                  <select
                    value={s.event}
                    onChange={(e) => update(s.id, { event: e.target.value as Speech["event"] })}
                    className="rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[12px]"
                  >
                    <option value="">Event…</option>
                    <option value="rehearsal">Rehearsal dinner</option>
                    {EVENTS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={s.timeLimit}
                    onChange={(e) => update(s.id, { timeLimit: e.target.value })}
                    className="rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-2 text-[12px]"
                  >
                    <option>2 min</option>
                    <option>3 min</option>
                    <option>5 min</option>
                    <option>No limit</option>
                  </select>
                  <StatusChip status={s.status} />
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => reorder(s.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-md text-[#A3A3A3] hover:bg-[#F5F1E8]"
                      aria-label="Move up"
                    >
                      <ChevronDown size={13} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => reorder(s.id, 1)}
                      className="grid h-7 w-7 place-items-center rounded-md text-[#A3A3A3] hover:bg-[#F5F1E8]"
                      aria-label="Move down"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Btn
                    size="xs"
                    variant="outline"
                    onClick={() => setActiveSpeech(activeSpeech === s.id ? null : s.id)}
                  >
                    {activeSpeech === s.id ? "Close workspace" : "Open speech workspace"}
                  </Btn>
                  <Btn size="xs" variant="ghost" onClick={() => setInviteShown(s.id)}>
                    <Send size={11} /> Invite speaker
                  </Btn>
                  {s.draft && (
                    <Btn size="xs" variant="ghost" onClick={() => setTeleFor(s.id)}>
                      <Play size={11} /> Teleprompter
                    </Btn>
                  )}
                  <Btn size="xs" variant="danger" onClick={() => remove(s.id)}>
                    <Trash2 size={11} />
                  </Btn>
                </div>

                {activeSpeech === s.id && (
                  <SpeechWorkspace
                    speech={s}
                    onUpdate={(p) => update(s.id, p)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Invite modal */}
      {inviteShown && (
        <InviteModal
          speech={state.speeches.find((s) => s.id === inviteShown)!}
          onClose={() => setInviteShown(null)}
        />
      )}

      {/* Teleprompter */}
      {teleFor && (
        <Teleprompter
          speech={state.speeches.find((s) => s.id === teleFor)!}
          onClose={() => setTeleFor(null)}
        />
      )}
    </>
  );
}

function StatusChip({ status }: { status: SpeechStatus }) {
  const color: Record<SpeechStatus, string> = {
    Invited: "bg-[#F5E0D6]/60 text-[#C97B63] border-[#C97B63]/30",
    Accepted: "bg-[#E8F0E0] text-[#4a6b3a] border-[#9CAF88]/40",
    "Draft in progress": "bg-[#F0E4C8]/60 text-[#8a6300] border-[#B8860B]/30",
    Rehearsed: "bg-[#DCE9E7] text-[#3d6562] border-[#5B8E8A]/30",
    Ready: "bg-[#1A1A1A] text-white border-[#1A1A1A]",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] ${color[status]}`}>
      {status}
    </span>
  );
}

// ─── Speech Workspace (AI writer) ────────────────────────────────────────

function SpeechWorkspace({
  speech,
  onUpdate,
}: {
  speech: Speech;
  onUpdate: (p: Partial<Speech>) => void;
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAnswers, setAiAnswers] = useState({
    relationship: "",
    memory: "",
    feeling: "",
    jokes: "",
  });

  const generate = () => {
    const draft = `${speech.speaker ? `Hey everyone — my name is ${speech.speaker}${speech.relationship ? ` and I'm ${speech.relationship.toLowerCase()}.` : "."}` : "Hi everyone."}\n\n${
      aiAnswers.memory ? `I still think about ${aiAnswers.memory.toLowerCase()}. ` : ""
    }${aiAnswers.jokes ? `And if you've known them as long as I have, you know ${aiAnswers.jokes.toLowerCase()}. ` : ""}\n\n${
      aiAnswers.relationship
        ? `What I love about them is ${aiAnswers.relationship.toLowerCase()}. `
        : ""
    }${
      aiAnswers.feeling
        ? `If I can leave you with one thing tonight, it's this — ${aiAnswers.feeling.toLowerCase()}.`
        : ""
    }\n\nSo please — raise your glass. To the happy couple.`;
    onUpdate({ draft, status: "Draft in progress" });
    setAiOpen(false);
  };

  const refine = (kind: "funnier" | "shorter" | "emotional") => {
    const suffix =
      kind === "funnier"
        ? "\n\n[+ punchier joke about the couple's first date]"
        : kind === "shorter"
        ? " (tightened — 1 min read)"
        : "\n\n…and the first time I saw the two of you together, I knew. Really knew.";
    onUpdate({ draft: (speech.draft || "") + suffix });
  };

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-[#B8860B]/20 bg-gradient-to-br from-[#FBF9F4] to-[#F0E4C8]/20 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">
            Guidance notes for the speaker
          </label>
          <Textarea
            value={speech.guidanceNotes}
            onChange={(v) => onUpdate({ guidanceNotes: v })}
            placeholder="Tone, topics to include/avoid, inside jokes to reference…"
            rows={4}
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">Tone</label>
          <select
            value={speech.tone}
            onChange={(e) => onUpdate({ tone: e.target.value as SpeechTone })}
            className="mt-1 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[13px]"
          >
            <option>Funny &amp; roast-style</option>
            <option>Heartfelt &amp; emotional</option>
            <option>Mix of both</option>
            <option>Short &amp; sweet</option>
            <option>Formal &amp; traditional</option>
          </select>
          <label className="mt-3 flex items-center gap-2 text-[12px] text-[#2E2E2E]">
            <input
              type="checkbox"
              checked={speech.sharedWithCouple}
              onChange={(e) => onUpdate({ sharedWithCouple: e.target.checked })}
              className="accent-[#B8860B]"
            />
            Speaker shared draft with the couple
          </label>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">
            Speech draft
          </label>
          <div className="flex flex-wrap gap-2">
            <AIButton size="xs" onClick={() => setAiOpen((v) => !v)}>
              Help me write this
            </AIButton>
            {speech.draft && (
              <>
                <AIButton size="xs" onClick={() => refine("funnier")}>
                  Make it funnier
                </AIButton>
                <AIButton size="xs" onClick={() => refine("shorter")}>
                  Make it shorter
                </AIButton>
                <AIButton size="xs" onClick={() => refine("emotional")}>
                  Make it more emotional
                </AIButton>
              </>
            )}
            <select
              value={speech.status}
              onChange={(e) => onUpdate({ status: e.target.value as SpeechStatus })}
              className="rounded-md border border-[#1A1A1A]/15 bg-white px-2 py-1 text-[11px]"
            >
              <option>Invited</option>
              <option>Accepted</option>
              <option>Draft in progress</option>
              <option>Rehearsed</option>
              <option>Ready</option>
            </select>
          </div>
        </div>

        {aiOpen && (
          <div className="mb-3 space-y-3 rounded-lg border border-[#B8860B]/25 bg-white p-4">
            <p className="text-[13px] text-[#1A1A1A]" style={FONT_SERIF}>
              Let's write this together. A few warm-up questions.
            </p>
            <Input
              value={aiAnswers.relationship}
              onChange={(v) => setAiAnswers((a) => ({ ...a, relationship: v }))}
              placeholder="Tell me about your relationship with them…"
            />
            <Input
              value={aiAnswers.memory}
              onChange={(v) => setAiAnswers((a) => ({ ...a, memory: v }))}
              placeholder="A favorite memory…"
            />
            <Input
              value={aiAnswers.feeling}
              onChange={(v) => setAiAnswers((a) => ({ ...a, feeling: v }))}
              placeholder="What do you want them to feel when you're done?"
            />
            <Input
              value={aiAnswers.jokes}
              onChange={(v) => setAiAnswers((a) => ({ ...a, jokes: v }))}
              placeholder="Inside joke or story to reference…"
            />
            <Btn variant="gold" size="sm" onClick={generate}>
              <Sparkles size={12} /> Draft my speech
            </Btn>
          </div>
        )}

        <Textarea
          value={speech.draft}
          onChange={(v) => onUpdate({ draft: v })}
          rows={speech.draft ? 10 : 5}
          placeholder="Write or paste the speech here, or tap 'Help me write this' to start conversationally."
        />
      </div>

      {/* Couple notes */}
      {speech.sharedWithCouple && (
        <div className="rounded-lg border border-[#1A1A1A]/8 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">
            Couple's notes (gentle — not edits)
          </p>
          <Textarea
            value={speech.coupleNotes}
            onChange={(v) => onUpdate({ coupleNotes: v })}
            placeholder="Love the story about college — maybe skip the part about Vegas?"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}

// ─── Invite Modal ────────────────────────────────────────────────────────

function InviteModal({ speech, onClose }: { speech: Speech; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/speech/${speech.id}`
    : `/speech/${speech.id}`;

  const copy = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1A1A1A]/40 px-4">
      <Card className="w-full max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8860B]">Invite speaker</p>
            <h3 className="mt-1 font-bold text-[22px] text-[#1A1A1A]" style={FONT_SERIF}>
              Send {speech.speaker || "the speaker"} their link
            </h3>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-[#F5F1E8]">
            <X size={16} />
          </button>
        </div>
        <p className="mt-3 text-[13px] text-[#6B6B6B]">
          They'll see only their speech card — not the full wedding workspace.
          They can write their draft, use the AI writer, and launch teleprompter mode on the day.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#1A1A1A]/10 bg-[#FBF9F4] p-3">
          <code className="truncate text-[12px] text-[#2E2E2E]">{inviteUrl}</code>
          <Btn size="sm" variant="gold" onClick={copy}>
            <Copy size={12} /> {copied ? "Copied!" : "Copy link"}
          </Btn>
        </div>
        <div className="mt-5 flex justify-end">
          <Btn variant="outline" size="sm" onClick={onClose}>
            Done
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Teleprompter ────────────────────────────────────────────────────────

function Teleprompter({ speech, onClose }: { speech: Speech; onClose: () => void }) {
  const [fontSize, setFontSize] = useState<"S" | "M" | "L" | "XL">("L");
  const [speed, setSpeed] = useState(60); // px/s
  const [playing, setPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const sizes = { S: 22, M: 28, L: 38, XL: 52 };
  const limitSec = parseInt(speech.timeLimit) * 60 || 0;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setOffset((o) => o + dt * speed);
      setElapsed((e) => e + dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed]);

  const progressPct = viewRef.current
    ? Math.min(100, (offset / (viewRef.current.scrollHeight || 1)) * 100)
    : 0;

  const overLimit = limitSec > 0 && elapsed > limitSec;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] text-[#FBF9F4]">
      {/* Top controls */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/10">
            <X size={16} />
          </button>
          <p className="text-[12px] text-white/70" style={FONT_SERIF}>
            {speech.speaker || "Speaker"} · {speech.relationship || "Speech"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["S", "M", "L", "XL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={`rounded px-2 py-0.5 text-[11px] ${
                fontSize === s ? "bg-[#B8860B] text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        className="relative flex-1 overflow-hidden"
        onClick={() => setPlaying((p) => !p)}
      >
        <div
          ref={viewRef}
          style={{
            ...FONT_SERIF,
            fontSize: sizes[fontSize],
            lineHeight: 1.5,
            transform: `translateY(${-offset}px)`,
            transition: "transform 0.05s linear",
          }}
          className="absolute inset-x-0 top-0 whitespace-pre-wrap px-8 pt-[40%] pb-[80%] text-[#F0E4C8]"
        >
          {speech.draft || "No draft yet. Tap pause and paste your speech."}
        </div>

        {/* Center guide line */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[#B8860B]/40" />

        {/* Pause overlay */}
        {!playing && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20">
            <div className="rounded-full bg-[#B8860B] p-6">
              <Play size={28} className="ml-1 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="mb-2 flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#B8860B] text-white"
          >
            {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60">Speed</span>
            <button onClick={() => setSpeed(Math.max(20, speed - 10))} className="rounded bg-white/10 p-1">
              <Minus size={11} />
            </button>
            <span className="w-8 text-center text-[12px]">{speed}</span>
            <button onClick={() => setSpeed(Math.min(200, speed + 10))} className="rounded bg-white/10 p-1">
              <Plus size={11} />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Timer size={12} className={overLimit ? "text-[#C97B63]" : "text-white/60"} />
            <span className={`text-[12px] ${overLimit ? "text-[#C97B63]" : "text-white/80"}`}>
              {formatTime(elapsed)}
              {limitSec > 0 && <span className="text-white/40"> / {formatTime(limitSec)}</span>}
            </span>
          </div>
        </div>
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[#B8860B]" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Couple's Own Speech ─────────────────────────────────────────────────

function CoupleSpeechCard({
  state,
  patch,
  setState,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [teleOpen, setTeleOpen] = useState(false);

  const effectiveDraft = (() => {
    if (state.coupleSpeechMode === "together") return state.coupleSpeechMerged;
    if (state.coupleSpeechMode === "separate")
      return state.coupleSpeechMerged || [state.coupleSpeechDraftA, state.coupleSpeechDraftB].filter(Boolean).join("\n\n");
    return "";
  })();

  const mergeWithAI = () => {
    const merged = [
      state.coupleSpeechDraftA ? `From me: ${state.coupleSpeechDraftA}` : "",
      state.coupleSpeechDraftB ? `From me: ${state.coupleSpeechDraftB}` : "",
      "",
      "Together: Thank you. For every one of you who made it here. We love you.",
    ]
      .filter(Boolean)
      .join("\n\n");
    patch({ coupleSpeechMerged: merged });
  };

  return (
    <>
      <Card className="border-[#B8860B]/40 bg-gradient-to-br from-[#F0E4C8]/40 to-white">
        <SectionHeading
          eyebrow="Couple's own speech"
          title="The most important one of the night"
          note="Writing together or separately? Either way — we'll help."
        />

        <div className="mb-4 flex flex-wrap gap-2">
          <Pill
            active={state.coupleSpeechMode === "together"}
            onClick={() => patch({ coupleSpeechMode: "together" })}
          >
            Writing together
          </Pill>
          <Pill
            active={state.coupleSpeechMode === "separate"}
            onClick={() => patch({ coupleSpeechMode: "separate" })}
          >
            Writing separately
          </Pill>
        </div>

        {state.coupleSpeechMode === "together" && (
          <Textarea
            value={state.coupleSpeechMerged}
            onChange={(v) => patch({ coupleSpeechMerged: v })}
            rows={8}
            placeholder="Start writing your joint speech here. Tap the AI button for help."
          />
        )}

        {state.coupleSpeechMode === "separate" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">Partner A</label>
                <Textarea
                  value={state.coupleSpeechDraftA}
                  onChange={(v) => patch({ coupleSpeechDraftA: v })}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">Partner B</label>
                <Textarea
                  value={state.coupleSpeechDraftB}
                  onChange={(v) => patch({ coupleSpeechDraftB: v })}
                  rows={6}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AIButton onClick={mergeWithAI}>Merge with AI</AIButton>
              <span className="text-[11px] text-[#6B6B6B]">Weaves both drafts into one speech.</span>
            </div>
            {state.coupleSpeechMerged && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">Merged speech</label>
                <Textarea
                  value={state.coupleSpeechMerged}
                  onChange={(v) => patch({ coupleSpeechMerged: v })}
                  rows={6}
                />
              </div>
            )}
          </div>
        )}

        {effectiveDraft && (
          <div className="mt-4">
            <Btn variant="gold" size="md" onClick={() => setTeleOpen(true)}>
              <Play size={12} /> Open teleprompter
            </Btn>
          </div>
        )}
      </Card>

      {teleOpen && (
        <Teleprompter
          speech={{
            id: "couple",
            speaker: "The Couple",
            relationship: "The happy couple",
            event: "reception",
            timing: "",
            timeLimit: "5 min",
            status: "Ready",
            draft: effectiveDraft,
            guidanceNotes: "",
            tone: "Mix of both",
            sharedWithCouple: false,
            coupleNotes: "",
            order: 99,
          }}
          onClose={() => setTeleOpen(false)}
        />
      )}
    </>
  );
}

// ─── MC Tone ─────────────────────────────────────────────────────────────

function MCToneCard({
  state,
  patch,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
}) {
  const set = (k: keyof MCTone, v: number) => patch({ mcTone: { ...state.mcTone, [k]: v } });

  const dims: { key: keyof MCTone; label: string; left: string; right: string }[] = [
    { key: "humor", label: "Humor level", left: "Keep it serious & elegant", right: "Full comedy — roast us" },
    { key: "energy", label: "Energy level", left: "Calm & smooth", right: "Hype man energy" },
    { key: "cultural", label: "Cultural balance", left: "Fully traditional", right: "Modern & Western" },
    { key: "interaction", label: "Crowd interaction", left: "Minimal — just announce", right: "Get the crowd involved" },
  ];

  return (
    <Card>
      <SectionHeading
        eyebrow="MC Tone"
        title="Shape the personality of your night"
        note="Set the sliders — the MC reads these before they write a single line."
      />
      <div className="space-y-5">
        {dims.map((d) => (
          <div key={d.key}>
            <p className="text-[13px] font-medium text-[#1A1A1A]" style={FONT_SERIF}>
              {d.label}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6B6B6B]">
              <span>{d.left}</span>
              <span>{d.right}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={state.mcTone[d.key]}
              onChange={(e) => set(d.key, Number(e.target.value))}
              className="mt-1 w-full accent-[#B8860B]"
            />
            {d.key === "cultural" && state.mcTone.cultural > 40 && state.mcTone.cultural < 60 && (
              <p className="mt-1 text-center text-[11px] italic text-[#8a6300]">Fusion of both</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── MC Notes per Event + Script Builder ─────────────────────────────────

function MCNotesCard({
  state,
  patch,
  setState,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [activeEvent, setActiveEvent] = useState<EventId>("haldi");
  const notes = state.mcNotes[activeEvent];

  const setField = (k: keyof MCEventNotes[EventId], v: string) => {
    setState((s) => ({
      ...s,
      mcNotes: { ...s.mcNotes, [activeEvent]: { ...s.mcNotes[activeEvent], [k]: v } },
    }));
  };

  const generateStarter = () => {
    const eventLabel = EVENTS.find((e) => e.id === activeEvent)!.label;
    const humor = state.mcTone.humor;
    const tone = humor > 70 ? "roast-ready" : humor > 40 ? "warm and witty" : "elegant and gracious";
    setField(
      "announce",
      `Welcome guests · Acknowledge elders and grandparents · Introduce the couple · Explain the ${eventLabel} tradition briefly · Hand off to family`,
    );
    setField("culturalContext", `${eventLabel} is the ceremony of ${activeEvent === "haldi" ? "turmeric blessing" : activeEvent === "mehendi" ? "mehendi artistry and song" : activeEvent === "sangeet" ? "dance performances and celebration" : activeEvent === "ceremony" ? "sacred vows" : "reception and community"}. Keep tone ${tone}.`);
  };

  const generateScript = () => {
    const eventLabel = EVENTS.find((e) => e.id === activeEvent)!.label;
    const energy = state.energyMap[activeEvent];
    setField(
      "script",
      `[Welcome — 1 min]\n"Namaste, welcome, and salaam. On behalf of the families, thank you for being with us for ${eventLabel}."\n\n[Intro — 2 min]\n"Tonight's energy is ${energyLabel(energy).toLowerCase()} — we'll keep it ${energy > 70 ? "loud, proud, and moving" : "warm and intimate"}."\n\n[Tradition — 1 min]\n(Explain ritual briefly; invite elder to begin.)\n\n[Handoff]\n"Please welcome…" → DJ cue.\n\n[Wind-down]\n(Read the room; close or transition per cue sheet.)`,
    );
  };

  const generateIntro = () => {
    const energy = state.energyMap[activeEvent];
    setField(
      "approvedJokes",
      `"They met on a flight to Goa — he slept through every meal, she took three. Somehow, he proposed anyway."\n\n"Tonight is ${energyLabel(energy).toLowerCase()}, so take off your shoes and stay a while."`,
    );
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="MC Notes & Script"
        title="Direction for every event"
        note="Brief the MC on what to announce, which names to nail, what jokes are approved, and the full run-of-show."
      />

      <div className="mb-5 flex gap-2 overflow-x-auto">
        {EVENTS.map((e) => (
          <Pill key={e.id} active={activeEvent === e.id} onClick={() => setActiveEvent(e.id)}>
            {e.label}
          </Pill>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="What to announce and when"
          value={notes.announce}
          onChange={(v) => setField("announce", v)}
          placeholder="e.g., Welcome guests → Introduce couple → Explain the ritual → …"
        />
        <Field
          label="Names to pronounce correctly"
          value={notes.names}
          onChange={(v) => setField("names", v)}
          placeholder="Include phonetics or tag with recordings below"
        />
        <Field
          label="Topics to include"
          value={notes.topicsInclude}
          onChange={(v) => setField("topicsInclude", v)}
        />
        <Field
          label="Topics to avoid"
          value={notes.topicsAvoid}
          onChange={(v) => setField("topicsAvoid", v)}
        />
        <Field
          label="Cultural context the MC should know"
          value={notes.culturalContext}
          onChange={(v) => setField("culturalContext", v)}
          rows={4}
        />
        <Field
          label="Approved jokes / bits"
          value={notes.approvedJokes}
          onChange={(v) => setField("approvedJokes", v)}
          rows={4}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <AIButton onClick={generateStarter}>Generate MC notes for {EVENTS.find((e) => e.id === activeEvent)!.label}</AIButton>
        <AIButton onClick={generateScript}>Build MC script for {EVENTS.find((e) => e.id === activeEvent)!.label}</AIButton>
        <AIButton onClick={generateIntro}>Write MC intro</AIButton>
      </div>

      {notes.script && (
        <div className="mt-5 rounded-lg border border-[#1A1A1A]/8 bg-[#FBF9F4] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">MC script · run of show</p>
            <Btn
              size="xs"
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(notes.script);
              }}
            >
              <Copy size={11} /> Copy for MC
            </Btn>
          </div>
          <Textarea
            value={notes.script}
            onChange={(v) => setField("script", v)}
            rows={10}
            className="mt-2 font-mono"
          />
        </div>
      )}
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.12em] text-[#B8860B]">{label}</label>
      <Textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
    </div>
  );
}

// ─── Pronunciation Guide ─────────────────────────────────────────────────

function PronunciationCard({
  state,
  setState,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [recordingFor, setRecordingFor] = useState<string | null>(null);

  const add = () => {
    const e: PronunciationEntry = {
      id: uid(),
      name: "",
      phonetic: "",
      context: "",
      hasAudio: false,
    };
    setState((s) => ({ ...s, pronunciation: [...s.pronunciation, e] }));
  };

  const update = (id: string, patch: Partial<PronunciationEntry>) => {
    setState((s) => ({
      ...s,
      pronunciation: s.pronunciation.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, pronunciation: s.pronunciation.filter((x) => x.id !== id) }));

  const suggestPhonetic = (name: string) => {
    if (!name.trim()) return "";
    return name
      .split(/\s+/)
      .map((w) => w.replace(/([aeiou])/gi, "$1·").replace(/·$/, "").toUpperCase())
      .join(" ");
  };

  return (
    <Card className="border-[#B8860B]/30">
      <SectionHeading
        eyebrow="Pronunciation Guide"
        title="Get every name right"
        note="A small detail that signals enormous respect. Record yourself — the MC plays it back."
        right={
          <Btn variant="gold" size="sm" onClick={add}>
            <Plus size={12} /> Add name
          </Btn>
        }
      />

      {state.pronunciation.length === 0 ? (
        <EmptyState
          icon={<Mic size={18} strokeWidth={1.6} />}
          title="No names yet"
          hint="Start with the grandparents, then parents. These are the ones that matter most."
          action={
            <Btn variant="outline" size="sm" onClick={add}>
              <Plus size={12} /> Add your first
            </Btn>
          }
        />
      ) : (
        <div className="space-y-3">
          {state.pronunciation.map((e) => (
            <div
              key={e.id}
              className="grid gap-3 rounded-lg border border-[#1A1A1A]/8 bg-white p-4 sm:grid-cols-[1.2fr_1.4fr_1.8fr_auto_auto]"
            >
              <div>
                <Input
                  value={e.name}
                  onChange={(v) => {
                    update(e.id, { name: v });
                    if (!e.phonetic.trim()) update(e.id, { phonetic: suggestPhonetic(v) });
                  }}
                  placeholder="Name as written"
                />
              </div>
              <div>
                <Input
                  value={e.phonetic}
                  onChange={(v) => update(e.id, { phonetic: v })}
                  placeholder="Phonetic (e.g., AH·nuh·nyah)"
                />
              </div>
              <Input
                value={e.context}
                onChange={(v) => update(e.id, { context: v })}
                placeholder="e.g., Bride's maternal grandmother — very important"
              />
              <button
                onClick={() => {
                  if (recordingFor === e.id) {
                    setRecordingFor(null);
                    update(e.id, { hasAudio: true });
                  } else {
                    setRecordingFor(e.id);
                  }
                }}
                className={`grid h-9 w-9 place-items-center rounded-md ${
                  recordingFor === e.id
                    ? "bg-[#C97B63] text-white animate-pulse"
                    : e.hasAudio
                    ? "bg-[#5B8E8A] text-white"
                    : "border border-[#1A1A1A]/12 text-[#8a6300] hover:bg-[#F0E4C8]"
                }`}
                aria-label={recordingFor === e.id ? "Stop recording" : "Record pronunciation"}
                title={e.hasAudio ? "Recording saved — click to re-record" : "Record"}
              >
                <Mic size={14} />
              </button>
              <button
                onClick={() => remove(e.id)}
                className="grid h-9 w-9 place-items-center rounded-md text-[#A3A3A3] hover:bg-[#F5E0D6]/50 hover:text-[#C97B63]"
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// TAB 3 — EVENT SOUNDSCAPES
// ═════════════════════════════════════════════════════════════════════════

function EventSoundscapesTab({
  state,
  patch,
  setState,
}: {
  state: WorkspaceState;
  patch: (p: Partial<WorkspaceState>) => void;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
}) {
  const [activeEvent, setActiveEvent] = useState<EventId>("sangeet");
  const soundscape = state.soundscapes[activeEvent];

  const update = (patch: Partial<EventSoundscape>) => {
    setState((s) => ({
      ...s,
      soundscapes: { ...s.soundscapes, [activeEvent]: { ...s.soundscapes[activeEvent], ...patch } },
    }));
  };

  return (
    <div className="space-y-8">
      <Card>
        <SectionHeading
          eyebrow="Event Soundscapes"
          title="Per-event deep dive"
          note="This is where the energy map comes alive. Design the sound journey of each event."
        />
        <div className="flex gap-2 overflow-x-auto">
          {EVENTS.map((e) => (
            <button
              key={e.id}
              onClick={() => setActiveEvent(e.id)}
              className={`rounded-full border px-4 py-2 text-[13px] transition-all ${
                activeEvent === e.id
                  ? "border-[#B8860B] bg-[#B8860B] text-white shadow-sm"
                  : "border-[#1A1A1A]/12 bg-white text-[#2E2E2E] hover:border-[#B8860B]/40"
              }`}
              style={FONT_SERIF}
            >
              {e.label}
              <span className="ml-2 text-[10px]" style={FONT_SANS}>
                {energyLabel(state.energyMap[e.id])}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <EventArcCard
        event={activeEvent}
        soundscape={soundscape}
        energy={state.energyMap[activeEvent]}
        genres={state.genrePalette}
        onUpdate={update}
      />

      <CulturalReqsCard
        event={activeEvent}
        soundscape={soundscape}
        onUpdate={update}
      />

      <PlaylistBuilderCard
        event={activeEvent}
        soundscape={soundscape}
        onUpdate={update}
      />

      <EntertainmentMomentsCard
        event={activeEvent}
        soundscape={soundscape}
        energy={state.energyMap[activeEvent]}
        onUpdate={update}
      />
    </div>
  );
}

// ─── Event Energy Arc ────────────────────────────────────────────────────

function EventArcCard({
  event,
  soundscape,
  energy,
  genres,
  onUpdate,
}: {
  event: EventId;
  soundscape: EventSoundscape;
  energy: number;
  genres: Genre[];
  onUpdate: (p: Partial<EventSoundscape>) => void;
}) {
  const eventLabel = EVENTS.find((e) => e.id === event)!.label;

  const suggest = (k: keyof EventMoment) => {
    const g = genres.slice(0, 2).join(" + ") || "acoustic Bollywood";
    const map: Record<EventId, Record<keyof EventMoment, string>> = {
      haldi: {
        opening: `Soft ${g} playlist as guests settle; warm instrumental bed.`,
        build: `Live dholki kicks in as the turmeric ritual begins; family claps along.`,
        peak: `Aunties sing boliyan; the room laughs and sings back; the couple is drenched.`,
        windDown: `Acoustic Sufi closing as guests wash up and tea is served.`,
      },
      mehendi: {
        opening: `Folk mehendi songs — mellow and warm, guests at leisure.`,
        build: `Dholki circle forms; Punjabi singers pick up; women gather.`,
        peak: `Full dholki + boliyan; impromptu dance in the center.`,
        windDown: `Quiet acoustic set as mehendi dries and mithai comes out.`,
      },
      sangeet: {
        opening: `Stylish lounge mix — ${g} — as guests arrive. Photographer roaming.`,
        build: `MC kicks off performances; each family act teed up with a build-up track.`,
        peak: `DJ drops a Punjabi MC mashup, dhol player joins live, entire family on the dance floor.`,
        windDown: `Slow mid-tempo ${g}; last call; a final communal song.`,
      },
      ceremony: {
        opening: `Shehnai or Nadaswaram plays as guests are seated.`,
        build: `Baraat arrives — dhol, procession song, claps and cheers.`,
        peak: `Mantras amplified clearly during the pheras; guests in silence or chanting.`,
        windDown: `Vidaai song — soft, aching, cinematic. Last hug, last look.`,
      },
      reception: {
        opening: `Jazz / lounge cocktail set; mingle energy; low whispers, high smiles.`,
        build: `Couple's grand entrance anthem; first dance; parent dances.`,
        peak: `Late-night Bollywood + EDM block; dhol cameo; the floor is packed until 2am.`,
        windDown: `Slow crooners into unplugged; last dance; lights up.`,
      },
    };
    onUpdate({ arc: { ...soundscape.arc, [k]: map[event][k] } });
  };

  const sections: { k: keyof EventMoment; label: string; prompt: string }[] = [
    { k: "opening", label: "Opening Mood", prompt: "What's playing as guests arrive?" },
    { k: "build", label: "Build", prompt: "How does the energy escalate?" },
    { k: "peak", label: "Peak", prompt: "The biggest moment." },
    { k: "windDown", label: "Wind-Down", prompt: "How does it end?" },
  ];

  return (
    <Card>
      <SectionHeading
        eyebrow="Event Energy Arc"
        title={`${eventLabel} — four moments that define the sound`}
        note={`Energy: ${energyLabel(energy)} · Aim the sound design at the emotional arc.`}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s, i) => (
          <div key={s.k} className="rounded-lg border border-[#1A1A1A]/8 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8860B]">
                  {String(i + 1).padStart(2, "0")} · {s.label}
                </p>
                <p className="mt-0.5 text-[13px] text-[#6B6B6B]" style={FONT_SERIF}>
                  {s.prompt}
                </p>
              </div>
              <AIButton size="xs" onClick={() => suggest(s.k)}>
                Suggest
              </AIButton>
            </div>
            <Textarea
              value={soundscape.arc[s.k]}
              onChange={(v) => onUpdate({ arc: { ...soundscape.arc, [s.k]: v } })}
              rows={3}
              placeholder="Describe the sound of this moment."
              className="mt-3"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Cultural Music Requirements ────────────────────────────────────────

function CulturalReqsCard({
  event,
  soundscape,
  onUpdate,
}: {
  event: EventId;
  soundscape: EventSoundscape;
  onUpdate: (p: Partial<EventSoundscape>) => void;
}) {
  const [newReq, setNewReq] = useState("");

  const toggle = (id: string) => {
    onUpdate({
      culturalReqs: soundscape.culturalReqs.map((r) => (r.id === id ? { ...r, on: !r.on } : r)),
    });
  };

  const add = () => {
    if (!newReq.trim()) return;
    onUpdate({
      culturalReqs: [...soundscape.culturalReqs, { id: uid(), label: newReq.trim(), on: true }],
    });
    setNewReq("");
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="Cultural Music Requirements"
        title="Traditional sound elements"
        note="Pre-populated for this event. Toggle off what doesn't apply, add what we missed."
      />
      <div className="space-y-2">
        {soundscape.culturalReqs.map((r) => (
          <label
            key={r.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
              r.on ? "border-[#B8860B]/40 bg-[#F0E4C8]/30" : "border-[#1A1A1A]/10 bg-white opacity-60"
            }`}
          >
            <input type="checkbox" checked={r.on} onChange={() => toggle(r.id)} className="accent-[#B8860B]" />
            <span className="text-[13px] text-[#1A1A1A]" style={FONT_SERIF}>
              {r.label}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={newReq} onChange={setNewReq} placeholder="Add a custom requirement" />
        <Btn variant="outline" size="md" onClick={add}>
          <Plus size={12} /> Add
        </Btn>
      </div>
    </Card>
  );
}

// ─── Playlist Builder ────────────────────────────────────────────────────

function PlaylistBuilderCard({
  event,
  soundscape,
  onUpdate,
}: {
  event: EventId;
  soundscape: EventSoundscape;
  onUpdate: (p: Partial<EventSoundscape>) => void;
}) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Playlists"
        title="What plays, what we'd love, what doesn't"
        note="Three lists per event — everything the DJ needs to see at a glance."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <PlaylistColumn
          title="Must-Play"
          icon={<Flame size={14} />}
          tint="bg-[#F0E4C8]/50 border-[#B8860B]/40"
          songs={soundscape.mustPlay}
          onChange={(v) => onUpdate({ mustPlay: v })}
          allowSuggest
          event={event}
        />
        <PlaylistColumn
          title="Request List"
          icon={<Heart size={14} />}
          tint="bg-[#F5E0D6]/50 border-[#C97B63]/30"
          songs={soundscape.requestList}
          onChange={(v) => onUpdate({ requestList: v })}
          event={event}
        />
        <PlaylistColumn
          title="Do Not Play"
          icon={<MicOff size={14} />}
          tint="bg-white border-[#1A1A1A]/10"
          songs={soundscape.doNotPlay}
          onChange={(v) => onUpdate({ doNotPlay: v })}
          event={event}
        />
      </div>
    </Card>
  );
}

function PlaylistColumn({
  title,
  icon,
  tint,
  songs,
  onChange,
  allowSuggest = false,
  event,
}: {
  title: string;
  icon: ReactNode;
  tint: string;
  songs: string[];
  onChange: (v: string[]) => void;
  allowSuggest?: boolean;
  event: EventId;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    onChange([...songs, draft.trim()]);
    setDraft("");
  };

  const remove = (i: number) => onChange(songs.filter((_, idx) => idx !== i));

  const suggest = () => {
    const byEvent: Record<EventId, string[]> = {
      haldi: ["Banno Tera Swagger", "Haldi Lagegi", "Dholi Taro Dhol Baaje"],
      mehendi: ["Mehendi Hai Rachne Wali", "Yeh Mehendi Ke Booti", "London Thumakda"],
      sangeet: ["Kala Chashma", "Morni Banke", "Gud Naal Ishq Mitha", "Dola Re Dola"],
      ceremony: ["Shehnai Mangalam", "Nadaswaram Melam", "Babul Ki Duayein"],
      reception: ["Señorita", "Uptown Funk", "Levitating", "Tujh Mein Rab Dikhta Hai"],
    };
    const ideas = byEvent[event].filter((s) => !songs.includes(s));
    onChange([...songs, ...ideas]);
  };

  return (
    <div className={`rounded-lg border p-4 ${tint}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A]">
          {icon} {title}
          <span className="ml-1 text-[10px] text-[#6B6B6B]">({songs.length})</span>
        </div>
        {allowSuggest && (
          <AIButton size="xs" onClick={suggest}>
            Suggest
          </AIButton>
        )}
      </div>
      <ul className="mt-3 space-y-1">
        {songs.length === 0 && (
          <li className="text-[11px] italic text-[#A3A3A3]">Empty — add or suggest.</li>
        )}
        {songs.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded bg-white/70 px-2.5 py-1.5 text-[12px] text-[#1A1A1A]"
          >
            <span className="truncate">{s}</span>
            <button onClick={() => remove(i)} className="text-[#A3A3A3] hover:text-[#C97B63]">
              <X size={11} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Song — Artist"
          className="flex-1 rounded-md border border-[#1A1A1A]/12 bg-white px-2.5 py-1 text-[12px] focus:border-[#B8860B] focus:outline-none"
        />
        <button
          onClick={add}
          className="grid h-7 w-7 place-items-center rounded-md border border-[#1A1A1A]/12 bg-white text-[#8a6300] hover:border-[#B8860B]"
          aria-label="Add"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Entertainment Moments ───────────────────────────────────────────────

function EntertainmentMomentsCard({
  event,
  soundscape,
  energy,
  onUpdate,
}: {
  event: EventId;
  soundscape: EventSoundscape;
  energy: number;
  onUpdate: (p: Partial<EventSoundscape>) => void;
}) {
  const add = (description = "") => {
    onUpdate({
      entertainment: [
        ...soundscape.entertainment,
        { id: uid(), description, notes: "", status: "Idea" },
      ],
    });
  };

  const update = (id: string, p: Partial<EventSoundscape["entertainment"][number]>) => {
    onUpdate({
      entertainment: soundscape.entertainment.map((x) => (x.id === id ? { ...x, ...p } : x)),
    });
  };

  const remove = (id: string) => {
    onUpdate({ entertainment: soundscape.entertainment.filter((x) => x.id !== id) });
  };

  const suggest = () => {
    const ideas: Record<EventId, string[]> = {
      haldi: ["Live dholki singers", "Traditional folk dancers", "Flower petal blessing shower"],
      mehendi: ["Mehendi artist station with live dholki", "Bangle stall", "Live Sufi singer during tea"],
      sangeet: [
        "Choreographed couple's dance",
        "Surprise flash mob by siblings",
        "Stand-up comedian between acts",
        "Live Sufi set during dinner",
      ],
      ceremony: ["Horse for Baraat arrival", "Shehnai ensemble", "Blessing by priest with live mantra chanting"],
      reception: [
        "Grand entrance confetti cannons",
        "Late-night dhol cameo",
        "Magician table-to-table during cocktails",
        "Photo booth with props",
      ],
    };
    ideas[event].forEach((d) => add(d));
  };

  return (
    <Card>
      <SectionHeading
        eyebrow="Entertainment Moments"
        title="Beyond the music"
        note={`What else creates unforgettable moments — ${energyLabel(energy).toLowerCase()} energy in mind.`}
        right={
          <div className="flex gap-2">
            <AIButton onClick={suggest}>Suggest entertainment</AIButton>
            <Btn variant="gold" size="sm" onClick={() => add()}>
              <Plus size={12} /> Add
            </Btn>
          </div>
        }
      />

      {soundscape.entertainment.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={18} strokeWidth={1.6} />}
          title="No entertainment beyond music yet"
          hint="A surprise flash mob? Live Sufi singer during dinner? A stand-up between courses? Ideas go here."
        />
      ) : (
        <div className="space-y-3">
          {soundscape.entertainment.map((e) => (
            <div
              key={e.id}
              className="grid gap-3 rounded-lg border border-[#1A1A1A]/8 bg-white p-4 md:grid-cols-[2fr_2fr_auto_auto]"
            >
              <Input
                value={e.description}
                onChange={(v) => update(e.id, { description: v })}
                placeholder="e.g., Choreographed couple dance at Sangeet"
              />
              <Input
                value={e.notes}
                onChange={(v) => update(e.id, { notes: v })}
                placeholder="Details — who, when, props, cues"
              />
              <select
                value={e.status}
                onChange={(ev) => update(e.id, { status: ev.target.value as EntertainmentStatus })}
                className="rounded-md border border-[#1A1A1A]/15 bg-white px-3 py-2 text-[13px]"
              >
                <option>Idea</option>
                <option>Confirmed</option>
                <option>Rehearsed</option>
              </select>
              <button
                onClick={() => remove(e.id)}
                className="grid h-9 w-9 place-items-center rounded-md text-[#A3A3A3] hover:bg-[#F5E0D6]/50 hover:text-[#C97B63]"
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
