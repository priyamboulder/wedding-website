"use client";

import { Suspense } from "react";
import OriginalChecklistPage from "./_legacy/OriginalChecklistPage";
import { AIQuestionnaireLauncher } from "@/components/ai-checklist/AIQuestionnaireLauncher";

export default function ChecklistPage() {
  return (
    // OriginalChecklistPage calls useSearchParams() — Suspense boundary required
    // by Next.js 16 App Router for any component using useSearchParams.
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <OriginalChecklistPage />
      <AIQuestionnaireLauncher />
    </Suspense>
  );
}
