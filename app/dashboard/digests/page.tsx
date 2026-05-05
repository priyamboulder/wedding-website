// ── /dashboard/digests route ───────────────────────────────────────────
// Reverse-chronological archive of every weekly digest the couple has
// received. Reachable from the dashboard's WeeklyDigest card via "View
// past digests".

import { DigestsArchive } from "@/components/dashboard/DigestsArchive";

export default function DigestsArchivePage() {
  return <DigestsArchive />;
}
