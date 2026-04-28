import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

export const mintedAdapter: LinkAdapter = {
  name: "minted",
  domains: ["minted.com"],
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};
    const priceText =
      $('[data-cy="product-price"]').first().text().trim() ||
      $(".product-price, .price").first().text().trim();
    const parsed = parsePrice(priceText);
    if (parsed) {
      out.price = parsed.amount;
      out.currency = parsed.currency;
    }
    out.siteName = "Minted";
    return out;
  },
};
