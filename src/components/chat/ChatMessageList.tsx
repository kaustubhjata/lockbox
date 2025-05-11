
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatMessage from './ChatMessage';

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

interface ChatMessageListProps {
  messages: ChatMessage[];
}

const ChatMessageList = ({ messages }: ChatMessageListProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <ChatMessage 
          key={msg.id} 
          message={msg} 
          isCurrentUser={msg.userId === user?.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
