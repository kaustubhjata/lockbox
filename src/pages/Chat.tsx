
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ChatMessageList from '@/components/chat/ChatMessageList';
import MessageInput from '@/components/chat/MessageInput';
import ShareFolderDialog from '@/components/chat/ShareFolderDialog';

interface ChatMessage {
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
}

interface Folder {
  id: string;
  name: string;
  password: string;
  createdBy?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [online, setOnline] = useState(Math.floor(Math.random() * 5) + 5); // Random 5-10 users
  const [shareFolderOpen, setShareFolderOpen] = useState(false);

  // Load messages from localStorage
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error('Error parsing stored messages', error);
      }
    } else {
      // Add some initial messages if no messages exist
      const initialMessages: ChatMessage[] = [
        {
          id: '1',
          userId: 'system',
          username: 'System',
          text: 'Welcome to LockBox Global Chat!',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'system',
          username: 'System',
          text: 'You can use this chat to communicate with other users and share folder access credentials.',
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(initialMessages);
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
    }

    // Load user's folders
    const loadFolders = () => {
      const storedFolders = localStorage.getItem('folders');
      if (storedFolders && user) {
        try {
          const allFolders: Folder[] = JSON.parse(storedFolders);
          const userFolders = allFolders.filter(folder => folder.createdBy === user.id);
          setFolders(userFolders);
        } catch (error) {
          console.error('Error loading folders', error);
        }
      }
    };

    loadFolders();
  }, [user]);

  const handleSendMessage = (message: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || user.email.split('@')[0],
      text: message,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
  };

  const shareFolder = (folder: Folder) => {
    if (!user) return;

    const shareMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || user.email.split('@')[0],
      text: `I'm sharing a folder with everyone!`,
      timestamp: new Date().toISOString(),
      isFolderShare: true,
      folderData: {
        name: folder.name,
        password: folder.password,
      },
    };

    const updatedMessages = [...messages, shareMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setShareFolderOpen(false);
    toast.success('Folder shared in chat');
  };

  return (
    <AppLayout>
      <div className="container px-4 py-6 mx-auto max-w-5xl h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Global Chat</h1>
            <p className="text-muted-foreground">
              Chat with other users and share folder access
            </p>
          </div>
          
          <div className="flex items-center gap-1 bg-primary/10 py-1 px-3 rounded-full">
            <div className="h-2 w-2 bg-secure-500 rounded-full"></div>
            <span className="text-sm font-medium">{online} users online</span>
          </div>
        </div>
        
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Global Chat Room</span>
              <ShareFolderDialog
                folders={folders}
                open={shareFolderOpen}
                onOpenChange={setShareFolderOpen}
                onShareFolder={shareFolder}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3">
            <ChatMessageList messages={messages} />
          </CardContent>
          <div className="border-t p-3">
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Chat;
