
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 dark:bg-secondary/40 dark:border-secondary"
      />
      <Button type="submit" disabled={!message.trim()} className="dark:hover:bg-primary/80">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
