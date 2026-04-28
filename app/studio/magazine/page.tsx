// ── /studio/magazine ────────────────────────────────────────────────────────
// The Magazine moved into Community (?tab=editorial&sub=magazine) — this
// route now just redirects so existing links keep working. The submit flow
// and [slug] detail pages still live under /studio/magazine/* for now.

import { redirect } from "next/navigation";

export default function MagazineRedirect() {
  redirect("/community?tab=editorial&sub=magazine");
}
