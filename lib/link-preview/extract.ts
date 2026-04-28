import type { CheerioAPI } from "cheerio";
import type { LinkMetadata } from "./types";
import { getDomain, getFaviconUrl } from "./normalize";

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
  "₽": "RUB",
  "₩": "KRW",
};

export function parsePrice(
  raw: string | null | undefined,
): { amount: number; currency: string } | null {
  if (!raw) return null;
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return null;

  let currency = "USD";
  const isoMatch = text.match(/\b([A-Z]{3})\b/);
  if (isoMatch) currency = isoMatch[1];
  else {
    for (const sym of Object.keys(CURRENCY_SYMBOL_MAP)) {
      if (text.includes(sym)) {
        currency = CURRENCY_SYMBOL_MAP[sym];
        break;
      }
    }
  }

  const match = text.match(/(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)/);
  if (!match) return null;
  let num = match[1];

  const lastComma = num.lastIndexOf(",");
  const lastDot = num.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      num = num.replace(/\./g, "").replace(",", ".");
    } else {
      num = num.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    const afterComma = num.length - lastComma - 1;
    if (afterComma === 2) num = num.replace(",", ".");
    else num = num.replace(/,/g, "");
  } else {
    num = num.replace(/\s/g, "");
  }

  const amount = parseFloat(num);
  if (!Number.isFinite(amount)) return null;

  return { amount, currency };
}

function firstMeta($: CheerioAPI, selectors: string[]): string | null {
  for (const sel of selectors) {
    const v = $(sel).attr("content");
    if (v && v.trim()) return v.trim();
  }
  return null;
}

function parseJsonLd($: CheerioAPI): Partial<LinkMetadata> {
  const out: Partial<LinkMetadata> = {};
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    const queue: unknown[] = [...candidates];
    while (queue.length) {
      const node = queue.shift();
      if (!node || typeof node !== "object") continue;
      const obj = node as Record<string, unknown>;
      const graph = obj["@graph"];
      if (Array.isArray(graph)) queue.push(...graph);

      const type = obj["@type"];
      const isProduct =
        type === "Product" ||
        (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;

      if (!out.title && typeof obj.name === "string") out.title = obj.name;
      if (!out.description && typeof obj.description === "string") {
        out.description = obj.description;
      }
      if (!out.image) {
        const img = obj.image;
        if (typeof img === "string") out.image = img;
        else if (Array.isArray(img) && typeof img[0] === "string")
          out.image = img[0];
        else if (
          img &&
          typeof img === "object" &&
          typeof (img as Record<string, unknown>).url === "string"
        ) {
          out.image = (img as Record<string, string>).url;
        }
      }
      const offers = obj.offers;
      const offerList = Array.isArray(offers)
        ? offers
        : offers
          ? [offers]
          : [];
      for (const o of offerList) {
        if (!o || typeof o !== "object") continue;
        const offer = o as Record<string, unknown>;
        if (out.price == null) {
          const p =
            typeof offer.price === "number"
              ? offer.price
              : typeof offer.price === "string"
                ? parseFloat(offer.price)
                : typeof offer.lowPrice === "number"
                  ? offer.lowPrice
                  : typeof offer.lowPrice === "string"
                    ? parseFloat(offer.lowPrice)
                    : NaN;
          if (Number.isFinite(p)) out.price = p;
        }
        if (!out.currency || out.currency === "USD") {
          if (typeof offer.priceCurrency === "string") {
            out.currency = offer.priceCurrency;
          }
        }
      }
    }
  });
  return out;
}

export function genericExtract(
  $: CheerioAPI,
  url: string,
): Partial<LinkMetadata> {
  const og: Partial<LinkMetadata> = {
    title:
      firstMeta($, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ]) ?? $("title").first().text().trim() ?? undefined,
    description: firstMeta($, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]),
    image: firstMeta($, [
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ]),
    siteName: firstMeta($, ['meta[property="og:site_name"]']),
  };

  const ogPrice = firstMeta($, [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
  ]);
  const ogCurrency = firstMeta($, [
    'meta[property="product:price:currency"]',
    'meta[property="og:price:currency"]',
  ]);
  if (ogPrice) {
    const p = parseFloat(ogPrice);
    if (Number.isFinite(p)) og.price = p;
    if (ogCurrency) og.currency = ogCurrency;
  }

  const jsonLd = parseJsonLd($);

  const merged: Partial<LinkMetadata> = {
    title: jsonLd.title ?? og.title,
    description: jsonLd.description ?? og.description ?? null,
    image: jsonLd.image ?? og.image ?? null,
    price: og.price ?? jsonLd.price ?? null,
    currency: og.currency ?? jsonLd.currency ?? "USD",
    siteName: og.siteName ?? null,
  };

  if (!merged.image) {
    const firstImg = $("img")
      .filter((_, el) => {
        const src = $(el).attr("src");
        const w = parseInt($(el).attr("width") ?? "0", 10);
        const h = parseInt($(el).attr("height") ?? "0", 10);
        return !!src && (w >= 200 || h >= 200);
      })
      .first()
      .attr("src");
    if (firstImg) merged.image = firstImg;
  }

  merged.domain = getDomain(url);
  merged.favicon = getFaviconUrl(url);
  merged.url = url;

  return merged;
}

export function absolutizeImage(
  image: string | null | undefined,
  base: string,
): string | null {
  if (!image) return null;
  try {
    return new URL(image, base).toString();
  } catch {
    return image;
  }
}
