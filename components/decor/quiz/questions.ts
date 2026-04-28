// ── Décor quiz (5 questions, per rebuild spec) ──────────────────────────────
// Each step has a prompt and 4–5 single-select options. Completing the quiz
// seeds keywords, writes to the brief, and signals stylistic direction.

import type {
  DecorFeeling,
  FloralRelationship,
  ColorLean,
  Traditionality,
  FocalPriority,
} from "@/types/decor";

export interface QuizOption<T extends string> {
  value: T;
  title: string;
}

export interface QuizStep {
  kind: "feeling" | "florals" | "colors" | "traditionality" | "focal";
  prompt: string;
  options:
    | QuizOption<DecorFeeling>[]
    | QuizOption<FloralRelationship>[]
    | QuizOption<ColorLean>[]
    | QuizOption<Traditionality>[]
    | QuizOption<FocalPriority>[];
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    kind: "feeling",
    prompt: "What's the overall feeling you want your wedding to have?",
    options: [
      { value: "grand_opulent", title: "Grand & opulent" },
      { value: "intimate_warm", title: "Intimate & warm" },
      { value: "modern_minimal", title: "Modern & minimal" },
      { value: "whimsical_playful", title: "Whimsical & playful" },
      { value: "traditional_sacred", title: "Traditional & sacred" },
    ] satisfies QuizOption<DecorFeeling>[],
  },
  {
    kind: "florals",
    prompt: "How do you feel about flowers?",
    options: [
      { value: "lush_everywhere", title: "Massive, lush, everywhere" },
      { value: "elegant_strategic", title: "Elegant and strategic" },
      { value: "minimal_space", title: "Minimal — let the space speak" },
      {
        value: "mixed_elements",
        title: "Mix flowers with non-floral elements (candles, draping, greenery)",
      },
    ] satisfies QuizOption<FloralRelationship>[],
  },
  {
    kind: "colors",
    prompt: "Colour story — where do you lean?",
    options: [
      { value: "jewel_tones", title: "Rich jewel tones (ruby, emerald, gold)" },
      { value: "soft_pastels", title: "Soft pastels (blush, ivory, sage)" },
      { value: "neutral_earthy", title: "Neutral & earthy (cream, terracotta, olive)" },
      {
        value: "bold_vibrant",
        title: "Bold & vibrant (marigold, fuchsia, turquoise)",
      },
      { value: "per_event", title: "I want each event to have its own palette" },
    ] satisfies QuizOption<ColorLean>[],
  },
  {
    kind: "traditionality",
    prompt: "How traditional should the décor feel?",
    options: [
      {
        value: "deeply_traditional",
        title: "Deeply traditional — marigold garlands, banana leaves, kolams",
      },
      {
        value: "modern_with_touches",
        title: "Modern with Indian touches — clean lines, cultural elements woven in",
      },
      {
        value: "fully_contemporary",
        title: "Fully contemporary — no traditional markers",
      },
      {
        value: "shifts_across_events",
        title: "I want it to shift across events (traditional ceremony, modern reception)",
      },
    ] satisfies QuizOption<Traditionality>[],
  },
  {
    kind: "focal",
    prompt: "What's more important to you?",
    options: [
      { value: "mandap", title: "The mandap — it's the sacred centerpiece" },
      { value: "entrance", title: "The entrance — first impression" },
      {
        value: "dinner_table",
        title: "The dinner table setting — where guests spend the most time",
      },
      {
        value: "overall_atmosphere",
        title: "The overall atmosphere — lighting, scent, texture",
      },
    ] satisfies QuizOption<FocalPriority>[],
  },
];

export const KEYWORDS_BY_FEELING: Record<DecorFeeling, string[]> = {
  grand_opulent: ["opulent", "dramatic", "regal"],
  intimate_warm: ["candlelit", "intimate", "romantic"],
  modern_minimal: ["minimal", "modern", "architectural"],
  whimsical_playful: ["whimsical", "playful", "bohemian"],
  traditional_sacred: ["traditional", "marigold", "sacred"],
};
