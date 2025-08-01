
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { FolderPlus, Shield, Lock, Globe } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import FileUpload from '@/components/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CreateFolder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [folderData, setFolderData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [isPublic, setIsPublic] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFolderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create folders");
      return;
    }
    
    if (!folderData.name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    if (folderData.password !== folderData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (folderData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please add at least one file");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create folder in database
      const { data: folder, error: folderError } = await supabase
        .from('folders')
        .insert({
          name: folderData.name,
          password: folderData.password,
          created_by: user.id,
          is_public: isPublic
        })
        .select()
        .single();

      if (folderError) throw folderError;

      // Upload files to storage and create file records
      const fileRecords = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${folder.id}/${Date.now()}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('folder-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create file record
        fileRecords.push({
          folder_id: folder.id,
          name: file.name,
          size: file.size,
          type: file.type,
          storage_path: fileName
        });
      }

      // Insert file records
      const { error: filesError } = await supabase
        .from('files')
        .insert(fileRecords);

      if (filesError) throw filesError;

      toast.success("Folder created successfully!");
      navigate("/my-folders");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <FolderPlus className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Create New Folder</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Secure Folder</CardTitle>
            <CardDescription>
              Create a password-protected folder to secure your files
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Secure Folder"
                  required
                  value={folderData.name}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground">
                  Choose a descriptive name for your folder
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Folder Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      value={folderData.password}
                      onChange={handleChange}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    value={folderData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This password will be required to access the folder's contents
              </p>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isPublic ? <Globe className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">
                      {isPublic ? "Public Folder" : "Private Folder"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPublic 
                        ? "Anyone can access this folder with the password" 
                        : "Only you can access this folder"
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <FileUpload 
                onFilesChange={handleFilesChange}
                maxFiles={20}
                className="pt-4"
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Folder..." : "Create Secure Folder"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateFolder;
