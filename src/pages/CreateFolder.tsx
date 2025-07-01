
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FolderPlus, UploadCloud, Shield } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
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
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFolderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
          created_by: user.id
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

              <div className="space-y-2 pt-4">
                <Label>Upload Files</Label>
                <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                  <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <Input
                    id="files"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('files')?.click()}
                  >
                    Select Files
                  </Button>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({files.length})</Label>
                  <div className="rounded-md border border-border divide-y">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-2 truncate">
                          <div className="flex-shrink-0 w-10">
                            {file.type.startsWith('image/') ? (
                              <div className="h-10 w-10 rounded bg-background/50 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={file.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                                <span className="text-xs uppercase font-medium">
                                  {file.name.split('.').pop()?.substring(0, 3) || '???'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
