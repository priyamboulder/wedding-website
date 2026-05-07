import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Vendor Marketplace — Ananya",
  description:
    "Browse curated South Asian wedding vendors: photographers, caterers, decorators, mehndi artists, pandits, and more. Filtered by ceremony, style, and region.",
  openGraph: {
    title: "Vendor Marketplace — Ananya",
    description:
      "Discover curated vendors for every ceremony — from mandap decorators to baraat dhol.",
    images: ["/wedding-photos/best/best-04.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendor Marketplace — Ananya",
    description: "Curated South Asian wedding vendors for every ceremony.",
  },
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
