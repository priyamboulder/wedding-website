import { MarigoldHero } from '@/components/marigold/sections/Hero';
import { ScrapbookGrid } from '@/components/marigold/sections/ScrapbookGrid';
import { StatsMarquee } from '@/components/marigold/sections/StatsMarquee';
import { ZillaZone } from '@/components/marigold/sections/ZillaZone';
import { Testimonials } from '@/components/marigold/sections/Testimonials';
import { PeopleBehindWedding } from '@/components/marigold/sections/PeopleBehindWedding';
import { FinalCta } from '@/components/marigold/sections/FinalCta';
import { ScrollBlooms } from '@/components/marigold/sections/ScrollBlooms';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <MarigoldHero />
      <ScrapbookGrid />
      <StatsMarquee />
      <ZillaZone />
      <Testimonials />
      <PeopleBehindWedding />
      <FinalCta />
      <ScrollBlooms />
    </div>
  );
}