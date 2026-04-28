"use client";

import Link from "next/link";
import { useSocialData } from "@/lib/social/SocialDataContext";
import BrandVoiceSetup from "@/components/social/BrandVoiceSetup";
import ContentLibrary from "@/components/social/ContentLibrary";

export default function VendorSocialPage() {
  const { isLoaded } = useSocialData();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mt-6 h-28 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-6 h-6 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
      <header className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
          Vendor · Social
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-neutral-900">
          Social Media Content
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Add your weddings, shoots, and projects, then generate on-brand posts across
          every platform in seconds.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/vendor/social/generate"
          className="group flex flex-col rounded-lg border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Post Generator
          </p>
          <h3 className="mt-1 text-lg font-semibold text-neutral-900 group-hover:underline">
            Generate on-brand posts →
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Pick a wedding or shoot, choose your platforms, and get ready-to-publish captions in seconds.
          </p>
        </Link>
        <Link
          href="/vendor/social/reels"
          className="group flex flex-col rounded-lg border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
            Reel Studio
          </p>
          <h3 className="mt-1 text-lg font-semibold text-neutral-900 group-hover:underline">
            Build Instagram Reels →
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Choose a template, fill in your photos and text, and preview an animated Reel storyboard.
          </p>
        </Link>
      </div>

      <div className="space-y-8">
        <BrandVoiceSetup />
        <ContentLibrary />
      </div>
    </div>
  );
}

