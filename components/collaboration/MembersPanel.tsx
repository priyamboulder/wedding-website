"use client";

import { Plus, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member, MemberRole } from "@/types/checklist";
import { Avatar } from "./Avatar";

const ROLES: MemberRole[] = ["Owner", "Planner", "Family", "Vendor", "Viewer"];

export function MembersPanel({
  members,
  ownerId,
  onInviteClick,
  onRoleChange,
  onResend,
  onRemove,
}: {
  members: Member[];
  ownerId: string | null;
  onInviteClick: () => void;
  onRoleChange: (id: string, role: MemberRole) => void;
  onResend: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const sorted = [...members].sort((a, b) => {
    // Active first, invited last
    if (a.status !== b.status) return a.status === "Active" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const activeCount = members.filter((m) => m.status === "Active").length;
  const invitedCount = members.filter((m) => m.status === "Invited").length;

  return (
    <main className="flex-1 overflow-y-auto" aria-label="Members">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Workspace
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">
                Members
              </h2>
              <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-muted">
                Everyone with access to this planning space.{" "}
                <span className="text-ink-faint">
                  {activeCount} active
                  {invitedCount > 0 ? ` · ${invitedCount} invited` : ""}
                </span>
              </p>
            </div>
            <button
              onClick={onInviteClick}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/30 px-3.5 py-2 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
            >
              <Plus size={13} strokeWidth={2} />
              Invite
            </button>
          </div>
          <div className="mt-5 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />
        </div>

        <ul className="divide-y divide-border/60" role="list">
          {sorted.map((member) => {
            const isOwner = member.id === ownerId;
            const canEdit = !isOwner;

            return (
              <li
                key={member.id}
                className="flex items-center gap-4 py-4"
              >
                <Avatar member={member} size={36} showTooltip={false} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-[15px] font-medium text-ink">
                      {member.name}
                    </span>
                    {isOwner && (
                      <span className="rounded-full border border-gold/20 bg-gold-pale/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[12px] text-ink-muted">
                    {member.email}
                  </div>
                </div>

                {/* Status pill */}
                {member.status === "Invited" ? (
                  <button
                    onClick={() => onResend(member.id)}
                    className="flex items-center gap-1 rounded-full border border-gold/20 bg-gold-pale/30 px-2.5 py-0.5 text-[10px] font-medium text-gold transition-colors hover:bg-gold-pale/50"
                    title="Resend invitation"
                  >
                    <Send size={9} strokeWidth={1.5} />
                    Invited — resend
                  </button>
                ) : (
                  <span className="rounded-full bg-sage-pale px-2 py-0.5 text-[10px] font-medium text-sage">
                    Active
                  </span>
                )}

                {/* Role dropdown */}
                <select
                  value={member.role}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onRoleChange(member.id, e.target.value as MemberRole)
                  }
                  className={cn(
                    "appearance-none rounded-md border border-border bg-ivory px-2.5 py-1 text-[12px] outline-none transition-colors",
                    canEdit
                      ? "cursor-pointer text-ink-muted hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                      : "cursor-not-allowed text-ink-faint",
                  )}
                  aria-label={`Role for ${member.name}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {/* Remove */}
                <button
                  onClick={() => {
                    if (isOwner) return;
                    onRemove(member.id);
                  }}
                  disabled={isOwner}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                    isOwner
                      ? "cursor-not-allowed text-ink-faint/30"
                      : "text-ink-faint hover:bg-rose-pale hover:text-rose",
                  )}
                  aria-label={`Remove ${member.name}`}
                  title={isOwner ? "The owner can't be removed" : "Remove"}
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
