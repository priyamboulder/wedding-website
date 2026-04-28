"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  FileText,
  Mail,
} from "lucide-react";
import { SiteLayout } from "@/components/marketing/SiteLayout";
import { useAuthStore, useCurrentUser } from "@/stores/auth-store";
import {
  canReapply,
  daysUntilReapply,
  useCreatorApplicationsStore,
} from "@/stores/creator-applications-store";
import {
  EXPERTISE_LABELS,
  FOLLOWING_LABELS,
  REJECTION_LABELS,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/types/creator-application";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const STATUS_THEME: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: "#FBF4E5",
    text: "#8B6B1F",
    border: "#E9D7A6",
  },
  under_review: {
    bg: "#FBF4E5",
    text: "#8B6B1F",
    border: "#E9D7A6",
  },
  approved: {
    bg: "#E7F3EC",
    text: "#3B6E4A",
    border: "#B8D9C1",
  },
  rejected: {
    bg: "#F9E9E6",
    text: "#8B2A22",
    border: "#E6BDB4",
  },
  waitlisted: {
    bg: "#EDEEF5",
    text: "#3F4A78",
    border: "#C4C9E0",
  },
  more_info_requested: {
    bg: "#F4EDE4",
    text: "#7C5C2E",
    border: "#DFCEB1",
  },
};

export default function ApplicationStatusPage() {
  const user = useCurrentUser();
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const application = useCreatorApplicationsStore((s) => {
    if (!user) return undefined;
    return s.getByUserId(user.id) ?? s.getByEmail(user.email);
  });
  const respondToInfoRequest = useCreatorApplicationsStore(
    (s) => s.respondToInfoRequest,
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[900px] px-6 py-20 md:px-12">
        <div
          className="text-[11px] uppercase tracking-[0.22em] text-[#B8755D]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Creator Program
        </div>
        <h1
          className="mt-4 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(38px, 5vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          Your application
        </h1>

        {!user ? (
          <EmptyCard
            title="Sign in to see your status"
            body="Your application is tied to your account. Sign in with the email you used to apply."
            cta={
              <button
                onClick={() => openSignIn("generic")}
                className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
                style={{ fontFamily: BODY }}
              >
                Sign in
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            }
          />
        ) : !application ? (
          <EmptyCard
            title="No application yet"
            body="You haven't applied to the creator program. Tell us about your work and we'll take a look."
            cta={
              <Link
                href="/creators/apply"
                className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
                style={{ fontFamily: BODY }}
              >
                Apply now
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            }
          />
        ) : (
          <StatusBody
            applicationId={application.id}
            onSubmitInfoResponse={(response) =>
              respondToInfoRequest(application.id, response)
            }
          />
        )}
      </div>
    </SiteLayout>
  );
}

// ── Body ───────────────────────────────────────────────────────────────

function StatusBody({
  applicationId,
  onSubmitInfoResponse,
}: {
  applicationId: string;
  onSubmitInfoResponse: (response: string) => void;
}) {
  const application = useCreatorApplicationsStore((s) =>
    s.getById(applicationId),
  );
  const [infoResponse, setInfoResponse] = useState("");
  const reapplyReady = useMemo(() => canReapply(application), [application]);
  const reapplyDays = useMemo(
    () => daysUntilReapply(application),
    [application],
  );

  if (!application) return null;
  const theme = STATUS_THEME[application.status];

  return (
    <div className="mt-12 space-y-6">
      <ProgressIndicator status={application.status} />

      <div
        className="rounded-2xl border p-7 md:p-9"
        style={{
          background: theme.bg,
          borderColor: theme.border,
        }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.18em]"
          style={{ fontFamily: BODY, fontWeight: 500, color: theme.text }}
        >
          {STATUS_LABELS[application.status]}
        </div>
        <StatusCopy status={application.status} application={application} reapplyReady={reapplyReady} reapplyDays={reapplyDays} />

        {application.status === "rejected" && application.rejectionReasonText && (
          <div
            className="mt-6 rounded-xl border bg-white/80 p-5"
            style={{ borderColor: theme.border }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Reason
            </div>
            {application.rejectionReasonCategory && (
              <div
                className="mt-1 text-[13px] font-medium text-[#1C1917]"
                style={{ fontFamily: BODY }}
              >
                {REJECTION_LABELS[application.rejectionReasonCategory]}
              </div>
            )}
            <p
              className="mt-2 text-[13.5px] leading-relaxed text-[#1C1917]"
              style={{ fontFamily: BODY }}
            >
              {application.rejectionReasonText}
            </p>
          </div>
        )}

        {application.status === "waitlisted" && application.waitlistNote && (
          <div
            className="mt-6 rounded-xl border bg-white/80 p-5"
            style={{ borderColor: theme.border }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
              style={{ fontFamily: BODY, fontWeight: 500 }}
            >
              Note from our team
            </div>
            <p
              className="mt-2 text-[13.5px] leading-relaxed text-[#1C1917]"
              style={{ fontFamily: BODY }}
            >
              {application.waitlistNote}
            </p>
          </div>
        )}

        {application.status === "more_info_requested" &&
          application.moreInfoRequest && (
            <div
              className="mt-6 rounded-xl border bg-white/80 p-5"
              style={{ borderColor: theme.border }}
            >
              <div
                className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                What we'd like to know
              </div>
              <p
                className="mt-2 text-[13.5px] leading-relaxed text-[#1C1917]"
                style={{ fontFamily: BODY }}
              >
                {application.moreInfoRequest}
              </p>
              {!application.moreInfoResponse ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={infoResponse}
                    onChange={(e) => setInfoResponse(e.target.value)}
                    placeholder="Your response…"
                    className="min-h-[120px] w-full resize-none rounded-lg border border-[#E6DFD3] bg-white px-4 py-3 text-[13.5px] leading-relaxed text-[#1C1917] transition-colors focus:border-[#B8755D] focus:outline-none focus:ring-2 focus:ring-[#B8755D]/20"
                    style={{ fontFamily: BODY }}
                  />
                  <button
                    onClick={() => {
                      if (!infoResponse.trim()) return;
                      onSubmitInfoResponse(infoResponse.trim());
                      setInfoResponse("");
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-2.5 text-[12.5px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
                    style={{ fontFamily: BODY }}
                  >
                    Send response
                    <ArrowRight size={13} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-[#B8D9C1] bg-[#E7F3EC] p-4 text-[13px] text-[#3B6E4A]"
                  style={{ fontFamily: BODY }}
                >
                  Your response was sent. We'll get back to you soon.
                </div>
              )}
            </div>
          )}
      </div>

      <SubmittedDetails applicationId={applicationId} />
    </div>
  );
}

function StatusCopy({
  status,
  application,
  reapplyReady,
  reapplyDays,
}: {
  status: ApplicationStatus;
  application: ReturnType<
    typeof useCreatorApplicationsStore.getState
  >["applications"][number];
  reapplyReady: boolean;
  reapplyDays: number;
}) {
  if (status === "pending" || status === "under_review") {
    return (
      <>
        <p
          className="mt-3 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Your application is under review.
        </p>
        <p
          className="mt-3 max-w-[540px] text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
        >
          We typically respond within 5 business days. You'll get an email as
          soon as a decision is made.
        </p>
      </>
    );
  }
  if (status === "approved") {
    return (
      <>
        <p
          className="mt-3 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Congratulations — you're approved.
        </p>
        <p
          className="mt-3 max-w-[540px] text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
        >
          Complete your creator profile to unlock collections, guides, drops,
          and consultations.
        </p>
        <Link
          href={
            application.linkedCreatorId
              ? `/dashboard?creatorId=${application.linkedCreatorId}`
              : "/dashboard"
          }
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          Set up my creator profile
          <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </>
    );
  }
  if (status === "rejected") {
    return (
      <>
        <p
          className="mt-3 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          Thank you for applying.
        </p>
        <p
          className="mt-3 max-w-[540px] text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
        >
          Your application wasn't approved this time. Most of our rejections
          are a timing issue — please do reapply once you've built out more of
          the work we'd be featuring.
        </p>
        <div
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] text-[#1C1917]"
          style={{ fontFamily: BODY }}
        >
          <Clock size={13} strokeWidth={1.8} />
          {reapplyReady
            ? "You're eligible to reapply today."
            : `Reapply eligible in ${reapplyDays} day${reapplyDays === 1 ? "" : "s"}.`}
        </div>
        {reapplyReady && (
          <div className="mt-5">
            <Link
              href="/creators/apply"
              className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
              style={{ fontFamily: BODY }}
            >
              Reapply
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        )}
      </>
    );
  }
  if (status === "waitlisted") {
    return (
      <>
        <p
          className="mt-3 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          You've been added to our waitlist.
        </p>
        <p
          className="mt-3 max-w-[540px] text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
        >
          We loved your application but don't have a spot in the current
          cohort. We'll notify you when one opens up.
        </p>
      </>
    );
  }
  // more_info_requested
  return (
    <>
      <p
        className="mt-3 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: 28,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        We'd love to learn more before deciding.
      </p>
      <p
        className="mt-3 max-w-[540px] text-[#6B6157]"
        style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
      >
        A quick follow-up from our team is below. Once you respond, we'll pick
        the review back up.
      </p>
    </>
  );
}

// ── Progress indicator ─────────────────────────────────────────────────

function ProgressIndicator({ status }: { status: ApplicationStatus }) {
  const steps: { key: "submitted" | "review" | "decision"; label: string }[] = [
    { key: "submitted", label: "Submitted" },
    { key: "review", label: "Under Review" },
    { key: "decision", label: "Decision" },
  ];
  const reached = (key: "submitted" | "review" | "decision") => {
    if (key === "submitted") return true;
    if (key === "review")
      return (
        status !== "pending" ||
        status === "pending" // always reached once submitted
      );
    // decision
    return (
      status === "approved" ||
      status === "rejected" ||
      status === "waitlisted"
    );
  };
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = reached(s.key);
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-[#1C1917] text-white"
                    : "bg-[#F0E9DC] text-[#8B7E6F]"
                }`}
                style={{ fontFamily: BODY }}
              >
                {i + 1}
              </div>
              <span
                className={`truncate text-[11px] uppercase tracking-[0.14em] ${
                  active ? "text-[#1C1917]" : "text-[#8B7E6F]"
                }`}
                style={{ fontFamily: BODY, fontWeight: 500 }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-px flex-1 bg-[#E6DFD3]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Submitted details ──────────────────────────────────────────────────

function SubmittedDetails({ applicationId }: { applicationId: string }) {
  const application = useCreatorApplicationsStore((s) =>
    s.getById(applicationId),
  );
  if (!application) return null;

  return (
    <div className="rounded-2xl border border-[#E6DFD3] bg-white p-7 md:p-9">
      <div className="flex items-center gap-3">
        <FileText size={16} strokeWidth={1.8} className="text-[#B8755D]" />
        <span
          className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          What you submitted
        </span>
      </div>
      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        <Detail label="Name" value={application.fullName} />
        <Detail label="Email" value={application.email} />
        <Detail
          label="Location"
          value={`${application.locationCity}, ${application.locationCountry}`}
        />
        <Detail
          label="Primary expertise"
          value={EXPERTISE_LABELS[application.primaryExpertise]}
        />
        <Detail
          label="Following"
          value={FOLLOWING_LABELS[application.combinedFollowingRange]}
        />
        <Detail
          label="Submitted"
          value={new Date(application.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </dl>
      <div className="mt-6 rounded-lg border border-[#E6DFD3] bg-[#F7F5F0] p-4">
        <div
          className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Bio
        </div>
        <p
          className="mt-2 text-[13.5px] leading-relaxed text-[#1C1917]"
          style={{ fontFamily: BODY }}
        >
          {application.bio}
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
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

// ── Empty card ─────────────────────────────────────────────────────────

function EmptyCard({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12 rounded-2xl border border-[#E6DFD3] bg-white p-10 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E9DC] text-[#B8755D]">
        <Mail size={20} strokeWidth={1.6} />
      </div>
      <h3
        className="mt-5 text-[#1C1917]"
        style={{
          fontFamily: DISPLAY,
          fontSize: 30,
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <p
        className="mx-auto mt-3 max-w-[440px] text-[#6B6157]"
        style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
      >
        {body}
      </p>
      <div className="mt-6 flex justify-center">{cta}</div>
    </motion.div>
  );
}
