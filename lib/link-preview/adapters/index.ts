import type { CheerioAPI } from "cheerio";
import type { LinkAdapter } from "../types";
import { amazonAdapter } from "./amazon";
import { etsyAdapter } from "./etsy";
import { targetAdapter } from "./target";
import { williamsSonomaFamilyAdapter } from "./williams-sonoma-family";
import { mintedAdapter } from "./minted";
import { shopifyGenericAdapter, isShopify } from "./shopify";
import { wooCommerceGenericAdapter, isWooCommerce } from "./woocommerce";

const DOMAIN_ADAPTERS: LinkAdapter[] = [
  amazonAdapter,
  etsyAdapter,
  targetAdapter,
  williamsSonomaFamilyAdapter,
  mintedAdapter,
  shopifyGenericAdapter,
];

function hostMatches(host: string, domain: string): boolean {
  const h = host.toLowerCase();
  const d = domain.toLowerCase();
  return h === d || h.endsWith("." + d);
}

export function getAdapterForUrl(url: string): LinkAdapter | null {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  for (const a of DOMAIN_ADAPTERS) {
    if (a.domains.some((d) => hostMatches(host, d))) return a;
  }
  return null;
}

export function getFingerprintAdapter(
  $: CheerioAPI,
  html: string,
): LinkAdapter | null {
  if (isShopify($, html)) return shopifyGenericAdapter;
  if (isWooCommerce($, html)) return wooCommerceGenericAdapter;
  return null;
}
