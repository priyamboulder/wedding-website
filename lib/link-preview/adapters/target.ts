import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

export const targetAdapter: LinkAdapter = {
  name: "target",
  domains: ["target.com"],
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};
    const priceText = $('[data-test="product-price"]').first().text().trim();
    const parsed = parsePrice(priceText);
    if (parsed) {
      out.price = parsed.amount;
      out.currency = parsed.currency;
    }
    out.siteName = "Target";
    return out;
  },
};
