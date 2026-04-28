"use client";

import { useEffect, useState } from "react";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type { BrandColors, Platform, VendorSocialProfile } from "@/lib/social/types";
import TagInput from "./TagInput";

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "instagram_post", label: "Instagram Post" },
  { value: "instagram_reel", label: "Instagram Reel" },
  { value: "instagram_story", label: "Instagram Story" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "pinterest", label: "Pinterest" },
  { value: "twitter", label: "Twitter/X" },
];

const DEFAULT_COLORS: BrandColors = {
  primary: "#000000",
  secondary: "#FFFFFF",
  accent: "#C9A961",
};

type FormState = {
  brand_voice: string;
  target_audience: string;
  default_hashtags: string[];
  instagram_handle: string;
  preferred_platforms: Platform[];
  brand_colors: BrandColors;
};

function toFormState(profile: VendorSocialProfile | null): FormState {
  return {
    brand_voice: profile?.brand_voice ?? "",
    target_audience: profile?.target_audience ?? "",
    default_hashtags: profile?.default_hashtags ?? [],
    instagram_handle: profile?.instagram_handle ?? "",
    preferred_platforms: profile?.preferred_platforms ?? [],
    brand_colors: profile?.brand_colors ?? DEFAULT_COLORS,
  };
}

export default function BrandVoiceSetup() {
  const { profile, saveProfile } = useSocialData();
  const [expanded, setExpanded] = useState(() => profile == null);
  const [form, setForm] = useState<FormState>(() => toFormState(profile));
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setForm(toFormState(profile));
    if (profile != null) setExpanded(false);
    else setExpanded(true);
  }, [profile]);

  const togglePlatform = (p: Platform) => {
    setForm((s) => ({
      ...s,
      preferred_platforms: s.preferred_platforms.includes(p)
        ? s.preferred_platforms.filter((x) => x !== p)
        : [...s.preferred_platforms, p],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const handle = form.instagram_handle.replace(/^@/, "").trim();
      await saveProfile({ ...form, instagram_handle: handle });
      setJustSaved(true);
      setExpanded(false);
      setTimeout(() => setJustSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasProfile = profile != null;

  if (!expanded) {
    return (
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
              Brand Voice
            </h2>
            <p className="mt-1 truncate text-sm text-neutral-600">
              {profile?.brand_voice || "No brand voice set yet."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
              {profile?.instagram_handle && <span>@{profile.instagram_handle}</span>}
              {profile?.preferred_platforms && profile.preferred_platforms.length > 0 && (
                <span>· {profile.preferred_platforms.length} platforms</span>
              )}
              {profile?.default_hashtags && profile.default_hashtags.length > 0 && (
                <span>· {profile.default_hashtags.length} default hashtags</span>
              )}
              {justSaved && <span className="text-emerald-600">· Saved</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Edit
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
            Brand Voice
          </h2>
          {!hasProfile && (
            <p className="mt-1 text-sm text-neutral-600">
              Set up your brand voice so every generated post sounds like you.
            </p>
          )}
        </div>
        {hasProfile && (
          <button
            type="button"
            onClick={() => {
              setForm(toFormState(profile));
              setExpanded(false);
            }}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
            Brand voice
          </label>
          <textarea
            value={form.brand_voice}
            onChange={(e) => setForm((s) => ({ ...s, brand_voice: e.target.value }))}
            placeholder="e.g., Warm and romantic. We tell love stories through candid, editorial photography. Our voice is intimate but professional — never salesy."
            rows={3}
            className="w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
            Target audience
          </label>
          <input
            type="text"
            value={form.target_audience}
            onChange={(e) => setForm((s) => ({ ...s, target_audience: e.target.value }))}
            placeholder="e.g., South Asian couples planning destination weddings"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
            Instagram handle
          </label>
          <div className="flex items-center rounded-md border border-neutral-300 bg-white focus-within:border-neutral-500">
            <span className="select-none border-r border-neutral-300 px-3 py-2 text-sm text-neutral-500">
              @
            </span>
            <input
              type="text"
              value={form.instagram_handle.replace(/^@/, "")}
              onChange={(e) =>
                setForm((s) => ({ ...s, instagram_handle: e.target.value.replace(/^@/, "") }))
              }
              placeholder="yourhandle"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
            Default hashtags
          </label>
          <TagInput
            value={form.default_hashtags}
            onChange={(next) => setForm((s) => ({ ...s, default_hashtags: next }))}
            placeholder="Type a hashtag and press Enter"
            prefix="#"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
            Preferred platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((p) => {
              const selected = form.preferred_platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-600">
            Brand colors
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["primary", "secondary", "accent"] as const).map((key) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-2"
              >
                <input
                  type="color"
                  value={form.brand_colors[key]}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      brand_colors: { ...s.brand_colors, [key]: e.target.value },
                    }))
                  }
                  className="h-10 w-10 cursor-pointer rounded border border-neutral-300 bg-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs capitalize text-neutral-500">{key}</p>
                  <p className="font-mono text-sm uppercase text-neutral-800">
                    {form.brand_colors[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : hasProfile ? "Save changes" : "Save brand voice"}
        </button>
      </div>
    </section>
  );
}
