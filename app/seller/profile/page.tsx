"use client";

import { useMemo, useState } from "react";
import ProfileEditor from "@/components/seller/shop-profile/ProfileEditor";
import ShopPreview from "@/components/seller/shop-profile/ShopPreview";
import {
  SHOP_PROFILE_SEED,
  type ShopProfile,
} from "@/lib/seller/shop-profile-seed";

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<ShopProfile>(SHOP_PROFILE_SEED);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("just now");

  const updater = useMemo(
    () => (fn: (prev: ShopProfile) => ShopProfile) => {
      setProfile((prev) => fn(prev));
      setDirty(true);
    },
    [],
  );

  const onSave = () => {
    setDirty(false);
    setLastSaved("just now");
  };

  const onRevert = () => {
    setProfile(SHOP_PROFILE_SEED);
    setDirty(false);
  };

  return (
    <div className="pb-16">
      {/* ── Sticky save bar ── */}
      <div
        className="sticky top-[100px] z-20 border-b"
        style={{
          backgroundColor: "rgba(250,248,245,0.94)",
          backdropFilter: "blur(10px)",
          borderColor: "rgba(44,44,44,0.08)",
        }}
      >
        <div className="flex items-center justify-between gap-4 px-8 py-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-2 w-2 rounded-full"
              style={{ backgroundColor: dirty ? "#C97B63" : "#4F7E5C" }}
              aria-hidden
            />
            <p className="text-[12.5px] text-stone-600">
              {dirty ? (
                <>
                  <span className="text-[#C97B63]">Unsaved changes</span> —
                  preview reflects your draft.
                </>
              ) : (
                <>
                  All changes saved{" "}
                  <span className="font-mono text-[11px] text-stone-500">
                    · {lastSaved}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRevert}
              disabled={!dirty}
              className="h-8 rounded-md border bg-white px-3 text-[12px] text-stone-600 transition-colors hover:bg-[#FBF3E4] disabled:opacity-40"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            >
              Revert
            </button>
            <button
              type="button"
              className="h-8 rounded-md border bg-white px-3 text-[12px] text-[#2C2C2C] hover:bg-[#FBF3E4]"
              style={{ borderColor: "rgba(44,44,44,0.12)" }}
            >
              Preview in new tab ↗
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty}
              className="h-8 rounded-md px-4 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "#C4A265" }}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="grid grid-cols-1 gap-6 px-8 py-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* LEFT — Editor */}
        <div className="min-w-0">
          <ProfileEditor profile={profile} setProfile={updater} />
        </div>

        {/* RIGHT — Live preview (sticky on wide screens) */}
        <div className="min-w-0">
          <div className="xl:sticky xl:top-[170px]">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#7a5a16]">
                How couples see your shop
              </p>
              <div className="flex gap-1">
                <DeviceToggle label="Desktop" active />
                <DeviceToggle label="Mobile" />
              </div>
            </div>
            <ShopPreview profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceToggle({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`h-7 rounded-md px-2.5 text-[11px] transition-colors ${
        active ? "text-[#7a5a16]" : "text-stone-500 hover:text-[#2C2C2C]"
      }`}
      style={{
        backgroundColor: active ? "#F5E6D0" : "transparent",
      }}
    >
      {label}
    </button>
  );
}
