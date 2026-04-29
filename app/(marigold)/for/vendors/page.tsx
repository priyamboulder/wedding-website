import { ProPage } from '@/components/marigold/sections/ProPage';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — For Vendors',
  description:
    'Receive crystal-clear briefs, manage your portfolio, and book the couples whose taste matches yours.',
});

export default function ForVendorsPage() {
  return (
    <ProPage
      audience="vendors"
      scrawl="for the ones who actually make it happen"
      heading="Win the Brief. <em>Every Time.</em>"
      lede="When a couple sends you The Brief, you don't get a Pinterest dump and a vague text. You get a structured workspace with their moodboard, palette, keywords, and budget — already laid out."
      benefits={[
        {
          title: 'Briefs that make sense',
          body: 'Style keywords, colour palette, must-haves, must-nots. Everything the couple agreed on with their planner — in one place.',
        },
        {
          title: 'A portfolio that actually works',
          body: 'Show your past weddings the way couples shop: by aesthetic, season, region, and budget tier. Not by Instagram grid.',
        },
        {
          title: 'Get matched to the right couples',
          body: "We don't list every vendor in India. We match couples to vendors whose work fits what they actually want.",
        },
      ]}
      included={[
        'Vendor profile & portfolio',
        'Brief inbox with moodboards',
        'Quote & contract templates',
        'Couple messaging in-app',
        'Calendar & availability sync',
        'Lead notifications',
        'Reviews from real clients',
        'Featured placement (curated)',
      ]}
      quote={{
        quote:
          'Half my consultations used to be me asking "but what do you actually want?" Now I open the brief and we start with execution. Game changer.',
        attribution: 'Rohan T. — photographer, Delhi',
      }}
      ctaTitle="Apply to <em>Join</em>"
      ctaSub="The Marigold is curated. We review every vendor application and onboard a small batch each month. No marketplace clutter, no race to the bottom."
      ctaLabel="Apply as a Vendor"
      ctaHref="mailto:vendors@themarigold.com?subject=Vendor%20Application"
      ctaFinePrint="curated · application reviewed within a week"
    />
  );
}
