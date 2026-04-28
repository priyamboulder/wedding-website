const TRACKING_PARAMS = [
  /^utm_/i,
  /^ref$/i,
  /^ref_$/i,
  /^tag$/i,
  /^gclid$/i,
  /^fbclid$/i,
  /^_ga$/i,
  /^mc_cid$/i,
  /^mc_eid$/i,
  /^_branch_match_id$/i,
  /^_hsenc$/i,
  /^_hsmi$/i,
  /^yclid$/i,
  /^msclkid$/i,
];

function isTrackingKey(key: string): boolean {
  return TRACKING_PARAMS.some((rx) => rx.test(key));
}

export function normalizeUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw.trim();
  }

  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  const keep: [string, string][] = [];
  url.searchParams.forEach((value, key) => {
    if (!isTrackingKey(key)) keep.push([key, value]);
  });
  const newParams = new URLSearchParams(keep);
  url.search = newParams.toString();

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

export function getDomain(raw: string): string {
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getFaviconUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return null;
  }
}

export function hashUrl(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}
