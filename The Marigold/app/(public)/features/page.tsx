import { SectionHeader } from '@/components/ui/SectionHeader';
import { FeatureHubGrid } from '@/components/features/FeatureHubGrid';
import { FeatureCta } from '@/components/features/FeatureCta';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — Features Hub',
  description:
    'Seven modules. One platform. The full tour of every feature inside The Marigold.',
});

export default function FeaturesHubPage() {
  return (
    <>
      <section
        className="relative px-6 md:px-10"
        style={{ paddingTop: 130, paddingBottom: 100 }}
      >
        <SectionHeader
          scrawl="everything you're getting"
          heading="The <em>Full Tour</em>"
          sub="Seven modules. One platform. Every feature explained — pick a card, take the deep dive."
        />
        <FeatureHubGrid />
      </section>

      <FeatureCta
        scrawl="okay take me everywhere"
        heading="Ready to plan it all <i>in one place?</i>"
        buttonLabel="Start Your Journey"
        secondary={{ label: 'See Pricing', href: '/pricing' }}
      />
    </>
  );
}
