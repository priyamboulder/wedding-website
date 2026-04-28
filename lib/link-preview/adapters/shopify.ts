import type { CheerioAPI } from "cheerio";
import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

export function isShopify($: CheerioAPI, html: string): boolean {
  if ($('meta[name="shopify-checkout-api-token"]').length > 0) return true;
  if ($('meta[name="shopify-digital-wallet"]').length > 0) return true;
  if (/Shopify\.shop\s*=/.test(html)) return true;
  if (/cdn\.shopify\.com/.test(html)) return true;
  return false;
}

export const shopifyGenericAdapter: LinkAdapter = {
  name: "shopify-generic",
  domains: ["shop.theknot.com"],
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};

    const priceMeta =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('meta[property="og:price:amount"]').attr("content");
    const currencyMeta =
      $('meta[property="product:price:currency"]').attr("content") ||
      $('meta[property="og:price:currency"]').attr("content");
    if (priceMeta) {
      const parsed = parsePrice(priceMeta);
      if (parsed) {
        out.price = parsed.amount;
        out.currency = currencyMeta || parsed.currency;
      }
    }

    if (out.price == null) {
      const priceText = $('[data-product-price], .product__price, .price__regular')
        .first()
        .text()
        .trim();
      const parsed = parsePrice(priceText);
      if (parsed) {
        out.price = parsed.amount;
        out.currency = parsed.currency;
      }
    }

    return out;
  },
};
