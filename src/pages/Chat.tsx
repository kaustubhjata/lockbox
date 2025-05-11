
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Share2, Folder, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
}

const Chat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [online, setOnline] = useState(Math.floor(Math.random() * 5) + 5); // Random 5-10 users
  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || user.email.split('@')[0],
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setMessage('');
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
              <Dialog open={shareFolderOpen} onOpenChange={setShareFolderOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    disabled={folders.length === 0}
                  >
                    <Share2 className="h-4 w-4" />
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
                            onClick={() => shareFolder(folder)}
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
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] ${msg.userId === user?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary'
                    } rounded-lg p-3 shadow`}
                  >
                    {msg.userId !== user?.id && (
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: getRandomColor(msg.userId) }}
                        >
                          {msg.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">
                          {msg.username}
                        </span>
                      </div>
                    )}
                    
                    {msg.isFolderShare && msg.folderData ? (
                      <div className="bg-background/20 p-3 rounded-md backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Folder className="h-4 w-4" />
                          <span className="font-bold">Shared Folder</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Name:</strong> {msg.folderData.name}</div>
                          <div><strong>Password:</strong> {msg.folderData.password}</div>
                          <Button 
                            size="sm" 
                            variant={msg.userId === user?.id ? "secondary" : "default"} 
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
                      <p>{msg.text}</p>
                    )}
                    
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <div className="border-t p-3">
            <form 
              className="flex gap-2" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Chat;
