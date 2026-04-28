import type { ReactNode } from "react";
import { CreatorPortalSidebar } from "@/components/creator-portal/CreatorPortalSidebar";
import { CreatorPortalTopBar } from "@/components/creator-portal/CreatorPortalTopBar";

export default function CreatorPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white text-ink">
      <CreatorPortalSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <CreatorPortalTopBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
