import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, X, File, Image } from 'lucide-react';
import { toast } from 'sonner';

interface FileWithPreview {
  file: File;
  preview?: string;
}

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesChange, 
  maxFiles = 10, 
  acceptedTypes = "*/*",
  className = "" 
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    if (newFiles.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more files can be added (max ${maxFiles})`);
    }

    const filesWithPreview = filesToAdd.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    const updatedFiles = [...files, ...filesWithPreview];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>Upload Files</Label>
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {files.length}/{maxFiles} files selected
          </p>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept={acceptedTypes}
            disabled={files.length >= maxFiles}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={files.length >= maxFiles}
          >
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({files.length})</Label>
          <div className="rounded-md border border-border divide-y max-h-60 overflow-y-auto">
            {files.map((fileWithPreview, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3 truncate">
                  <div className="flex-shrink-0 w-10 h-10">
                    {fileWithPreview.preview ? (
                      <div className="h-10 w-10 rounded bg-background/50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={fileWithPreview.preview} 
                          alt={fileWithPreview.file.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                        {fileWithPreview.file.type.startsWith('image/') ? (
                          <Image className="h-5 w-5" />
                        ) : (
                          <File className="h-5 w-5" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{fileWithPreview.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileWithPreview.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;