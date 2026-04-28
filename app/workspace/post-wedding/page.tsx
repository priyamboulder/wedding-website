"use client";

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function WorkspacePostWeddingPage() {
  return (
    <WorkspaceShell
      initialSelection={{ type: "extra", id: "post_wedding" }}
    />
  );
}
