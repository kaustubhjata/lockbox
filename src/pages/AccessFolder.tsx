
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Key, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Folder {
  id: string;
  name: string;
  password: string;
}

const AccessFolder = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [folderData, setFolderData] = useState({
    name: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFolderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // Here we're using localStorage for the demo
      const storedFolders = localStorage.getItem('folders');
      const folders: Folder[] = storedFolders ? JSON.parse(storedFolders) : [];
      
      // Find folder by name and check password
      const folder = folders.find(f => f.name.toLowerCase() === folderData.name.toLowerCase());
      
      if (!folder) {
        toast.error("Folder not found");
        return;
      }
      
      if (folder.password !== folderData.password) {
        toast.error("Incorrect password");
        return;
      }
      
      toast.success("Access granted!");
      navigate(`/folder/${folder.id}`);
    } catch (error) {
      console.error("Error accessing folder:", error);
      toast.error("Failed to access folder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 mx-auto max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Access Folder</h1>
        <p className="text-muted-foreground text-center mb-8">
          Enter the folder name and password to access shared files
        </p>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Enter Folder Credentials</CardTitle>
              <CardDescription>
                This information was shared with you by the folder owner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    className="pl-10"
                    placeholder="Enter the exact folder name"
                    required
                    value={folderData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Folder Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    className="pl-10"
                    placeholder="Enter the folder password"
                    required
                    value={folderData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying Access..." : "Access Folder"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need access to a folder? Ask the folder owner to share the credentials with you.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AccessFolder;
