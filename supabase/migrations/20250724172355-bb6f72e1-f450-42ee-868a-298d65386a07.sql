-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload files to their own folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in accessible folders" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create storage policies for the folder-files bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files to their own folders"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'folder-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view files in folders they have access to
CREATE POLICY "Users can view files in accessible folders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'folder-files' 
  AND (
    -- User owns the folder
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Folder is public (check from folders table)
    EXISTS (
      SELECT 1 FROM public.folders 
      WHERE folders.id::text = (storage.foldername(name))[2]
      AND folders.is_public = true
    )
  )
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'folder-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'folder-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);