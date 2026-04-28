import Link from "next/link";
import ProfilePreview from "@/components/planner/profile/ProfilePreview";
import { DEFAULT_PROFILE } from "@/lib/planner/profile-seed";
import { PLANNER_PALETTE } from "@/components/planner/ui";

export const metadata = {
  title: "Preview — Radz Events",
};

export default function ProfileCouplePreviewPage() {
  const profile = DEFAULT_PROFILE;
  const slug = profile.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5", color: "#2C2C2C" }}>
      {/* Preview bar */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: PLANNER_PALETTE.charcoal,
          borderColor: "rgba(0,0,0,0.2)",
          color: "#FAF8F5",
        }}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-2.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
              Viewing as couple
            </span>
            <span className="hidden font-mono text-[10.5px] text-[#9E8245] sm:inline">
              ananya.com/planners/{slug}
            </span>
          </div>
          <Link
            href="/planner/profile"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors"
            style={{
              backgroundColor: PLANNER_PALETTE.gold,
              color: PLANNER_PALETTE.charcoal,
            }}
          >
            <span aria-hidden>←</span> Back to editor
          </Link>
        </div>
      </div>

      {/* Faux couple-site top bar */}
      <div
        className="border-b"
        style={{
          backgroundColor: "rgba(250, 248, 245, 0.92)",
          borderColor: PLANNER_PALETTE.hairline,
        }}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <span
            className="text-[26px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Ananya
          </span>
          <nav className="hidden gap-6 text-[13px] text-[#5a5a5a] sm:flex">
            <span>Planners</span>
            <span>Vendors</span>
            <span>Venues</span>
            <span>Inspiration</span>
          </nav>
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-[12.5px] font-medium"
            style={{
              backgroundColor: PLANNER_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            Sign in
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px]">
        <ProfilePreview profile={profile} variant="full" />
      </div>
    </div>
  );
}
