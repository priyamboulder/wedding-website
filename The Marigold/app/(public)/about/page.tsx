import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'The Marigold — About',
  description:
    'The story behind The Marigold — built by people who survived their own weddings, for the ones still in it.',
});

export default function AboutPage() {
  return <PlaceholderPage name="Our <em>Story</em>" />;
}
