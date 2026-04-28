import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checklist — Ananya",
  description: "Wedding planning checklist",
};

export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
