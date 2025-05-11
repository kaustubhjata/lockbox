
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageProps {
  message: {
    id: string;
    userId: string;
    username: string;
    text: string;
    timestamp: string;
    isFolderShare?: boolean;
    folderData?: {
      name: string;
      password: string;
    };
  };
  isCurrentUser: boolean;
}

const ChatMessage = ({ message, isCurrentUser }: ChatMessageProps) => {
  const navigate = useNavigate();
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRandomColor = (userId: string) => {
    // Generate a deterministic but seemingly random color based on user id
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Avoid too light colors on white background
    const h = hash % 360;
    return `hsl(${h}, 70%, 40%)`;
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] ${isCurrentUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary'
        } rounded-lg p-3 shadow`}
      >
        {!isCurrentUser && (
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: getRandomColor(message.userId) }}
            >
              {message.username.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-sm">
              {message.username}
            </span>
          </div>
        )}
        
        {message.isFolderShare && message.folderData ? (
          <div className="bg-background/20 p-3 rounded-md backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="h-4 w-4" />
              <span className="font-bold">Shared Folder</span>
            </div>
            <div className="space-y-1 text-sm">
              <div><strong>Name:</strong> {message.folderData.name}</div>
              <div><strong>Password:</strong> {message.folderData.password}</div>
              <Button 
                size="sm" 
                variant={isCurrentUser ? "secondary" : "default"} 
                className="mt-2 w-full"
                onClick={() => {
                  navigate('/access-folder');
                }}
              >
                Access Folder
              </Button>
            </div>
          </div>
        ) : (
          <p>{message.text}</p>
        )}
        
        <div className="text-xs opacity-70 mt-1 text-right">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
