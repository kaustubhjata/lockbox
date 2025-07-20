
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Download, FileText, Image, File, ArrowLeft, 
  Copy, Share2, Lock, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
}

interface Folder {
  id: string;
  name: string;
  password: string;
  created_at: string;
  created_by: string;
  is_public: boolean;
  files: FileItem[];
}

const FolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchFolder = async () => {
      if (!folderId) return;
      
      try {
        const { data: folderData, error: folderError } = await supabase
          .from('folders')
          .select(`
            id,
            name,
            password,
            created_at,
            created_by,
            is_public,
            files (
              id,
              name,
              size,
              type,
              storage_path
            )
          `)
          .eq('id', folderId)
          .single();

        if (folderError) throw folderError;

        if (!folderData) {
          toast.error("Folder not found");
          navigate('/dashboard');
          return;
        }

        // Check if user has access to this folder
        const isCreator = user && folderData.created_by === user.id;
        const canAccess = folderData.is_public || isCreator;
        
        if (!canAccess) {
          toast.error("This folder is private and you don't have access");
          navigate('/dashboard');
          return;
        }
        
        setFolder(folderData as Folder);
        
        // Auto-authenticate if user is the creator
        if (isCreator) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching folder:', error);
        toast.error('Failed to load folder');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolder();
  }, [folderId, navigate, user]);

  const handleAuthenticate = () => {
    if (folder && password === folder.password) {
      setAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const copyFolderDetails = () => {
    if (!folder) return;
    
    const text = `Folder: ${folder.name}\nPassword: ${folder.password}\n\nAccess this folder on LockBox Global!`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Folder details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy folder details');
    });
  };

  const downloadFile = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('folder-files')
        .download(file.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('text/')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container px-4 py-6 mx-auto max-w-5xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-[400px] bg-muted rounded w-full mt-6"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!folder) {
    return (
      <AppLayout>
        <div className="container px-4 py-6 mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Folder Not Found</h1>
          <p className="mb-6">The folder you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container px-4 py-6 mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Button 
                asChild 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <Link to="/my-folders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold">{folder.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-10">
              {folder.files.length} files • Created on {new Date(folder.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyFolderDetails}
              title="Copy folder details"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyFolderDetails}
              title="Share folder"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {authenticated ? (
          <div className="space-y-6">
            {/* Folder password display */}
            <Card className="p-4 bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Folder Password</p>
                    <p className="text-sm text-muted-foreground">
                      {passwordVisible ? folder.password : "••••••••"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </Card>
            
            {/* Files list */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Files</h2>
              
              <div className="bg-background border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 p-3 font-medium text-sm text-muted-foreground border-b">
                  <div>Type</div>
                  <div>Name</div>
                  <div className="hidden md:block">Size</div>
                  <div>Action</div>
                </div>
                
                <div className="divide-y">
                  {folder.files.map((file, index) => (
                    <div key={index} className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 p-3 items-center">
                      <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="hidden md:block text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => downloadFile(file)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-6 max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Password Protected</h2>
            <p className="text-muted-foreground text-center mb-4">
              Enter the password to access this folder's contents
            </p>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter folder password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
              />
              <Button className="w-full" onClick={handleAuthenticate}>
                Access Folder
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default FolderView;
