
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageDB } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  messages: MessageDB[];
  otherUserName: string;
}

const MessageList = ({ messages, otherUserName }: MessageListProps) => {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
      <div className="space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">No messages yet. Start a conversation with {otherUserName}.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser ? 'bg-tech-primary text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${isCurrentUser ? 'text-tech-light' : 'text-gray-500'}`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
