"use client";

// ── Videography Creative Canvas (couple-facing) ─────────────────────────────
// Renders inside WorkspaceShell as the videography canvas. Three tabs:
// Vision & Mood (brief, keywords, moments), Inspiration & References (film
// gallery, personal refs), Sound & Story (music per event, sampler, voiceover,
// story arc). Replaces the older 6-tab production-planning VideographyCanvas —
// this surface is for the couple's creative exploration, not videographer ops.

import { useMemo, useState, type ElementType } from "react";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  ExternalLink,
  Film,
  Heart,
  Link as LinkIcon,
  Music,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { useGuidedCanvas } from "@/components/workspace/shared/guided-journey/useGuidedCanvas";

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = "vision" | "inspiration" | "sound";

type FilmFormat = "highlight" | "short" | "feature" | "documentary";

type VoiceoverMode = "none" | "vows" | "custom" | "letter";

type AudioPriority = "music_driven" | "vows_speeches_first" | "balanced";

type ReactionChipId = "style" | "music" | "pacing" | "audio" | "color";

type EventKey =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "baraat"
  | "wedding"
  | "reception";

type MoodKey =
  | "intimate"
  | "bollywood"
  | "classical"
  | "modern"
  | "fusion";

type SamplerCategory =
  | "romantic"
  | "energetic"
  | "traditional"
  | "cinematic"
  | "ambient";

type GalleryCategory =
  | "cinematic"
  | "intimate"
  | "bollywood"
  | "editorial"
  | "destination";

type GalleryFilm = {
  id: string;
  title: string;
  category: GalleryCategory;
  tags: string[];
  duration: string;
  thumbHue: string;
};

type Reaction = {
  filmId: string;
  likes: string[]; // "style" | "music" | "pacing" | "audio" | "color"
  love: string;
  change: string;
  saved: boolean;
};

type ReferenceFilm = {
  id: string;
  url: string;
  title: string;
  love: string;
  change: string;
  tags: string[];
  reactions: string[]; // ReactionChipId[] — same chips as the curated gallery
};

type MusicDirection = {
  mood: MoodKey | null;
  notes: string;
};

// ── Data ─────────────────────────────────────────────────────────────────────

const CREATIVE_TABS: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "vision", label: "Vision & Mood", icon: Sparkles },
  { id: "inspiration", label: "Inspiration & References", icon: Clapperboard },
  { id: "sound", label: "Sound & Story", icon: Music },
];

const QUIZ_QUESTIONS: {
  id: string;
  prompt: string;
  help: string;
  options: { id: string; label: string; keywords: string[] }[];
}[] = [
  {
    id: "feeling",
    prompt: "When you picture your film, what's the first feeling?",
    help: "Not a mood board — a feeling. The one that sticks.",
    options: [
      { id: "warm", label: "Warm & emotional", keywords: ["intimate", "warm", "emotional"] },
      { id: "cinematic", label: "Big, cinematic, sweeping", keywords: ["cinematic", "sweeping", "editorial"] },
      { id: "joy", label: "Pure joy & movement", keywords: ["joyful", "celebratory", "vibrant"] },
      { id: "doc", label: "Quiet, documentary, real", keywords: ["documentary", "honest", "unposed"] },
    ],
  },
  {
    id: "pacing",
    prompt: "How should the film move?",
    help: "Long, held moments? Or fast, musical cuts?",
    options: [
      { id: "slow", label: "Slow and held — let moments breathe", keywords: ["lush", "lingering"] },
      { id: "rhythmic", label: "Rhythmic — cut to music", keywords: ["rhythmic", "musical"] },
      { id: "balanced", label: "Balanced — held where it matters", keywords: ["balanced"] },
    ],
  },
  {
    id: "palette",
    prompt: "The look?",
    help: "Your videographer will color-grade to match this.",
    options: [
      { id: "goldenhour", label: "Golden-hour, sun-soaked", keywords: ["warm-toned", "golden"] },
      { id: "filmic", label: "Filmic, muted, editorial", keywords: ["editorial", "muted"] },
      { id: "moody", label: "Moody & shadowed", keywords: ["moody"] },
      { id: "vivid", label: "Vivid & saturated", keywords: ["vivid", "saturated"] },
    ],
  },
  {
    id: "music",
    prompt: "What kind of music lives under this film?",
    help: "You can change this later per event.",
    options: [
      { id: "orchestral", label: "Orchestral, cinematic score", keywords: ["orchestral", "score"] },
      { id: "acoustic", label: "Acoustic, indie, intimate", keywords: ["acoustic"] },
      { id: "bolly", label: "Bollywood, energetic", keywords: ["bollywood"] },
      { id: "trad", label: "Traditional — shehnai, dhol, classical", keywords: ["classical", "traditional"] },
    ],
  },
  {
    id: "voiceover",
    prompt: "Should anyone speak over the film?",
    help: "Voiceover isn't for everyone — and that's fine.",
    options: [
      { id: "no", label: "No — visuals and music carry it", keywords: [] },
      { id: "vows", label: "Yes — our vows", keywords: ["voiceover"] },
      { id: "letter", label: "Yes — a letter to each other", keywords: ["voiceover", "narrative"] },
      { id: "narration", label: "Yes — a short narration", keywords: ["voiceover"] },
    ],
  },
];

const KEYWORD_SUGGESTIONS = [
  "cinematic",
  "lush",
  "balanced",
  "intimate",
  "joyful",
  "documentary",
  "editorial",
  "moody",
  "warm",
  "rhythmic",
  "golden-hour",
  "unposed",
  "celebratory",
  "sweeping",
];

const FILM_FORMATS: {
  id: FilmFormat;
  label: string;
  length: string;
  note: string;
}[] = [
  {
    id: "highlight",
    label: "Highlight Reel",
    length: "1–3 min",
    note: "The one you'll share on Instagram — the best two minutes, set to music.",
  },
  {
    id: "short",
    label: "Short Film",
    length: "5–8 min",
    note: "A complete emotional arc. Long enough to tell a story; short enough to watch again.",
  },
  {
    id: "feature",
    label: "Feature Film",
    length: "15–25 min",
    note: "Your full wedding experience, edited like a film — with space for ritual, speeches, and the room.",
  },
  {
    id: "documentary",
    label: "Full Documentary",
    length: "Full-length",
    note: "Everything, with minimal cuts — the way future-you will want to relive it.",
  },
];

const GALLERY_FILMS: GalleryFilm[] = [
  { id: "g1", title: "Aarav × Priya — Udaipur", category: "cinematic", tags: ["cinematic", "sweeping", "warm"], duration: "3:12", thumbHue: "linear-gradient(135deg, #D4A24C, #C97B63)" },
  { id: "g2", title: "A Brooklyn Brownstone Wedding", category: "intimate", tags: ["intimate", "documentary", "unposed"], duration: "2:48", thumbHue: "linear-gradient(135deg, #9CAF88, #B8C9A8)" },
  { id: "g3", title: "The Kapoor Sangeet", category: "bollywood", tags: ["joyful", "bollywood", "rhythmic"], duration: "4:02", thumbHue: "linear-gradient(135deg, #C97B63, #DDA08A)" },
  { id: "g4", title: "Ananya + Sam", category: "editorial", tags: ["editorial", "muted", "lush"], duration: "2:55", thumbHue: "linear-gradient(135deg, #6B6B6B, #1A1A1A)" },
  { id: "g5", title: "A Goa Beach Wedding", category: "destination", tags: ["aerial", "golden-hour", "sweeping"], duration: "3:30", thumbHue: "linear-gradient(135deg, #85AEAB, #DCE9E7)" },
  { id: "g6", title: "Rohan & Mira — Jaipur", category: "cinematic", tags: ["moody", "cinematic", "editorial"], duration: "3:45", thumbHue: "linear-gradient(135deg, #B8860B, #1A1A1A)" },
  { id: "g7", title: "An Intimate Haldi", category: "intimate", tags: ["warm", "documentary", "tender"], duration: "1:58", thumbHue: "linear-gradient(135deg, #F0E4C8, #D4A843)" },
  { id: "g8", title: "Dance-Floor Reels", category: "bollywood", tags: ["energetic", "joyful", "musical"], duration: "2:21", thumbHue: "linear-gradient(135deg, #D4A843, #C97B63)" },
];

const GALLERY_CATEGORIES: { id: GalleryCategory; label: string }[] = [
  { id: "cinematic", label: "Cinematic & Dramatic" },
  { id: "intimate", label: "Intimate & Documentary" },
  { id: "bollywood", label: "Bollywood Energy" },
  { id: "editorial", label: "Modern & Editorial" },
  { id: "destination", label: "Destination & Aerial" },
];

const REACTION_CHIPS: { id: string; label: string }[] = [
  { id: "style", label: "Love the style" },
  { id: "music", label: "Love the music" },
  { id: "pacing", label: "Love the pacing" },
  { id: "audio", label: "Love the natural audio" },
  { id: "color", label: "Love the color" },
];

const EVENTS: { id: EventKey; label: string }[] = [
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "baraat", label: "Baraat" },
  { id: "wedding", label: "Wedding" },
  { id: "reception", label: "Reception" },
];

const MOODS: { id: MoodKey; label: string }[] = [
  { id: "intimate", label: "Intimate & Acoustic" },
  { id: "bollywood", label: "Bollywood & High Energy" },
  { id: "classical", label: "Classical & Traditional" },
  { id: "modern", label: "Modern & Cinematic" },
  { id: "fusion", label: "Fusion" },
];

const SAMPLER: {
  id: SamplerCategory;
  label: string;
  samples: { id: string; title: string; meta: string }[];
}[] = [
  {
    id: "romantic",
    label: "Romantic",
    samples: [
      { id: "rom-1", title: "Slow piano & strings", meta: "0:42" },
      { id: "rom-2", title: "Warm acoustic guitar", meta: "0:38" },
      { id: "rom-3", title: "Intimate indie ballad", meta: "0:51" },
    ],
  },
  {
    id: "energetic",
    label: "Energetic",
    samples: [
      { id: "en-1", title: "Dhol & electronic fusion", meta: "0:35" },
      { id: "en-2", title: "Bollywood dance reel cut", meta: "0:44" },
      { id: "en-3", title: "Big-room celebratory", meta: "0:39" },
    ],
  },
  {
    id: "traditional",
    label: "Traditional",
    samples: [
      { id: "tr-1", title: "Shehnai — ceremony open", meta: "0:33" },
      { id: "tr-2", title: "Hindustani classical", meta: "0:48" },
      { id: "tr-3", title: "Tabla & sitar", meta: "0:41" },
    ],
  },
  {
    id: "cinematic",
    label: "Cinematic",
    samples: [
      { id: "ci-1", title: "Orchestral score swell", meta: "0:46" },
      { id: "ci-2", title: "Filmic strings & piano", meta: "0:52" },
      { id: "ci-3", title: "Choral build", meta: "0:40" },
    ],
  },
  {
    id: "ambient",
    label: "Ambient",
    samples: [
      { id: "am-1", title: "Soft pad & field recording", meta: "0:37" },
      { id: "am-2", title: "Reverbed guitar textures", meta: "0:43" },
    ],
  },
];

const STORY_QUESTIONS = [
  "How did you meet?",
  "What's the moment you knew?",
  "What does this wedding mean to your families?",
  "How do you want the film to end?",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateBriefDraft(keywords: string[], format: FilmFormat[]): string {
  const k = keywords.slice(0, 4).join(", ");
  const fmt = format.length
    ? format.map((f) => FILM_FORMATS.find((x) => x.id === f)?.label).filter(Boolean).join(" + ")
    : "a highlight reel";
  return `We want our wedding film to feel ${k || "warm, cinematic, and unposed"} — documentary in spirit, cinematic in craft. We're drawn to natural audio, held emotional moments, and light that matches the feeling of the room. Format: ${fmt}. Our film should be a love letter to our families as much as to each other — the laughter, the tears, the dancing — captured the way it actually was.`;
}

function generateStyleSummary(refs: ReferenceFilm[]): string {
  if (refs.length < 2) return "";
  const tagPool = refs.flatMap((r) => r.tags);
  const top = Array.from(new Set(tagPool)).slice(0, 3);
  const descriptors = top.length ? top.join(", ") : "cinematic, warm-toned films with natural audio";
  return `Based on your references, you're drawn to ${descriptors}. The common thread across what you've saved: emotional pacing that holds on faces, real audio over heavy voiceover, and a warm color palette that feels filmic rather than documentary-flat. Your videographer will use this as a north star.`;
}

function generateStoryOutline(answers: Record<string, string>): string {
  const meet = answers.q0 || "a quiet moment neither of us expected";
  const knew = answers.q1 || "the morning we realized";
  const families = answers.q2 || "two families braided into one";
  const end = answers.q3 || "dancing, long after the last song should've ended";
  return `OPENING — ${meet}. The film opens soft: ambient sound from the morning of, the house waking up, hands being held that don't yet know what today will be.\n\nBUILD — We return to ${knew}. The film layers in laughter, the small rituals, the glances. Pacing stays patient; we let moments breathe.\n\nEMOTIONAL PEAK — The vows and the ceremony. ${families}. This is the film's center — the held silence before and the tears after.\n\nCELEBRATION — Music rises. The baraat, the sangeet, the dance floor. The cuts get faster; the joy gets louder.\n\nCLOSE — ${end}. The film ends on a long, held frame — the two of you, the room emptying, music fading. Fade to a title card.`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function VideographyCreativeCanvas({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [tab, setTab] = useState<TabId>("vision");
  const { subHeader, headerActions, bodyOverride } = useGuidedCanvas("videography");

  // Vision & Mood state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizDismissed, setQuizDismissed] = useState(false);

  const [brief, setBrief] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [filmToneScore, setFilmToneScore] = useState(50);
  const [formats, setFormats] = useState<FilmFormat[]>([]);
  const [formatComment, setFormatComment] = useState("");
  const [moments, setMoments] = useState<{ id: string; text: string }[]>([]);
  const [momentInput, setMomentInput] = useState("");
  const [audioMoments, setAudioMoments] = useState<{ id: string; text: string }[]>([]);
  const [audioMomentInput, setAudioMomentInput] = useState("");
  const [dontInclude, setDontInclude] = useState<{ id: string; text: string }[]>([]);
  const [dontInput, setDontInput] = useState("");
  const [dontOpen, setDontOpen] = useState(false);

  // Inspiration state
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [refs, setRefs] = useState<ReferenceFilm[]>([]);
  const [refUrl, setRefUrl] = useState("");
  const [styleSummaryCache, setStyleSummaryCache] = useState("");

  // Sound & Story state
  const [audioPriority, setAudioPriority] = useState<AudioPriority | null>(null);
  const [music, setMusic] = useState<Record<EventKey, MusicDirection>>(
    Object.fromEntries(
      EVENTS.map((e) => [e.id, { mood: null, notes: "" }]),
    ) as Record<EventKey, MusicDirection>,
  );
  const [playing, setPlaying] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [voMode, setVoMode] = useState<VoiceoverMode>("none");
  const [voScript, setVoScript] = useState("");
  const [storyAnswers, setStoryAnswers] = useState<Record<string, string>>({});
  const [storyOutline, setStoryOutline] = useState("");

  // ── Quiz handlers ──────────────────────────────────────────────────────────

  function openQuiz() {
    setQuizOpen(true);
    setQuizStep(0);
  }

  function answerQuiz(questionId: string, optionId: string) {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function finishQuiz() {
    const q = QUIZ_QUESTIONS;
    const chosenKw = new Set<string>();
    q.forEach((question) => {
      const optId = quizAnswers[question.id];
      const opt = question.options.find((o) => o.id === optId);
      opt?.keywords.forEach((kw) => chosenKw.add(kw));
    });
    const kwList = Array.from(chosenKw);
    setKeywords((prev) => Array.from(new Set([...prev, ...kwList])));
    const voChoice = quizAnswers.voiceover;
    if (voChoice === "vows") setVoMode("vows");
    if (voChoice === "letter") setVoMode("letter");
    if (voChoice === "narration") setVoMode("custom");
    if (!brief) {
      setBrief(generateBriefDraft(kwList, formats));
    }
    const musicChoice = quizAnswers.music;
    if (musicChoice) {
      const map: Record<string, MoodKey> = {
        orchestral: "modern",
        acoustic: "intimate",
        bolly: "bollywood",
        trad: "classical",
      };
      const mood = map[musicChoice];
      if (mood) {
        setMusic((prev) => ({
          ...prev,
          wedding: { ...prev.wedding, mood },
        }));
      }
    }
    setQuizCompleted(true);
    setQuizOpen(false);
  }

  function refineBrief() {
    const refined =
      brief.trim()
        ? `${brief.trim()}\n\nRefined: our film should feel unhurried in the moments that matter — the first look, the vows, the last dance. We'd rather hold one beat too long than cut away too soon. The sound design should lean on room tone and real audio over score, except in the highlight reel's opening and close.`
        : generateBriefDraft(keywords, formats);
    setBrief(refined);
  }

  // ── Moments handlers ───────────────────────────────────────────────────────

  function addMoment() {
    const t = momentInput.trim();
    if (!t) return;
    setMoments((prev) => [...prev, { id: uid("m"), text: t }]);
    setMomentInput("");
  }

  function addAudioMoment() {
    const t = audioMomentInput.trim();
    if (!t) return;
    setAudioMoments((prev) => [...prev, { id: uid("am"), text: t }]);
    setAudioMomentInput("");
  }

  function addDont() {
    const t = dontInput.trim();
    if (!t) return;
    setDontInclude((prev) => [...prev, { id: uid("d"), text: t }]);
    setDontInput("");
  }

  // ── Keyword handlers ───────────────────────────────────────────────────────

  function toggleKeyword(k: string) {
    setKeywords((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  }

  function addCustomKeyword(raw: string) {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    if (!keywords.includes(v)) setKeywords((prev) => [...prev, v]);
  }

  // ── Gallery / reaction handlers ────────────────────────────────────────────

  function toggleReactionChip(filmId: string, chipId: string) {
    setReactions((prev) => {
      const curr = prev[filmId] ?? { filmId, likes: [], love: "", change: "", saved: false };
      const likes = curr.likes.includes(chipId)
        ? curr.likes.filter((x) => x !== chipId)
        : [...curr.likes, chipId];
      return { ...prev, [filmId]: { ...curr, likes } };
    });
  }

  function updateReactionText(filmId: string, field: "love" | "change", value: string) {
    setReactions((prev) => {
      const curr = prev[filmId] ?? { filmId, likes: [], love: "", change: "", saved: false };
      return { ...prev, [filmId]: { ...curr, [field]: value } };
    });
  }

  function saveToReferences(f: GalleryFilm) {
    setReactions((prev) => {
      const curr = prev[f.id] ?? { filmId: f.id, likes: [], love: "", change: "", saved: false };
      return { ...prev, [f.id]: { ...curr, saved: !curr.saved } };
    });
    if (!reactions[f.id]?.saved) {
      const existing = refs.find((r) => r.id === f.id);
      if (!existing) {
        setRefs((prev) => [
          ...prev,
          {
            id: f.id,
            url: "",
            title: f.title,
            love: reactions[f.id]?.love ?? "",
            change: reactions[f.id]?.change ?? "",
            tags: f.tags,
            reactions: reactions[f.id]?.likes ?? [],
          },
        ]);
      }
    } else {
      setRefs((prev) => prev.filter((r) => r.id !== f.id));
    }
  }

  // ── Reference handlers ─────────────────────────────────────────────────────

  function addReference() {
    const url = refUrl.trim();
    if (!url) return;
    const title = (() => {
      if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube reference";
      if (url.includes("vimeo")) return "Vimeo reference";
      if (url.includes("instagram")) return "Instagram reel";
      return "Reference film";
    })();
    setRefs((prev) => [
      ...prev,
      { id: uid("r"), url, title, love: "", change: "", tags: [], reactions: [] },
    ]);
    setRefUrl("");
  }

  function toggleReferenceReaction(id: string, chipId: string) {
    setRefs((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const reactions = r.reactions ?? [];
        return {
          ...r,
          reactions: reactions.includes(chipId)
            ? reactions.filter((x) => x !== chipId)
            : [...reactions, chipId],
        };
      }),
    );
  }

  function updateRef(id: string, patch: Partial<ReferenceFilm>) {
    setRefs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRef(id: string) {
    setRefs((prev) => prev.filter((r) => r.id !== id));
  }

  function regenerateSummary() {
    setStyleSummaryCache(generateStyleSummary(refs));
  }

  // ── Music handlers ─────────────────────────────────────────────────────────

  function setEventMood(ev: EventKey, mood: MoodKey) {
    setMusic((prev) => ({
      ...prev,
      [ev]: { ...prev[ev], mood: prev[ev].mood === mood ? null : mood },
    }));
  }

  function setEventNotes(ev: EventKey, notes: string) {
    setMusic((prev) => ({ ...prev, [ev]: { ...prev[ev], notes } }));
  }

  function suggestMusic(ev: EventKey) {
    const suggestions: Record<EventKey, string> = {
      haldi: "Old Hindi classics + soft dhol — 'Mehendi Laga Ke Rakhna', 'Bole Chudiyan' (slow)",
      mehendi: "Acoustic Bollywood + folk — 'Kabira', 'Laila Main Laila' (lounge mix)",
      sangeet: "Dance mashups + choreo anchors — DJ mashups of 'Desi Girl', 'Naach Meri Rani'",
      baraat: "Live dhol + Punjabi bhangra — 'London Thumakda', 'Balam Pichkari'",
      wedding: "Shehnai open + classical instrumentals — 'Raag Yaman', then vows in silence",
      reception: "Live band + dance floor mashups — 'Perfect' (first dance), Bollywood top 40",
    };
    setEventNotes(ev, suggestions[ev]);
  }

  // ── Sampler handlers ───────────────────────────────────────────────────────

  function togglePlay(sampleId: string) {
    setPlaying((curr) => (curr === sampleId ? null : sampleId));
  }

  function toggleSaved(sampleId: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(sampleId)) next.delete(sampleId);
      else next.add(sampleId);
      return next;
    });
  }

  // ── Voiceover handlers ─────────────────────────────────────────────────────

  function aiVoiceoverDraft() {
    const existing = voScript.trim();
    const base = existing
      ? `${existing}\n\n— Refined by Ananya —\n`
      : "";
    const draft =
      voMode === "letter"
        ? `${base}The day I met you, I didn't know yet that you'd become the story I tell for the rest of my life.\n\nI don't remember the first thing we said. I remember the way you laughed. I remember thinking, I want to hear that sound on my wedding day.\n\nToday you do. Today I get to marry the person who made home feel like a place and not a word.\n\nThank you for every ordinary day that led us here.`
        : `${base}Today, two families became one.\n\nAnd somewhere between the shehnai and the last song, two people who built a life between late-night conversations and Sunday breakfasts made the quietest, loudest promise of their lives.\n\nThis is how it happened.`;
    setVoScript(draft);
  }

  // ── Story handlers ─────────────────────────────────────────────────────────

  function setStoryAnswer(idx: number, v: string) {
    setStoryAnswers((prev) => ({ ...prev, [`q${idx}`]: v }));
  }

  function generateStory() {
    setStoryOutline(generateStoryOutline(storyAnswers));
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <WorkspaceCanvas<TabId>
        category={category}
        categoryIcon={Film}
        eyebrowSuffix="Videography"
        tabs={CREATIVE_TABS}
        subHeader={subHeader}
        headerActions={headerActions}
        bodyOverride={bodyOverride}
        renderTab={(t) => (
          <>
            {t === "vision" && (
              <VisionTab
                quizCompleted={quizCompleted}
                quizDismissed={quizDismissed}
                quizOpen={quizOpen}
                quizStep={quizStep}
                quizAnswers={quizAnswers}
                onOpenQuiz={openQuiz}
                onCloseQuiz={() => setQuizOpen(false)}
                onDismissQuiz={() => setQuizDismissed(true)}
                onAnswerQuiz={answerQuiz}
                onQuizStep={setQuizStep}
                onFinishQuiz={finishQuiz}
                brief={brief}
                onBriefChange={setBrief}
                onRefineBrief={refineBrief}
                keywords={keywords}
                onToggleKeyword={toggleKeyword}
                onAddCustomKeyword={addCustomKeyword}
                filmToneScore={filmToneScore}
                onFilmToneChange={setFilmToneScore}
                formats={formats}
                onToggleFormat={(f) =>
                  setFormats((prev) =>
                    prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
                  )
                }
                formatComment={formatComment}
                onFormatCommentChange={setFormatComment}
                moments={moments}
                momentInput={momentInput}
                onMomentInputChange={setMomentInput}
                onAddMoment={addMoment}
                onRemoveMoment={(id) =>
                  setMoments((prev) => prev.filter((m) => m.id !== id))
                }
                audioMoments={audioMoments}
                audioMomentInput={audioMomentInput}
                onAudioMomentInputChange={setAudioMomentInput}
                onAddAudioMoment={addAudioMoment}
                onRemoveAudioMoment={(id) =>
                  setAudioMoments((prev) => prev.filter((m) => m.id !== id))
                }
                dontInclude={dontInclude}
                dontInput={dontInput}
                dontOpen={dontOpen}
                onDontInputChange={setDontInput}
                onAddDont={addDont}
                onRemoveDont={(id) =>
                  setDontInclude((prev) => prev.filter((d) => d.id !== id))
                }
                onToggleDontOpen={() => setDontOpen((v) => !v)}
              />
            )}

            {t === "inspiration" && (
              <InspirationTab
                reactions={reactions}
                onToggleReactionChip={toggleReactionChip}
                onUpdateReactionText={updateReactionText}
                onSaveToRefs={saveToReferences}
                refs={refs}
                refUrl={refUrl}
                onRefUrlChange={setRefUrl}
                onAddReference={addReference}
                onUpdateRef={updateRef}
                onRemoveRef={removeRef}
                onToggleRefReaction={toggleReferenceReaction}
                styleSummary={styleSummaryCache}
                onRegenerateSummary={regenerateSummary}
              />
            )}

            {t === "sound" && (
              <SoundTab
                audioPriority={audioPriority}
                onSetAudioPriority={setAudioPriority}
                music={music}
                onSetEventMood={setEventMood}
                onSetEventNotes={setEventNotes}
                onSuggestMusic={suggestMusic}
                playing={playing}
                saved={saved}
                onTogglePlay={togglePlay}
                onToggleSaved={toggleSaved}
                voMode={voMode}
                onSetVoMode={setVoMode}
                voScript={voScript}
                onSetVoScript={setVoScript}
                onAiVoiceoverDraft={aiVoiceoverDraft}
                storyAnswers={storyAnswers}
                onSetStoryAnswer={setStoryAnswer}
                storyOutline={storyOutline}
                onSetStoryOutline={setStoryOutline}
                onGenerateStory={generateStory}
              />
            )}
          </>
        )}
      />

      {quizOpen && (
        <QuizModal
          step={quizStep}
          answers={quizAnswers}
          onStep={setQuizStep}
          onAnswer={answerQuiz}
          onFinish={finishQuiz}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </>
  );
}

// ── Tab 1: Vision & Mood ─────────────────────────────────────────────────────

type VisionTabProps = {
  quizCompleted: boolean;
  quizDismissed: boolean;
  quizOpen: boolean;
  quizStep: number;
  quizAnswers: Record<string, string>;
  onOpenQuiz: () => void;
  onCloseQuiz: () => void;
  onDismissQuiz: () => void;
  onAnswerQuiz: (qId: string, oId: string) => void;
  onQuizStep: (n: number) => void;
  onFinishQuiz: () => void;
  brief: string;
  onBriefChange: (v: string) => void;
  onRefineBrief: () => void;
  keywords: string[];
  onToggleKeyword: (k: string) => void;
  onAddCustomKeyword: (k: string) => void;
  filmToneScore: number;
  onFilmToneChange: (n: number) => void;
  formats: FilmFormat[];
  onToggleFormat: (f: FilmFormat) => void;
  formatComment: string;
  onFormatCommentChange: (v: string) => void;
  moments: { id: string; text: string }[];
  momentInput: string;
  onMomentInputChange: (v: string) => void;
  onAddMoment: () => void;
  onRemoveMoment: (id: string) => void;
  audioMoments: { id: string; text: string }[];
  audioMomentInput: string;
  onAudioMomentInputChange: (v: string) => void;
  onAddAudioMoment: () => void;
  onRemoveAudioMoment: (id: string) => void;
  dontInclude: { id: string; text: string }[];
  dontInput: string;
  dontOpen: boolean;
  onDontInputChange: (v: string) => void;
  onAddDont: () => void;
  onRemoveDont: (id: string) => void;
  onToggleDontOpen: () => void;
};

function VisionTab(props: VisionTabProps) {
  const [customKw, setCustomKw] = useState("");
  return (
    <div className="space-y-8">
      {/* Quiz card */}
      {!props.quizDismissed && !props.quizCompleted && (
        <QuizEntryCard onStart={props.onOpenQuiz} onSkip={props.onDismissQuiz} />
      )}
      {props.quizCompleted && !props.quizDismissed && (
        <div className="flex items-center justify-between rounded-lg border border-sage/30 bg-sage-pale/40 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} strokeWidth={1.8} className="text-sage" />
            <p className="text-[13px] text-ink">
              Quiz complete — your brief, style keywords, and music direction are seeded below.
            </p>
          </div>
          <button
            type="button"
            onClick={props.onDismissQuiz}
            className="text-ink-muted hover:text-ink"
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Style Keywords */}
      <SectionCard
        eyebrow="What your film should feel like"
        title="Style Keywords"
      >
        <div className="space-y-4">
          {props.keywords.length === 0 ? (
            <p className="italic text-gold-light">
              Tap the words below that describe the film you're imagining.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {props.keywords.map((k) => (
                <span
                  key={k}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-ivory"
                >
                  {k}
                  <button
                    type="button"
                    onClick={() => props.onToggleKeyword(k)}
                    className="opacity-60 hover:opacity-100"
                    aria-label={`Remove ${k}`}
                  >
                    <X size={11} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
              Suggested
            </p>
            <div className="flex flex-wrap gap-1.5">
              {KEYWORD_SUGGESTIONS.filter((k) => !props.keywords.includes(k)).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => props.onToggleKeyword(k)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-[12px] text-ink-muted hover:border-gold/40 hover:text-ink"
                >
                  <Plus size={11} strokeWidth={1.8} />
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customKw}
              onChange={(e) => setCustomKw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.onAddCustomKeyword(customKw);
                  setCustomKw("");
                }
              }}
              placeholder="Add your own — e.g., 'sun-soaked' or 'unhurried'"
              className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[13px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                props.onAddCustomKeyword(customKw);
                setCustomKw("");
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-gold/40 hover:text-ink"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Film Tone */}
      <SectionCard
        eyebrow="Film tone"
        title="How produced should it feel?"
      >
        <FilmToneSlider
          value={props.filmToneScore}
          onChange={props.onFilmToneChange}
        />
      </SectionCard>

      {/* Film Length & Format */}
      <SectionCard
        eyebrow="Pick every format you want — a film can be more than one"
        title="Film Length & Format"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {FILM_FORMATS.map((f) => {
            const selected = props.formats.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => props.onToggleFormat(f.id)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border px-4 py-4 text-left transition-all",
                  selected
                    ? "border-gold bg-gold-pale/30 shadow-sm"
                    : "border-border bg-white hover:border-gold/30",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-serif text-[17px] text-ink">{f.label}</span>
                  <span className="font-mono text-[10.5px] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
                    {f.length}
                  </span>
                </div>
                <p className={cn("text-[12.5px] leading-[1.55]", selected ? "text-ink" : "text-ink-muted")}>
                  {f.note}
                </p>
                {selected && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-gold">
                    <CheckCircle2 size={12} strokeWidth={1.8} /> Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-1.5">
          <label
            htmlFor="format-comment"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Custom requests or notes
          </label>
          <textarea
            id="format-comment"
            value={props.formatComment}
            onChange={(e) => props.onFormatCommentChange(e.target.value)}
            placeholder="e.g., a short film for each event (mehndi, sangeet, reception), a vertical cut for social, or a length that doesn't match the options above."
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13.5px] leading-[1.5] text-ink placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
          />
        </div>
      </SectionCard>

      {/* Moments That Matter */}
      <SectionCard
        eyebrow="The shots your videographer can't miss"
        title="Moments That Matter"
      >
        <div className="space-y-2">
          {moments_empty(props.moments) ? (
            <p className="italic text-gold-light">
              Tell them what matters most to you — even three moments changes the way they show up on the day.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {props.moments.map((m) => (
                <li
                  key={m.id}
                  className="group flex items-start gap-2.5 rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" aria-hidden />
                  <p className="flex-1 leading-[1.55]">{m.text}</p>
                  <button
                    type="button"
                    onClick={() => props.onRemoveMoment(m.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove moment"
                  >
                    <Trash2 size={13} strokeWidth={1.8} className="text-ink-faint hover:text-rose" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={props.momentInput}
              onChange={(e) => props.onMomentInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") props.onAddMoment();
              }}
              placeholder="e.g., My dad seeing me in my lehenga for the first time"
              className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[14px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={props.onAddMoment}
              disabled={!props.momentInput.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={13} strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Audio Moments */}
      <SectionCard
        eyebrow="Words worth capturing"
        title="Audio Moments"
      >
        <p className="-mt-2 mb-3 text-[13px] italic text-ink-muted">
          The speeches, vows, and quiet words your film needs.
        </p>
        <div className="space-y-2">
          {props.audioMoments.length === 0 ? (
            <p className="italic text-gold-light">
              List the audio your videographer must lock in — a parent's speech, the pheras in silence, a song that has to play.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {props.audioMoments.map((m) => (
                <li
                  key={m.id}
                  className="group flex items-start gap-2.5 rounded-md border border-border bg-white px-3 py-2 text-[14px] text-ink"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-saffron" aria-hidden />
                  <p className="flex-1 leading-[1.55]">{m.text}</p>
                  <button
                    type="button"
                    onClick={() => props.onRemoveAudioMoment(m.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove audio moment"
                  >
                    <Trash2 size={13} strokeWidth={1.8} className="text-ink-faint hover:text-rose" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={props.audioMomentInput}
              onChange={(e) => props.onAudioMomentInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") props.onAddAudioMoment();
              }}
              placeholder="e.g., Dad's speech at sangeet, the dhol during baraat"
              className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[14px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={props.onAddAudioMoment}
              disabled={!props.audioMomentInput.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-ink px-3.5 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={13} strokeWidth={1.8} />
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Please Don't Include */}
      <div className="rounded-lg border border-border bg-white">
        <button
          type="button"
          onClick={props.onToggleDontOpen}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
              Optional
            </p>
            <p className="mt-0.5 font-serif text-[16px] text-ink">Please Don't Include</p>
          </div>
          {props.dontOpen ? (
            <ChevronUp size={16} strokeWidth={1.8} className="text-ink-muted" />
          ) : (
            <ChevronDown size={16} strokeWidth={1.8} className="text-ink-muted" />
          )}
        </button>
        {props.dontOpen && (
          <div className="space-y-2 border-t border-border px-5 pb-4 pt-3">
            <p className="text-[12.5px] italic text-ink-muted">
              Every couple has preferences — note anything you'd rather leave out.
            </p>
            {props.dontInclude.length > 0 && (
              <ul className="space-y-1.5">
                {props.dontInclude.map((d) => (
                  <li
                    key={d.id}
                    className="group flex items-start gap-2.5 rounded-md bg-ivory-warm px-3 py-2 text-[13.5px] text-ink"
                  >
                    <X size={13} strokeWidth={2} className="mt-1 flex-shrink-0 text-rose" />
                    <p className="flex-1">{d.text}</p>
                    <button
                      type="button"
                      onClick={() => props.onRemoveDont(d.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <Trash2 size={12} strokeWidth={1.8} className="text-ink-faint hover:text-rose" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={props.dontInput}
                onChange={(e) => props.onDontInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") props.onAddDont();
                }}
                placeholder="e.g., No cheesy slow-motion / Skip the garter toss"
                className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13.5px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={props.onAddDont}
                disabled={!props.dontInput.trim()}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink-muted hover:border-gold/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={12} strokeWidth={1.8} />
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Film Brief — last so couples articulate it after the rest of Vision & Mood */}
      <SectionCard
        eyebrow="The document your videographer reads first"
        title="Your Film Brief"
      >
        <div className="space-y-3">
          <textarea
            value={props.brief}
            onChange={(e) => props.onBriefChange(e.target.value)}
            placeholder="Click to write a brief — a few sentences about what your wedding film should feel like. Don't worry about structure; we'll help you polish it."
            rows={props.brief ? 7 : 5}
            className="w-full resize-none rounded-md border border-border bg-white px-4 py-3 font-serif text-[16px] leading-[1.7] text-ink placeholder:font-sans placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11.5px] text-ink-faint">
              {props.brief.length
                ? `${props.brief.trim().split(/\s+/).length} words`
                : "A paragraph is plenty. Three is generous."}
            </p>
            <button
              type="button"
              onClick={props.onRefineBrief}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/40 px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-gold-pale/60"
            >
              <Sparkles size={13} strokeWidth={1.8} className="text-gold" />
              Refine with AI
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function moments_empty(m: { id: string; text: string }[]): boolean {
  return m.length === 0;
}

// ── Tab 2: Inspiration & References ──────────────────────────────────────────

type InspirationTabProps = {
  reactions: Record<string, Reaction>;
  onToggleReactionChip: (filmId: string, chipId: string) => void;
  onUpdateReactionText: (filmId: string, field: "love" | "change", value: string) => void;
  onSaveToRefs: (f: GalleryFilm) => void;
  refs: ReferenceFilm[];
  refUrl: string;
  onRefUrlChange: (v: string) => void;
  onAddReference: () => void;
  onUpdateRef: (id: string, patch: Partial<ReferenceFilm>) => void;
  onRemoveRef: (id: string) => void;
  onToggleRefReaction: (id: string, chipId: string) => void;
  styleSummary: string;
  onRegenerateSummary: () => void;
};

function InspirationTab(props: InspirationTabProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "all">("all");
  const [openFilm, setOpenFilm] = useState<string | null>(null);

  const filteredFilms = useMemo(() => {
    if (activeCategory === "all") return GALLERY_FILMS;
    return GALLERY_FILMS.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-10">
      {/* Curated Gallery */}
      <section>
        <SectionHeader
          eyebrow="Watch, react, and save what you love"
          title="Curated Film Gallery"
          subtitle="A handful of wedding films we've collected, sorted by style. Tap to watch and tell us what you feel."
        />

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <CategoryPill active={activeCategory === "all"} onClick={() => setActiveCategory("all")} label="All" />
          {GALLERY_CATEGORIES.map((c) => (
            <CategoryPill
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
              label={c.label}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFilms.map((f) => {
            const r = props.reactions[f.id];
            const isOpen = openFilm === f.id;
            return (
              <article
                key={f.id}
                className="flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenFilm((curr) => (curr === f.id ? null : f.id))}
                  className="relative aspect-video w-full overflow-hidden"
                  style={{ background: f.thumbHue }}
                  aria-label={`Play ${f.title}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                      <Play size={18} strokeWidth={2} className="translate-x-[1px] text-ink" fill="currentColor" />
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 rounded bg-ink/75 px-1.5 py-0.5 font-mono text-[10px] text-ivory" style={{ fontFamily: "var(--font-mono)" }}>
                    {f.duration}
                  </span>
                </button>

                <div className="flex flex-1 flex-col gap-2.5 px-4 py-3">
                  <div>
                    <h4 className="font-serif text-[15.5px] leading-[1.2] text-ink">{f.title}</h4>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {f.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-ivory-warm px-2 py-0.5 text-[10.5px] text-ink-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reaction chips */}
                  <div className="flex flex-wrap gap-1">
                    {REACTION_CHIPS.map((chip) => {
                      const on = r?.likes.includes(chip.id);
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => props.onToggleReactionChip(f.id, chip.id)}
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                            on
                              ? "border-gold bg-gold-pale/60 text-ink"
                              : "border-border bg-white text-ink-muted hover:border-gold/30",
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  {isOpen && (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        value={r?.love ?? ""}
                        onChange={(e) => props.onUpdateReactionText(f.id, "love", e.target.value)}
                        placeholder="What you love about this…"
                        rows={2}
                        className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[12.5px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
                      />
                      <textarea
                        value={r?.change ?? ""}
                        onChange={(e) => props.onUpdateReactionText(f.id, "change", e.target.value)}
                        placeholder="What you'd change…"
                        rows={2}
                        className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[12.5px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setOpenFilm((curr) => (curr === f.id ? null : f.id))}
                      className="text-[11.5px] text-ink-muted hover:text-ink"
                    >
                      {isOpen ? "Collapse notes" : "Add notes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onSaveToRefs(f)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium",
                        r?.saved
                          ? "bg-ink text-ivory"
                          : "border border-border text-ink-muted hover:border-gold/40 hover:text-ink",
                      )}
                    >
                      <Heart size={11} strokeWidth={1.8} fill={r?.saved ? "currentColor" : "none"} />
                      {r?.saved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Personal References */}
      <section>
        <SectionHeader
          eyebrow="The films that have stuck with you"
          title="Your Reference Films"
          subtitle="Paste a link — YouTube, Vimeo, Instagram. We'll pull it in and give you space to tell us why."
        />

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-gold/25 bg-gold-pale/25 px-3 py-2">
          <LinkIcon size={14} strokeWidth={1.8} className="text-gold" />
          <input
            type="url"
            value={props.refUrl}
            onChange={(e) => props.onRefUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") props.onAddReference();
            }}
            placeholder="Paste a YouTube, Vimeo, or Instagram link…"
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:italic placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={props.onAddReference}
            disabled={!props.refUrl.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={12} strokeWidth={1.8} />
            Add
          </button>
        </div>

        {props.refs.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-gold/35 bg-white px-6 py-10 text-center">
            <Clapperboard size={22} strokeWidth={1.3} className="mx-auto text-gold-light" />
            <p className="mt-2 font-serif italic text-[15px] text-gold-light">
              No references yet. Paste a link above — even one changes the whole conversation with your videographer.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {props.refs.map((r) => (
              <ReferenceCard
                key={r.id}
                ref_={r}
                onUpdate={(patch) => props.onUpdateRef(r.id, patch)}
                onRemove={() => props.onRemoveRef(r.id)}
                onToggleReaction={(chipId) => props.onToggleRefReaction(r.id, chipId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Style Comparison */}
      {props.refs.length >= 2 && (
        <section>
          <SectionHeader
            eyebrow="What your references have in common"
            title="Style Comparison"
          />
          <div className="mt-4 rounded-lg border border-gold/25 bg-gold-pale/25 px-5 py-4">
            <div className="flex items-start gap-3">
              <Sparkles size={14} strokeWidth={1.8} className="mt-1 flex-shrink-0 text-gold" />
              <p className="flex-1 font-serif text-[15px] leading-[1.7] text-ink">
                {props.styleSummary || generateStyleSummary(props.refs)}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={props.onRegenerateSummary}
                className="inline-flex items-center gap-1.5 text-[12px] text-gold hover:text-saffron"
              >
                <Wand2 size={12} strokeWidth={1.8} />
                Regenerate
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ReferenceCard({
  ref_,
  onUpdate,
  onRemove,
  onToggleReaction,
}: {
  ref_: ReferenceFilm;
  onUpdate: (patch: Partial<ReferenceFilm>) => void;
  onRemove: () => void;
  onToggleReaction: (chipId: string) => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const refReactions = ref_.reactions ?? [];
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-white">
      <div className="relative aspect-video bg-gradient-to-br from-ivory-deep via-gold-pale to-rose-pale">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 shadow-md">
            <Play size={14} strokeWidth={2} className="translate-x-[1px] text-ink" fill="currentColor" />
          </span>
        </div>
        {ref_.url && (
          <a
            href={ref_.url}
            target="_blank"
            rel="noreferrer"
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10.5px] text-ink-muted hover:text-ink"
          >
            Open
            <ExternalLink size={10} strokeWidth={1.8} />
          </a>
        )}
      </div>
      <div className="space-y-2.5 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <input
            type="text"
            value={ref_.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="flex-1 bg-transparent font-serif text-[15px] text-ink outline-none"
          />
          <button
            type="button"
            onClick={onRemove}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove reference"
          >
            <Trash2 size={13} strokeWidth={1.8} className="text-ink-faint hover:text-rose" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {REACTION_CHIPS.map((chip) => {
            const on = refReactions.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onToggleReaction(chip.id)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                  on
                    ? "border-gold bg-gold-pale/60 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/30",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <textarea
          value={ref_.love}
          onChange={(e) => onUpdate({ love: e.target.value })}
          placeholder="What I love about this…"
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-ivory-warm/30 px-3 py-1.5 text-[12.5px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
        />
        <textarea
          value={ref_.change}
          onChange={(e) => onUpdate({ change: e.target.value })}
          placeholder="What I'd change…"
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-ivory-warm/30 px-3 py-1.5 text-[12.5px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
        />
        <div>
          <div className="flex flex-wrap gap-1">
            {ref_.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-ivory-warm px-2 py-0.5 text-[10.5px] text-ink-muted"
              >
                {t}
                <button
                  type="button"
                  onClick={() => onUpdate({ tags: ref_.tags.filter((x) => x !== t) })}
                  aria-label={`Remove tag ${t}`}
                >
                  <X size={9} strokeWidth={2} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  onUpdate({ tags: [...ref_.tags, tagInput.trim().toLowerCase()] });
                  setTagInput("");
                }
              }}
              placeholder="+ tag"
              className="w-20 bg-transparent text-[11px] outline-none placeholder:italic placeholder:text-ink-faint"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Tab 3: Sound & Story ─────────────────────────────────────────────────────

type SoundTabProps = {
  audioPriority: AudioPriority | null;
  onSetAudioPriority: (p: AudioPriority) => void;
  music: Record<EventKey, MusicDirection>;
  onSetEventMood: (ev: EventKey, mood: MoodKey) => void;
  onSetEventNotes: (ev: EventKey, notes: string) => void;
  onSuggestMusic: (ev: EventKey) => void;
  playing: string | null;
  saved: Set<string>;
  onTogglePlay: (id: string) => void;
  onToggleSaved: (id: string) => void;
  voMode: VoiceoverMode;
  onSetVoMode: (m: VoiceoverMode) => void;
  voScript: string;
  onSetVoScript: (v: string) => void;
  onAiVoiceoverDraft: () => void;
  storyAnswers: Record<string, string>;
  onSetStoryAnswer: (idx: number, v: string) => void;
  storyOutline: string;
  onSetStoryOutline: (v: string) => void;
  onGenerateStory: () => void;
};

function SoundTab(props: SoundTabProps) {
  const audioPriorityOptions: {
    id: AudioPriority;
    title: string;
    note: string;
  }[] = [
    {
      id: "music_driven",
      title: "Music-driven",
      note: "The soundtrack is the spine. Audio is woven in for accent.",
    },
    {
      id: "vows_speeches_first",
      title: "Vows & speeches first",
      note: "Every word matters. Music supports, never competes.",
    },
    {
      id: "balanced",
      title: "Balanced",
      note: "Weave both together — music sets the tone, audio brings the truth.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Audio Priority */}
      <section>
        <SectionHeader
          eyebrow="How should sound carry your film?"
          title="Audio Priority"
          subtitle="One signal your videographer uses to weigh score against natural audio."
        />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {audioPriorityOptions.map((opt) => {
            const selected = props.audioPriority === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => props.onSetAudioPriority(opt.id)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border px-4 py-4 text-left transition-all",
                  selected
                    ? "border-gold bg-gold-pale/30 shadow-sm"
                    : "border-border bg-white hover:border-gold/30",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-serif text-[16.5px] text-ink">
                    {opt.title}
                  </span>
                  {selected && (
                    <CheckCircle2 size={14} strokeWidth={1.8} className="text-gold" />
                  )}
                </div>
                <p className={cn("text-[12.5px] leading-[1.55]", selected ? "text-ink" : "text-ink-muted")}>
                  {opt.note}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Music Direction per event */}
      <section>
        <SectionHeader
          eyebrow="The energy of each event, in sound"
          title="Music Direction"
          subtitle="Set the mood for each celebration. Your videographer uses this to match pacing and score to each moment."
        />
        <div className="mt-5 space-y-4">
          {EVENTS.map((ev) => (
            <EventMusicRow
              key={ev.id}
              event={ev}
              direction={props.music[ev.id]}
              onSetMood={(m) => props.onSetEventMood(ev.id, m)}
              onSetNotes={(n) => props.onSetEventNotes(ev.id, n)}
              onSuggest={() => props.onSuggestMusic(ev.id)}
            />
          ))}
        </div>
      </section>

      {/* Music Sampler */}
      <section>
        <SectionHeader
          eyebrow="Listen and save — your videographer will match the energy"
          title="Music Sampler"
          subtitle="Short samples across mood categories. Heart the ones that feel right; they'll flow into the events above."
        />
        <div className="mt-5 space-y-5">
          {SAMPLER.map((cat) => (
            <div key={cat.id}>
              <h4 className="font-serif text-[17px] text-ink">{cat.label}</h4>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cat.samples.map((s) => {
                  const isPlaying = props.playing === s.id;
                  const isSaved = props.saved.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => props.onTogglePlay(s.id)}
                        className={cn(
                          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                          isPlaying
                            ? "border-ink bg-ink text-ivory"
                            : "border-border bg-ivory-warm text-ink hover:border-gold/40",
                        )}
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause size={12} strokeWidth={2} /> : <Play size={12} strokeWidth={2} className="translate-x-[1px]" fill="currentColor" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] text-ink">{s.title}</p>
                        {isPlaying && <SoundWave />}
                        <p className="mt-0.5 font-mono text-[10px] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
                          {s.meta}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => props.onToggleSaved(s.id)}
                        aria-label={isSaved ? "Unsave" : "Save"}
                        className={cn(
                          "flex-shrink-0 transition-colors",
                          isSaved ? "text-rose" : "text-ink-faint hover:text-rose",
                        )}
                      >
                        <Heart size={14} strokeWidth={1.8} fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voiceover */}
      <section>
        <SectionHeader
          eyebrow="A voice over the film — or the quiet between the frames"
          title="Voiceover & Narration"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {([
            { id: "none", title: "No voiceover", note: "Let the visuals and music speak." },
            { id: "vows", title: "Personal vows as voiceover", note: "Use audio from the ceremony itself." },
            { id: "custom", title: "Custom narration", note: "Write or record a personal message." },
            { id: "letter", title: "Letter to each other", note: "A written letter read over the film." },
          ] as const).map((opt) => {
            const selected = props.voMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => props.onSetVoMode(opt.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border px-4 py-3.5 text-left transition-all",
                  selected ? "border-gold bg-gold-pale/30 shadow-sm" : "border-border bg-white hover:border-gold/30",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-serif text-[15.5px] text-ink">{opt.title}</span>
                  {selected && <CheckCircle2 size={14} strokeWidth={1.8} className="text-gold" />}
                </div>
                <span className="text-[12.5px] text-ink-muted">{opt.note}</span>
              </button>
            );
          })}
        </div>

        {(props.voMode === "custom" || props.voMode === "letter") && (
          <div className="mt-5 rounded-lg border border-border bg-white px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
                {props.voMode === "letter" ? "Your letter" : "Your narration"}
              </p>
              <button
                type="button"
                onClick={props.onAiVoiceoverDraft}
                className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/40 px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-gold-pale/60"
              >
                <Sparkles size={12} strokeWidth={1.8} className="text-gold" />
                Help me write this
              </button>
            </div>
            <textarea
              value={props.voScript}
              onChange={(e) => props.onSetVoScript(e.target.value)}
              placeholder={
                props.voMode === "letter"
                  ? "Dear you — start where the feeling starts. We'll polish it together."
                  : "Write what you want people to feel when they watch this film…"
              }
              rows={props.voScript ? 10 : 6}
              className="w-full resize-none rounded-md border border-border bg-ivory-warm/20 px-4 py-3 font-serif text-[15.5px] leading-[1.7] text-ink placeholder:font-sans placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* Story Mockup */}
      <section>
        <SectionHeader
          eyebrow="What's the story of your wedding film?"
          title="Story Mockup"
          subtitle="Answer a few questions and we'll sketch out a narrative arc your videographer can use as a creative guide."
        />

        <div className="mt-5 rounded-lg border border-border bg-white px-5 py-4">
          {!props.storyOutline ? (
            <div className="space-y-4">
              {STORY_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <label className="block font-serif text-[14.5px] text-ink">{q}</label>
                  <textarea
                    value={props.storyAnswers[`q${i}`] ?? ""}
                    onChange={(e) => props.onSetStoryAnswer(i, e.target.value)}
                    rows={2}
                    placeholder="A sentence or two is enough."
                    className="mt-1.5 w-full resize-none rounded-md border border-border bg-ivory-warm/20 px-3 py-2 text-[13.5px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11.5px] italic text-gold-light">
                  Your love story has a beginning, middle, and end — let's sketch it out.
                </p>
                <button
                  type="button"
                  onClick={props.onGenerateStory}
                  disabled={Object.values(props.storyAnswers).every((v) => !v?.trim())}
                  className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={13} strokeWidth={1.8} />
                  Generate story outline
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold" style={{ fontFamily: "var(--font-mono)" }}>
                  Your film's story arc
                </p>
                <button
                  type="button"
                  onClick={props.onGenerateStory}
                  className="inline-flex items-center gap-1 text-[12px] text-gold hover:text-saffron"
                >
                  <Wand2 size={12} strokeWidth={1.8} />
                  Regenerate
                </button>
              </div>
              <textarea
                value={props.storyOutline}
                onChange={(e) => props.onSetStoryOutline(e.target.value)}
                rows={16}
                className="w-full resize-none rounded-md border border-border bg-ivory-warm/20 px-4 py-3 font-serif text-[15px] leading-[1.8] text-ink focus:border-gold/40 focus:outline-none"
              />
              <p className="text-[11.5px] italic text-ink-muted">
                Fully editable. This becomes a creative guide, not a script.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventMusicRow({
  event,
  direction,
  onSetMood,
  onSetNotes,
  onSuggest,
}: {
  event: { id: EventKey; label: string };
  direction: MusicDirection;
  onSetMood: (m: MoodKey) => void;
  onSetNotes: (n: string) => void;
  onSuggest: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
            Event
          </p>
          <h4 className="mt-0.5 font-serif text-[18px] text-ink">{event.label}</h4>
        </div>
        <button
          type="button"
          onClick={onSuggest}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-gold-pale/50"
        >
          <Sparkles size={11} strokeWidth={1.8} className="text-gold" />
          Suggest music
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {MOODS.map((m) => {
          const on = direction.mood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSetMood(m.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                on
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={direction.notes}
        onChange={(e) => onSetNotes(e.target.value)}
        placeholder={
          event.id === "baraat"
            ? "e.g., Live dhol for entry, then DJ Punjabi mashups"
            : event.id === "reception"
              ? "e.g., First dance: 'Perfect' by Ed Sheeran. Dance floor: Bollywood top 40."
              : "Specific songs, artists, or vibes for this event…"
        }
        rows={2}
        className="mt-3 w-full resize-none rounded-md border border-border bg-ivory-warm/20 px-3 py-2 text-[13px] placeholder:italic placeholder:text-ink-faint focus:border-gold/40 focus:outline-none"
      />
    </div>
  );
}

function SoundWave() {
  return (
    <div className="flex items-end gap-[2px] pt-1" aria-hidden>
      {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3].map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-sm bg-gold"
          style={{
            height: `${h * 10}px`,
            animation: `pulse 0.${(i % 5) + 3}s ease-in-out ${i * 0.05}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ── Quiz modal ───────────────────────────────────────────────────────────────

function QuizModal({
  step,
  answers,
  onStep,
  onAnswer,
  onFinish,
  onClose,
}: {
  step: number;
  answers: Record<string, string>;
  onStep: (n: number) => void;
  onAnswer: (qId: string, oId: string) => void;
  onFinish: () => void;
  onClose: () => void;
}) {
  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[step];
  if (!q) return null;
  const selected = answers[q.id];
  const isLast = step === total - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-xl bg-ivory px-8 pb-8 pt-10 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-muted hover:text-ink"
          aria-label="Close quiz"
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        <div className="mb-5 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron" style={{ fontFamily: "var(--font-mono)" }}>
            Your wedding film · {step + 1} of {total}
          </p>
          <div className="flex items-center gap-1">
            {QUIZ_QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === step ? "w-6 bg-gold" : i < step ? "w-4 bg-gold/50" : "w-4 bg-border",
                )}
              />
            ))}
          </div>
        </div>

        <h3 className="font-serif text-[26px] leading-[1.15] text-ink">{q.prompt}</h3>
        <p className="mt-2 text-[13px] italic text-ink-muted">{q.help}</p>

        <div className="mt-6 space-y-2">
          {q.options.map((opt) => {
            const on = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswer(q.id, opt.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
                  on
                    ? "border-gold bg-gold-pale/40"
                    : "border-border bg-white hover:border-gold/30 hover:bg-ivory-warm/40",
                )}
              >
                <span className="font-serif text-[16px] text-ink">{opt.label}</span>
                {on && <CheckCircle2 size={16} strokeWidth={1.8} className="text-gold" />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-[13px] text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onFinish() : onStep(step + 1))}
            disabled={!selected}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-5 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? "See my film brief" : "Next"}
            <ArrowRight size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable bits ────────────────────────────────────────────────────────────

function QuizEntryCard({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-br from-ivory-warm to-gold-pale/30 px-6 py-6 md:px-8">
      <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron" style={{ fontFamily: "var(--font-mono)" }}>
            Guided onboarding · ~3 min
          </p>
          <h3 className="mt-2 font-serif text-[24px] leading-[1.15] text-ink">
            Your wedding film in 5 questions
          </h3>
          <p className="mt-2 text-[14px] leading-[1.55] text-ink-muted">
            Five light questions. We'll turn your answers into a draft brief, style keywords, and starting music direction — all editable.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-[13px] text-ink-muted hover:text-ink"
          >
            Skip, I'll fill it in myself
          </button>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Sparkles size={13} strokeWidth={1.8} />
            Start the quiz
            <ArrowRight size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilmToneSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const label =
    value < 33 ? "Warm Documentary" : value < 67 ? "Editorial Cinematic" : "Highly Produced";
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] italic text-ink-muted">
          Slide between raw documentary and highly produced cinema. Your videographer color-grades to match.
        </p>
        <span className="font-mono text-[11px] text-gold" style={{ fontFamily: "var(--font-mono)" }}>
          {label} · {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold"
        aria-label="Film tone"
      />
      <div className="flex items-center justify-between text-[11.5px] text-ink-faint">
        <span>Raw &amp; documentary</span>
        <span>Highly cinematic</span>
      </div>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white px-5 py-5 md:px-6 md:py-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint" style={{ fontFamily: "var(--font-mono)" }}>
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-[22px] leading-[1.15] text-ink">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron" style={{ fontFamily: "var(--font-mono)" }}>
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-serif text-[26px] leading-[1.1] text-ink">{title}</h2>
      {subtitle && <p className="mt-1.5 max-w-2xl text-[13.5px] text-ink-muted">{subtitle}</p>}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
