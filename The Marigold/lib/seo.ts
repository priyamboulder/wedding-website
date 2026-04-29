import type { Metadata } from 'next';

const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'The Marigold' };

export function pageMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'The Marigold',
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
