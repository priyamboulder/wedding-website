"use client";

import Link from "next/link";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  Globe,
  Hourglass,
  MessageSquare,
  UserPlus,
  X,
} from "lucide-react";
import { useCreatorApplicationsStore } from "@/stores/creator-applications-store";
import { useCurrentUser } from "@/stores/auth-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useCreatorsStore } from "@/stores/creators-store";
import {
  EXPERTISE_LABELS,
  FOLLOWING_LABELS,
  REJECTION_LABELS,
  STATUS_LABELS,
  YEARS_LABELS,
  type ApplicationStatus,
  type RejectionReasonCategory,
} from "@/types/creator-application";
import type { Creator } from "@/types/creator";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

type Dialog = "approve" | "reject" | "waitlist" | "info" | "note" | null;

const STATUS_BADGE: Record<ApplicationStatus, { bg: string; text: string }> = {
  pending: { bg: "#FBF4E5", text: "#8B6B1F" },
  under_review: { bg: "#FBF4E5", text: "#8B6B1F" },
  more_info_requested: { bg: "#F4EDE4", text: "#7C5C2E" },
  approved: { bg: "#E7F3EC", text: "#3B6E4A" },
  rejected: { bg: "#F9E9E6", text: "#8B2A22" },
  waitlisted: { bg: "#EDEEF5", text: "#3F4A78" },
};

export default function AdminApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useCurrentUser();
  const application = useCreatorApplicationsStore((s) =>
    s.getById(params.id),
  );
  const logs = useCreatorApplicationsStore(
    useShallow((s) => s.getLogsFor(params.id)),
  );
  const approve = useCreatorApplicationsStore((s) => s.approve);
  const reject = useCreatorApplicationsStore((s) => s.reject);
  const waitlist = useCreatorApplicationsStore((s) => s.waitlist);
  const requestInfo = useCreatorApplicationsStore((s) => s.requestInfo);
  const addInternalNote = useCreatorApplicationsStore(
    (s) => s.addInternalNote,
  );
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const existingCreators = useCreatorsStore((s) => s.creators);

  const [dialog, setDialog] = useState<Dialog>(null);

  if (!application) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-20 md:px-10">
        <p className="text-[13px] text-[#8B7E6F]" style={{ fontFamily: BODY }}>
          Application not found.
        </p>
        <Link
          href="/admin/creator-applications"
          className="mt-4 inline-flex items-center gap-2 text-[13px] text-[#1C1917] hover:text-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back to applications
        </Link>
      </div>
    );
  }

  const theme = STATUS_BADGE[application.status];
  const adminId = user?.id ?? "admin-local";
  const hasLinkedCreator = application.linkedCreatorId
    ? existingCreators.some((c) => c.id === application.linkedCreatorId)
    : false;
  const linkedCreator: Creator | undefined = hasLinkedCreator
    ? existingCreators.find((c) => c.id === application.linkedCreatorId)
    : undefined;

  // ── Actions ────────────────────────────────────────────────────────
  const onApprove = () => {
    approve({ applicationId: application.id, adminUserId: adminId });
    addNotification({
      type: "application_approved",
      title: "Congratulations — you're approved",
      body: "Your creator application has been approved. Set up your profile and start creating.",
      link: "/creators/application-status",
      actor_name: "Ananya Team",
      recipient: "couple",
    });
    setDialog(null);
  };

  const onReject = (reasonCategory: RejectionReasonCategory, reasonText: string) => {
    reject({
      applicationId: application.id,
      adminUserId: adminId,
      reasonCategory,
      reasonText,
    });
    addNotification({
      type: "application_rejected",
      title: "Your creator application update",
      body: reasonText,
      link: "/creators/application-status",
      actor_name: "Ananya Team",
      recipient: "couple",
    });
    setDialog(null);
  };

  const onWaitlist = (note: string) => {
    waitlist({ applicationId: application.id, adminUserId: adminId, note });
    addNotification({
      type: "application_waitlisted",
      title: "Your creator application — waitlisted",
      body: "We've added you to our waitlist. We'll notify you when a spot opens up.",
      link: "/creators/application-status",
      actor_name: "Ananya Team",
      recipient: "couple",
    });
    setDialog(null);
  };

  const onRequestInfo = (request: string) => {
    requestInfo({
      applicationId: application.id,
      adminUserId: adminId,
      request,
    });
    addNotification({
      type: "application_more_info",
      title: "Ananya needs more info for your creator application",
      body: request,
      link: "/creators/application-status",
      actor_name: "Ananya Team",
      recipient: "couple",
    });
    setDialog(null);
  };

  const onAddNote = (note: string) => {
    addInternalNote({
      applicationId: application.id,
      adminUserId: adminId,
      note,
    });
    setDialog(null);
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
      <Link
        href="/admin/creator-applications"
        className="inline-flex items-center gap-2 text-[12.5px] text-[#6B6157] transition-colors hover:text-[#B8755D]"
        style={{ fontFamily: BODY }}
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        All applications
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(32px, 4vw, 46px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                fontWeight: 400,
              }}
            >
              {application.fullName}
            </h1>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[10.5px] uppercase tracking-[0.14em]"
              style={{
                fontFamily: BODY,
                fontWeight: 500,
                background: theme.bg,
                color: theme.text,
              }}
            >
              {STATUS_LABELS[application.status]}
            </span>
          </div>
          <p
            className="mt-2 text-[13.5px] text-[#6B6157]"
            style={{ fontFamily: BODY }}
          >
            {application.email} · {application.locationCity},{" "}
            {application.locationCountry} · Submitted{" "}
            {new Date(application.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        {linkedCreator && (
          <Link
            href={`/creators/${linkedCreator.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white px-4 py-2 text-[12px] text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
            style={{ fontFamily: BODY }}
          >
            <UserPlus size={13} strokeWidth={1.8} />
            Linked creator: {linkedCreator.displayName}
            <ExternalLink size={12} strokeWidth={1.8} />
          </Link>
        )}
      </div>

      {/* Action bar */}
      <div className="mt-8 flex flex-wrap gap-2">
        <ActionButton
          onClick={() => setDialog("approve")}
          disabled={application.status === "approved"}
          accent="approve"
          icon={Check}
        >
          Approve
        </ActionButton>
        <ActionButton
          onClick={() => setDialog("reject")}
          disabled={application.status === "rejected"}
          accent="reject"
          icon={X}
        >
          Reject
        </ActionButton>
        <ActionButton
          onClick={() => setDialog("waitlist")}
          disabled={application.status === "waitlisted"}
          icon={Hourglass}
        >
          Waitlist
        </ActionButton>
        <ActionButton
          onClick={() => setDialog("info")}
          icon={MessageSquare}
        >
          Request more info
        </ActionButton>
        <ActionButton onClick={() => setDialog("note")} icon={FileText}>
          Add internal note
        </ActionButton>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left — application content */}
        <div className="space-y-6">
          <Card title="Bio">
            <p
              className="text-[14px] leading-relaxed text-[#1C1917]"
              style={{ fontFamily: BODY }}
            >
              {application.bio}
            </p>
          </Card>

          <Card title="Expertise">
            <dl className="grid gap-4 md:grid-cols-2">
              <DL
                label="Primary"
                value={EXPERTISE_LABELS[application.primaryExpertise]}
              />
              <DL
                label="Secondary"
                value={
                  application.secondaryExpertise.length > 0
                    ? application.secondaryExpertise
                        .map((a) => EXPERTISE_LABELS[a])
                        .join(", ")
                    : "—"
                }
              />
              <DL
                label="Years in industry"
                value={YEARS_LABELS[application.yearsExperience]}
              />
              <DL
                label="Professional?"
                value={
                  application.isIndustryProfessional
                    ? application.professionalRole || "Yes"
                    : "No"
                }
              />
            </dl>
          </Card>

          <Card title="Audience & socials">
            <dl className="grid gap-4 md:grid-cols-2">
              <DL
                label="Combined following"
                value={FOLLOWING_LABELS[application.combinedFollowingRange]}
              />
              <SocialLink
                label="Instagram"
                value={application.instagramHandle}
                href={
                  application.instagramHandle
                    ? `https://instagram.com/${application.instagramHandle.replace(/^@/, "")}`
                    : null
                }
              />
              <SocialLink
                label="YouTube"
                value={application.youtubeChannel}
                href={
                  application.youtubeChannel
                    ? /^https?:/.test(application.youtubeChannel)
                      ? application.youtubeChannel
                      : `https://youtube.com/${application.youtubeChannel.replace(/^@/, "@")}`
                    : null
                }
              />
              <SocialLink
                label="TikTok"
                value={application.tiktokHandle}
                href={
                  application.tiktokHandle
                    ? `https://tiktok.com/${application.tiktokHandle.replace(/^@/, "@")}`
                    : null
                }
              />
              <SocialLink
                label="Website"
                value={application.blogUrl}
                href={application.blogUrl}
              />
              <DL
                label="Other links"
                value={application.otherSocialLinks ?? "—"}
              />
            </dl>
          </Card>

          <Card title="Portfolio">
            {application.portfolioUrls.length === 0 ? (
              <p
                className="text-[13px] text-[#8B7E6F]"
                style={{ fontFamily: BODY }}
              >
                No portfolio links attached.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {application.portfolioUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-xl border border-[#E6DFD3] bg-[#F7F5F0] transition-colors hover:border-[#B8755D]"
                  >
                    <div
                      className="aspect-[4/3] w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                    <div
                      className="flex items-center justify-between gap-2 px-3 py-2 text-[11.5px] text-[#6B6157]"
                      style={{ fontFamily: BODY }}
                    >
                      <span className="truncate">{url}</span>
                      <ExternalLink
                        size={11}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#8B7E6F] transition-colors group-hover:text-[#B8755D]"
                      />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </Card>

          <Card title="Content plan">
            <p
              className="text-[14px] leading-relaxed text-[#1C1917]"
              style={{ fontFamily: BODY }}
            >
              {application.contentPlan}
            </p>
          </Card>

          {application.moreInfoRequest && (
            <Card title="Follow-up">
              <div
                className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                Our question
              </div>
              <p
                className="mt-1 text-[13.5px] leading-relaxed text-[#1C1917]"
                style={{ fontFamily: BODY }}
              >
                {application.moreInfoRequest}
              </p>
              {application.moreInfoResponse && (
                <>
                  <div
                    className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
                    style={{ fontFamily: BODY, fontWeight: 500 }}
                  >
                    Their response
                  </div>
                  <p
                    className="mt-1 text-[13.5px] leading-relaxed text-[#1C1917]"
                    style={{ fontFamily: BODY }}
                  >
                    {application.moreInfoResponse}
                  </p>
                </>
              )}
            </Card>
          )}
        </div>

        {/* Right — sidebar */}
        <div className="space-y-6">
          {application.status === "rejected" &&
            application.rejectionReasonText && (
              <Card title="Rejection reason">
                {application.rejectionReasonCategory && (
                  <div
                    className="text-[12px] font-medium text-[#1C1917]"
                    style={{ fontFamily: BODY }}
                  >
                    {REJECTION_LABELS[application.rejectionReasonCategory]}
                  </div>
                )}
                <p
                  className="mt-2 text-[13px] leading-relaxed text-[#6B6157]"
                  style={{ fontFamily: BODY }}
                >
                  {application.rejectionReasonText}
                </p>
                {application.reapplyEligibleAt && (
                  <p
                    className="mt-3 text-[11.5px] text-[#8B7E6F]"
                    style={{ fontFamily: BODY }}
                  >
                    Reapply eligible{" "}
                    {new Date(application.reapplyEligibleAt).toLocaleDateString()}
                  </p>
                )}
              </Card>
            )}

          {application.status === "waitlisted" && application.waitlistNote && (
            <Card title="Waitlist note">
              <p
                className="text-[13px] leading-relaxed text-[#6B6157]"
                style={{ fontFamily: BODY }}
              >
                {application.waitlistNote}
              </p>
            </Card>
          )}

          <Card title="Internal notes">
            {application.adminInternalNotes ? (
              <p
                className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#1C1917]"
                style={{ fontFamily: BODY }}
              >
                {application.adminInternalNotes}
              </p>
            ) : (
              <p
                className="text-[12.5px] text-[#8B7E6F]"
                style={{ fontFamily: BODY }}
              >
                No internal notes yet. Use "Add internal note" to leave a
                comment for the team.
              </p>
            )}
          </Card>

          <Card title="Activity log">
            {logs.length === 0 ? (
              <p
                className="text-[12.5px] text-[#8B7E6F]"
                style={{ fontFamily: BODY }}
              >
                No activity yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="border-l-2 border-[#E6DFD3] pl-3"
                    style={{ fontFamily: BODY }}
                  >
                    <div className="text-[12px] text-[#1C1917]">
                      {log.action === "status_change" && (
                        <>
                          Status →{" "}
                          <span className="font-medium">
                            {log.newStatus
                              ? STATUS_LABELS[log.newStatus]
                              : "—"}
                          </span>
                        </>
                      )}
                      {log.action === "note_added" && "Internal note added"}
                      {log.action === "info_requested" && "Requested more info"}
                    </div>
                    {log.note && (
                      <div className="mt-1 text-[12px] text-[#6B6157]">
                        {log.note}
                      </div>
                    )}
                    <div className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-[#8B7E6F]">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {dialog === "approve" && (
        <ConfirmDialog
          title="Approve application"
          description={`This will create a creator profile for ${application.fullName} at Standard tier (5% commission) and notify them.`}
          confirmLabel="Approve & create profile"
          accent="#3B6E4A"
          onConfirm={onApprove}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "reject" && (
        <RejectDialog onReject={onReject} onClose={() => setDialog(null)} />
      )}
      {dialog === "waitlist" && (
        <TextDialog
          title="Waitlist applicant"
          description="Leave a short note explaining why. They'll see this on their status page."
          placeholder="We loved your work but our current cohort is focused on…"
          confirmLabel="Add to waitlist"
          accent="#3F4A78"
          onConfirm={onWaitlist}
          onClose={() => setDialog(null)}
          required
        />
      )}
      {dialog === "info" && (
        <TextDialog
          title="Request more information"
          description="What do you need from the applicant? They'll see this prompt on their status page with a response field."
          placeholder="Could you share 2–3 links to past wedding-specific work?"
          confirmLabel="Send request"
          accent="#7C5C2E"
          onConfirm={onRequestInfo}
          onClose={() => setDialog(null)}
          required
        />
      )}
      {dialog === "note" && (
        <TextDialog
          title="Add internal note"
          description="Team-only. The applicant will never see this."
          placeholder="Quick thoughts for the team…"
          confirmLabel="Save note"
          accent="#1C1917"
          onConfirm={onAddNote}
          onClose={() => setDialog(null)}
          required
        />
      )}
    </div>
  );
}

// ── Cards & primitives ───────────────────────────────────────────────────

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E6DFD3] bg-white p-6">
      <h3
        className="text-[11px] uppercase tracking-[0.16em] text-[#8B7E6F]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DL({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-[10.5px] uppercase tracking-[0.14em] text-[#8B7E6F]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 text-[13.5px] text-[#1C1917]"
        style={{ fontFamily: BODY }}
      >
        {value}
      </dd>
    </div>
  );
}

function SocialLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null;
  href: string | null;
}) {
  if (!value) return <DL label={label} value="—" />;
  return (
    <div>
      <dt
        className="text-[10.5px] uppercase tracking-[0.14em] text-[#8B7E6F]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {label}
      </dt>
      <dd className="mt-1" style={{ fontFamily: BODY }}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13.5px] text-[#1C1917] transition-colors hover:text-[#B8755D]"
          >
            <Globe size={12} strokeWidth={1.8} />
            {value}
            <ExternalLink size={11} strokeWidth={1.8} />
          </a>
        ) : (
          <span className="text-[13.5px] text-[#1C1917]">{value}</span>
        )}
      </dd>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
  disabled,
  accent,
  icon: Icon,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  accent?: "approve" | "reject";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}) {
  const cls =
    accent === "approve"
      ? "bg-[#3B6E4A] text-white hover:bg-[#2E5739]"
      : accent === "reject"
        ? "bg-[#8B2A22] text-white hover:bg-[#711F19]"
        : "border border-[#E6DFD3] bg-white text-[#1C1917] hover:border-[#B8755D] hover:text-[#B8755D]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-medium tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
      style={{ fontFamily: BODY }}
    >
      <Icon size={13} strokeWidth={1.8} />
      {children}
    </button>
  );
}

// ── Dialogs ─────────────────────────────────────────────────────────────

function DialogShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 p-6">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#E6DFD3] bg-white p-7 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: 26,
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8B7E6F] transition-colors hover:bg-[#F0E9DC] hover:text-[#1C1917]"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        {description && (
          <p
            className="mt-2 text-[13.5px] leading-relaxed text-[#6B6157]"
            style={{ fontFamily: BODY }}
          >
            {description}
          </p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  accent,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  accent: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <DialogShell title={title} description={description} onClose={onClose}>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-[#E6DFD3] bg-white px-5 py-2 text-[12.5px] font-medium tracking-wider text-[#1C1917] transition-colors hover:border-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-full px-5 py-2 text-[12.5px] font-medium tracking-wider text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: BODY, background: accent }}
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}

function TextDialog({
  title,
  description,
  placeholder,
  confirmLabel,
  accent,
  onConfirm,
  onClose,
  required,
}: {
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  accent: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
  required?: boolean;
}) {
  const [value, setValue] = useState("");
  const canSubmit = !required || value.trim().length > 0;
  return (
    <DialogShell title={title} description={description} onClose={onClose}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-h-[140px] w-full resize-none rounded-lg border border-[#E6DFD3] bg-white px-4 py-3 text-[13.5px] leading-relaxed text-[#1C1917] transition-colors focus:border-[#B8755D] focus:outline-none focus:ring-2 focus:ring-[#B8755D]/20"
        style={{ fontFamily: BODY }}
      />
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-[#E6DFD3] bg-white px-5 py-2 text-[12.5px] font-medium tracking-wider text-[#1C1917] transition-colors hover:border-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          Cancel
        </button>
        <button
          onClick={() => canSubmit && onConfirm(value.trim())}
          disabled={!canSubmit}
          className="rounded-full px-5 py-2 text-[12.5px] font-medium tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontFamily: BODY, background: accent }}
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}

function RejectDialog({
  onReject,
  onClose,
}: {
  onReject: (category: RejectionReasonCategory, text: string) => void;
  onClose: () => void;
}) {
  const [category, setCategory] =
    useState<RejectionReasonCategory>("insufficient_portfolio");
  const [text, setText] = useState("");
  const canSubmit = text.trim().length > 0;
  return (
    <DialogShell
      title="Reject application"
      description="Choose a category and share context. The applicant will see this on their status page and in their email, so keep it professional and specific."
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {(Object.keys(REJECTION_LABELS) as RejectionReasonCategory[]).map(
            (k) => {
              const active = category === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCategory(k)}
                  className={`rounded-full border px-4 py-1.5 text-[11.5px] transition-colors ${
                    active
                      ? "border-[#8B2A22] bg-[#8B2A22] text-white"
                      : "border-[#E6DFD3] bg-white text-[#1C1917] hover:border-[#B8755D]"
                  }`}
                  style={{ fontFamily: BODY }}
                >
                  {REJECTION_LABELS[k]}
                </button>
              );
            },
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Specific, constructive feedback. What would make them a yes in 90 days?"
          className="min-h-[140px] w-full resize-none rounded-lg border border-[#E6DFD3] bg-white px-4 py-3 text-[13.5px] leading-relaxed text-[#1C1917] transition-colors focus:border-[#B8755D] focus:outline-none focus:ring-2 focus:ring-[#B8755D]/20"
          style={{ fontFamily: BODY }}
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full border border-[#E6DFD3] bg-white px-5 py-2 text-[12.5px] font-medium tracking-wider text-[#1C1917] transition-colors hover:border-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          Cancel
        </button>
        <button
          onClick={() => canSubmit && onReject(category, text.trim())}
          disabled={!canSubmit}
          className="rounded-full bg-[#8B2A22] px-5 py-2 text-[12.5px] font-medium tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontFamily: BODY }}
        >
          Reject with reason
        </button>
      </div>
    </DialogShell>
  );
}
