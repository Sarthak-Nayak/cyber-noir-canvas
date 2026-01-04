import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TavernMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  color?: string;
}

export const useTavernChat = () => {
  const [messages, setMessages] = useState<TavernMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('tavern_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Subscribe to new messages via Realtime
  useEffect(() => {
    const channel = supabase
      .channel('tavern-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tavern_messages',
        },
        (payload) => {
          const newMessage = payload.new as TavernMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = useCallback(async (content: string, userId: string) => {
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from('tavern_messages')
        .insert({
          user_id: userId,
          content: content.trim(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
