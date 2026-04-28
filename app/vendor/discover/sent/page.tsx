"use client";

// ── Vendor sent-introductions tracker ───────────────────────────────────────
// Shows the status of every interest this vendor has expressed. Accepted
// introductions reveal the bride's contact info; declined cases use soft
// language; expired entries surface clearly so the vendor knows the bride
// has likely moved on.

import { useEffect, useMemo } from "react";
import { Mail, Phone } from "lucide-react";
import { Card, Chip, PageHeader, VENDOR_PALETTE } from "@/components/vendor-portal/ui";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";
import { getVendorNeedCategory } from "@/types/vendor-needs";
import type {
  CommunityVendorInterest,
  VendorInterestStatus,
} from "@/types/vendor-needs";

const STATUS_META: Record<
  VendorInterestStatus,
  { label: string; tone: "neutral" | "gold" | "sage" | "rose" | "teal" }
> = {
  pending:  { label: "Pending",                          tone: "gold" },
  viewed:   { label: "Viewed",                           tone: "teal" },
  accepted: { label: "Accepted",                         tone: "sage" },
  declined: { label: "Reviewed other options for now",   tone: "neutral" },
  expired:  { label: "Expired",                          tone: "neutral" },
};

// Demo placeholder contact info for accepted brides. In a real backend this
// would come from each profile's account record (email/phone). The seed
// brides don't carry contact details, so synthesize from the display name.
function placeholderEmail(displayName: string) {
  return `${displayName.toLowerCase().replace(/[^a-z0-9]/g, "")}@email.com`;
}
function placeholderPhone() {
  return "+1-xxx-xxx-xxxx";
}

export default function VendorSentInterestsPage() {
  const vendor = usePortalVendor();
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const allInterests = useVendorNeedsStore((s) => s.interests);
  const allNeeds = useVendorNeedsStore((s) => s.needs);
  const ensureSeeded = useVendorNeedsStore((s) => s.ensureSeeded);
  const expirePending = useVendorNeedsStore((s) => s._expirePending);

  useEffect(() => {
    ensureSeeded();
    expirePending();
  }, [ensureSeeded, expirePending]);

  const myInterests = useMemo(
    () =>
      allInterests
        .filter((i) => i.vendor_id === vendor.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [allInterests, vendor.id],
  );

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Your introductions"
        description="every introduction you've sent to a bride and where it stands."
      />

      <div className="px-8 py-7">
        {myInterests.length === 0 ? (
          <Card className="px-8 py-14 text-center">
            <p
              className="text-[20px] italic"
              style={{
                fontFamily: "'EB Garamond', serif",
                color: "#6a6a6a",
              }}
            >
              you haven't reached out to any brides yet.
            </p>
            <p className="mt-2 text-[12.5px] text-[#8a8a8a]">
              head to{" "}
              <a
                href="/vendor/discover"
                className="text-[#9E8245] underline-offset-2 hover:underline"
              >
                Browse brides
              </a>{" "}
              to find brides looking for your services.
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {myInterests.map((interest) => {
              const profile = profiles.find(
                (p) => p.id === interest.bride_profile_id,
              );
              const need = allNeeds.find((n) => n.id === interest.need_id);
              if (!profile || !need) return null;
              return (
                <SentRow key={interest.id} interest={interest} profile={profile} need={need} />
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function SentRow({
  interest,
  profile,
  need,
}: {
  interest: CommunityVendorInterest;
  profile: { id: string; display_name: string; wedding_city?: string };
  need: { category_slug: ReturnType<typeof getVendorNeedCategory> extends infer _ ? any : any };
}) {
  const cat = getVendorNeedCategory(need.category_slug);
  const meta = STATUS_META[interest.status];
  const cityShort = profile.wedding_city?.split(",")[0] ?? "—";
  const sentLabel = relativeDays(interest.created_at);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p
            className="text-[18px] leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              color: VENDOR_PALETTE.charcoal,
            }}
          >
            {profile.display_name}
          </p>
          <p className="mt-0.5 text-[12.5px] text-[#6a6a6a]">
            {cat?.emoji} {cat?.label} · {cityShort}
          </p>
          <p className="mt-2 text-[12px] italic text-[#8a8a8a]">
            sent {sentLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Chip tone={meta.tone}>{meta.label}</Chip>
          {interest.status === "accepted" && (
            <div className="flex flex-wrap items-center justify-end gap-3 text-[12px] text-[#4a4a4a]">
              <span className="inline-flex items-center gap-1">
                <Mail size={11} strokeWidth={1.8} className="text-[#9E8245]" />
                {placeholderEmail(profile.display_name)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone size={11} strokeWidth={1.8} className="text-[#9E8245]" />
                {placeholderPhone()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Original pitch */}
      <div
        className="border-t px-5 py-3 text-[12.5px] italic leading-[1.55]"
        style={{
          borderColor: VENDOR_PALETTE.hairlineSoft,
          color: "#6a6a6a",
          fontFamily: "'EB Garamond', serif",
        }}
      >
        &ldquo;{interest.message}&rdquo;
      </div>
    </Card>
  );
}

function relativeDays(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
