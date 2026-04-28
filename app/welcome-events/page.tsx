// ── /welcome-events route ──────────────────────────────────────────────────
// Top-level route for the Welcome Events module, part of the Memories &
// Keepsakes section. Delegates to the shell which owns the TopNav + tab
// layout.

import { WelcomeEventsShell } from "@/components/welcome-events/WelcomeEventsShell";

export default function WelcomeEventsPage() {
  return <WelcomeEventsShell />;
}
