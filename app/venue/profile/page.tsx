"use client";

import { useState } from "react";
import { VENUE_PALETTE } from "@/components/venue/ui";
import { ProfileEditor, SaveBar } from "@/components/venue/profile/ProfileEditor";
import { ProfilePreview } from "@/components/venue/profile/ProfilePreview";
import { PROFILE as SEED_PROFILE, type VenueProfile } from "@/lib/venue/profile-seed";

const SECTION_NAV = [
  { id: "basics", label: "Basics" },
  { id: "spaces", label: "Spaces" },
  { id: "amenities", label: "Amenities" },
  { id: "gallery", label: "Gallery" },
  { id: "pricing", label: "Pricing" },
  { id: "calendar", label: "Availability" },
];

export default function VenueProfilePage() {
  const [profile, setProfile] = useState<VenueProfile>(SEED_PROFILE);
  const [activeSection, setActiveSection] = useState<string>("basics");

  return (
    <div className="mx-auto max-w-[1520px] px-6 pt-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Venue · Profile editor
          </p>
          <h1
            className="mt-2 text-[38px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            How couples see {profile.basics.name}
          </h1>
          <p
            className="mt-1.5 max-w-[62ch] text-[14px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Edit on the left. The right panel is exactly what couples see when they
            browse your venue on Ananya. Save when you're ready to publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProfile(SEED_PROFILE)}
            className="rounded-full border px-4 py-2 text-[12px] font-medium text-[#2C2C2C] hover:bg-[#F5E6D0]"
            style={{ borderColor: "rgba(196,162,101,0.4)" }}
          >
            Reset to last saved
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium"
            style={{ backgroundColor: VENUE_PALETTE.charcoal, color: "#FAF8F5" }}
          >
            Publish →
          </button>
        </div>
      </header>

      <SectionJump active={activeSection} onChange={setActiveSection} />

      {/* Two-panel layout */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Editor panel */}
        <div className="min-w-0">
          <ProfileEditor profile={profile} onChange={setProfile} />
          <SaveBar />
        </div>

        {/* Sticky preview panel */}
        <div className="min-w-0">
          <div className="sticky top-[80px]">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: VENUE_PALETTE.ontrack }}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#5a5a5a]">
                Live preview
              </span>
              <span className="text-[11px] italic text-[#8a8a8a]" style={{ fontFamily: "'EB Garamond', serif" }}>
                · updates as you edit
              </span>
            </div>
            <ProfilePreview profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionJump({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav
      className="sticky top-[64px] z-20 -mx-2 flex gap-1 overflow-x-auto rounded-full border bg-white/92 px-2 py-1.5 backdrop-blur"
      style={{
        borderColor: VENUE_PALETTE.hairline,
        boxShadow: "0 10px 24px -18px rgba(44,44,44,0.18)",
      }}
    >
      {SECTION_NAV.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => onChange(s.id)}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors ${
            active === s.id
              ? "bg-[#F5E6D0] text-[#2C2C2C]"
              : "text-[#5a5a5a] hover:bg-[#F5E6D0]/55 hover:text-[#2C2C2C]"
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
