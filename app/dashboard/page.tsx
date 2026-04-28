// ── /dashboard route ───────────────────────────────────────────────────────
// Home surface, reached by clicking the couple's names in the top nav. Carries
// what a dashboard should: orientation, next moves, flags, and a glance at
// event themes. Detailed editing lives on the originating surfaces (brief,
// workspace, etc.) — the dashboard never duplicates them, only points at them.

import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardPage() {
  return <DashboardShell />;
}
