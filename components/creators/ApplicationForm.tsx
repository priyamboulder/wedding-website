"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { useAuthStore, useCurrentUser } from "@/stores/auth-store";
import { useCreatorApplicationsStore } from "@/stores/creator-applications-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import {
  EXPERTISE_LABELS,
  FOLLOWING_LABELS,
  YEARS_LABELS,
  type ExpertiseArea,
  type FollowingRange,
  type YearsExperience,
} from "@/types/creator-application";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const EXPERTISE_OPTIONS = Object.keys(EXPERTISE_LABELS) as ExpertiseArea[];
const YEARS_OPTIONS = Object.keys(YEARS_LABELS) as YearsExperience[];
const FOLLOWING_OPTIONS = Object.keys(FOLLOWING_LABELS) as FollowingRange[];

type Step = 1 | 2 | 3 | 4 | "done";

const MAX_BIO = 280;
const MAX_CONTENT_PLAN = 500;

type FormState = {
  fullName: string;
  email: string;
  locationCity: string;
  locationCountry: string;
  avatarUrl: string;
  bio: string;
  primaryExpertise: ExpertiseArea;
  secondaryExpertise: ExpertiseArea[];
  yearsExperience: YearsExperience;
  isIndustryProfessional: boolean;
  professionalRole: string;
  instagramHandle: string;
  youtubeChannel: string;
  tiktokHandle: string;
  blogUrl: string;
  otherSocialLinks: string;
  combinedFollowingRange: FollowingRange;
  portfolioUrls: string[];
  contentPlan: string;
  agreedToTerms: boolean;
  agreedToReview: boolean;
};

const emptyForm = (prefill: Partial<FormState>): FormState => ({
  fullName: prefill.fullName ?? "",
  email: prefill.email ?? "",
  locationCity: "",
  locationCountry: "",
  avatarUrl: "",
  bio: "",
  primaryExpertise: "bridal_styling",
  secondaryExpertise: [],
  yearsExperience: "1_to_3",
  isIndustryProfessional: false,
  professionalRole: "",
  instagramHandle: "",
  youtubeChannel: "",
  tiktokHandle: "",
  blogUrl: "",
  otherSocialLinks: "",
  combinedFollowingRange: "under_1k",
  portfolioUrls: [],
  contentPlan: "",
  agreedToTerms: false,
  agreedToReview: false,
});

export function ApplicationForm() {
  const router = useRouter();
  const user = useCurrentUser();
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const submit = useCreatorApplicationsStore((s) => s.submit);
  const existingForUser = useCreatorApplicationsStore((s) =>
    user ? s.getByUserId(user.id) : undefined,
  );
  const existingForEmail = useCreatorApplicationsStore((s) =>
    user ? s.getByEmail(user.email) : undefined,
  );
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(() =>
    emptyForm({
      fullName: user?.name,
      email: user?.email,
    }),
  );
  const [portfolioDraft, setPortfolioDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const existing = existingForUser ?? existingForEmail;
  const alreadyApplied =
    existing && existing.status !== "rejected";

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const goNext = () => {
    setError(null);
    if (step === 1) {
      if (!form.fullName.trim()) return setError("Please enter your full name.");
      if (!form.email.trim()) return setError("Please enter your email.");
      if (!form.locationCity.trim() || !form.locationCountry.trim())
        return setError("Please enter your city and country.");
      if (!form.bio.trim()) return setError("A short bio is required.");
      if (form.bio.length > MAX_BIO)
        return setError(`Bio must be ${MAX_BIO} characters or fewer.`);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (form.isIndustryProfessional && !form.professionalRole.trim())
        return setError("Please describe your professional role.");
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!form.contentPlan.trim())
        return setError("Tell us what you plan to create.");
      if (form.contentPlan.length > MAX_CONTENT_PLAN)
        return setError(
          `Content plan must be ${MAX_CONTENT_PLAN} characters or fewer.`,
        );
      setStep(4);
      return;
    }
  };

  const goBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      openSignIn("generic");
      return;
    }
    if (!form.agreedToTerms)
      return setError("Please agree to the Creator Program Terms & Conditions.");
    if (!form.agreedToReview)
      return setError("Please confirm you understand the review process.");

    const application = submit({
      userId: user.id,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      locationCity: form.locationCity.trim(),
      locationCountry: form.locationCountry.trim(),
      avatarUrl: form.avatarUrl.trim() || null,
      bio: form.bio.trim(),
      primaryExpertise: form.primaryExpertise,
      secondaryExpertise: form.secondaryExpertise,
      yearsExperience: form.yearsExperience,
      isIndustryProfessional: form.isIndustryProfessional,
      professionalRole: form.isIndustryProfessional
        ? form.professionalRole.trim() || null
        : null,
      instagramHandle: form.instagramHandle.trim() || null,
      youtubeChannel: form.youtubeChannel.trim() || null,
      tiktokHandle: form.tiktokHandle.trim() || null,
      blogUrl: form.blogUrl.trim() || null,
      otherSocialLinks: form.otherSocialLinks.trim() || null,
      combinedFollowingRange: form.combinedFollowingRange,
      portfolioUrls: form.portfolioUrls,
      contentPlan: form.contentPlan.trim(),
      agreedToTerms: form.agreedToTerms,
    });

    addNotification({
      type: "application_received",
      title: "We received your application",
      body: "We'll review it within 5 business days and email you when a decision is made.",
      link: "/creators/application-status",
      actor_name: "Ananya Team",
      recipient: "couple",
    });
    addNotification({
      type: "application_new_admin",
      title: `New creator application from ${application.fullName}`,
      body: `${EXPERTISE_LABELS[application.primaryExpertise]} · ${FOLLOWING_LABELS[application.combinedFollowingRange]} following`,
      link: `/admin/creator-applications/${application.id}`,
      actor_name: application.fullName,
      recipient: "admin",
    });

    setStep("done");
  };

  const addPortfolioLink = () => {
    const trimmed = portfolioDraft.trim();
    if (!trimmed) return;
    if (form.portfolioUrls.length >= 5) return;
    update("portfolioUrls", [...form.portfolioUrls, trimmed]);
    setPortfolioDraft("");
  };

  const removePortfolioLink = (url: string) =>
    update(
      "portfolioUrls",
      form.portfolioUrls.filter((u) => u !== url),
    );

  // ── Guard states ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="mx-auto max-w-[620px] rounded-2xl border border-[#E6DFD3] bg-white p-10 text-center">
        <h3
          className="text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          Sign in to apply
        </h3>
        <p
          className="mt-3 text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6 }}
        >
          Creator applications are tied to your account so we can notify you
          when we've reviewed your work.
        </p>
        <button
          onClick={() => openSignIn("generic")}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          Sign in or create an account
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="mx-auto max-w-[620px] rounded-2xl border border-[#E6DFD3] bg-white p-10 text-center">
        <h3
          className="text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 28,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          You've already applied
        </h3>
        <p
          className="mt-3 text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6 }}
        >
          We have your application on file. Head to your status page to see
          where it is in the review process.
        </p>
        <Link
          href="/creators/application-status"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          View application status
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-[620px] rounded-2xl border border-[#E6DFD3] bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B8755D]/10 text-[#B8755D]">
          <Check size={26} strokeWidth={1.8} />
        </div>
        <h3
          className="mt-5 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 32,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
          }}
        >
          Thank you — we've got it.
        </h3>
        <p
          className="mt-4 text-[#6B6157]"
          style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}
        >
          We'll review your application within 5 business days. You'll
          receive an email as soon as a decision is made. In the meantime,
          you can check the status page any time.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/creators/application-status"
            className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
            style={{ fontFamily: BODY }}
          >
            View my application
            <ChevronRight size={14} strokeWidth={2} />
          </Link>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white px-6 py-3 text-[13px] font-medium tracking-wider text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
            style={{ fontFamily: BODY }}
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[720px] rounded-2xl border border-[#E6DFD3] bg-white p-8 md:p-10"
    >
      <StepHeader step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 space-y-6"
        >
          {step === 1 && (
            <StepOne form={form} update={update} />
          )}
          {step === 2 && (
            <StepTwo form={form} update={update} />
          )}
          {step === 3 && (
            <StepThree
              form={form}
              update={update}
              portfolioDraft={portfolioDraft}
              setPortfolioDraft={setPortfolioDraft}
              addPortfolioLink={addPortfolioLink}
              removePortfolioLink={removePortfolioLink}
            />
          )}
          {step === 4 && <StepFour form={form} update={update} />}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div
          className="mt-6 rounded-lg border border-[#C4564C]/30 bg-[#C4564C]/10 px-4 py-3 text-[13px] text-[#8B2A22]"
          style={{ fontFamily: BODY }}
        >
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#E6DFD3] pt-6">
        {step !== 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white px-5 py-2.5 text-[12.5px] font-medium tracking-wider text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
            style={{ fontFamily: BODY }}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Back
          </button>
        ) : (
          <span />
        )}
        {step !== 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-2.5 text-[12.5px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
            style={{ fontFamily: BODY }}
          >
            Continue
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        ) : (
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-[#B8755D] px-6 py-2.5 text-[12.5px] font-medium tracking-wider text-white transition-colors hover:bg-[#1C1917]"
            style={{ fontFamily: BODY }}
          >
            Submit application
            <Check size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </form>
  );
}

// ── Step header ─────────────────────────────────────────────────────────

function StepHeader({ step }: { step: Exclude<Step, "done"> }) {
  const steps = [
    { n: 1, label: "About you" },
    { n: 2, label: "Your expertise" },
    { n: 3, label: "Audience" },
    { n: 4, label: "Review" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const isActive = s.n === step;
        const isDone = s.n < step;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#1C1917] text-white"
                    : isDone
                      ? "bg-[#B8755D] text-white"
                      : "bg-[#F0E9DC] text-[#8B7E6F]"
                }`}
                style={{ fontFamily: BODY }}
              >
                {isDone ? <Check size={12} strokeWidth={2.4} /> : s.n}
              </div>
              <span
                className={`truncate text-[11px] uppercase tracking-[0.14em] ${
                  isActive ? "text-[#1C1917]" : "text-[#8B7E6F]"
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

// ── Step 1 ──────────────────────────────────────────────────────────────

function StepOne({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name">
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className={inputCls}
            placeholder="Priya Patel"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputCls}
            placeholder="you@studio.com"
          />
        </Field>
        <Field label="City">
          <input
            type="text"
            value={form.locationCity}
            onChange={(e) => update("locationCity", e.target.value)}
            className={inputCls}
            placeholder="Mumbai"
          />
        </Field>
        <Field label="Country">
          <input
            type="text"
            value={form.locationCountry}
            onChange={(e) => update("locationCountry", e.target.value)}
            className={inputCls}
            placeholder="India"
          />
        </Field>
      </div>
      <Field label="Profile photo (link)" hint="Paste a public image URL. Optional, but brings your profile to life.">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0E9DC] text-[#8B7E6F]"
            style={{
              backgroundImage: form.avatarUrl ? `url(${form.avatarUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!form.avatarUrl && <Upload size={18} strokeWidth={1.6} />}
          </div>
          <input
            type="url"
            value={form.avatarUrl}
            onChange={(e) => update("avatarUrl", e.target.value)}
            className={inputCls}
            placeholder="https://..."
          />
        </div>
      </Field>
      <Field
        label="Short bio"
        hint={`${form.bio.length}/${MAX_BIO} characters — this becomes your creator bio if approved.`}
      >
        <textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value.slice(0, MAX_BIO))}
          className={`${inputCls} min-h-[110px] resize-none leading-relaxed`}
          placeholder="Bridal stylist and fashion editor. Featured in…"
        />
      </Field>
    </>
  );
}

// ── Step 2 ──────────────────────────────────────────────────────────────

function StepTwo({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  const toggleSecondary = (area: ExpertiseArea) => {
    if (area === form.primaryExpertise) return;
    update(
      "secondaryExpertise",
      form.secondaryExpertise.includes(area)
        ? form.secondaryExpertise.filter((a) => a !== area)
        : [...form.secondaryExpertise, area],
    );
  };

  return (
    <>
      <Field label="Primary expertise">
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.map((area) => {
            const active = form.primaryExpertise === area;
            return (
              <button
                type="button"
                key={area}
                onClick={() => {
                  update("primaryExpertise", area);
                  update(
                    "secondaryExpertise",
                    form.secondaryExpertise.filter((a) => a !== area),
                  );
                }}
                className={`rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                  active
                    ? "border-[#1C1917] bg-[#1C1917] text-white"
                    : "border-[#E6DFD3] bg-white text-[#1C1917] hover:border-[#B8755D] hover:text-[#B8755D]"
                }`}
                style={{ fontFamily: BODY }}
              >
                {EXPERTISE_LABELS[area]}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Secondary areas" hint="Optional — anywhere else you have real depth.">
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.filter(
            (a) => a !== form.primaryExpertise,
          ).map((area) => {
            const active = form.secondaryExpertise.includes(area);
            return (
              <button
                type="button"
                key={area}
                onClick={() => toggleSecondary(area)}
                className={`rounded-full border px-4 py-1.5 text-[12px] transition-colors ${
                  active
                    ? "border-[#B8755D] bg-[#B8755D]/10 text-[#B8755D]"
                    : "border-[#E6DFD3] bg-white text-[#8B7E6F] hover:border-[#B8755D] hover:text-[#B8755D]"
                }`}
                style={{ fontFamily: BODY }}
              >
                {EXPERTISE_LABELS[area]}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Years in the wedding industry">
        <select
          value={form.yearsExperience}
          onChange={(e) =>
            update("yearsExperience", e.target.value as YearsExperience)
          }
          className={inputCls}
        >
          {YEARS_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {YEARS_LABELS[y]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Do you currently work professionally in the wedding industry?">
        <div className="flex gap-2">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((opt) => (
            <button
              type="button"
              key={opt.label}
              onClick={() => update("isIndustryProfessional", opt.value)}
              className={`rounded-full border px-5 py-1.5 text-[12px] transition-colors ${
                form.isIndustryProfessional === opt.value
                  ? "border-[#1C1917] bg-[#1C1917] text-white"
                  : "border-[#E6DFD3] bg-white text-[#1C1917] hover:border-[#B8755D]"
              }`}
              style={{ fontFamily: BODY }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>
      {form.isIndustryProfessional && (
        <Field label="What's your role?">
          <input
            type="text"
            value={form.professionalRole}
            onChange={(e) => update("professionalRole", e.target.value)}
            className={inputCls}
            placeholder="Senior editor at Vogue Weddings, freelance planner, etc."
          />
        </Field>
      )}
    </>
  );
}

// ── Step 3 ──────────────────────────────────────────────────────────────

function StepThree({
  form,
  update,
  portfolioDraft,
  setPortfolioDraft,
  addPortfolioLink,
  removePortfolioLink,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  portfolioDraft: string;
  setPortfolioDraft: (s: string) => void;
  addPortfolioLink: () => void;
  removePortfolioLink: (url: string) => void;
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Instagram" hint="Optional, but strongly encouraged.">
          <input
            type="text"
            value={form.instagramHandle}
            onChange={(e) => update("instagramHandle", e.target.value)}
            className={inputCls}
            placeholder="@yourhandle"
          />
        </Field>
        <Field label="YouTube">
          <input
            type="text"
            value={form.youtubeChannel}
            onChange={(e) => update("youtubeChannel", e.target.value)}
            className={inputCls}
            placeholder="Channel name or URL"
          />
        </Field>
        <Field label="TikTok">
          <input
            type="text"
            value={form.tiktokHandle}
            onChange={(e) => update("tiktokHandle", e.target.value)}
            className={inputCls}
            placeholder="@yourhandle"
          />
        </Field>
        <Field label="Blog / website">
          <input
            type="url"
            value={form.blogUrl}
            onChange={(e) => update("blogUrl", e.target.value)}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>
      </div>
      <Field label="Other social links" hint="Pinterest, Substack, press — anything you want us to see.">
        <input
          type="text"
          value={form.otherSocialLinks}
          onChange={(e) => update("otherSocialLinks", e.target.value)}
          className={inputCls}
          placeholder="Pinterest: @you, Substack: yourletter.substack.com"
        />
      </Field>
      <Field label="Total combined following">
        <select
          value={form.combinedFollowingRange}
          onChange={(e) =>
            update("combinedFollowingRange", e.target.value as FollowingRange)
          }
          className={inputCls}
        >
          {FOLLOWING_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {FOLLOWING_LABELS[f]}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Portfolio"
        hint={`Up to 5 links to images, mood boards, or past work. ${form.portfolioUrls.length}/5 added.`}
      >
        <div className="flex gap-2">
          <input
            type="url"
            value={portfolioDraft}
            onChange={(e) => setPortfolioDraft(e.target.value)}
            className={inputCls}
            placeholder="https://..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPortfolioLink();
              }
            }}
          />
          <button
            type="button"
            onClick={addPortfolioLink}
            disabled={form.portfolioUrls.length >= 5}
            className="shrink-0 rounded-full bg-[#1C1917] px-5 py-2 text-[12px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ fontFamily: BODY }}
          >
            Add
          </button>
        </div>
        {form.portfolioUrls.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {form.portfolioUrls.map((url) => (
              <li
                key={url}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#E6DFD3] bg-[#F7F5F0] px-3 py-2 text-[12.5px]"
                style={{ fontFamily: BODY }}
              >
                <span className="truncate text-[#1C1917]">{url}</span>
                <button
                  type="button"
                  onClick={() => removePortfolioLink(url)}
                  className="shrink-0 text-[#8B7E6F] transition-colors hover:text-[#C4564C]"
                  aria-label="Remove"
                >
                  <X size={14} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>
      <Field
        label="What do you plan to create?"
        hint={`${form.contentPlan.length}/${MAX_CONTENT_PLAN} characters.`}
      >
        <textarea
          value={form.contentPlan}
          onChange={(e) =>
            update("contentPlan", e.target.value.slice(0, MAX_CONTENT_PLAN))
          }
          className={`${inputCls} min-h-[120px] resize-none leading-relaxed`}
          placeholder="Monthly lehenga edits, heirloom jewelry stories, couture-forward bridal guides…"
        />
      </Field>
    </>
  );
}

// ── Step 4 ──────────────────────────────────────────────────────────────

function StepFour({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  const summary = useMemo(
    () => [
      { label: "Name", value: form.fullName },
      { label: "Email", value: form.email },
      {
        label: "Location",
        value: [form.locationCity, form.locationCountry]
          .filter(Boolean)
          .join(", "),
      },
      {
        label: "Primary expertise",
        value: EXPERTISE_LABELS[form.primaryExpertise],
      },
      {
        label: "Secondary",
        value:
          form.secondaryExpertise.length > 0
            ? form.secondaryExpertise.map((a) => EXPERTISE_LABELS[a]).join(", ")
            : "—",
      },
      { label: "Experience", value: YEARS_LABELS[form.yearsExperience] },
      {
        label: "Professional?",
        value: form.isIndustryProfessional
          ? form.professionalRole || "Yes"
          : "No",
      },
      {
        label: "Instagram",
        value: form.instagramHandle || "—",
      },
      {
        label: "Following",
        value: FOLLOWING_LABELS[form.combinedFollowingRange],
      },
      {
        label: "Portfolio links",
        value:
          form.portfolioUrls.length > 0
            ? `${form.portfolioUrls.length} attached`
            : "—",
      },
    ],
    [form],
  );

  return (
    <>
      <div className="rounded-xl border border-[#E6DFD3] bg-[#F7F5F0] p-5">
        <h4
          className="text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: 20,
            letterSpacing: "-0.01em",
          }}
        >
          Review your application
        </h4>
        <dl className="mt-4 divide-y divide-[#E6DFD3]">
          {summary.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-[13px]"
              style={{ fontFamily: BODY }}
            >
              <dt className="text-[11px] uppercase tracking-[0.12em] text-[#8B7E6F]">
                {row.label}
              </dt>
              <dd className="text-[#1C1917]">{row.value || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-lg border border-[#E6DFD3] bg-white p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#8B7E6F]" style={{ fontFamily: BODY }}>
            Bio
          </div>
          <p
            className="mt-2 text-[13px] leading-relaxed text-[#1C1917]"
            style={{ fontFamily: BODY }}
          >
            {form.bio || "—"}
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-[#E6DFD3] bg-white p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#8B7E6F]" style={{ fontFamily: BODY }}>
            Content plan
          </div>
          <p
            className="mt-2 text-[13px] leading-relaxed text-[#1C1917]"
            style={{ fontFamily: BODY }}
          >
            {form.contentPlan || "—"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E6DFD3] bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={form.agreedToTerms}
            onChange={(e) => update("agreedToTerms", e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#B8755D]"
          />
          <span
            className="text-[13px] leading-relaxed text-[#1C1917]"
            style={{ fontFamily: BODY }}
          >
            I agree to the{" "}
            <Link
              href="/creators/apply/terms"
              className="underline decoration-[#B8755D] underline-offset-4 hover:text-[#B8755D]"
            >
              Creator Program Terms & Conditions
            </Link>
            .
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E6DFD3] bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={form.agreedToReview}
            onChange={(e) => update("agreedToReview", e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#B8755D]"
          />
          <span
            className="text-[13px] leading-relaxed text-[#1C1917]"
            style={{ fontFamily: BODY }}
          >
            I understand that my application will be reviewed and I'll be
            notified of the decision via email.
          </span>
        </label>
      </div>
    </>
  );
}

// ── Reusable field wrapper ──────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-[11px] uppercase tracking-[0.14em] text-[#8B7E6F]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span
          className="text-[11.5px] text-[#8B7E6F]"
          style={{ fontFamily: BODY }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#E6DFD3] bg-white px-4 py-2.5 text-[13.5px] text-[#1C1917] transition-colors placeholder:text-[#B5AA9A] focus:border-[#B8755D] focus:outline-none focus:ring-2 focus:ring-[#B8755D]/20";
