// ── /community/real-weddings/new ────────────────────────────────────────────
// Legacy entrypoint for the old showcase wizard. The Real Weddings submission
// experience now lives at /share — this stub keeps any old links and emails
// working by bouncing the user there.

import { redirect } from "next/navigation";

export default function LegacyNewShowcaseRedirect(): never {
  redirect("/share");
}
