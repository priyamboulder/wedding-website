import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

const SITE_DESCRIPTION =
  'The only wedding planning platform that actually gets it. 582 tasks, 13 phases, vendor moodboards, AI-powered briefs, a shagun pool tracker — and yes, a special login for your mom.';

export const metadata: Metadata = {
  metadataBase: new URL('https://themarigold.app'),
  title: {
    default: 'The Marigold — Where Bridezillas & Momzillas Unite',
    template: '%s',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'The Marigold',
    title: 'The Marigold — Where Bridezillas & Momzillas Unite',
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'The Marigold' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Marigold — Where Bridezillas & Momzillas Unite',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
