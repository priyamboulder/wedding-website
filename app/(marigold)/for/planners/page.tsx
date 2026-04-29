import { ProPage } from '@/components/marigold/sections/ProPage';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — For Planners',
  description:
    'Manage every couple, vendor, and decision in one workspace. The Marigold for wedding planners.',
});

export default function ForPlannersPage() {
  return (
    <ProPage
      audience="planners"
      scrawl="for the ones holding it all together"
      heading="One Workspace. <em>Every Wedding.</em>"
      lede="The Marigold gives wedding planners a single home for every couple, vendor, timeline, and budget — so the only thing you're juggling is creative direction."
      benefits={[
        {
          title: 'All your weddings, side by side',
          body: 'Switch between couples in two clicks. Each wedding has its own checklist, vendor team, guest list, and budget — already structured.',
        },
        {
          title: 'The Brief, prefilled',
          body: 'Couples fill out the moodboard and style quiz themselves. You get a vendor-ready brief without the back-and-forth.',
        },
        {
          title: 'Your couples see what you see',
          body: 'No more Dropbox links, scattered Excel sheets, or "did you get my WhatsApp?" The conversation lives in one place.',
        },
      ]}
      included={[
        'Multi-wedding dashboard',
        '13-phase planning checklist',
        'Vendor workspace access',
        'Shared moodboards & style briefs',
        'Guest list & RSVP manager',
        'Budget & shagun tracker',
        'Branded client portal',
        'Invoicing & contracts (beta)',
      ]}
      quote={{
        quote:
          'I used to manage four weddings in seventeen different spreadsheets. Now I manage twelve in one tab. My couples think I work magic.',
        attribution: 'Urvashi K. — planner, Mumbai',
      }}
      ctaTitle="Plan With <em>The Marigold</em>"
      ctaSub="We're onboarding select planners across India and the diaspora. Tell us a bit about your studio and we'll be in touch within 48 hours."
      ctaLabel="Request Planner Access"
      ctaHref="mailto:planners@themarigold.com?subject=Planner%20Access%20Request"
      ctaFinePrint="invite-only · founders' rate for the first 50 studios"
    />
  );
}
