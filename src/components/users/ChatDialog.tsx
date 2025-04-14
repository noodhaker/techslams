
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { fetchMessages, sendMessage } from '@/api/messages';
import { supabase } from '@/integrations/supabase/client';
import { MessageDB } from '@/types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toast } from '@/components/ui/use-toast';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

const ChatDialog = ({ isOpen, onClose, receiverId, receiverName }: ChatDialogProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user?.id || !receiverId) return;

    const loadMessages = async () => {
      setLoading(true);
      const fetchedMessages = await fetchMessages(user.id, receiverId);
      setMessages(fetchedMessages);
      setLoading(false);
    };

    loadMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${receiverId}),and(sender_id=eq.${receiverId},receiver_id=eq.${user.id}))`,
        },
        (payload) => {
          const newMessage = payload.new as MessageDB;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user?.id, receiverId]);

  const handleSendMessage = async (content: string) => {
    if (!user?.id) return;

    try {
      const sentMessage = await sendMessage(user.id, receiverId, content);
      if (!sentMessage) {
        toast({
          title: "Failed to send message",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat with {receiverName}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <MessageList 
            messages={messages} 
            otherUserName={receiverName} 
          />
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={loading || !user?.id} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
