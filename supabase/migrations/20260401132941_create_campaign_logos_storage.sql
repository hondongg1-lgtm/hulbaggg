/*
  # Create Storage Bucket for Campaign Logos

  1. New Storage Bucket
    - `campaign-logos` bucket for storing advertiser logo images
    - Public access for viewing
    - Restricted upload (only authenticated advertisers)

  2. Security
    - Enable RLS on storage.objects
    - Allow authenticated advertisers to upload their own logos
    - Allow public read access to all logos
    - Restrict file types to images only
    - Limit file size to 5MB
*/

-- Create storage bucket for campaign logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-logos',
  'campaign-logos',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload campaign logos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own campaign logos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own campaign logos" ON storage.objects;
  DROP POLICY IF EXISTS "Public read access to campaign logos" ON storage.objects;
END $$;

-- Policy: Allow authenticated users to upload to campaign-logos bucket
CREATE POLICY "Authenticated users can upload campaign logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-logos' AND
    auth.uid() IS NOT NULL
  );

-- Policy: Allow users to update their own uploaded logos
CREATE POLICY "Users can update their own campaign logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campaign-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'campaign-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to delete their own uploaded logos
CREATE POLICY "Users can delete their own campaign logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campaign-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow public read access to all campaign logos
CREATE POLICY "Public read access to campaign logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'campaign-logos');