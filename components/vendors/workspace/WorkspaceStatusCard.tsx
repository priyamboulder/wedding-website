"use client";

import { useMemo } from "react";
import {
  Clock,
  Eye,
  Mail,
  Send,
  Sparkles,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  VendorWorkspace,
  WorkspaceInviteStatus,
} from "@/types/vendor-workspace";
import {
  DISCIPLINE_LABEL,
  INVITE_STATUS_LABEL,
} from "@/types/vendor-workspace";

interface WorkspaceStatusCardProps {
  workspace: VendorWorkspace;
  vendorName: string;
  onInvite: () => void;
  onResend: () => void;
  onRevoke: () => void;
  onPreview: () => void;
}

const STATUS_COLOR: Record<
  WorkspaceInviteStatus,
  { dot: string; pill: string; tint: string }
> = {
  not_invited: {
    dot: "bg-ink-faint",
    pill: "bg-ivory-warm text-ink-muted",
    tint: "from-ivory-warm/40 to-ivory",
  },
  invited: {
    dot: "bg-gold-light",
    pill: "bg-gold-pale/60 text-gold",
    tint: "from-gold-pale/30 to-ivory",
  },
  active: {
    dot: "bg-sage",
    pill: "bg-sage-pale text-sage",
    tint: "from-sage-pale/40 to-ivory",
  },
  revoked: {
    dot: "bg-rose",
    pill: "bg-rose-pale/60 text-rose",
    tint: "from-rose-pale/30 to-ivory",
  },
};

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function WorkspaceStatusCard({
  workspace,
  vendorName,
  onInvite,
  onResend,
  onRevoke,
  onPreview,
}: WorkspaceStatusCardProps) {
  const color = STATUS_COLOR[workspace.invite_status];
  const discipline = DISCIPLINE_LABEL[workspace.discipline];
  const statusLabel = INVITE_STATUS_LABEL[workspace.invite_status];

  const claimedOn = useMemo(
    () =>
      workspace.invitation?.claimed_at
        ? new Date(workspace.invitation.claimed_at).toLocaleDateString(
            undefined,
            { month: "long", day: "numeric", year: "numeric" },
          )
        : null,
    [workspace.invitation?.claimed_at],
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-6 shadow-[0_1px_2px_rgba(26,26,26,0.04)]",
        color.tint,
      )}
    >
      {/* Corner sparkle accent — editorial punctuation */}
      <Sparkles
        size={84}
        strokeWidth={0.6}
        className="pointer-events-none absolute -right-5 -top-5 text-saffron/12"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Workspace
            </span>
            <span className="text-ink-faint">·</span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {discipline}
            </span>
          </div>

          <h2 className="mt-1.5 font-serif text-[24px] leading-tight text-ink">
            {vendorName}'s workspace
          </h2>

          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-muted">
            The scoped view this vendor lands in when they log into Ananya.
            Everything you stage here — references, timings, permissions —
            travels with the invitation.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "relative flex h-2 w-2",
                  color.dot === "bg-sage" && "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-sage/40",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    color.dot,
                  )}
                />
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                  color.pill,
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {statusLabel}
              </span>
            </div>

            {workspace.last_vendor_activity_at && (
              <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                <Clock size={12} strokeWidth={1.6} className="text-ink-faint" />
                <span>Last active {formatRelative(workspace.last_vendor_activity_at)}</span>
              </div>
            )}

            {claimedOn && (
              <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                <UserCheck size={12} strokeWidth={1.6} className="text-ink-faint" />
                <span>Claimed {claimedOn}</span>
              </div>
            )}

            {workspace.invitation?.sent_at && workspace.invite_status !== "active" && (
              <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                <Mail size={12} strokeWidth={1.6} className="text-ink-faint" />
                <span>Sent {formatRelative(workspace.invitation.sent_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
          <button
            type="button"
            onClick={onPreview}
            className="group inline-flex items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-[12.5px] font-medium text-ink transition-all hover:border-saffron hover:bg-saffron-pale/40"
          >
            <Eye size={13} strokeWidth={1.8} className="text-ink-muted group-hover:text-saffron" />
            View as vendor
          </button>

          {workspace.invite_status === "not_invited" && (
            <button
              type="button"
              onClick={onInvite}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-opacity hover:opacity-90"
            >
              <Send size={13} strokeWidth={1.8} />
              Invite vendor
            </button>
          )}

          {workspace.invite_status === "invited" && (
            <>
              <button
                type="button"
                onClick={onResend}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-opacity hover:opacity-90"
              >
                <Send size={13} strokeWidth={1.8} />
                Resend invitation
              </button>
              <button
                type="button"
                onClick={onRevoke}
                className="inline-flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-rose transition-opacity hover:opacity-80"
              >
                <UserX size={12} strokeWidth={1.8} />
                Revoke
              </button>
            </>
          )}

          {workspace.invite_status === "active" && (
            <button
              type="button"
              onClick={onRevoke}
              className="inline-flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-rose"
            >
              <UserX size={12} strokeWidth={1.8} />
              Revoke access
            </button>
          )}

          {workspace.invite_status === "revoked" && (
            <button
              type="button"
              onClick={onInvite}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-opacity hover:opacity-90"
            >
              <Send size={13} strokeWidth={1.8} />
              Re-invite
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
