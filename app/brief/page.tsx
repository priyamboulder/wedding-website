import { BriefQuiz } from '@/components/brief/BriefQuiz';

export const metadata = {
  title: 'The Brief — Your 2-minute wedding planning snapshot · The Marigold',
  description:
    'Tell us about your wedding in 2 minutes. We\'ll give you a personalized planning snapshot — budget breakdown, timeline, vibe profile, and what to do first.',
};

export default function BriefPage() {
  return <BriefQuiz />;
}
