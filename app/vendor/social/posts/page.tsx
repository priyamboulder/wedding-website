"use client";

import { useSocialData } from "@/lib/social/SocialDataContext";
import PostsDashboard from "@/components/social/PostsDashboard";

export default function VendorSocialPostsPage() {
  const { isLoaded } = useSocialData();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="h-8 w-56 animate-pulse rounded bg-neutral-200" />
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-neutral-100"
            />
          ))}
        </div>
        <div className="mt-6 h-28 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-6 grid gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-lg bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return <PostsDashboard />;
}
