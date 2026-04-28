import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

// Etsy blocks transparent bot UAs — use a browser-like UA for fetches.
// The OG/JSON-LD data they serve is identical to what browsers receive.
export const etsyAdapter: LinkAdapter = {
  name: "etsy",
  domains: ["etsy.com", "etsy.me"],
  fetchOptions: {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    extraHeaders: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
  },
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};

    const title =
      $('h1[data-buy-box-listing-title]').first().text().trim() ||
      $("h1").first().text().trim();
    if (title) out.title = title;

    const priceText =
      $('[data-buy-box-region="price"] p').first().text().trim() ||
      $('[data-selector="price-only"]').first().text().trim();
    const parsed = parsePrice(priceText);
    if (parsed) {
      out.price = parsed.amount;
      out.currency = parsed.currency;
    }

    const image =
      $('img[data-listing-card-primary-image]').attr("src") ||
      $(".listing-page-image-carousel-component img").first().attr("src") ||
      $('img[data-index="0"]').attr("src");
    if (image) out.image = image;

    out.siteName = "Etsy";

    return out;
  },
};
