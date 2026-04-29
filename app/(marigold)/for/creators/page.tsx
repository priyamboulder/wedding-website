import { ProPage } from '@/components/marigold/sections/ProPage';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — For Creators',
  description:
    'Publish shoppable picks, share outfit guides, and grow an audience of brides who actually buy.',
});

export default function ForCreatorsPage() {
  return (
    <ProPage
      audience="creators & stylists"
      scrawl="for the editors, the curators, the eye"
      heading="Editorial. <em>Curation.</em> Influence."
      lede="The Marigold is where brides come to plan, not to scroll. When you publish here — outfit guides, shopping picks, editorial — you reach an audience that's actively making decisions."
      benefits={[
        {
          title: 'Shoppable, not just scrollable',
          body: "Tag every outfit, jewel, and centrepiece. When a bride saves your pick, it lands in her shopping list — not in her bookmarks graveyard.",
        },
        {
          title: 'Editorial that sticks',
          body: 'Publish long-form: "How to Style a Sangeet in Mint," "The Five Sari Drapes Worth Knowing." Your content becomes part of the planning flow.',
        },
        {
          title: 'Get paid for taste',
          body: 'Affiliate revenue on shoppable picks. Sponsored editorial slots. Paid styling sessions with couples. Real income, not a free sample box.',
        },
      ]}
      included={[
        'Creator profile page',
        'Editorial publishing tools',
        'Shoppable image tagging',
        'Affiliate revenue dashboard',
        'Sponsored content marketplace',
        'Direct messaging with couples',
        'Featured in The Edit',
        'Analytics & audience insights',
      ]}
      quote={{
        quote:
          'I had 80,000 followers and made nothing. I joined The Marigold and the same audience suddenly converted. Turns out brides buy when they\'re actually planning.',
        attribution: 'Anaita R. — stylist, Bengaluru',
      }}
      ctaTitle="Apply as a <em>Creator</em>"
      ctaSub="We work with stylists, editors, and creators whose taste we trust. Tell us about your work and what you'd love to publish."
      ctaLabel="Apply as a Creator"
      ctaHref="mailto:creators@themarigold.com?subject=Creator%20Application"
      ctaFinePrint="curated · founders' revenue share for the first 25 creators"
    />
  );
}
