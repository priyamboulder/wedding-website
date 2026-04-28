-- ── Migration 0013: Supabase Storage buckets ──────────────────────────────────

-- Create the uploads bucket (public so uploaded files are accessible via URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ananya-uploads',
  'ananya-uploads',
  true,
  10485760,  -- 10 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'application/pdf',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ananya-uploads');

-- Allow anyone to read public files
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'ananya-uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ananya-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'ananya-uploads')
  WITH CHECK (bucket_id = 'ananya-uploads');
