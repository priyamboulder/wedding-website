import { SiteLayout } from "@/components/marketing/SiteLayout";
import { HomePage } from "@/components/marketing/HomePage";
import { getCategoriesWithLiveCounts } from "@/lib/marketing/data";

export const metadata = {
  title: "Ananya — The Wedding Platform for South Asian Couples",
  description:
    "Plan every ceremony, book curated vendors, design stationery, and build your wedding website — all in one place built for the multi-day South Asian wedding.",
  openGraph: {
    title: "Ananya — The Wedding Platform for South Asian Couples",
    description:
      "Plan every ceremony, book curated vendors, design stationery, and build your wedding website — all in one place.",
    images: ["/wedding-photos/best/best-04.jpg"],
  },
};

export default async function RootPage() {
  const categories = await getCategoriesWithLiveCounts();
  return (
    <SiteLayout flushTop>
      <HomePage categories={categories} />
    </SiteLayout>
  );
}
