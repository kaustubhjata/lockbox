
import React from 'react';
import { Folder, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Folder {
  id: string;
  name: string;
  password: string;
  createdBy?: string;
}

interface ShareFolderDialogProps {
  folders: Folder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShareFolder: (folder: Folder) => void;
}

const ShareFolderDialog = ({ folders, open, onOpenChange, onShareFolder }: ShareFolderDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={folders.length === 0}
        >
          <Folder className="h-4 w-4" />
          <span>Share Folder</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share a Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-4">
            Select a folder to share in the global chat:
          </p>
          {folders.length > 0 ? (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {folders.map((folder) => (
                <Card 
                  key={folder.id}
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => onShareFolder(folder)}
                >
                  <CardContent className="flex items-center p-3 gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{folder.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span>{folder.password.replace(/./g, '•')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              You haven't created any folders yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFolderDialog;
