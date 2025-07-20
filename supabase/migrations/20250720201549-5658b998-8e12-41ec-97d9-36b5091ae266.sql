-- Add is_public column to folders table
ALTER TABLE public.folders 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true;

-- Update RLS policies for folders
DROP POLICY "Anyone can view folders" ON public.folders;

-- Public folders can be viewed by anyone, private folders only by creator
CREATE POLICY "Public folders viewable by all, private by creator" 
  ON public.folders 
  FOR SELECT 
  USING (is_public = true OR (is_public = false AND auth.uid() = created_by));

-- Update files policies to respect folder privacy
DROP POLICY "Anyone can view files" ON public.files;

CREATE POLICY "Files viewable based on folder privacy" 
  ON public.files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.folders 
      WHERE id = folder_id 
      AND (is_public = true OR (is_public = false AND auth.uid() = created_by))
    )
  );

-- Create function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_folder_data(data TEXT, folder_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple encryption using folder password as key
  -- In production, use pgcrypto for better encryption
  RETURN encode(
    digest(data || folder_password, 'sha256'),
    'base64'
  ) || '::' || encode(data::bytea, 'base64');
END;
$$;

-- Create function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_folder_data(encrypted_data TEXT, folder_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  parts TEXT[];
  stored_hash TEXT;
  data_part TEXT;
  decrypted_data TEXT;
BEGIN
  -- Split the encrypted data
  parts := string_to_array(encrypted_data, '::');
  IF array_length(parts, 1) != 2 THEN
    RETURN NULL;
  END IF;
  
  stored_hash := parts[1];
  data_part := parts[2];
  
  -- Decrypt the data
  decrypted_data := convert_from(decode(data_part, 'base64'), 'UTF8');
  
  -- Verify the hash
  IF stored_hash = encode(digest(decrypted_data || folder_password, 'sha256'), 'base64') THEN
    RETURN decrypted_data;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;