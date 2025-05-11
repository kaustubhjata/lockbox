
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Search, FolderPlus, Eye, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Folder {
  id: string;
  name: string;
  password: string;
  files: {
    name: string;
    size: number;
    type: string;
    url?: string;
  }[];
  createdAt: string;
  createdBy: string;
}

const MyFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we're using localStorage
        const storedFolders = localStorage.getItem('folders');
        const parsedFolders = storedFolders ? JSON.parse(storedFolders) : [];
        
        // Filter to only show the current user's folders
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        const userFolders = parsedFolders.filter((folder: Folder) => folder.createdBy === userId);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        
        setFolders(userFolders);
        setFilteredFolders(userFolders);
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to load folders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = folders.filter(folder => 
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFolders(filtered);
    } else {
      setFilteredFolders(folders);
    }
  }, [searchTerm, folders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const copyFolderDetails = (folder: Folder) => {
    const text = `Folder: ${folder.name}\nPassword: ${folder.password}\n\nAccess this folder on LockBox Global!`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Folder details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy folder details');
    });
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Folders</h1>
            <p className="text-muted-foreground">
              Manage your secure folders and files
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button asChild>
              <Link to="/create-folder" className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                <span>Create Folder</span>
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => (
              <Card key={folder.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 truncate">
                      <Folder className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Created on {formatDate(folder.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p><strong>{folder.files.length}</strong> files</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {folder.files.slice(0, 3).map((file, index) => (
                        <div 
                          key={index} 
                          className="text-xs bg-secondary px-2 py-1 rounded-full whitespace-nowrap"
                        >
                          {file.name.length > 15 ? `${file.name.substring(0, 12)}...` : file.name}
                        </div>
                      ))}
                      {folder.files.length > 3 && (
                        <div className="text-xs bg-secondary px-2 py-1 rounded-full">
                          +{folder.files.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex w-full gap-2">
                    <Button asChild variant="default" className="flex-1">
                      <Link to={`/folder/${folder.id}`} className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyFolderDetails(folder)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyFolderDetails(folder)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="w-full text-xs text-center text-muted-foreground">
                    Password: {folder.password.replace(/./g, '•')}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <FolderPlus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No folders found</h3>
              {searchTerm ? (
                <p className="text-muted-foreground mb-4">
                  No folders match your search criteria. Try a different search term.
                </p>
              ) : (
                <p className="text-muted-foreground mb-4">
                  You haven't created any secure folders yet.
                </p>
              )}
              <Button asChild>
                <Link to="/create-folder">Create a Folder</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default MyFolders;
