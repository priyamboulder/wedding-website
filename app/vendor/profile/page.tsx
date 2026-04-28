"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Card,
  CardHeader,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/vendor-portal/ui";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";
import { useVendorsStore } from "@/stores/vendors-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import type { VendorCategory } from "@/types/vendor";

const UNIFIED_CATEGORIES = Object.keys(CATEGORY_LABELS) as VendorCategory[];

// ── Static options ────────────────────────────────────────────────

const PRIMARY_CATEGORIES: { value: VendorCategory; label: string }[] =
  UNIFIED_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));

const SECONDARY_TAGS = [
  "Editorial",
  "Candid",
  "Film-look",
  "Destination",
  "Documentary",
  "Traditional",
  "Fusion",
  "Fine-art",
  "Multi-day",
  "Pre-wedding",
];

const SPECIALTY_POOL = [
  "Editorial",
  "Candid",
  "Film-look",
  "Destination",
  "Multi-day",
  "Documentary",
  "Fusion",
  "Traditional",
  "Outdoor",
  "Drone Coverage",
  "Album Design",
  "Second Shooter",
];

const RESPONSE_TIMES = [
  "1 hour",
  "3 hours",
  "6 hours",
  "24 hours",
  "48 hours",
];

const SECTION_LABELS: Record<string, string> = {
  cover: "Cover image",
  business: "Business info",
  bio: "Bio",
  specialties: "Specialties",
  social: "Social links",
  contact: "Contact preferences",
};

const TAGLINE_LIMIT = 90;
const BIO_TARGET_MIN = 150;
const BIO_TARGET_MAX = 300;

// ── Page ──────────────────────────────────────────────────────────

export default function VendorProfilePage() {
  const vendor = usePortalVendor();
  const updateVendor = useVendorsStore((s) => s.updateVendor);

  // Cover image
  const [coverUrl, setCoverUrl] = useState<string>(
    vendor.cover_image ||
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  );
  const [coverOffsetY, setCoverOffsetY] = useState(50); // percent

  // Business info
  const [businessName, setBusinessName] = useState(vendor.name);
  const [tagline, setTagline] = useState(vendor.tagline);
  const [primaryCategory, setPrimaryCategory] = useState<VendorCategory>(
    vendor.category,
  );
  const [secondaryCategories, setSecondaryCategories] = useState<string[]>(
    vendor.style_tags.slice(0, 2),
  );
  const [location, setLocation] = useState(vendor.location);
  const [travelRange, setTravelRange] = useState<string>(vendor.travel_level);
  const [yearsInBusiness, setYearsInBusiness] = useState(
    String(vendor.years_active),
  );
  const [teamSize, setTeamSize] = useState(String(vendor.team_size));
  const [websiteUrl, setWebsiteUrl] = useState(vendor.contact.website);

  // Bio
  const [bio, setBio] = useState(vendor.bio);

  // Specialties — mirror vendor.style_tags
  const [specialties, setSpecialties] = useState<string[]>(
    [...vendor.style_tags],
  );
  const [newSpecialty, setNewSpecialty] = useState("");

  // Social links
  const [instagram, setInstagram] = useState(
    vendor.contact.instagram.replace(/^@/, ""),
  );
  const [pinterest, setPinterest] = useState(vendor.contact.pinterest ?? "");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState(vendor.contact.facebook ?? "");

  // Contact preferences
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [responseTime, setResponseTime] = useState(
    vendor.response_time_hours != null ? `${vendor.response_time_hours} hours` : "3 hours",
  );

  // Sync local form state to the store once after mount. Zustand's persist
  // middleware rehydrates from localStorage on the client; the seed-backed
  // fallback from usePortalVendor can render first, leaving useState stuck on
  // seed values. This effect pulls in the hydrated record so saved edits show
  // up on return visits.
  const hydratedOnceRef = useRef(false);
  useEffect(() => {
    if (hydratedOnceRef.current) return;
    hydratedOnceRef.current = true;
    setCoverUrl(
      vendor.cover_image ||
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    );
    setBusinessName(vendor.name);
    setTagline(vendor.tagline);
    setPrimaryCategory(vendor.category);
    setSecondaryCategories(vendor.style_tags.slice(0, 2));
    setLocation(vendor.location);
    setTravelRange(vendor.travel_level);
    setYearsInBusiness(String(vendor.years_active));
    setTeamSize(String(vendor.team_size));
    setWebsiteUrl(vendor.contact.website);
    setBio(vendor.bio);
    setSpecialties([...vendor.style_tags]);
    setInstagram(vendor.contact.instagram.replace(/^@/, ""));
    setPinterest(vendor.contact.pinterest ?? "");
    setFacebook(vendor.contact.facebook ?? "");
    setResponseTime(
      vendor.response_time_hours != null
        ? `${vendor.response_time_hours} hours`
        : "3 hours",
    );
  }, [vendor]);

  // Persist the current form state back to vendors-store. Called by the
  // per-section Save buttons; individual fields all flow into the same
  // updateVendor patch for simplicity.
  function saveAll() {
    const hoursMatch = responseTime.match(/(\d+)/);
    const responseHours = hoursMatch ? Number(hoursMatch[1]) : null;
    updateVendor(vendor.id, {
      name: businessName.trim(),
      tagline: tagline.trim(),
      category: primaryCategory,
      location: location.trim(),
      years_active: Number(yearsInBusiness) || 0,
      team_size: Number(teamSize) || 0,
      bio: bio.trim(),
      style_tags: specialties,
      cover_image: coverUrl,
      response_time_hours: responseHours,
      profile_completeness: completeness.pct,
      contact: {
        ...vendor.contact,
        website: websiteUrl.trim(),
        instagram: instagram ? `@${instagram.replace(/^@/, "")}` : "",
        pinterest: pinterest || undefined,
        facebook: facebook || undefined,
      },
    });
  }

  // Per-section saved flashes
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flashSave = (id: string) => {
    saveAll();
    setSavedSection(id);
    setToast(id === "all" ? "Profile saved" : `${SECTION_LABELS[id] ?? "Section"} saved`);
    window.setTimeout(
      () => setSavedSection((curr) => (curr === id ? null : curr)),
      1500,
    );
    window.setTimeout(
      () => setToast((curr) => (curr && curr.endsWith("saved") ? null : curr)),
      2200,
    );
  };

  // Preview panel
  const [previewOpen, setPreviewOpen] = useState(false);

  // Completeness calculation
  const completeness = useMemo(() => {
    const checks: { label: string; ok: boolean; weight: number; fix?: string }[] = [
      { label: "Cover image", ok: Boolean(coverUrl), weight: 10 },
      { label: "Business name", ok: businessName.trim().length > 0, weight: 6 },
      { label: "Tagline", ok: tagline.trim().length > 10, weight: 8, fix: "Write a one-line tagline — couples skim this first." },
      { label: "Primary category", ok: Boolean(primaryCategory), weight: 6 },
      { label: "Location", ok: location.trim().length > 0, weight: 6 },
      { label: "Years in business", ok: Number(yearsInBusiness) > 0, weight: 4 },
      { label: "Team size", ok: Number(teamSize) > 0, weight: 4 },
      { label: "Website", ok: websiteUrl.trim().length > 0, weight: 6 },
      {
        label: "About / Bio",
        ok: wordCount(bio) >= BIO_TARGET_MIN,
        weight: 14,
        fix: "Your bio is thin — couples skip profiles without one. Aim for 150–300 words.",
      },
      { label: "Specialties (≥3)", ok: specialties.length >= 3, weight: 10 },
      {
        label: "Social links",
        ok: [instagram, pinterest, youtube, facebook].filter(Boolean).length >= 2,
        weight: 8,
        fix: "Add at least 2 social links so couples can see your ongoing work.",
      },
      {
        label: "Contact preferences",
        ok: notifyEmail || notifySms || notifyInApp,
        weight: 4,
      },
      { label: "Response time", ok: Boolean(responseTime), weight: 4 },
      // Portfolio is managed elsewhere but counted here so the percentage
      // reflects real vendor state, not a placeholder.
      {
        label: "Portfolio (≥8 images)",
        ok: (vendor.portfolio_images ?? []).length >= 8,
        weight: 10,
        fix: "Add a portfolio to go live — head to the Portfolio tab.",
      },
    ];

    const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
    const earned = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
    const pct = Math.round((earned / totalWeight) * 100);
    const missing = checks.filter((c) => !c.ok);
    return { pct, checks, missing };
  }, [
    coverUrl,
    businessName,
    tagline,
    primaryCategory,
    location,
    yearsInBusiness,
    teamSize,
    websiteUrl,
    bio,
    specialties,
    instagram,
    pinterest,
    youtube,
    facebook,
    notifyEmail,
    notifySms,
    notifyInApp,
    responseTime,
    (vendor.portfolio_images ?? []).length,
  ]);

  const bioWords = wordCount(bio);
  const bioTone =
    bioWords === 0
      ? "empty"
      : bioWords < BIO_TARGET_MIN
        ? "short"
        : bioWords <= BIO_TARGET_MAX
          ? "good"
          : "long";

  const toggleSpecialty = (s: string) =>
    setSpecialties((curr) =>
      curr.includes(s) ? curr.filter((x) => x !== s) : [...curr, s],
    );

  const addCustomSpecialty = () => {
    const v = newSpecialty.trim();
    if (!v) return;
    if (!specialties.includes(v)) setSpecialties((c) => [...c, v]);
    setNewSpecialty("");
  };

  const toggleSecondary = (s: string) =>
    setSecondaryCategories((curr) =>
      curr.includes(s) ? curr.filter((x) => x !== s) : [...curr, s],
    );

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="My Profile"
        title="How couples see you"
        description="This is the storefront couples see when they find you in the Ananya directory. Edit any section, preview live, and publish when you're ready."
        actions={
          <>
            <GhostButton onClick={() => setPreviewOpen(true)}>
              Preview public page
            </GhostButton>
            <PrimaryButton onClick={() => flashSave("all")}>
              {savedSection === "all" ? "Saved ✓" : "Save changes"}
            </PrimaryButton>
          </>
        }
      />

      {/* Completeness strip */}
      <div className="border-b border-[rgba(44,44,44,0.06)] bg-[#FBF4E6]/50 px-8 py-4">
        <div className="flex flex-wrap items-center gap-5">
          <div className="min-w-[180px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
              Profile completeness
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <p
                className="text-[26px] leading-none text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {completeness.pct}%
              </p>
              <Chip tone={completeness.pct >= 90 ? "sage" : "gold"}>
                {completeness.pct >= 90
                  ? "Live-ready"
                  : `${completeness.missing.length} to polish`}
              </Chip>
            </div>
          </div>

          <div className="flex-1 min-w-[240px]">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F5E6D0]/80">
              <div
                className="h-full rounded-full bg-[#C4A265] transition-[width] duration-500"
                style={{ width: `${completeness.pct}%` }}
              />
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-stone-600">
              {completeness.missing.slice(0, 3).map((m) => (
                <li key={m.label} className="flex items-center gap-1.5">
                  <span className="text-[#C0392B]">●</span>
                  {m.fix ?? `Missing: ${m.label}`}
                </li>
              ))}
              {completeness.missing.length === 0 && (
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <span>✓</span> Everything a couple would look for is here.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          {/* Main column */}
          <div className="space-y-5">
            {/* Cover image */}
            <Card>
              <CardHeader
                title="Cover image"
                hint="The first thing couples see. Wide aspect; show your best single frame."
                action={
                  <SectionSave
                    saved={savedSection === "cover"}
                    onClick={() => flashSave("cover")}
                  />
                }
              />
              <div className="p-5">
                <div
                  className="relative h-48 w-full overflow-hidden rounded-lg border"
                  style={{ borderColor: "rgba(44,44,44,0.1)" }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `center ${coverOffsetY}%` }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#F5E6D0] text-[13px] text-stone-500">
                      No cover yet.
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#2C2C2C]/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-[#FAF8F5]">
                    <p
                      className="text-[18px] leading-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                      }}
                    >
                      {businessName || "Your business name"}
                    </p>
                    <p className="text-[11.5px] italic opacity-90">
                      {tagline || "Your tagline will appear here."}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
                  <label className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-[12.5px] text-stone-600 hover:border-[#C4A265] hover:bg-[#FBF4E6] cursor-pointer"
                    style={{ borderColor: "rgba(44,44,44,0.2)" }}
                  >
                    <span className="text-[#9E8245]">↥</span>
                    <span className="flex-1">
                      {coverUrl ? "Replace cover image" : "Upload cover image"}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                      JPG · PNG
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setCoverUrl(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                      Reposition (vertical)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={coverOffsetY}
                      onChange={(e) => setCoverOffsetY(Number(e.target.value))}
                      className="w-full accent-[#C4A265]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Business info */}
            <Card>
              <CardHeader
                title="Business info"
                action={
                  <SectionSave
                    saved={savedSection === "business"}
                    onClick={() => flashSave("business")}
                  />
                }
              />
              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Business name"
                    value={businessName}
                    onChange={setBusinessName}
                  />
                  <Field
                    label="Website URL"
                    value={websiteUrl}
                    onChange={setWebsiteUrl}
                    placeholder="https://"
                  />
                </div>

                <div>
                  <FieldLabel>
                    Tagline
                    <span
                      className={`ml-2 font-mono text-[10px] normal-case tracking-normal ${
                        tagline.length > TAGLINE_LIMIT
                          ? "text-[#C0392B]"
                          : "text-stone-400"
                      }`}
                    >
                      {tagline.length}/{TAGLINE_LIMIT}
                    </span>
                  </FieldLabel>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) =>
                      setTagline(e.target.value.slice(0, TAGLINE_LIMIT + 20))
                    }
                    placeholder="One line. What makes your work different?"
                    className="w-full rounded-md border bg-white px-3 py-2 text-[14px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  />
                </div>

                <div>
                  <FieldLabel>Primary category</FieldLabel>
                  <select
                    value={primaryCategory}
                    onChange={(e) =>
                      setPrimaryCategory(e.target.value as VendorCategory)
                    }
                    className="w-full rounded-md border bg-white px-3 py-2 text-[14px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                    style={{ borderColor: "rgba(44,44,44,0.12)" }}
                  >
                    {PRIMARY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Secondary tags (style)</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_TAGS.map((s) => {
                      const on = secondaryCategories.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSecondary(s)}
                          className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                            on
                              ? "bg-[#2C2C2C] text-[#FAF8F5]"
                              : "border border-[rgba(44,44,44,0.12)] bg-white text-stone-600 hover:border-[#C4A265]"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Home location"
                    value={location}
                    onChange={setLocation}
                  />
                  <Field
                    label="Travel range"
                    value={travelRange}
                    onChange={setTravelRange}
                  />
                  <Field
                    label="Years in business"
                    value={yearsInBusiness}
                    onChange={setYearsInBusiness}
                    type="number"
                  />
                  <Field
                    label="Team size"
                    value={teamSize}
                    onChange={setTeamSize}
                    type="number"
                  />
                </div>
              </div>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader
                title="About / Bio"
                hint="Aim for 150–300 words. Tell couples what makes your work different, not just what you do."
                action={
                  <SectionSave
                    saved={savedSection === "bio"}
                    onClick={() => flashSave("bio")}
                  />
                }
              />
              <div className="p-5">
                <textarea
                  rows={8}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-none rounded-lg border bg-white p-4 text-[15px] leading-relaxed text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                  style={{
                    borderColor: "rgba(44,44,44,0.12)",
                    fontFamily: "'EB Garamond', serif",
                  }}
                />
                <div className="mt-2 flex items-center justify-between text-[11.5px]">
                  <span
                    className={
                      bioTone === "good"
                        ? "text-emerald-700"
                        : bioTone === "long"
                          ? "text-[#C0392B]"
                          : "text-stone-500"
                    }
                  >
                    {bioTone === "empty" && "Empty — couples skip profiles without one."}
                    {bioTone === "short" &&
                      `${bioWords} words — ${BIO_TARGET_MIN - bioWords} more to hit the sweet spot.`}
                    {bioTone === "good" &&
                      `${bioWords} words — right in the pocket.`}
                    {bioTone === "long" &&
                      `${bioWords} words — consider trimming; couples skim on mobile.`}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                    {bioWords} / {BIO_TARGET_MIN}–{BIO_TARGET_MAX}
                  </span>
                </div>
              </div>
            </Card>

            {/* Specialties & tags */}
            <Card>
              <CardHeader
                title="Specialties & tags"
                hint="Pick from the list or add your own. Couples filter the directory by these."
                action={
                  <SectionSave
                    saved={savedSection === "specialties"}
                    onClick={() => flashSave("specialties")}
                  />
                }
              />
              <div className="space-y-4 p-5">
                <div>
                  <FieldLabel>From the list</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_POOL.map((s) => {
                      const on = specialties.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecialty(s)}
                          className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                            on
                              ? "border border-[rgba(184,134,11,0.3)] bg-[#FBF4E6] text-[#9E8245]"
                              : "border border-[rgba(44,44,44,0.12)] bg-white text-stone-600 hover:border-[#C4A265]"
                          }`}
                        >
                          {on ? `✓ ${s}` : s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel>Your selections</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {specialties.length === 0 && (
                      <p className="text-[12px] italic text-stone-500">
                        Nothing picked yet.
                      </p>
                    )}
                    {specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full border border-[rgba(184,134,11,0.3)] bg-[#FBF4E6] px-3 py-1 text-[12px] text-[#9E8245]"
                      >
                        {s}
                        <button
                          onClick={() => toggleSpecialty(s)}
                          className="text-[11px] text-stone-400 hover:text-[#C0392B]"
                          aria-label={`Remove ${s}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Add a custom tag</FieldLabel>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSpecialty();
                        }
                      }}
                      placeholder="e.g. Mandap Design"
                      className="flex-1 rounded-md border bg-white px-3 py-2 text-[14px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    />
                    <GhostButton onClick={addCustomSpecialty}>Add</GhostButton>
                  </div>
                </div>
              </div>
            </Card>

            {/* Social links */}
            <Card>
              <CardHeader
                title="Social links"
                hint="Couples open these within seconds of liking a profile."
                action={
                  <SectionSave
                    saved={savedSection === "social"}
                    onClick={() => flashSave("social")}
                  />
                }
              />
              <div className="space-y-4 p-5">
                <SocialField
                  label="Instagram"
                  prefix="@"
                  value={instagram}
                  onChange={setInstagram}
                  placeholder="handle"
                />
                <SocialField
                  label="Pinterest"
                  prefix="pinterest.com/"
                  value={pinterest}
                  onChange={setPinterest}
                  placeholder="handle"
                />
                <SocialField
                  label="YouTube"
                  prefix="youtube.com/@"
                  value={youtube}
                  onChange={setYoutube}
                  placeholder="channel"
                />
                <SocialField
                  label="Facebook"
                  prefix="facebook.com/"
                  value={facebook}
                  onChange={setFacebook}
                  placeholder="page"
                />
              </div>
            </Card>

            {/* Contact preferences */}
            <Card>
              <CardHeader
                title="Contact preferences"
                hint="How inquiries come in — and what you promise couples about response time."
                action={
                  <SectionSave
                    saved={savedSection === "contact"}
                    onClick={() => flashSave("contact")}
                  />
                }
              />
              <div className="space-y-5 p-5">
                <div>
                  <FieldLabel>Send inquiry notifications via</FieldLabel>
                  <div className="space-y-2">
                    <ToggleRow
                      label="Email notification"
                      hint="Arrives the instant a couple writes in."
                      on={notifyEmail}
                      onChange={setNotifyEmail}
                    />
                    <ToggleRow
                      label="SMS"
                      hint="For urgent or day-of messages only."
                      on={notifySms}
                      onChange={setNotifySms}
                    />
                    <ToggleRow
                      label="In-app only"
                      hint="Stay inside the Ananya inbox — quieter days."
                      on={notifyInApp}
                      onChange={setNotifyInApp}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Response time commitment</FieldLabel>
                  <div className="flex items-center gap-2 text-[14px] text-stone-700">
                    <span>We typically respond within</span>
                    <select
                      value={responseTime}
                      onChange={(e) => setResponseTime(e.target.value)}
                      className="rounded-md border bg-white px-2 py-1.5 text-[14px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    >
                      {RESPONSE_TIMES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span>.</span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-stone-500">
                    Shown on your public profile. Couples book faster when this is
                    under 6 hours.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader title="Profile checklist" />
              <div className="p-5">
                <ul className="space-y-2 text-[13px]">
                  {completeness.checks.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-start gap-2 ${
                        c.ok ? "text-stone-700" : "text-stone-500"
                      }`}
                    >
                      <span
                        className={
                          c.ok ? "text-emerald-600" : "text-stone-400"
                        }
                      >
                        {c.ok ? "✓" : "○"}
                      </span>
                      <span className="flex-1">{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <CardHeader title="Verification" />
              <div className="space-y-3 p-5 text-[13px]">
                <Row label="Business registered" value="Verified" tone="sage" />
                <Row label="GST / tax ID" value="Verified" tone="sage" />
                <Row label="Insurance" value="Needs upload" tone="rose" />
                <Row label="Ananya onboarding" value="Complete" tone="sage" />
              </div>
            </Card>

            <Card>
              <CardHeader title="Live status" />
              <div className="p-5 text-[13px] text-stone-700">
                <p>
                  {completeness.pct >= 90 ? (
                    <>
                      You're above 90% — couples can find you in the directory
                      and inquire immediately.
                    </>
                  ) : (
                    <>
                      You'll go live once you cross <b>90%</b> and add a portfolio.
                      Finishing the missing items above unlocks directory
                      visibility.
                    </>
                  )}
                </p>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-[#9E8245] hover:underline"
                >
                  Open live preview →
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Save toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-md border border-emerald-600/30 bg-emerald-600/95 px-4 py-2.5 text-[13px] text-white shadow-lg"
        >
          <span aria-hidden>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Preview side panel */}
      {previewOpen && (
        <PreviewPanel
          onClose={() => setPreviewOpen(false)}
          coverUrl={coverUrl}
          coverOffsetY={coverOffsetY}
          businessName={businessName}
          tagline={tagline}
          primaryCategory={CATEGORY_LABELS[primaryCategory]}
          secondaryCategories={secondaryCategories}
          location={location}
          travelRange={travelRange}
          yearsInBusiness={yearsInBusiness}
          teamSize={teamSize}
          websiteUrl={websiteUrl}
          bio={bio}
          specialties={specialties}
          instagram={instagram}
          pinterest={pinterest}
          youtube={youtube}
          facebook={facebook}
          responseTime={responseTime}
        />
      )}
    </div>
  );
}

// ── Field atoms ───────────────────────────────────────────────────

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-2 text-[14px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
        style={{ borderColor: "rgba(44,44,44,0.12)" }}
      />
    </div>
  );
}

function SocialField({
  label,
  prefix,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        className="flex items-center rounded-md border bg-white focus-within:ring-2 focus-within:ring-[#C4A265]/40"
        style={{ borderColor: "rgba(44,44,44,0.12)" }}
      >
        <span className="px-3 py-2 font-mono text-[12px] text-stone-400">
          {prefix}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2 pr-3 text-[14px] text-[#2C2C2C] focus:outline-none"
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`flex w-full items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
        on
          ? "border-[rgba(184,134,11,0.4)] bg-[#FBF4E6]"
          : "border-[rgba(44,44,44,0.1)] bg-white hover:bg-[#FBF4E6]/40"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[13.5px] text-[#2C2C2C]">{label}</p>
        <p className="text-[11.5px] text-stone-500">{hint}</p>
      </div>
      <span
        className={`mt-1 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-[2px] transition-colors ${
          on ? "bg-[#C4A265]" : "bg-stone-300"
        }`}
        aria-hidden
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

function SectionSave({
  saved,
  onClick,
}: {
  saved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[11.5px] font-medium transition-colors ${
        saved
          ? "bg-emerald-600/10 text-emerald-700"
          : "bg-[#2C2C2C] text-[#FAF8F5] hover:bg-[#2e2e2e]"
      }`}
    >
      {saved ? "Saved ✓" : "Save"}
    </button>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sage" | "rose";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-700">{label}</span>
      <Chip tone={tone}>{value}</Chip>
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────

function PreviewPanel(props: {
  onClose: () => void;
  coverUrl: string;
  coverOffsetY: number;
  businessName: string;
  tagline: string;
  primaryCategory: string;
  secondaryCategories: string[];
  location: string;
  travelRange: string;
  yearsInBusiness: string;
  teamSize: string;
  websiteUrl: string;
  bio: string;
  specialties: string[];
  instagram: string;
  pinterest: string;
  youtube: string;
  facebook: string;
  responseTime: string;
}) {
  const {
    onClose,
    coverUrl,
    coverOffsetY,
    businessName,
    tagline,
    primaryCategory,
    secondaryCategories,
    location,
    travelRange,
    yearsInBusiness,
    teamSize,
    websiteUrl,
    bio,
    specialties,
    instagram,
    pinterest,
    youtube,
    facebook,
    responseTime,
  } = props;

  const socials: { label: string; handle: string }[] = [
    instagram && { label: "Instagram", handle: `@${instagram}` },
    pinterest && { label: "Pinterest", handle: pinterest },
    youtube && { label: "YouTube", handle: `@${youtube}` },
    facebook && { label: "Facebook", handle: facebook },
  ].filter(Boolean) as { label: string; handle: string }[];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-[#2C2C2C]/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="flex h-full w-full max-w-[560px] flex-col border-l bg-[#FAF8F5] shadow-2xl"
        style={{ borderColor: "rgba(44,44,44,0.1)" }}
      >
        <div className="flex items-center justify-between border-b border-[rgba(44,44,44,0.08)] px-5 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
              Live preview
            </p>
            <p className="text-[13px] text-[#2C2C2C]">
              How couples see your public page
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 text-[12px] text-stone-600 hover:bg-white"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Cover */}
          <div className="relative h-56 w-full overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: `center ${coverOffsetY}%` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#F5E6D0] text-[13px] text-stone-500">
                Cover image missing
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2C2C2C]/70 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-[#FAF8F5]">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] opacity-80">
                {primaryCategory || "Vendor"} · {location}
              </p>
              <p
                className="mt-1 text-[26px] leading-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {businessName || "Your business"}
              </p>
              <p
                className="mt-0.5 text-[14px] italic opacity-90"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {tagline || "Tagline will appear here."}
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5">
            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4"
              style={{ borderColor: "rgba(44,44,44,0.08)" }}
            >
              <Meta label="Based in" value={location || "—"} />
              <Meta label="Travels to" value={travelRange || "—"} />
              <Meta
                label="Years"
                value={yearsInBusiness ? `${yearsInBusiness} yrs` : "—"}
              />
              <Meta
                label="Team"
                value={teamSize ? `${teamSize} people` : "—"}
              />
            </div>

            {/* Secondary */}
            {secondaryCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {secondaryCategories.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[#2C2C2C] px-2.5 py-1 text-[11px] text-[#FAF8F5]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Bio */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
                About
              </p>
              {wordCount(bio) === 0 ? (
                <p className="mt-2 rounded-md border border-dashed bg-white p-3 text-[13px] italic text-stone-500"
                  style={{ borderColor: "rgba(44,44,44,0.15)" }}
                >
                  Your bio is empty — couples skip profiles without one.
                </p>
              ) : (
                <p
                  className="mt-2 text-[15px] leading-relaxed text-stone-700"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {bio}
                </p>
              )}
            </section>

            {/* Specialties */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
                Specialties
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {specialties.length === 0 ? (
                  <p className="text-[13px] italic text-stone-500">
                    No specialties yet.
                  </p>
                ) : (
                  specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-[rgba(184,134,11,0.3)] bg-[#FBF4E6] px-2.5 py-1 text-[11.5px] text-[#9E8245]"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </section>

            {/* Socials */}
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-stone-500">
                Find me
              </p>
              <ul className="mt-2 space-y-1.5 text-[13px]">
                {websiteUrl && (
                  <li className="flex justify-between text-stone-700">
                    <span>Website</span>
                    <span className="text-[#9E8245]">{websiteUrl}</span>
                  </li>
                )}
                {socials.length === 0 && !websiteUrl ? (
                  <li className="italic text-stone-500">No links yet.</li>
                ) : (
                  socials.map((s) => (
                    <li
                      key={s.label}
                      className="flex justify-between text-stone-700"
                    >
                      <span>{s.label}</span>
                      <span className="text-[#9E8245]">{s.handle}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            {/* Response time */}
            <section
              className="rounded-lg border bg-white p-4"
              style={{ borderColor: "rgba(44,44,44,0.08)" }}
            >
              <p className="text-[13px] text-stone-700">
                <span className="text-[#2C2C2C]">We typically respond</span>{" "}
                within <b>{responseTime}</b>.
              </p>
              <button
                disabled
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md bg-[#2C2C2C] text-[13px] font-medium text-[#FAF8F5] opacity-90"
              >
                Send an inquiry
              </button>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-400">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] text-[#2C2C2C]">{value}</p>
    </div>
  );
}

// ── Utils ─────────────────────────────────────────────────────────

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
