import { Hero } from '@/components/sections/Hero';
import { ScrapbookGrid } from '@/components/sections/ScrapbookGrid';
import { StatsMarquee } from '@/components/sections/StatsMarquee';
import { ZillaZone } from '@/components/sections/ZillaZone';
import { Testimonials } from '@/components/sections/Testimonials';
import { PeopleBehindWedding } from '@/components/sections/PeopleBehindWedding';
import { FinalCta } from '@/components/sections/FinalCta';
import { ScrollBlooms } from '@/components/sections/ScrollBlooms';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Home',
  description:
    'Where Bridezillas & Momzillas unite. 582 tasks, 13 phases, vendor moodboards, AI-powered briefs, a shagun pool tracker — and yes, a special login for your mom.',
});

export default function HomePage() {
  return (
    <div className="relative">
      <Hero />
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
