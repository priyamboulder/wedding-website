import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Community — Ananya",
  description:
    "Real wedding stories, vendor guides, planning advice, and the Confessional — a place where South Asian couples share what really happens.",
  openGraph: {
    title: "Community — Ananya",
    description:
      "Real weddings, honest vendor notes, traditions guides, and The Confessional.",
    images: ["/wedding-photos/sangeet/sangeet-04.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community — Ananya",
    description: "Real weddings, honest planning advice, and the Confessional.",
  },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
