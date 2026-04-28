import { SocialDataProvider } from "@/lib/social/SocialDataContext";

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocialDataProvider>{children}</SocialDataProvider>;
}
