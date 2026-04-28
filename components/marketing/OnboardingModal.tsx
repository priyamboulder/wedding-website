"use client";

// ── Post-signup onboarding moment ──────────────────────────────
// "Tell us about your wedding." Four optional fields. Skip is a
// first-class citizen — the account is fully usable without this
// data, it just makes the planner smarter when it's filled in.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

export function OnboardingModal() {
  const isOpen = useAuthStore((s) => s.isOnboardingOpen);
  const user = useAuthStore((s) => s.user);
  const skip = useAuthStore((s) => s.skipOnboarding);
  const save = useAuthStore((s) => s.saveOnboarding);

  const [weddingDate, setWeddingDate] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="onboard-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[110] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(28,25,23,0.55)", backdropFilter: "blur(6px)" }}
        >
          <motion.div
            key="onboard-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[520px] bg-[#F7F5F0] px-8 py-10 md:px-14 md:py-14"
            style={{ boxShadow: "0 40px 80px -20px rgba(28,25,23,0.3)", fontFamily: BODY }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboard-headline"
          >
            <div className="text-center">
              <span
                className="text-[11px] uppercase text-[#A8998A]"
                style={{ letterSpacing: "0.3em" }}
              >
                One moment, {user?.name?.split(" ")[0] ?? "welcome"}
              </span>
              <h2
                id="onboard-headline"
                className="mt-5 text-[#1C1917]"
                style={{
                  fontFamily: DISPLAY,
                  fontSize: "clamp(28px, 3.8vw, 36px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  fontWeight: 400,
                }}
              >
                Tell us about your wedding.
              </h2>
              <p
                className="mx-auto mt-4 max-w-[380px] text-[#5E544B]"
                style={{ fontSize: 13.5, lineHeight: 1.65 }}
              >
                Entirely optional. Fill what you know — you can edit
                everything later from your dashboard.
              </p>
            </div>

            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                save({
                  weddingDate: weddingDate || undefined,
                  partnerName: partnerName.trim() || undefined,
                  location: location.trim() || undefined,
                  guestCount: guestCount ? Number(guestCount) : undefined,
                });
              }}
            >
              <Field
                label="Wedding date"
                placeholder="Optional"
                type="date"
                value={weddingDate}
                onChange={setWeddingDate}
              />
              <Field
                label="Partner's name"
                placeholder="Optional"
                type="text"
                value={partnerName}
                onChange={setPartnerName}
              />
              <Field
                label="Location"
                placeholder="e.g. Dallas · Napa · Udaipur"
                type="text"
                value={location}
                onChange={setLocation}
              />
              <Field
                label="Estimated guest count"
                placeholder="Optional"
                type="number"
                value={guestCount}
                onChange={setGuestCount}
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-[#B8755D] px-7 py-3.5 text-[13px] tracking-[0.08em] text-[#F7F5F0] transition-colors hover:bg-[#A0634C]"
                  style={{ fontFamily: BODY, fontWeight: 500 }}
                >
                  Save &amp; continue →
                </button>
                <button
                  type="button"
                  onClick={skip}
                  className="text-[12.5px] tracking-[0.06em] text-[#1C1917]/55 transition-colors hover:text-[#B8755D]"
                  style={{ fontFamily: BODY }}
                >
                  Skip for now
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  placeholder,
  type,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
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
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-[#1C1917]/15 bg-transparent py-2 text-[14px] text-[#1C1917] outline-none transition-colors placeholder:text-[#A8998A]/70 focus:border-[#B8755D]"
        style={{ letterSpacing: "0.01em" }}
      />
    </label>
  );
}
