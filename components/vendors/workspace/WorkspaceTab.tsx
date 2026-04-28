"use client";

import { useCallback, useMemo, useState } from "react";
import type { Vendor } from "@/types/vendor";
import { useVendorWorkspaceStore } from "@/stores/vendor-workspace-store";
import { disciplineFromCategory } from "@/types/vendor-workspace";
import { WorkspaceStatusCard } from "./WorkspaceStatusCard";
import { WorkspaceContent } from "./WorkspaceContent";
import { PermissionsPanel } from "./PermissionsPanel";
import { InvitationPanel } from "./InvitationPanel";
import { ActivityLog } from "./ActivityLog";
import { ViewAsVendorModal } from "./ViewAsVendorModal";

interface WorkspaceTabProps {
  vendor: Vendor;
}

export function WorkspaceTab({ vendor }: WorkspaceTabProps) {
  const workspaces = useVendorWorkspaceStore((s) => s.workspaces);
  const createWorkspace = useVendorWorkspaceStore((s) => s.createWorkspace);
  const updatePermissions = useVendorWorkspaceStore((s) => s.updatePermissions);
  const sendInvitation = useVendorWorkspaceStore((s) => s.sendInvitation);
  const resendInvitation = useVendorWorkspaceStore((s) => s.resendInvitation);
  const revokeInvitation = useVendorWorkspaceStore((s) => s.revokeInvitation);

  // Lazily create a workspace for vendors that don't have one yet.
  const workspace = useMemo(() => {
    const existing = workspaces.find((w) => w.vendor_id === vendor.id);
    if (existing) return existing;
    return createWorkspace({
      vendor_id: vendor.id,
      discipline: disciplineFromCategory(vendor.category),
    });
  }, [workspaces, vendor.id, vendor.category, createWorkspace]);

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleRevoke = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        `Revoke ${vendor.name}'s access to the workspace? They'll be logged out and the link will stop working.`,
      )
    ) {
      revokeInvitation(workspace.id);
    }
  }, [revokeInvitation, workspace.id, vendor.name]);

  return (
    <>
      <div className="space-y-10">
        <WorkspaceStatusCard
          workspace={workspace}
          vendorName={vendor.name}
          onInvite={() => {
            // No-op: scrolls to the invitation panel below. The panel itself
            // owns form state and triggers sendInvitation.
            document
              .getElementById("invitation-panel")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onResend={() => resendInvitation(workspace.id)}
          onRevoke={handleRevoke}
          onPreview={() => setPreviewOpen(true)}
        />

        <WorkspaceContent workspace={workspace} />

        <PermissionsPanel
          permissions={workspace.permissions}
          onChange={(key, value) =>
            updatePermissions(workspace.id, { [key]: value })
          }
        />

        <div id="invitation-panel">
          <InvitationPanel
            workspace={workspace}
            vendorName={vendor.name}
            vendorEmail={vendor.contact.email}
            onSend={(p) => sendInvitation(workspace.id, p)}
            onResend={() => resendInvitation(workspace.id)}
          />
        </div>

        <ActivityLog activity={workspace.activity} />
      </div>

      <ViewAsVendorModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        workspace={workspace}
        vendorName={vendor.name}
        weddingLabel="Priya & Arjun"
      />
    </>
  );
}
