"use client";

// ── Sign-in / Create-account modal ─────────────────────────────
// One clean modal, two tabs. Parchment card, serif headline,
// terracotta primary button, minimal form chrome. Opens from any
// gated CTA on the marketing site; closing never blocks the user
// from continuing to browse.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore, type AccountRole, type AuthPromptReason } from "@/stores/auth-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const REASON_COPY: Record<AuthPromptReason, { eyebrow: string; headline: string; sub: string }> = {
  "save-selection": {
    eyebrow: "Save your selections",
    headline: "Welcome to Ananya",
    sub: "Create a free account to save your selections and start planning — no credit card, no pressure.",
  },
  "send-inquiry": {
    eyebrow: "Send your inquiry",
    headline: "Welcome to Ananya",
    sub: "A free account keeps your inquiries and vendor replies in one place.",
  },
  "planning-tool": {
    eyebrow: "The planning platform",
    headline: "Welcome to Ananya",
    sub: "Sign in to unlock Guest Management, Timeline, Budget, and the rest of the planner.",
  },
  "write-review": {
    eyebrow: "Share your experience",
    headline: "Welcome to Ananya",
    sub: "A free account lets vendors and other couples trust the reviews you write.",
  },
  generic: {
    eyebrow: "Sign in · Create account",
    headline: "Welcome to Ananya",
    sub: "Save selections, message vendors, and open the planning platform — all in one account.",
  },
};

export function SignInModal() {
  const isOpen = useAuthStore((s) => s.isModalOpen);
  const tab = useAuthStore((s) => s.modalTab);
  const setTab = useAuthStore((s) => s.setModalTab);
  const closeModal = useAuthStore((s) => s.closeModal);
  const promptReason = useAuthStore((s) => s.promptReason);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signInWithSocial = useAuthStore((s) => s.signInWithSocial);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  const copy = REASON_COPY[promptReason] ?? REASON_COPY.generic;

  useEffect(() => {
    if (!isOpen) {
      setVerificationEmail(null);
      setSocialError(null);
      setSocialLoading(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeModal]);

  // Reset social error when tab changes
  useEffect(() => { setSocialError(null); }, [tab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="signin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(28, 25, 23, 0.45)", backdropFilter: "blur(6px)" }}
          onClick={closeModal}
        >
          <motion.div
            key="signin-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[480px] bg-[#F7F5F0] px-8 py-10 md:px-12 md:py-14"
            style={{
              boxShadow: "0 40px 80px -20px rgba(28,25,23,0.28)",
              fontFamily: BODY,
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-headline"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center text-[#1C1917]/50 transition-colors hover:text-[#B8755D]"
            >
              <span aria-hidden className="relative block h-4 w-4">
                <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>

            {verificationEmail ? (
              <VerificationPrompt email={verificationEmail} onDismiss={() => { setVerificationEmail(null); closeModal(); }} />
            ) : (
              <>
                <div className="text-center">
                  <span className="text-[11px] uppercase text-[#A8998A]" style={{ letterSpacing: "0.3em" }}>
                    {copy.eyebrow}
                  </span>
                  <h2
                    id="signin-headline"
                    className="mt-5 text-[#1C1917]"
                    style={{ fontFamily: DISPLAY, fontSize: "clamp(28px, 4vw, 38px)", lineHeight: 1.1, letterSpacing: "-0.01em", fontWeight: 400 }}
                  >
                    {copy.headline}
                  </h2>
                  <p className="mx-auto mt-4 max-w-[360px] text-[#5E544B]" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
                    {copy.sub}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-1 border-b border-[#1C1917]/10" role="tablist" aria-label="Sign in or create account">
                  <TabButton label="Sign In" active={tab === "signin"} onClick={() => setTab("signin")} />
                  <TabButton label="Create Account" active={tab === "signup"} onClick={() => setTab("signup")} />
                </div>

                {tab === "signin" ? (
                  <SignInForm onSubmit={signIn} onForgotPassword={forgotPassword} />
                ) : (
                  <SignUpForm
                    onSubmit={async (input) => {
                      const res = await signUp(input);
                      if (res.ok && res.needsVerification) setVerificationEmail(input.email);
                      return res;
                    }}
                  />
                )}

                <div className="my-6 flex items-center gap-3 text-[11px] uppercase text-[#A8998A]" style={{ letterSpacing: "0.25em" }}>
                  <span className="h-px flex-1 bg-[#1C1917]/10" />or<span className="h-px flex-1 bg-[#1C1917]/10" />
                </div>

                <div className="flex flex-col gap-3">
                  <SocialButton provider="google" onClick={async () => {
                    setSocialError(null);
                    setSocialLoading("google");
                    const res = await signInWithSocial("google");
                    setSocialLoading(null);
                    if (!res.ok) setSocialError(res.error);
                  }} loading={socialLoading === "google"} />
                  <SocialButton provider="apple" onClick={async () => {
                    setSocialError(null);
                    setSocialLoading("apple");
                    const res = await signInWithSocial("apple");
                    setSocialLoading(null);
                    if (!res.ok) setSocialError(res.error);
                  }} loading={socialLoading === "apple"} />
                </div>

                {socialError && (
                  <p className="mt-3 text-center text-[12px] text-[#B8755D]">{socialError}</p>
                )}

                <p className="mt-8 text-center text-[11px] text-[#A8998A]" style={{ lineHeight: 1.6 }}>
                  By continuing you agree to our Terms &amp; Privacy.
                  <br />
                  Browsing stays free — you only need an account when you save, message, or plan.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="relative flex-1 px-4 pb-3 pt-2 text-[13px] transition-colors"
      style={{
        color: active ? "#1C1917" : "rgba(28,25,23,0.55)",
        fontWeight: active ? 500 : 400,
        letterSpacing: "0.02em",
      }}
    >
      {label}
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-px left-0 right-0 h-[1.5px] bg-[#B8755D]"
        />
      )}
    </button>
  );
}

function SignInForm({
  onSubmit,
  onForgotPassword,
}: {
  onSubmit: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  onForgotPassword: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleForgot() {
    if (!email) { setError("Enter your email above, then click Forgot password."); return; }
    setForgotLoading(true);
    const res = await onForgotPassword(email);
    setForgotLoading(false);
    if (res.ok) setForgotSent(true);
    else setError(res.error);
  }

  return (
    <form
      className="mt-7 flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await onSubmit(email, password);
        setLoading(false);
        if (!res.ok) setError(res.error);
      }}
    >
      <Field label="Email" type="email" value={email} onChange={(v) => { setEmail(v); setError(null); setForgotSent(false); }} autoComplete="email" required />
      <Field label="Password" type="password" value={password} onChange={(v) => { setPassword(v); setError(null); }} autoComplete="current-password" required />
      {error && <p className="text-[12px] text-[#B8755D]">{error}</p>}
      {forgotSent && <p className="text-[12px] text-[#6B8F5E]">Reset link sent — check your inbox.</p>}
      <div className="flex items-center justify-between">
        <PrimaryButton label={loading ? "Signing in…" : "Sign In"} disabled={loading} />
        <button
          type="button"
          onClick={handleForgot}
          disabled={forgotLoading}
          className="text-[11px] text-[#A8998A] underline-offset-2 hover:text-[#B8755D] hover:underline"
          style={{ fontFamily: BODY }}
        >
          {forgotLoading ? "Sending…" : "Forgot password?"}
        </button>
      </div>
    </form>
  );
}

function SignUpForm({
  onSubmit,
}: {
  onSubmit: (input: {
    name: string;
    email: string;
    password: string;
    role: AccountRole;
  }) => Promise<{ ok: true; needsVerification?: boolean } | { ok: false; error: string }>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("couple");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mt-7 flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await onSubmit({ name, email, password, role });
        setLoading(false);
        if (!res.ok) setError(res.error);
      }}
    >
      <Field
        label="Name"
        type="text"
        value={name}
        onChange={(v) => {
          setName(v);
          setError(null);
        }}
        autoComplete="name"
        required
      />
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          setError(null);
        }}
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          setError(null);
        }}
        autoComplete="new-password"
        required
      />

      <div className="mt-1">
        <span
          className="mb-2 block text-[11px] uppercase text-[#A8998A]"
          style={{ letterSpacing: "0.2em" }}
        >
          I am
        </span>
        <div className="grid grid-cols-2 gap-2">
          <RoleChip
            label="Planning a wedding"
            active={role === "couple"}
            onClick={() => setRole("couple")}
          />
          <RoleChip
            label="A vendor"
            active={role === "vendor"}
            onClick={() => setRole("vendor")}
          />
        </div>
      </div>

      {error && <p className="text-[12px] text-[#B8755D]">{error}</p>}
      <PrimaryButton label={loading ? "Creating account…" : "Create Your Account"} disabled={loading} />
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-[11px] uppercase text-[#A8998A]"
        style={{ letterSpacing: "0.2em" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full border-0 border-b border-[#1C1917]/15 bg-transparent py-2 text-[14px] text-[#1C1917] outline-none transition-colors placeholder:text-[#A8998A] focus:border-[#B8755D]"
        style={{ letterSpacing: "0.01em" }}
      />
    </label>
  );
}

function RoleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center justify-center px-3 py-3 text-[12.5px] transition-all"
      style={{
        fontFamily: BODY,
        letterSpacing: "0.02em",
        border: active ? "1px solid #B8755D" : "1px solid rgba(28,25,23,0.12)",
        color: active ? "#B8755D" : "rgba(28,25,23,0.72)",
        backgroundColor: active ? "rgba(184,117,93,0.06)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function PrimaryButton({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-2 inline-flex items-center justify-center bg-[#B8755D] px-6 py-3.5 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#A0634C] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ fontFamily: BODY, fontWeight: 500 }}
    >
      {label} →
    </button>
  );
}

function VerificationPrompt({ email, onDismiss }: { email: string; onDismiss: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B8755D]/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8755D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 7 10-7" />
        </svg>
      </div>
      <h2 id="signin-headline" style={{ fontFamily: DISPLAY, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 400, lineHeight: 1.2, color: "#1C1917" }}>
        Check your inbox
      </h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "#5E544B", maxWidth: 320 }}>
        We sent a confirmation link to <strong style={{ color: "#1C1917" }}>{email}</strong>. Click it to activate your account, then sign in.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 inline-flex items-center justify-center bg-[#B8755D] px-8 py-3.5 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#A0634C]"
        style={{ fontFamily: BODY, fontWeight: 500 }}
      >
        Got it
      </button>
      <p style={{ fontSize: 11, color: "#A8998A", lineHeight: 1.6 }}>
        Didn't receive it? Check spam, or try signing up again with the same email.
      </p>
    </div>
  );
}

function SocialButton({
  provider,
  onClick,
  loading,
}: {
  provider: "google" | "apple";
  onClick: () => void;
  loading?: boolean;
}) {
  const label = provider === "google"
    ? (loading ? "Redirecting…" : "Continue with Google")
    : (loading ? "Redirecting…" : "Continue with Apple");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-3 border border-[#1C1917]/15 bg-white px-6 py-3 text-[13px] tracking-[0.02em] text-[#1C1917] transition-colors hover:border-[#B8755D] hover:text-[#B8755D] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ fontFamily: BODY, fontWeight: 500 }}
    >
      <SocialGlyph provider={provider} />
      {label}
    </button>
  );
}

function SocialGlyph({ provider }: { provider: "google" | "apple" }) {
  if (provider === "google") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.75 3.28-8.07z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.12A6.98 6.98 0 0 1 5.5 12c0-.74.13-1.46.34-2.12V7.04H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.96l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.37 12.64c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.73 0-1.83-.81-3.01-.79-1.55.02-2.99.9-3.79 2.29-1.62 2.81-.41 6.96 1.16 9.24.77 1.12 1.67 2.37 2.85 2.32 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.13 2.76-2.26.87-1.29 1.23-2.55 1.25-2.62-.03-.01-2.4-.92-2.34-3.73zM14.1 5.84c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.68 1.37-.59.67-1.11 1.76-.97 2.79 1.02.08 2.07-.51 2.71-1.27z" />
    </svg>
  );
}
