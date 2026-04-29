import { ProPage } from '@/components/sections/ProPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — For Venues',
  description:
    'List your venue with floor plans, capacity guides, and preferred vendor lists — where couples and planners are already working.',
});

export default function ForVenuesPage() {
  return (
    <ProPage
      audience="venues"
      scrawl="for the rooms (and palaces, and lawns)"
      heading="Your Venue, <em>Front and Center.</em>"
      lede="Couples and planners on The Marigold are already deep in planning mode. Show them your spaces with floor plans, capacity guides, and the vendors you trust — right where decisions are being made."
      benefits={[
        {
          title: 'Beyond the photo gallery',
          body: 'Floor plans, capacity by event type, sightline notes, power and rigging details. The information planners actually need.',
        },
        {
          title: 'Your preferred vendors, surfaced',
          body: "Recommend the caterers, decorators, and DJs you've worked with for years. Couples see your shortlist alongside the venue.",
        },
        {
          title: 'Bookings without the back-and-forth',
          body: 'Share availability, hold dates, send proposals — all inside the same workspace your couple is already using to plan.',
        },
      ]}
      included={[
        'Multi-space venue profile',
        'Floor plans & capacity guides',
        'Preferred vendor list',
        'Availability calendar',
        'Inquiry & hold management',
        'Setup & timeline templates',
        'Photo & video portfolio',
        'Featured in planner searches',
      ]}
      quote={{
        quote:
          'We used to email the same floor plans, the same vendor list, the same timeline twenty times a season. Now it lives where the planning lives.',
        attribution: 'The Leela Palace — events team, Udaipur',
      }}
      ctaTitle="List Your <em>Venue</em>"
      ctaSub="From Udaipur palaces to Brooklyn lofts — we work with venues that take their craft seriously. Tell us about your spaces."
      ctaLabel="List Your Venue"
      ctaHref="mailto:venues@themarigold.com?subject=Venue%20Listing%20Inquiry"
      ctaFinePrint="curated · we visit before we list"
    />
  );
}
