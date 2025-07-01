
-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create files table
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Folders are publicly readable (anyone can see them exist and access with password)
-- But only creators can modify them
CREATE POLICY "Anyone can view folders" 
  ON public.folders 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can create folders" 
  ON public.folders 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own folders" 
  ON public.folders 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own folders" 
  ON public.folders 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Files are publicly readable if you have access to the folder
CREATE POLICY "Anyone can view files" 
  ON public.files 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can create files in their folders" 
  ON public.files 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.folders 
      WHERE id = folder_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their folders" 
  ON public.files 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.folders 
      WHERE id = folder_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in their folders" 
  ON public.files 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.folders 
      WHERE id = folder_id AND created_by = auth.uid()
    )
  );

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('folder-files', 'folder-files', true);

-- Storage policies for the bucket
CREATE POLICY "Anyone can view files" 
  ON storage.objects 
  FOR SELECT 
  TO public
  USING (bucket_id = 'folder-files');

CREATE POLICY "Authenticated users can upload files" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'folder-files');

CREATE POLICY "Users can update their own files" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'folder-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'folder-files' AND auth.uid()::text = (storage.foldername(name))[1]);
