import { createAnonClient } from '@/lib/supabase/server-client';
import { listMoodboards } from '@/lib/moodboards/queries';
import { FALLBACK_MOODBOARDS } from '@/lib/moodboards/fallback';
import type { MoodboardRow } from '@/types/moodboard';
import { MoodboardGalleryClient } from './MoodboardGalleryClient';

export async function MoodboardGallery() {
  let moodboards: MoodboardRow[] = [];
  try {
    const supabase = createAnonClient();
    moodboards = await listMoodboards(supabase);
  } catch {
    moodboards = [];
  }

  // Fall back to the static seed if the table hasn't been migrated yet —
  // the homepage always shows the gallery.
  if (moodboards.length === 0) moodboards = FALLBACK_MOODBOARDS;

  return <MoodboardGalleryClient moodboards={moodboards} />;
}
