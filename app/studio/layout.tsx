import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Studio — Ananya",
  description:
    "Design your wedding website, stationery, and brand. Choose from 17 hand-crafted templates and publish in minutes.",
  openGraph: {
    title: "Studio — Ananya",
    description:
      "17 hand-crafted wedding website templates. Design your brand, publish your site.",
    images: ["/wedding-photos/wedding/wedding-06.jpg"],
    type: "website",
  },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
