// ── Videography → Vision & Mood quiz ──────────────────────────────────────
// Parallels photography but asks about cinematic style and pacing. Seeds
// the moodboard with reference stills and records an energy note.

import { createVisionMoodQuiz } from "./_shared";

export const videographyVisionQuiz = createVisionMoodQuiz({
  category: "videography",
  id: "videography:vision:v1",
  version: "1",
  title: "Videography in 4 quick takes",
  intro:
    "Tell us how you want the film to feel — pacing, audio, and the beats it has to land. We'll seed your moodboard, keywords, and tone note.",
  estimatedMinutes: 2,
  stylePrompt: "Which 3 words describe the film you want?",
  styleHelper: "Pick up to three — these become the brief for your cinematographer.",
  styleOptions: [
    { value: "cinematic", label: "Cinematic" },
    { value: "documentary", label: "Documentary" },
    { value: "same-day-edit", label: "Same-day edit" },
    { value: "raw-candid", label: "Raw & candid" },
    { value: "music-video", label: "Music-video" },
    { value: "slow-cinematic", label: "Slow cinematic" },
    { value: "energetic", label: "Energetic" },
    { value: "emotive", label: "Emotive" },
  ],
  moodPrompt: "Pick the film stills that feel right",
  moodOptions: [
    {
      value: "golden_cinematic",
      label: "Golden cinematic",
      image_url:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&q=70",
    },
    {
      value: "candid_docu",
      label: "Candid documentary",
      image_url:
        "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=480&q=70",
    },
    {
      value: "aerial_wide",
      label: "Aerial & wide",
      image_url:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=480&q=70",
    },
    {
      value: "music_video",
      label: "Music-video energy",
      image_url:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=480&q=70",
    },
    {
      value: "slow_intimate",
      label: "Slow & intimate",
      image_url:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=480&q=70",
    },
    {
      value: "glamorous_stage",
      label: "Glamorous stage",
      image_url:
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=480&q=70",
    },
  ],
  scalePrompt: "Pacing preference — fast cuts or long takes?",
  scaleHelper: "Slide toward the energy you want the final film to hold.",
  scaleMin: 0,
  scaleMax: 100,
  scaleStep: 5,
  scaleDefault: 45,
  scaleMinLabel: "Slow & cinematic",
  scaleMaxLabel: "Fast & energetic",
  scaleDescriptors: {
    0: "Slow, cinematic, long takes",
    25: "Measured, breathing room between moments",
    50: "Balanced — mix of slow and punchy",
    75: "Fast-paced, rhythmic cuts",
    100: "Hyper-energetic, music-video style",
  },
  scaleNoteLabel: "Pacing direction",
  avoidPrompt: "Anything you want the film to skip?",
  avoidHelper: "Think: shaky handheld, cheesy transitions, slow-mo overkill…",
  avoidPlaceholder: "e.g. no heavy slow-mo on the vows, no drone during rituals…",
  moodboardPreviewLabel: "Reference stills",
});
