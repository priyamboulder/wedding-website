import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

// Amazon also blocks non-browser UAs.
export const amazonAdapter: LinkAdapter = {
  name: "amazon",
  domains: [
    "amazon.com",
    "amazon.co.uk",
    "amazon.ca",
    "amazon.de",
    "amazon.fr",
    "amazon.es",
    "amazon.it",
    "amazon.in",
    "amazon.com.au",
    "amazon.co.jp",
    "a.co",
  ],
  fetchOptions: {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    extraHeaders: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  },
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};

    const title = $("#productTitle").text().trim();
    if (title) out.title = title;

    const priceText =
      $("#corePriceDisplay_desktop_feature_div .a-price .a-offscreen")
        .first()
        .text()
        .trim() ||
      $(".a-price .a-offscreen").first().text().trim() ||
      $("#priceblock_ourprice").text().trim() ||
      $("#priceblock_dealprice").text().trim() ||
      $("#priceblock_saleprice").text().trim();
    const parsed = parsePrice(priceText);
    if (parsed) {
      out.price = parsed.amount;
      out.currency = parsed.currency;
    }

    const image =
      $("#landingImage").attr("data-old-hires") ||
      $("#landingImage").attr("src") ||
      $("#imgBlkFront").attr("src") ||
      $("#main-image").attr("src");
    if (image) out.image = image;

    out.siteName = "Amazon";

    return out;
  },
};
