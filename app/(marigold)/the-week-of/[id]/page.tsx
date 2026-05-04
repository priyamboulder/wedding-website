import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getDiaryById } from '@/lib/week-of/queries';
import { WeekOfArticle } from '@/components/week-of/WeekOfArticle';
import { pageMetadata } from '@/lib/marigold/seo';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const diary = await getDiaryById(supabase, id);
  if (!diary) {
    return pageMetadata({
      title: 'Diary not found — The Marigold',
      description: 'This diary entry could not be found.',
    });
  }
  return pageMetadata({
    title: `${diary.title} — The Marigold`,
    description: diary.author_persona,
  });
}

export default async function WeekOfDiaryPage({ params }: PageProps) {
  const { id } = await params;
  const diary = await getDiaryById(supabase, id);
  if (!diary) notFound();
  return <WeekOfArticle diary={diary} />;
}
