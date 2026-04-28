"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/marketing/SiteLayout";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

export default function CreatorTermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[760px] px-6 py-20 md:px-12">
        <Link
          href="/creators/apply"
          className="inline-flex items-center gap-2 text-[12.5px] text-[#6B6157] transition-colors hover:text-[#B8755D]"
          style={{ fontFamily: BODY }}
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          Back to apply
        </Link>
        <div
          className="mt-8 text-[11px] uppercase tracking-[0.22em] text-[#B8755D]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Creator Program
        </div>
        <h1
          className="mt-4 text-[#1C1917]"
          style={{
            fontFamily: DISPLAY,
            fontSize: "clamp(36px, 5vw, 60px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          Terms & Conditions
        </h1>
        <p
          className="mt-6 text-[13px] uppercase tracking-[0.14em] text-[#8B7E6F]"
          style={{ fontFamily: BODY, fontWeight: 500 }}
        >
          Placeholder — final terms to be published at launch.
        </p>
        <div
          className="mt-10 space-y-5 text-[#1C1917]"
          style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.75 }}
        >
          <p>
            By applying to the Ananya Creator Program, you agree to create
            original, wedding-relevant content and to disclose any material
            commercial relationships with vendors or brands featured in your
            work. You retain ownership of everything you publish. We retain
            the right to moderate, feature, or remove content that doesn't
            align with our editorial standards or community values.
          </p>
          <p>
            Commissions are paid monthly on verified, non-refunded
            conversions. Tier eligibility is reviewed quarterly. Participation
            can be paused or ended at any time by either party with written
            notice.
          </p>
          <p>
            Final terms will be published before you start earning. If any
            clause materially changes, we'll ask you to re-agree before the
            change takes effect.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
