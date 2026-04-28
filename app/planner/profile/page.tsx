"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import ProfilePreview from "@/components/planner/profile/ProfilePreview";
import {
  DEFAULT_PROFILE,
  SUGGESTED_LANGUAGES,
  TRAVEL_RADIUS_LABEL,
  type CeremonyType,
  type DestinationRegion,
  type ProfileData,
  type ServiceTier,
  type TravelRadius,
} from "@/lib/planner/profile-seed";

export default function PlannerProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);

  const update = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  return (
    <div
      className="mx-auto max-w-[1600px] px-6 py-10"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Page head */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            My profile
          </p>
          <h1
            className="mt-2 text-[40px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            How couples see you
          </h1>
          <p
            className="mt-1.5 text-[15px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Edit on the left — preview updates live on the right.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/planner/profile/preview"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: "#FFFFFF",
              color: PLANNER_PALETTE.charcoal,
              boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.12)",
            }}
          >
            <span aria-hidden>◉</span>
            View as couple
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: PLANNER_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Save changes
          </button>
        </div>
      </div>

      {/* Two-panel */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Left: editor */}
        <div className="space-y-6">
          <IdentityEditor profile={profile} update={update} />
          <BioEditor profile={profile} update={update} />
          <ServicesEditor
            services={profile.services}
            onChange={(next) => update("services", next)}
          />
          <DetailsEditor profile={profile} update={update} />
          <CulturalEditor
            ceremonyTypes={profile.ceremonyTypes}
            onChange={(next) => update("ceremonyTypes", next)}
          />
        </div>

        {/* Right: preview */}
        <div className="lg:sticky lg:top-[80px] lg:self-start">
          <PreviewFrame profile={profile} />
        </div>
      </div>
    </div>
  );
}

function PreviewFrame({ profile }: { profile: ProfileData }) {
  const previewUrl = useMemo(
    () =>
      `ananya.com/planners/${profile.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
    [profile.companyName],
  );

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        borderColor: PLANNER_PALETTE.hairline,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 24px 48px -36px rgba(44,44,44,0.25)",
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-3 border-b px-4 py-2.5"
        style={{
          borderColor: PLANNER_PALETTE.hairline,
          backgroundColor: "#FAF8F5",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: "#28C840" }} />
        </div>
        <div
          className="flex flex-1 items-center gap-2 rounded-md px-3 py-1 font-mono text-[10.5px] text-[#8a8a8a]"
          style={{ backgroundColor: "#FFFFFF", boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.06)" }}
        >
          <span aria-hidden>◎</span>
          {previewUrl}
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
          Live preview
        </span>
      </div>
      <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
        <ProfilePreview profile={profile} variant="panel" />
      </div>
    </div>
  );
}

function EditorCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: PLANNER_PALETTE.hairline }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          className="text-[22px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {hint && <p className="text-[11.5px] italic text-[#8a8a8a]">{hint}</p>}
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
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
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
          {label}
        </span>
        {hint && <span className="text-[11px] text-[#8a8a8a]">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-md border bg-white px-3 py-2 text-[14px] text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265] ${className}`}
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-md border bg-white px-3 py-2 text-[14px] leading-relaxed text-[#2C2C2C] outline-none transition-colors focus:border-[#C4A265] ${className}`}
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    />
  );
}

// --- Editor sections ---------------------------------------------------------

function IdentityEditor({
  profile,
  update,
}: {
  profile: ProfileData;
  update: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
}) {
  return (
    <EditorCard title="Identity" hint="The basics couples see first">
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <div
            className="grid h-20 w-20 place-items-center rounded-full text-[24px]"
            style={{
              backgroundColor: PLANNER_PALETTE.champagne,
              color: PLANNER_PALETTE.goldDeep,
              fontFamily: "'Cormorant Garamond', serif",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
            }}
          >
            {profile.photoMonogram || "–"}
          </div>
          <div className="mt-2 flex flex-col gap-1 text-[11px]">
            <button
              type="button"
              className="rounded-md px-2.5 py-1 text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.12)" }}
            >
              Upload
            </button>
            <button
              type="button"
              className="rounded-md px-2.5 py-1 text-[#9E8245] transition-colors hover:bg-[#FBF4E6]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)" }}
            >
              Pull from IG
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <TextInput
              value={profile.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </Field>
          <Field label="Planner name">
            <TextInput
              value={profile.plannerName}
              onChange={(e) => update("plannerName", e.target.value)}
            />
          </Field>
          <Field label="Tagline" hint={`${profile.tagline.length}/120`}>
            <TextInput
              value={profile.tagline}
              maxLength={120}
              onChange={(e) => update("tagline", e.target.value)}
              className="sm:col-span-2"
            />
          </Field>
          <Field
            label="Instagram handle"
            hint="Portfolio syncs automatically"
          >
            <TextInput
              value={profile.instagramHandle}
              onChange={(e) => update("instagramHandle", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </EditorCard>
  );
}

function BioEditor({
  profile,
  update,
}: {
  profile: ProfileData;
  update: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
}) {
  return (
    <EditorCard
      title="About you"
      hint="This is what couples read to decide if you connect"
    >
      <div className="flex items-center gap-2 rounded-lg border px-2 py-1.5"
        style={{ borderColor: "rgba(44,44,44,0.12)", backgroundColor: "#FBF4E6" }}
      >
        {[
          { g: "B", label: "Bold" },
          { g: "I", label: "Italic" },
          { g: "•", label: "List" },
          { g: "¶", label: "Paragraph" },
          { g: "🔗", label: "Link" },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            className="grid h-7 w-7 place-items-center rounded text-[12px] text-[#5a5a5a] transition-colors hover:bg-white"
          >
            <span style={{ fontFamily: b.g === "B" || b.g === "I" ? "serif" : undefined, fontWeight: b.g === "B" ? 700 : undefined, fontStyle: b.g === "I" ? "italic" : undefined }}>
              {b.g}
            </span>
          </button>
        ))}
        <span className="mx-1 h-4 w-px" style={{ backgroundColor: "rgba(44,44,44,0.15)" }} />
        <span className="text-[10.5px] italic text-[#8a8a8a]">Rich text · keep it personal</span>
      </div>
      <TextArea
        rows={12}
        value={profile.bio}
        onChange={(e) => update("bio", e.target.value)}
      />
      <p className="text-[11px] text-[#8a8a8a]">
        {profile.bio.length} characters · {profile.bio.split(/\s+/).filter(Boolean).length} words
      </p>
    </EditorCard>
  );
}

function ServicesEditor({
  services,
  onChange,
}: {
  services: ServiceTier[];
  onChange: (next: ServiceTier[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(services.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));

  const setField = <K extends keyof ServiceTier>(id: string, key: K, value: ServiceTier[K]) =>
    onChange(services.map((s) => (s.id === id ? { ...s, [key]: value } : s)));

  return (
    <EditorCard
      title="Services & pricing"
      hint={`${services.filter((s) => s.enabled).length} of ${services.length} enabled`}
    >
      <div className="space-y-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="rounded-lg border p-4 transition-colors"
            style={{
              borderColor: svc.enabled ? "rgba(196,162,101,0.45)" : "rgba(44,44,44,0.08)",
              backgroundColor: svc.enabled ? "#FBF4E6" : "#FFFFFF",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3">
                <Toggle checked={svc.enabled} onChange={() => toggle(svc.id)} />
                <span
                  className="text-[16px] text-[#2C2C2C]"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                >
                  {svc.label}
                </span>
              </label>
              {svc.enabled && (
                <span className="font-mono text-[11px] text-[#9E8245]">
                  ${svc.priceLow.toLocaleString()} – ${svc.priceHigh.toLocaleString()}
                </span>
              )}
            </div>
            {svc.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[auto_auto_1fr]">
                <Field label="Low $">
                  <TextInput
                    type="number"
                    value={svc.priceLow}
                    onChange={(e) => setField(svc.id, "priceLow", Number(e.target.value) || 0)}
                    className="w-28"
                  />
                </Field>
                <Field label="High $">
                  <TextInput
                    type="number"
                    value={svc.priceHigh}
                    onChange={(e) => setField(svc.id, "priceHigh", Number(e.target.value) || 0)}
                    className="w-28"
                  />
                </Field>
                <Field label="What's included">
                  <TextArea
                    rows={2}
                    value={svc.includes}
                    onChange={(e) => setField(svc.id, "includes", e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>
        ))}
      </div>
    </EditorCard>
  );
}

function DetailsEditor({
  profile,
  update,
}: {
  profile: ProfileData;
  update: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
}) {
  const radii: TravelRadius[] = ["local", "regional", "nationwide", "international"];

  const toggleLanguage = (lang: string) => {
    const has = profile.languages.includes(lang);
    update(
      "languages",
      has ? profile.languages.filter((l) => l !== lang) : [...profile.languages, lang],
    );
  };

  const toggleRegion = (key: DestinationRegion["key"]) =>
    update(
      "destinationRegions",
      profile.destinationRegions.map((r) =>
        r.key === key ? { ...r, selected: !r.selected } : r,
      ),
    );

  const setCredential = (id: string, label: string) =>
    update(
      "credentials",
      profile.credentials.map((c) => (c.id === id ? { ...c, label } : c)),
    );

  const removeCredential = (id: string) =>
    update(
      "credentials",
      profile.credentials.filter((c) => c.id !== id),
    );

  const addCredential = () =>
    update("credentials", [
      ...profile.credentials,
      {
        id: `c-${Date.now()}`,
        kind: "award",
        label: "New credential",
      },
    ]);

  return (
    <EditorCard title="Details" hint="Where you work, how you work">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Base location">
          <TextInput
            value={profile.baseLocation}
            onChange={(e) => update("baseLocation", e.target.value)}
          />
        </Field>
        <Field label="Travel radius">
          <div className="flex flex-wrap gap-1.5">
            {radii.map((r) => {
              const active = profile.travelRadius === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => update("travelRadius", r)}
                  className="rounded-full px-3 py-1 text-[11.5px] transition-colors"
                  style={{
                    backgroundColor: active ? PLANNER_PALETTE.charcoal : "#FFFFFF",
                    color: active ? "#FAF8F5" : "#2C2C2C",
                    boxShadow: active ? "none" : "inset 0 0 0 1px rgba(44,44,44,0.12)",
                  }}
                >
                  {TRAVEL_RADIUS_LABEL[r].split(" (")[0]}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Years of experience">
          <TextInput
            type="number"
            value={profile.yearsExperience}
            onChange={(e) => update("yearsExperience", Number(e.target.value) || 0)}
            className="w-24"
          />
        </Field>
        <Field label="Weddings planned" hint="Platform count — editable">
          <TextInput
            type="number"
            value={profile.weddingsPlanned}
            onChange={(e) => update("weddingsPlanned", Number(e.target.value) || 0)}
            className="w-28"
          />
        </Field>
      </div>

      {(profile.travelRadius === "international" ||
        profile.travelRadius === "nationwide") && (
        <Field label="Destination regions">
          <div className="flex flex-wrap gap-2">
            {profile.destinationRegions.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => toggleRegion(r.key)}
                className="rounded-full px-3 py-1.5 text-[11.5px] transition-colors"
                style={{
                  backgroundColor: r.selected ? PLANNER_PALETTE.champagne : "#FFFFFF",
                  color: r.selected ? "#8a5a20" : "#5a5a5a",
                  boxShadow: r.selected
                    ? "inset 0 0 0 1px rgba(196,162,101,0.45)"
                    : "inset 0 0 0 1px rgba(44,44,44,0.12)",
                }}
              >
                {r.selected ? "✓ " : ""}{r.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Languages">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_LANGUAGES.map((lang) => {
            const active = profile.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className="rounded-full px-3 py-1 text-[11.5px] transition-colors"
                style={{
                  backgroundColor: active ? PLANNER_PALETTE.champagne : "#FFFFFF",
                  color: active ? "#8a5a20" : "#5a5a5a",
                  boxShadow: active
                    ? "inset 0 0 0 1px rgba(196,162,101,0.45)"
                    : "inset 0 0 0 1px rgba(44,44,44,0.12)",
                }}
              >
                {active ? "✓ " : ""}{lang}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Certifications, awards, press"
        hint={`${profile.credentials.length} entries`}
      >
        <div className="space-y-2">
          {profile.credentials.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px]"
                style={{
                  backgroundColor: "#F5E6D0",
                  color: "#9E8245",
                  boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
                }}
                aria-hidden
              >
                {c.kind === "award" ? "✦" : c.kind === "press" ? "✎" : "✓"}
              </span>
              <TextInput
                value={c.label}
                onChange={(e) => setCredential(c.id, e.target.value)}
                className="flex-1"
              />
              {c.year && (
                <span className="font-mono text-[10.5px] text-[#8a8a8a]">{c.year}</span>
              )}
              <button
                type="button"
                onClick={() => removeCredential(c.id)}
                aria-label="Remove"
                className="grid h-7 w-7 place-items-center rounded-full text-[13px] text-[#8a8a8a] transition-colors hover:bg-[#F5E6D0]"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCredential}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] text-[#9E8245] transition-colors hover:bg-[#FBF4E6]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)" }}
          >
            <span aria-hidden>+</span> Add credential
          </button>
        </div>
      </Field>
    </EditorCard>
  );
}

function CulturalEditor({
  ceremonyTypes,
  onChange,
}: {
  ceremonyTypes: CeremonyType[];
  onChange: (next: CeremonyType[]) => void;
}) {
  const toggle = (key: CeremonyType["key"]) =>
    onChange(
      ceremonyTypes.map((c) => (c.key === key ? { ...c, selected: !c.selected } : c)),
    );

  const groups: CeremonyType["group"][] = ["Hindu", "Sikh", "Muslim", "Other"];

  return (
    <EditorCard
      title="Cultural expertise"
      hint="Couples look for planners who know their traditions"
    >
      {groups.map((group) => {
        const items = ceremonyTypes.filter((c) => c.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#9E8245]">
              {group}
            </p>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {items.map((c) => (
                <label
                  key={c.key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors"
                  style={{
                    backgroundColor: c.selected ? "#FBF4E6" : "transparent",
                    boxShadow: c.selected
                      ? "inset 0 0 0 1px rgba(196,162,101,0.35)"
                      : "inset 0 0 0 1px rgba(44,44,44,0.06)",
                  }}
                >
                  <Checkbox checked={c.selected} onChange={() => toggle(c.key)} />
                  <span className="text-[13.5px] text-[#2C2C2C]">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </EditorCard>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative h-[20px] w-[34px] rounded-full transition-colors"
      style={{
        backgroundColor: checked ? PLANNER_PALETTE.goldDeep : "rgba(44,44,44,0.2)",
      }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white transition-all"
        style={{ left: checked ? "16px" : "2px" }}
      />
    </button>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange();
        }
      }}
      className="grid h-[17px] w-[17px] shrink-0 cursor-pointer place-items-center rounded-[4px] text-[11px] transition-colors"
      style={{
        backgroundColor: checked ? PLANNER_PALETTE.goldDeep : "#FFFFFF",
        color: "#FFFFFF",
        boxShadow: checked
          ? "none"
          : "inset 0 0 0 1.5px rgba(44,44,44,0.25)",
      }}
    >
      {checked && <span aria-hidden>✓</span>}
    </span>
  );
}
