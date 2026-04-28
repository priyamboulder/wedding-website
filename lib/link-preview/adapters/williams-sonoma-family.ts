import type { LinkAdapter, LinkMetadata } from "../types";
import { parsePrice } from "../extract";

export const williamsSonomaFamilyAdapter: LinkAdapter = {
  name: "williams-sonoma-family",
  domains: [
    "potterybarn.com",
    "westelm.com",
    "williams-sonoma.com",
    "pbteen.com",
    "pbkids.com",
    "potterybarnkids.com",
  ],
  async extract(_html, _url, $) {
    const out: Partial<LinkMetadata> = {};

    const priceAmount =
      $('meta[property="og:price:amount"]').attr("content") ||
      $('meta[property="product:price:amount"]').attr("content");
    const priceCurrency =
      $('meta[property="og:price:currency"]').attr("content") ||
      $('meta[property="product:price:currency"]').attr("content");

    if (priceAmount) {
      const parsed = parsePrice(priceAmount);
      if (parsed) {
        out.price = parsed.amount;
        out.currency = priceCurrency || parsed.currency;
      }
    } else {
      const fallback = $(".price-amount, .product-price, .pip-price-amount")
        .first()
        .text()
        .trim();
      const parsed = parsePrice(fallback);
      if (parsed) {
        out.price = parsed.amount;
        out.currency = parsed.currency;
      }
    }

    return out;
  },
};
