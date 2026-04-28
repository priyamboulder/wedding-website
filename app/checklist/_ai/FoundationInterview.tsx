"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EMPTY_PROFILE,
  type WeddingProfile,
  type Faith,
  type Culture,
  type WeddingType,
  type GuestCount,
} from "./engine";

const FAITH_OPTIONS: { value: Faith; label: string }[] = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "sikh", label: "Sikh" },
  { value: "christian", label: "Christian" },
  { value: "jewish", label: "Jewish" },
  { value: "buddhist", label: "Buddhist" },
  { value: "jain", label: "Jain" },
  { value: "parsi", label: "Zoroastrian (Parsi)" },
  { value: "interfaith", label: "Interfaith" },
  { value: "spiritual", label: "Spiritual, not religious" },
  { value: "secular", label: "Non-religious / secular" },
  { value: "other", label: "Other" },
];

const CULTURE_OPTIONS: { value: Culture; label: string }[] = [
  { value: "north_indian", label: "North Indian" },
  { value: "south_indian", label: "South Indian" },
  { value: "gujarati", label: "Gujarati" },
  { value: "punjabi", label: "Punjabi" },
  { value: "bengali", label: "Bengali" },
  { value: "maharashtrian", label: "Maharashtrian" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "malayali", label: "Malayali" },
  { value: "rajasthani", label: "Rajasthani" },
  { value: "pakistani", label: "Pakistani" },
  { value: "sri_lankan", label: "Sri Lankan" },
  { value: "bangladeshi", label: "Bangladeshi" },
  { value: "indo_caribbean", label: "Indo-Caribbean" },
  { value: "fusion", label: "Mixed / Fusion" },
  { value: "western", label: "Western" },
  { value: "other", label: "Other" },
];

const TYPE_OPTIONS: { value: WeddingType; label: string; blurb: string }[] = [
  { value: "traditional", label: "Traditional", blurb: "Conventional ceremony + reception" },
  { value: "same_gender", label: "Same-gender", blurb: "Same-gender couple" },
  { value: "intercultural", label: "Intercultural", blurb: "Two cultural traditions" },
  { value: "interfaith", label: "Interfaith", blurb: "Two faith traditions" },
  { value: "destination", label: "Destination", blurb: "Away from home" },
  { value: "elopement", label: "Elopement", blurb: "Intimate, under 30 guests" },
  { value: "civil", label: "Court / civil", blurb: "Civil ceremony + reception" },
];

const GUEST_OPTIONS: { value: GuestCount; label: string }[] = [
  { value: "lt50", label: "Under 50" },
  { value: "50_150", label: "50–150" },
  { value: "150_300", label: "150–300" },
  { value: "300_500", label: "300–500" },
  { value: "gt500", label: "500+" },
];

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface Props {
  initial?: WeddingProfile;
  onComplete: (profile: WeddingProfile) => void;
  onCancel?: () => void;
}

export function FoundationInterview({ initial, onComplete, onCancel }: Props) {
  const [profile, setProfile] = useState<WeddingProfile>(initial ?? EMPTY_PROFILE);
  const [step, setStep] = useState<Step>(0);

  const canAdvance = stepIsValid(step, profile);

  function next() {
    if (step < 6) setStep((s) => (s + 1) as Step);
    else onComplete(profile);
  }
  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-line/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <div>
              <div className="text-sm font-medium text-ink">AI Checklist Engine</div>
              <div className="text-xs text-ink-faint">Step {step + 1} of 7</div>
            </div>
          </div>
          {onCancel ? (
            <button
              className="text-sm text-ink-faint hover:text-ink"
              onClick={onCancel}
            >
              Close
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 0 ? (
            <Field label="When is your wedding?" hint="An approximate month + year is fine.">
              <input
                type="date"
                className="w-full rounded-lg border border-ink-line/60 px-3 py-2 text-sm"
                value={profile.weddingDate ?? ""}
                onChange={(e) =>
                  setProfile({ ...profile, weddingDate: e.target.value || null })
                }
              />
            </Field>
          ) : null}

          {step === 1 ? (
            <Field label="Partner names" hint="We use these throughout your checklist.">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-lg border border-ink-line/60 px-3 py-2 text-sm"
                  placeholder="Partner 1"
                  value={profile.partner1Name}
                  onChange={(e) =>
                    setProfile({ ...profile, partner1Name: e.target.value })
                  }
                />
                <input
                  className="rounded-lg border border-ink-line/60 px-3 py-2 text-sm"
                  placeholder="Partner 2"
                  value={profile.partner2Name}
                  onChange={(e) =>
                    setProfile({ ...profile, partner2Name: e.target.value })
                  }
                />
              </div>
            </Field>
          ) : null}

          {step === 2 ? (
            <Field label="Estimated guest count" hint="Rough range — we'll refine later.">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GUEST_OPTIONS.map((opt) => (
                  <Pill
                    key={opt.value}
                    selected={profile.guestCount === opt.value}
                    onClick={() => setProfile({ ...profile, guestCount: opt.value })}
                  >
                    {opt.label}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === 3 ? (
            <Field
              label="Faith & religion"
              hint="Select all traditions that should shape the wedding."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FAITH_OPTIONS.map((opt) => (
                  <Pill
                    key={opt.value}
                    selected={profile.faiths.includes(opt.value)}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        faiths: toggle(profile.faiths, opt.value),
                      })
                    }
                  >
                    {opt.label}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === 4 ? (
            <Field
              label="Cultural background(s)"
              hint="Select all that apply — cross-cultural is common."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CULTURE_OPTIONS.map((opt) => (
                  <Pill
                    key={opt.value}
                    selected={profile.cultures.includes(opt.value)}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        cultures: toggle(profile.cultures, opt.value),
                      })
                    }
                  >
                    {opt.label}
                  </Pill>
                ))}
              </div>
            </Field>
          ) : null}

          {step === 5 ? (
            <Field label="Wedding type" hint="Select all that apply.">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        weddingTypes: toggle(profile.weddingTypes, opt.value),
                      })
                    }
                    className={cn(
                      "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      profile.weddingTypes.includes(opt.value)
                        ? "border-amber-500 bg-amber-50"
                        : "border-ink-line/60 hover:bg-ink-line/10",
                    )}
                  >
                    <div className="font-medium text-ink">{opt.label}</div>
                    <div className="text-xs text-ink-faint">{opt.blurb}</div>
                  </button>
                ))}
              </div>
            </Field>
          ) : null}

          {step === 6 ? (
            <Field label="Location" hint="Where is the wedding happening?">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  className="rounded-lg border border-ink-line/60 px-3 py-2 text-sm"
                  placeholder="City"
                  value={profile.locationCity}
                  onChange={(e) =>
                    setProfile({ ...profile, locationCity: e.target.value })
                  }
                />
                <input
                  className="rounded-lg border border-ink-line/60 px-3 py-2 text-sm"
                  placeholder="State / Region"
                  value={profile.locationRegion}
                  onChange={(e) =>
                    setProfile({ ...profile, locationRegion: e.target.value })
                  }
                />
                <input
                  className="rounded-lg border border-ink-line/60 px-3 py-2 text-sm"
                  placeholder="Country"
                  value={profile.locationCountry}
                  onChange={(e) =>
                    setProfile({ ...profile, locationCountry: e.target.value })
                  }
                />
              </div>
            </Field>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-ink-line/60 bg-ink-line/5 px-6 py-4">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm text-ink-faint hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={next}
            disabled={!canAdvance}
            className="flex items-center gap-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-40"
          >
            {step === 6 ? "Generate checklist" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function stepIsValid(step: Step, p: WeddingProfile): boolean {
  switch (step) {
    case 0:
      return !!p.weddingDate;
    case 1:
      return !!p.partner1Name.trim() && !!p.partner2Name.trim();
    case 2:
      return !!p.guestCount;
    case 3:
      return p.faiths.length > 0;
    case 4:
      return p.cultures.length > 0;
    case 5:
      return p.weddingTypes.length > 0;
    case 6:
      return true; // Location is optional
  }
}

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
    <div>
      <div className="mb-1 text-base font-medium text-ink">{label}</div>
      {hint ? <div className="mb-4 text-sm text-ink-faint">{hint}</div> : null}
      <div>{children}</div>
    </div>
  );
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-sm transition-colors",
        selected
          ? "border-amber-500 bg-amber-50 text-ink"
          : "border-ink-line/60 text-ink-faint hover:bg-ink-line/10 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
