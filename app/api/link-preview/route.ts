import { NextResponse } from "next/server";
import { z } from "zod";
import * as cheerio from "cheerio";
import type { LinkMetadata } from "@/lib/link-preview/types";
import { genericExtract, absolutizeImage } from "@/lib/link-preview/extract";
import {
  getAdapterForUrl,
  getFingerprintAdapter,
} from "@/lib/link-preview/adapters";
import {
  normalizeUrl,
  getDomain,
  getFaviconUrl,
  hashUrl,
} from "@/lib/link-preview/normalize";

export const runtime = "nodejs";

// SSRF protection: block requests to private/internal network ranges
const SSRF_BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
];

// Blocks 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x (link-local / AWS metadata)
const SSRF_BLOCKED_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^fc[0-9a-f]{2}:/i, // IPv6 ULA
  /^fe80:/i,           // IPv6 link-local
];

function isPrivateHost(hostname: string): boolean {
  if (SSRF_BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) return true;
  return SSRF_BLOCKED_PATTERNS.some((rx) => rx.test(hostname));
}

const bodySchema = z.object({ url: z.string().url() });

const metadataSchema = z.object({
  image: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string(),
  siteName: z.string().nullable(),
  domain: z.string(),
  favicon: z.string().nullable(),
  url: z.string(),
  adapter_used: z.string().nullable(),
});

type CacheEntry = { data: LinkMetadata; fetchedAt: number };
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; AnanyaBot/1.0; +https://ananya.app/bot)";

async function fetchHtml(
  url: string,
  opts?: { userAgent?: string; extraHeaders?: Record<string, string> },
): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const headers: Record<string, string> = {
      "User-Agent": opts?.userAgent || DEFAULT_USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      ...(opts?.extraHeaders ?? {}),
    };
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = await res.text();
    return { html, finalUrl: res.url || url };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 },
    );
  }

  const inputUrl = parsed.data.url;

  // SSRF protection: reject requests targeting private/internal network ranges
  try {
    const parsedHost = new URL(inputUrl).hostname;
    if (isPrivateHost(parsedHost)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const normalized = normalizeUrl(inputUrl);
  const cacheKey = hashUrl(normalized);

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const domainAdapter = getAdapterForUrl(inputUrl);
    const { html, finalUrl } = await fetchHtml(
      inputUrl,
      domainAdapter?.fetchOptions,
    );
    const $ = cheerio.load(html);

    const generic = genericExtract($, finalUrl);

    let adapter = domainAdapter ?? getAdapterForUrl(finalUrl);
    if (!adapter) adapter = getFingerprintAdapter($, html);

    let adapterData: Partial<LinkMetadata> = {};
    if (adapter) {
      try {
        adapterData = await adapter.extract(html, finalUrl, $);
      } catch (err) {
        console.error(`[link-preview] adapter ${adapter.name} failed:`, err);
        adapterData = {};
      }
    }

    const merged: LinkMetadata = {
      image: absolutizeImage(
        adapterData.image ?? generic.image ?? null,
        finalUrl,
      ),
      title:
        adapterData.title ||
        generic.title ||
        getDomain(finalUrl) ||
        finalUrl,
      description: adapterData.description ?? generic.description ?? null,
      price: adapterData.price ?? generic.price ?? null,
      currency: (adapterData.currency ?? generic.currency ?? "USD").toUpperCase(),
      siteName: adapterData.siteName ?? generic.siteName ?? null,
      domain: getDomain(finalUrl),
      favicon: getFaviconUrl(finalUrl),
      url: finalUrl,
      adapter_used: adapter?.name ?? null,
    };

    const validated = metadataSchema.safeParse(merged);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Extraction produced invalid metadata" },
        { status: 502 },
      );
    }

    cache.set(cacheKey, { data: validated.data, fetchedAt: Date.now() });
    return NextResponse.json(validated.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json(
      {
        error: msg,
        domain: getDomain(inputUrl),
        favicon: getFaviconUrl(inputUrl),
        url: inputUrl,
      },
      { status: 502 },
    );
  }
}
