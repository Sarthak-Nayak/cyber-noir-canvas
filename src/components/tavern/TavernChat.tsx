import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTavernChat } from '@/hooks/useTavernChat';

interface TavernChatProps {
  isConnected: boolean;
  myId: string;
  myUsername: string;
  myColor: string;
  onlineCount: number;
}

const TavernChat = ({ isConnected, myId, myUsername, myColor, onlineCount }: TavernChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sendMessage } = useTavernChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected) return;
    
    try {
      await sendMessage(inputValue, myId);
      setInputValue('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed right-6 bottom-6 z-40 p-4 rounded-full glass-panel border border-primary/30 hover:border-primary/60 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        }}
      >
        <MessageSquare className="w-6 h-6 text-primary" />
        {messages.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-mono">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-6 bottom-24 z-40 w-80 h-[500px] glass-panel border border-primary/30 rounded-lg overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-primary/20 bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground">Global Tavern</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {isConnected ? (
                      <Wifi className="w-3 h-3 text-green-400" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-destructive" />
                    )}
                    <Users className="w-3 h-3" />
                    <span>{onlineCount}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground text-sm">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs">Be the first to speak!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMe = message.user_id === myId;
                    return (
                      <motion.div
                        key={message.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span 
                          className="text-xs font-mono mb-1"
                          style={{ color: isMe ? myColor : '#888' }}
                        >
                          {isMe ? myUsername : `User_${message.user_id.slice(0, 4)}`}
                        </span>
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                            isMe 
                              ? 'bg-primary/20 border border-primary/40' 
                              : 'bg-muted/50 border border-muted'
                          }`}
                        >
                          {message.content}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-primary/20 bg-card/50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isConnected ? "Type a message..." : "Not connected..."}
                  disabled={!isConnected}
                  className="flex-1 bg-background/50 border-primary/30 focus:border-primary"
                />
                <Button
                  onClick={handleSend}
                  disabled={!isConnected || !inputValue.trim()}
                  size="icon"
                  className="bg-primary/20 hover:bg-primary/40 border border-primary/40"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TavernChat;
