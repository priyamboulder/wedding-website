"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, useMyCollections } from "@/lib/creators/current-creator";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import { TierBadge } from "@/components/creators/TierBadge";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import type { BudgetRange } from "@/types/creator";
import { BUDGET_RANGE_LABELS, ALL_BUDGET_RANGES } from "@/stores/matching-store";

const MODULE_OPTIONS = [
  { id: "phase-0", label: "Foundation & Vision" },
  { id: "phase-1", label: "Branding & Identity" },
  { id: "phase-2", label: "Core Bookings" },
  { id: "phase-3", label: "Attire & Styling" },
  { id: "phase-5", label: "Paper & Stationery" },
  { id: "phase-10", label: "Final Month" },
  { id: "phase-12", label: "Post-Wedding" },
];

const STYLE_TAG_OPTIONS = [
  "traditional",
  "fusion",
  "minimalist",
  "grand",
  "intimate",
  "destination",
  "eco-conscious",
  "maximalist",
  "heirloom",
  "couture",
];

export default function CreatorProfilePage() {
  const creator = useCurrentCreator();
  const collections = useMyCollections();
  const updateProfile = useCreatorPortalStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [primaryExpertise, setPrimaryExpertise] = useState("phase-3");
  const [secondaryExpertise, setSecondaryExpertise] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string>("");
  const [budgets, setBudgets] = useState<BudgetRange[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [blog, setBlog] = useState("");
  const [otherLinks, setOtherLinks] = useState<string[]>(["", "", ""]);
  const [featuredCollectionId, setFeaturedCollectionId] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverGradient, setCoverGradient] = useState("");
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!creator) return;
    setDisplayName(creator.displayName);
    setHandle(creator.handle);
    setBio(creator.bio);
    setPrimaryExpertise(creator.moduleExpertise[0] ?? "phase-3");
    setSecondaryExpertise(creator.moduleExpertise.slice(1));
    setSpecialties(creator.specialties.join(", "));
    setBudgets(creator.targetBudgetRanges);
    setStyleTags(creator.styleTags);
    setAvatarUrl(creator.avatarUrl ?? "");
    setCoverGradient(creator.coverGradient);
  }, [creator]);

  if (!creator) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-[13px] text-ink-muted">
        No creator selected.
      </div>
    );
  }

  const bioCount = bio.length;
  const bioOver = bioCount > 280;

  const handleSave = () => {
    updateProfile(creator.id, {
      displayName,
      handle,
      bio: bio.slice(0, 280),
      avatarUrl: avatarUrl || null,
      coverGradient,
      specialties: specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      moduleExpertise: [primaryExpertise, ...secondaryExpertise.filter((s) => s !== primaryExpertise)],
      targetBudgetRanges: budgets,
      styleTags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Profile"
        title="Your public profile"
        description="This is how couples see you across Creator Picks, guides, and the platform."
        actions={
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-gold-pale/30"
          >
            {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPreview ? "Hide preview" : "Preview profile"}
          </button>
        }
      />

      {showPreview && (
        <div className="mb-6 overflow-hidden rounded-xl border border-gold/20 bg-white">
          <div
            className="h-32 w-full"
            style={{ background: coverGradient || creator.coverGradient }}
          />
          <div className="flex items-start gap-4 px-6 py-5">
            <CreatorAvatar
              creator={{ ...creator, displayName, avatarUrl: avatarUrl || null }}
              size="xl"
              withBadge={creator.isVerified}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-[22px] text-ink">{displayName}</h3>
                <TierBadge tier={creator.tier} size="sm" />
              </div>
              <p className="text-[12px] text-ink-faint">{handle}</p>
              <p className="mt-2 text-[13px] text-ink">{bio}</p>
              {styleTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {styleTags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-gold/20 bg-gold-pale/20 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-gold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Display name">
          <TextInput value={displayName} onChange={setDisplayName} />
        </Field>

        <Field label="Handle">
          <TextInput value={handle} onChange={setHandle} placeholder="@yourname" />
        </Field>

        <Field
          label={`Bio · ${bioCount}/280`}
          className="md:col-span-2"
        >
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={`w-full resize-none rounded-md border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none focus:ring-0 ${
              bioOver ? "border-rose" : "border-border"
            }`}
          />
        </Field>

        <Field label="Profile photo URL">
          <TextInput
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="https://…"
          />
        </Field>

        <Field label="Cover gradient (CSS)">
          <TextInput
            value={coverGradient}
            onChange={setCoverGradient}
            placeholder="linear-gradient(135deg, #… 0%, #… 100%)"
          />
        </Field>

        <Field label="Primary expertise">
          <select
            value={primaryExpertise}
            onChange={(e) => setPrimaryExpertise(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-gold/40 focus:outline-none"
          >
            {MODULE_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Specialties (comma-separated)">
          <TextInput
            value={specialties}
            onChange={setSpecialties}
            placeholder="Bridal stylist, Fashion editor"
          />
        </Field>

        <Field label="Secondary expertise" className="md:col-span-2">
          <TagToggle
            options={MODULE_OPTIONS.filter((o) => o.id !== primaryExpertise).map(
              (o) => ({ value: o.id, label: o.label }),
            )}
            selected={secondaryExpertise}
            onToggle={(v) =>
              setSecondaryExpertise((sel) =>
                sel.includes(v) ? sel.filter((s) => s !== v) : [...sel, v],
              )
            }
          />
        </Field>

        <Field label="Target budget ranges" className="md:col-span-2">
          <TagToggle
            options={ALL_BUDGET_RANGES.map((b) => ({
              value: b,
              label: BUDGET_RANGE_LABELS[b],
            }))}
            selected={budgets}
            onToggle={(v) =>
              setBudgets((sel) =>
                sel.includes(v as BudgetRange)
                  ? sel.filter((s) => s !== v)
                  : [...sel, v as BudgetRange],
              )
            }
          />
        </Field>

        <Field label="Style tags" className="md:col-span-2">
          <TagToggle
            options={STYLE_TAG_OPTIONS.map((s) => ({ value: s, label: s }))}
            selected={styleTags}
            onToggle={(v) =>
              setStyleTags((sel) =>
                sel.includes(v) ? sel.filter((s) => s !== v) : [...sel, v],
              )
            }
          />
        </Field>

        <Field label="Instagram handle">
          <TextInput value={instagram} onChange={setInstagram} placeholder="@…" />
        </Field>

        <Field label="YouTube channel">
          <TextInput value={youtube} onChange={setYoutube} placeholder="URL" />
        </Field>

        <Field label="TikTok handle">
          <TextInput value={tiktok} onChange={setTiktok} placeholder="@…" />
        </Field>

        <Field label="Blog / website">
          <TextInput value={blog} onChange={setBlog} placeholder="https://…" />
        </Field>

        <Field label="Other links (up to 3)" className="md:col-span-2">
          <div className="flex flex-col gap-1.5">
            {otherLinks.map((link, i) => (
              <TextInput
                key={i}
                value={link}
                onChange={(v) =>
                  setOtherLinks((prev) => prev.map((p, idx) => (idx === i ? v : p)))
                }
                placeholder={`Link ${i + 1}`}
              />
            ))}
          </div>
        </Field>

        <Field label="Featured collection" className="md:col-span-2">
          <select
            value={featuredCollectionId}
            onChange={(e) => setFeaturedCollectionId(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-gold/40 focus:outline-none"
          >
            <option value="">None</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 flex items-center justify-between border-t border-gold/15 bg-white/95 px-6 py-3 backdrop-blur">
        <p className="text-[12px] text-ink-muted">
          Changes are saved locally and reflected across the platform.
        </p>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sage/20 px-3 py-1 text-[11.5px] text-sage">
              <Check size={11} /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={bioOver}
            className="rounded-md bg-ink px-4 py-1.5 text-[12.5px] text-ivory transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink focus:border-gold/40 focus:outline-none focus:ring-0"
    />
  );
}

function TagToggle({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`rounded-full border px-3 py-1 text-[11.5px] transition-colors ${
              active
                ? "border-gold/40 bg-gold-pale/40 text-ink"
                : "border-border bg-white text-ink-muted hover:border-gold/30"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
