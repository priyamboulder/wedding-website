// ── /dashboard/year-in-review route ────────────────────────────────────
// Couple-only keepsake page that compiles the entire planning journey
// into a single beautifully-designed printable surface. The actual
// layout lives in the YearInReviewKeepsake client component so that
// store hydration is handled in one place.

import { YearInReviewKeepsake } from "@/components/dashboard/YearInReviewKeepsake";

export default function YearInReviewPage() {
  return <YearInReviewKeepsake />;
}
