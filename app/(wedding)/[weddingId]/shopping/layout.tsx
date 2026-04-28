import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping — Ananya",
  description: "Wedding-wide shopping board",
};

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
