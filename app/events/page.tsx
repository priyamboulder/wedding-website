// ── /events → /workspace/events redirect ──────────────────────────────────
// The 5-question wizard that used to live here has been absorbed into the
// tabbed Events workspace under /workspace/events. Preserve any deep-link
// query params on the way through so "?event=X&tab=Y" still lands correctly.

import { redirect } from "next/navigation";

interface SearchParams {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function LegacyEventsRedirect({ searchParams }: SearchParams) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === "string") params.set(key, value);
      else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    }
  }
  const qs = params.toString();
  redirect(`/workspace/events${qs ? `?${qs}` : ""}`);
}
