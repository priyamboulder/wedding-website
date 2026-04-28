"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

type Stage = "loading" | "form" | "success" | "error";

export default function ResetPasswordPage() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const syncSession = useAuthStore((s) => s.syncSession);
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Supabase embeds the recovery token in the URL hash on redirect.
  // Calling syncSession() picks it up and establishes a session.
  useEffect(() => {
    syncSession().then(() => setStage("form"));
  }, [syncSession]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSubmitting(true);
    const res = await resetPassword(password);
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setStage("success");
    setTimeout(() => router.replace("/app"), 2000);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-4"
      style={{ fontFamily: BODY }}
    >
      <div
        className="w-full max-w-[440px] bg-white px-8 py-12 shadow-sm"
        style={{ boxShadow: "0 20px 60px -12px rgba(28,25,23,0.12)" }}
      >
        {stage === "loading" && (
          <p className="text-center text-sm text-[#A8998A]">Verifying link…</p>
        )}

        {stage === "form" && (
          <>
            <p className="text-center text-[11px] uppercase text-[#A8998A]" style={{ letterSpacing: "0.3em" }}>
              Password reset
            </p>
            <h1
              className="mt-4 text-center text-[#1C1917]"
              style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,4vw,32px)", fontWeight: 400, lineHeight: 1.15 }}
            >
              Choose a new password
            </h1>
            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase text-[#A8998A]" style={{ letterSpacing: "0.2em" }}>
                  New password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full border-0 border-b border-[#1C1917]/15 bg-transparent py-2 text-[14px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase text-[#A8998A]" style={{ letterSpacing: "0.2em" }}>
                  Confirm password
                </span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full border-0 border-b border-[#1C1917]/15 bg-transparent py-2 text-[14px] text-[#1C1917] outline-none transition-colors focus:border-[#B8755D]"
                />
              </label>
              {error && <p className="text-[12px] text-[#B8755D]">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center bg-[#B8755D] px-6 py-3.5 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#A0634C] disabled:opacity-60"
                style={{ fontWeight: 500 }}
              >
                {submitting ? "Saving…" : "Set new password →"}
              </button>
            </form>
          </>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6B8F5E]/12">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B8F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 400, color: "#1C1917" }}>
              Password updated
            </h1>
            <p style={{ fontSize: 13.5, color: "#5E544B" }}>Redirecting you to the app…</p>
          </div>
        )}

        {stage === "error" && (
          <div className="text-center">
            <p className="text-[#B8755D]">This reset link has expired. Please request a new one.</p>
            <button
              onClick={() => router.replace("/")}
              className="mt-6 text-[13px] text-[#A8998A] underline-offset-2 hover:underline"
            >
              Back to home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
