import { MarigoldHero } from '@/components/marigold/sections/Hero';
import { HowItWorks } from '@/components/marigold/sections/HowItWorks';
import { WhoThisIsFor } from '@/components/marigold/sections/WhoThisIsFor';
import { TrendingOnMarigold } from '@/components/marigold/sections/TrendingOnMarigold';
import { ShareYourShaadi } from '@/components/marigold/sections/ShareYourShaadi';
import { ToolsTeaser } from '@/components/marigold/sections/ToolsTeaser';
import { StatsBar } from '@/components/marigold/sections/StatsBar';
import { MoodboardGallery } from '@/components/marigold/sections/MoodboardGallery';
import { DesignYourWorld } from '@/components/marigold/sections/DesignYourWorld';
import { ScrapbookGrid } from '@/components/marigold/sections/ScrapbookGrid';
import { ZillaZone } from '@/components/marigold/sections/ZillaZone';
import { Testimonials } from '@/components/marigold/sections/Testimonials';
import { ZillaZonePoll } from '@/components/marigold/sections/ZillaZonePoll';
import { PeopleBehindWedding } from '@/components/marigold/sections/PeopleBehindWedding';
import { FinalCta } from '@/components/marigold/sections/FinalCta';
import { FloatingDestinationCta } from '@/components/marigold/sections/FloatingDestinationCta';
import { ScrollBlooms } from '@/components/marigold/sections/ScrollBlooms';
import { AmbientDrift } from '@/components/marigold/sections/AmbientDrift';
import { RevealOnScroll } from '@/components/marigold/sections/RevealOnScroll';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <AmbientDrift />
      <MarigoldHero />
      <RevealOnScroll>
        <HowItWorks />
      </RevealOnScroll>
      <RevealOnScroll>
        <WhoThisIsFor />
      </RevealOnScroll>
      <RevealOnScroll>
        <ToolsTeaser />
      </RevealOnScroll>
      <RevealOnScroll>
        <StatsBar />
      </RevealOnScroll>
      <RevealOnScroll>
        <TrendingOnMarigold />
      </RevealOnScroll>
      <RevealOnScroll>
        <ShareYourShaadi />
      </RevealOnScroll>
      <RevealOnScroll>
        <MoodboardGallery />
      </RevealOnScroll>
      <RevealOnScroll>
        <DesignYourWorld />
      </RevealOnScroll>
      <RevealOnScroll>
        <ScrapbookGrid />
      </RevealOnScroll>
      <RevealOnScroll>
        <PeopleBehindWedding />
      </RevealOnScroll>
      <RevealOnScroll>
        <ZillaZone />
      </RevealOnScroll>
      <RevealOnScroll>
        <Testimonials />
      </RevealOnScroll>
      <RevealOnScroll>
        <section
          className="relative overflow-hidden px-6 py-20 md:px-10 md:py-24"
          style={{ background: 'var(--wine)' }}
        >
          <ZillaZonePoll />
        </section>
      </RevealOnScroll>
      <RevealOnScroll>
        <FinalCta />
      </RevealOnScroll>
      <ScrollBlooms />
      <FloatingDestinationCta />
    </div>
  );
}
