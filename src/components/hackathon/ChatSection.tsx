import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageContextMenu } from '@/components/MessageContextMenu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/hooks/useChat';
import { LinkRenderer } from '@/lib/linkDetector';
import { AvatarUpload } from '@/components/AvatarUpload';
import { toast } from 'sonner';

interface ChatSectionProps {
  messages: ChatMessage[];
  onSendMessage?: (content: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onProfileClick?: (userId: string, userName: string) => void;
  loading?: boolean;
  hackathon?: {
    id: string;
    teamMembers?: string[];
    creatorId: string;
    status?: 'open' | 'closed';
  };
}

export function ChatSection({ messages, onSendMessage, onEditMessage, onDeleteMessage, onProfileClick, loading, hackathon }: ChatSectionProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    messageId: string;
    messageContent: string;
    position: { x: number; y: number };
    isOwnMessage: boolean;
  }>({
    isOpen: false,
    messageId: '',
    messageContent: '',
    position: { x: 0, y: 0 },
    isOwnMessage: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Check if user is a member of the hackathon
  const isHackathonMember = user && hackathon && (
    hackathon.teamMembers?.includes(user.uid) || 
    hackathon.creatorId === user.uid
  );

  // Check if hackathon is closed
  const isHackathonClosed = hackathon?.status === 'closed';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim() && onSendMessage) {
      setIsSending(true);
      try {
        await onSendMessage(newMessage);
        setNewMessage('');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMessageLongPress = (messageId: string, messageContent: string, isOwnMessage: boolean, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      messageId,
      messageContent,
      position: { x: event.clientX, y: event.clientY },
      isOwnMessage,
    });
  };

  const handleMessageEdit = async (newContent: string) => {
    if (onEditMessage) {
      try {
        await onEditMessage(contextMenu.messageId, newContent);
        toast.success('Message edited successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to edit message');
      }
    }
  };

  const handleMessageDelete = async () => {
    if (onDeleteMessage) {
      try {
        await onDeleteMessage(contextMenu.messageId);
        toast.success('Message deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete message');
      }
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl flex flex-col h-[500px] animate-pulse">
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.authorId === user?.uid;
            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  isOwn && 'flex-row-reverse'
                )}
              >
                <div className="flex-shrink-0">
                  <AvatarUpload 
                    currentAvatar={message.authorAvatar || null}
                    userName={message.authorName || 'Unknown'}
                    size="sm"
                    editable={false}
                  />
                </div>
                <div className={cn(
                  'max-w-[70%]',
                  isOwn && 'text-right'
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => onProfileClick?.(message.authorId, message.authorName || 'Unknown')}
                      className={cn(
                        'text-xs font-medium hover:underline transition-colors',
                        isOwn ? 'text-primary' : 'text-foreground hover:text-primary'
                      )}
                    >
                      {message.authorName || 'Unknown'}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const date = new Date(message.createdAt);
                          if (isNaN(date.getTime())) return 'now';
                          return date.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch {
                          return 'now';
                        }
                      })()}
                    </span>
                  </div>
                  <div className={cn(
                    'rounded-2xl px-4 py-2 inline-block cursor-pointer select-none',
                    isOwn 
                      ? 'bg-primary text-primary-foreground rounded-tr-md' 
                      : 'bg-muted rounded-tl-md'
                  )}
                  onContextMenu={(e) => handleMessageLongPress(message.id, message.content, isOwn, e)}
                  onClick={(e) => {
                    // Handle long press on mobile (touch and hold)
                    let pressTimer: NodeJS.Timeout;
                    const startPress = () => {
                      pressTimer = setTimeout(() => {
                        handleMessageLongPress(message.id, message.content, isOwn, e);
                      }, 500);
                    };
                    const endPress = () => {
                      clearTimeout(pressTimer);
                    };
                    
                    // Add touch event listeners for mobile
                    const element = e.currentTarget;
                    element.addEventListener('touchstart', startPress);
                    element.addEventListener('touchend', endPress);
                    element.addEventListener('touchcancel', endPress);
                    
                    // Cleanup listeners
                    setTimeout(() => {
                      element.removeEventListener('touchstart', startPress);
                      element.removeEventListener('touchend', endPress);
                      element.removeEventListener('touchcancel', endPress);
                    }, 100);
                  }}
                  >
                    <div className="text-sm">
                      <LinkRenderer 
                        text={message.content} 
                        isOwnMessage={isOwn}
                      />
                      {message.edited && (
                        <span className="text-xs opacity-70 ml-2">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {user ? (
          isHackathonMember ? (
            isHackathonClosed ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  This hackathon has been closed by the creator.
                </p>
                <p className="text-xs text-muted-foreground">
                  No new messages can be sent.
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button onClick={handleSend} disabled={!newMessage.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Only hackathon members can send messages in this chat.
              </p>
              <p className="text-xs text-muted-foreground">
                Join the hackathon to participate in the discussion.
              </p>
            </div>
          )
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Please sign in to participate in the chat
          </p>
        )}
      </div>

      {/* Message Context Menu */}
      <MessageContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onEdit={handleMessageEdit}
        onDelete={handleMessageDelete}
        messageContent={contextMenu.messageContent}
        position={contextMenu.position}
        isOwnMessage={contextMenu.isOwnMessage}
      />
    </div>
  );
}
