// ── /dashboard/decisions route ─────────────────────────────────────────
// Full reverse-chronological list of every decision the couple has
// logged. Reachable from the dashboard's Decision Tracker via "View all
// decisions".

import { DecisionsHistory } from "@/components/dashboard/DecisionsHistory";

export default function DecisionsHistoryPage() {
  return <DecisionsHistory />;
}
