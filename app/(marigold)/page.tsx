import { MarigoldHero } from '@/components/marigold/sections/Hero';
import { TrendingOnMarigold } from '@/components/marigold/sections/TrendingOnMarigold';
import { ToolsTeaser } from '@/components/marigold/sections/ToolsTeaser';
import { MoodboardGallery } from '@/components/marigold/sections/MoodboardGallery';
import { ScrapbookGrid } from '@/components/marigold/sections/ScrapbookGrid';
import { StatsMarquee } from '@/components/marigold/sections/StatsMarquee';
import { ZillaZone } from '@/components/marigold/sections/ZillaZone';
import { Testimonials } from '@/components/marigold/sections/Testimonials';
import { PeopleBehindWedding } from '@/components/marigold/sections/PeopleBehindWedding';
import { FinalCta } from '@/components/marigold/sections/FinalCta';
import { ScrollBlooms } from '@/components/marigold/sections/ScrollBlooms';
import { AmbientDrift } from '@/components/marigold/sections/AmbientDrift';
import { RevealOnScroll } from '@/components/marigold/sections/RevealOnScroll';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <AmbientDrift />
      <MarigoldHero />
      <RevealOnScroll>
        <TrendingOnMarigold />
      </RevealOnScroll>
      <RevealOnScroll>
        <ToolsTeaser />
      </RevealOnScroll>
      <RevealOnScroll>
        <MoodboardGallery />
      </RevealOnScroll>
      <RevealOnScroll>
        <ScrapbookGrid />
      </RevealOnScroll>
      <RevealOnScroll>
        <StatsMarquee />
      </RevealOnScroll>
      <RevealOnScroll>
        <ZillaZone />
      </RevealOnScroll>
      <RevealOnScroll>
        <Testimonials />
      </RevealOnScroll>
      <RevealOnScroll>
        <PeopleBehindWedding />
      </RevealOnScroll>
      <RevealOnScroll>
        <FinalCta />
      </RevealOnScroll>
      <ScrollBlooms />
    </div>
  );
}