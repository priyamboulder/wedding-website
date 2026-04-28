"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/seller/ui";

type ShippingProfile = {
  id: string;
  name: string;
  processingDays: number;
  carrier: string;
  domestic: { price: number; freeAbove: number | null };
  international: { enabled: boolean; price: number };
};

const DEFAULT_PROFILES: ShippingProfile[] = [
  {
    id: "sp-1",
    name: "Standard shipping",
    processingDays: 3,
    carrier: "USPS",
    domestic: { price: 6.99, freeAbove: 75 },
    international: { enabled: true, price: 24.99 },
  },
  {
    id: "sp-2",
    name: "Express shipping",
    processingDays: 1,
    carrier: "UPS",
    domestic: { price: 14.99, freeAbove: null },
    international: { enabled: false, price: 0 },
  },
];

export default function SellerShippingPage() {
  const [profiles, setProfiles] = useState<ShippingProfile[]>(DEFAULT_PROFILES);
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
          Shipping profiles
        </h1>
        <p className="mt-1 text-[13px] text-stone-500">
          Configure how your products are shipped to buyers.
        </p>
      </div>

      <div className="px-8 py-8 space-y-6 max-w-2xl">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="rounded-xl border p-6"
            style={{ borderColor: "rgba(44,44,44,0.10)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-medium text-[#2C2C2C]">{profile.name}</h3>
                <p className="mt-0.5 text-[12.5px] text-stone-500">
                  {profile.carrier} · {profile.processingDays} day{profile.processingDays !== 1 ? "s" : ""} processing
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#FAF8F5] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-2">Domestic</p>
                <p className="text-[14px] text-[#2C2C2C]">${profile.domestic.price.toFixed(2)}</p>
                {profile.domestic.freeAbove && (
                  <p className="text-[11.5px] text-stone-500 mt-0.5">
                    Free above ${profile.domestic.freeAbove}
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-[#FAF8F5] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-2">International</p>
                {profile.international.enabled ? (
                  <p className="text-[14px] text-[#2C2C2C]">${profile.international.price.toFixed(2)}</p>
                ) : (
                  <p className="text-[13px] text-stone-400">Not offered</p>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="rounded-lg bg-[#2C2C2C] px-5 py-2.5 text-[13px] text-white transition hover:bg-[#1a1a1a]"
        >
          {saved ? "Saved ✓" : "Save shipping profiles"}
        </button>
      </div>
    </div>
  );
}
