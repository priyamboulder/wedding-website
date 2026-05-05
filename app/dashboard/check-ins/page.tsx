// ── /dashboard/check-ins route ──────────────────────────────────────────
// Reverse-chronological list of every daily check-in entry. Reachable
// from the dashboard's daily check-in card via "View past entries".

import { CheckInsHistory } from "@/components/dashboard/CheckInsHistory";

export default function CheckInsHistoryPage() {
  return <CheckInsHistory />;
}
