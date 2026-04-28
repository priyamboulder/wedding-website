"use client";

import { TopNav } from "@/components/shell/TopNav";
import { ApplicationWizard } from "@/components/community/rishta-circle/ApplicationWizard";
import { SubPageHeader } from "@/components/community/rishta-circle/SubPageHeader";

export default function RishtaCircleApplyPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <SubPageHeader
        eyebrow="Apply to join"
        title="rishta circle."
        subline="A short, thoughtful application. Four steps — it should take about five minutes."
      />
      <main className="px-10 py-14">
        <ApplicationWizard />
      </main>
    </div>
  );
}
