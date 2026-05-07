import { Ticker } from "@/components/marigold-layout/Ticker";
import { Navbar } from "@/components/marigold-layout/Navbar";
import { Footer } from "@/components/marigold-layout/Footer";
import { ScrollToTop } from "@/components/marigold-ui/ScrollToTop";
import { Hero } from "@/components/marigold-sections/Hero";
import { ScrapbookGrid } from "@/components/marigold-sections/ScrapbookGrid";
import { StatsMarquee } from "@/components/marigold-sections/StatsMarquee";
import { ZillaZone } from "@/components/marigold-sections/ZillaZone";
import { Testimonials } from "@/components/marigold-sections/Testimonials";
import { PeopleBehindWedding } from "@/components/marigold-sections/PeopleBehindWedding";
import { FinalCta } from "@/components/marigold-sections/FinalCta";
import { ScrollBlooms } from "@/components/marigold-sections/ScrollBlooms";

export default function HomePage() {
  return (
    <div className="marigold-root">
      <Ticker />
      <Navbar />
      <main className="relative" style={{ paddingTop: 100 }}>
        <Hero />
        <ScrapbookGrid />
        <StatsMarquee />
        <ZillaZone />
        <Testimonials />
        <PeopleBehindWedding />
        <FinalCta />
        <ScrollBlooms />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
