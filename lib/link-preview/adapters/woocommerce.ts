import type { CheerioAPI } from "cheerio";
import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

export function isWooCommerce($: CheerioAPI, html: string): boolean {
  if ($('body').hasClass('woocommerce')) return true;
  if ($('body').hasClass('woocommerce-page')) return true;
  if (/wp-content\/plugins\/woocommerce/.test(html)) return true;
  return false;
}

export const wooCommerceGenericAdapter: LinkAdapter = {
  name: "woocommerce-generic",
  domains: [],
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};
    const priceText =
      $("p.price .woocommerce-Price-amount, .summary .price .woocommerce-Price-amount")
        .first()
        .text()
        .trim() ||
      $(".woocommerce-Price-amount").first().text().trim();
    const parsed = parsePrice(priceText);
    if (parsed) {
      out.price = parsed.amount;
      out.currency = parsed.currency;
    }
    return out;
  },
};
