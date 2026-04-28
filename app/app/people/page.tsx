"use client";

import { useState } from "react";
import { TopNav } from "@/components/shell/TopNav";
import { MembersPanel } from "@/components/collaboration/MembersPanel";
import { InviteModal } from "@/components/collaboration/InviteModal";
import { useChecklistStore } from "@/stores/checklist-store";
import type { MemberRole } from "@/types/checklist";

export default function CouplePeoplePage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const members         = useChecklistStore((s) => s.members);
  const inviteMembers   = useChecklistStore((s) => s.inviteMembers);
  const updateMemberRole = useChecklistStore((s) => s.updateMemberRole);
  const removeMember    = useChecklistStore((s) => s.removeMember);
  const resendInvite    = useChecklistStore((s) => s.resendInvite);

  const owner = members.find((m) => m.role === "Owner") ?? null;

  return (
    <div className="flex h-screen flex-col bg-white">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <MembersPanel
          members={members}
          ownerId={owner?.id ?? null}
          onInviteClick={() => setInviteOpen(true)}
          onRoleChange={(id, role) => updateMemberRole(id, role)}
          onResend={(id) => resendInvite(id)}
          onRemove={removeMember}
        />
      </main>

      <InviteModal
        open={inviteOpen}
        coupleNames={{ person1: "Partner 1", person2: "Partner 2" }}
        inviteLink={typeof window !== "undefined" ? window.location.origin + "/join" : "/join"}
        onClose={() => setInviteOpen(false)}
        onSend={(emails, role) => {
          inviteMembers(emails, role);
          setInviteOpen(false);
        }}
      />
    </div>
  );
}
