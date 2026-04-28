"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/seller/ui";
import ProfileEditor from "@/components/seller/shop-profile/ProfileEditor";
import ShopPreview from "@/components/seller/shop-profile/ShopPreview";
import { SHOP_PROFILE_SEED as SHOP_PROFILE } from "@/lib/seller/shop-profile-seed";
import type { ShopProfile } from "@/lib/seller/shop-profile-seed";

export default function SellerSettingsPage() {
  const [profile, setProfile] = useState<ShopProfile>(SHOP_PROFILE);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="pb-16">
      <div className="border-b px-8 py-6" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
          Settings
        </p>
        <h1
          className="mt-1 text-[28px] leading-tight text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Shop profile
        </h1>
        <p className="mt-1 text-[13px] text-stone-500">
          How buyers see your shop across the marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 px-8 py-8 lg:grid-cols-2">
        <div>
          <SectionHeading title="Profile details" />
          <ProfileEditor profile={profile} setProfile={setProfile} />
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="rounded-lg bg-[#2C2C2C] px-5 py-2.5 text-[13px] text-white transition hover:bg-[#1a1a1a]"
            >
              {saved ? "Saved ✓" : "Save changes"}
            </button>
          </div>
        </div>

        <div>
          <SectionHeading title="Live preview" />
          <ShopPreview profile={profile} />
        </div>
      </div>
    </div>
  );
}
