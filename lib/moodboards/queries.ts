// Server-side query helpers for moodboards.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MoodboardItemRow, MoodboardRow } from '@/types/moodboard';

type AnyClient = SupabaseClient<any, any, any>;

export async function listMoodboards(supabase: AnyClient): Promise<MoodboardRow[]> {
  const { data, error } = await supabase
    .from('moodboards')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MoodboardRow[];
}

export async function getMoodboard(
  supabase: AnyClient,
  slug: string,
): Promise<MoodboardRow | null> {
  const { data, error } = await supabase
    .from('moodboards')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as MoodboardRow | null) ?? null;
}

export async function listMoodboardItems(
  supabase: AnyClient,
  moodboardId: string,
): Promise<MoodboardItemRow[]> {
  const { data, error } = await supabase
    .from('moodboard_items')
    .select('*')
    .eq('moodboard_id', moodboardId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MoodboardItemRow[];
}
