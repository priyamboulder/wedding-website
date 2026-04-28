"use client";

import { useEffect, useState } from "react";
import { AtSign, Mail, Send, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./WorkspaceContent";
import type {
  VendorWorkspace,
  VendorWorkspaceInvitation,
} from "@/types/vendor-workspace";

interface InvitationPanelProps {
  workspace: VendorWorkspace;
  vendorName: string;
  vendorEmail?: string;
  onSend: (payload: { invited_email: string; personal_note: string }) => void;
  onResend: () => void;
}

export function InvitationPanel({
  workspace,
  vendorName,
  vendorEmail,
  onSend,
  onResend,
}: InvitationPanelProps) {
  const [email, setEmail] = useState(
    workspace.invitation?.invited_email ?? vendorEmail ?? "",
  );
  const [note, setNote] = useState(
    workspace.invitation?.personal_note ??
      `${vendorName.split(" ")[0]}, we'd love to have you bring your craft to our wedding. I've pre-staged everything you'll need here — look it over when you have a moment.`,
  );

  useEffect(() => {
    if (workspace.invitation?.invited_email) {
      setEmail(workspace.invitation.invited_email);
    }
    if (workspace.invitation?.personal_note) {
      setNote(workspace.invitation.personal_note);
    }
  }, [workspace.invitation?.id]);

  const isSending = workspace.invite_status === "not_invited";
  const canSend = email.trim().length > 0 && note.trim().length > 0;

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Invitation"
        title={isSending ? "Send the invitation" : "Manage invitation"}
        description={
          isSending
            ? "Send the vendor a scoped link to claim their workspace. They'll either create an Ananya account or link an existing one."
            : "The vendor can log back in any time from the claimed link. Resend to bump it to the top of their inbox."
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="space-y-4 rounded-lg border border-border bg-white p-5">
          <Field label="Vendor email" icon={<AtSign size={13} strokeWidth={1.8} />}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. studio@vendor.com"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
            />
          </Field>

          <Field
            label="Personal note"
            icon={<Mail size={13} strokeWidth={1.8} />}
            hint="Appears above the claim button. A warm two-sentence greeting goes a long way."
          >
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
            />
          </Field>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {isSending ? "No invitation sent yet" : sentSummary(workspace.invitation)}
            </span>
            <button
              type="button"
              disabled={!canSend}
              onClick={() =>
                isSending
                  ? onSend({ invited_email: email, personal_note: note })
                  : onResend()
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory transition-opacity hover:opacity-90",
                !canSend && "cursor-not-allowed opacity-40",
              )}
            >
              <Send size={13} strokeWidth={1.8} />
              {isSending ? "Send invitation" : "Resend invitation"}
            </button>
          </div>
        </div>

        {/* Email preview */}
        <EmailPreview
          vendorName={vendorName}
          personalNote={note}
          weddingLabel="Priya & Arjun"
        />
      </div>
    </section>
  );
}

function sentSummary(inv: VendorWorkspaceInvitation | null): string {
  if (!inv || !inv.sent_at) return "Not yet sent";
  const d = new Date(inv.sent_at);
  return `Last sent ${d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} at ${d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
        <span className="text-ink-muted">{icon}</span>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] italic text-ink-muted">{hint}</p>}
    </div>
  );
}

function EmailPreview({
  vendorName,
  personalNote,
  weddingLabel,
}: {
  vendorName: string;
  personalNote: string;
  weddingLabel: string;
}) {
  return (
    <aside className="overflow-hidden rounded-lg border border-border bg-gradient-to-b from-ivory-warm/40 to-ivory p-5 shadow-[0_1px_1px_rgba(26,26,26,0.03)]">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Email preview
      </p>

      <div className="mt-3 rounded-md border border-border bg-white p-5">
        <div className="border-b border-border pb-3">
          <p className="text-[11px] text-ink-muted">
            From: Ananya · on behalf of {weddingLabel}
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-ink">
            You're invited to {weddingLabel}'s workspace
          </p>
        </div>

        <div className="py-4">
          <p className="font-serif text-[18px] leading-snug text-ink">
            {vendorName.split(" ")[0]},
          </p>
          <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
            {personalNote.trim() || <em className="text-ink-faint">(Your note will appear here.)</em>}
          </p>
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
            We've set up a dedicated workspace on Ananya with everything you'll
            need — references, timings, scope. Click below to claim it.
          </p>

          <div className="mt-5 flex justify-center">
            <div className="rounded-md bg-ink px-5 py-2.5 text-[12.5px] font-medium text-ivory">
              Claim your workspace →
            </div>
          </div>

          <p className="mt-5 text-[11px] italic text-ink-faint">
            With love, {weddingLabel}
          </p>
        </div>

        <div className="flex items-center gap-1.5 border-t border-border pt-3">
          <SparklesIcon size={11} strokeWidth={1.6} className="text-saffron" />
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Powered by Ananya
          </span>
        </div>
      </div>
    </aside>
  );
}
