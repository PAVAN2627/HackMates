import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UserProfileModal } from '@/components/UserProfileModal';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const { messages, sendMessage, markAsRead, markConversationAsRead, getConversation, getConversationList, loading: messagesLoading } = useDirectMessages();
  const { getProfileById, loading: profilesLoading } = useProfiles();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<{ id: string; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle URL parameter for direct conversation
  useEffect(() => {
    const withUserId = searchParams.get('with');
    if (withUserId && withUserId !== selectedConversation) {
      setSelectedConversation(withUserId);
    }
  }, [searchParams, selectedConversation]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation, user, markConversationAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  const conversations = getConversationList();
  const selectedMessages = selectedConversation ? getConversation(selectedConversation) : [];
  const selectedUserProfile = selectedConversation ? getProfileById(selectedConversation) : null;

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user || !profile) {
      toast.error('Invalid message or conversation');
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(selectedConversation, messageText, profile.name, profile.avatar);
      setMessageText('');
      toast.success('Message sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleProfileClick = (userId: string, userName: string) => {
    setProfileModalUser({ id: userId, name: userName });
    setProfileModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-border bg-card flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold">Messages</h2>
            <p className="text-sm text-muted-foreground">Direct conversations</p>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {messagesLoading || profilesLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-pulse">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>No conversations yet</p>
                <p className="text-xs mt-2">Start by messaging someone from the Profiles page</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherUserId = conv.senderId === user.uid ? conv.recipientId : conv.senderId;
                const otherUser = getProfileById(otherUserId);
                const unreadCount = messages.filter(m => 
                  m.recipientId === user.uid && m.senderId === otherUserId && !m.read
                ).length;

                return (
                  <button
                    key={otherUserId}
                    onClick={() => setSelectedConversation(otherUserId)}
                    className={`conversation-item w-full p-4 border-b border-border text-left hover:bg-accent transition-colors ${
                      selectedConversation === otherUserId ? 'selected' : ''
                    } ${unreadCount > 0 ? 'unread' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {otherUser?.avatar ? (
                        <div className="relative">
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-transparent"
                          />
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-transparent">
                            <span className="text-primary font-semibold text-lg">
                              {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                            {otherUser?.name || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(conv.createdAt).toLocaleDateString('en-IN', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {conv.senderId === user.uid ? 'You: ' : ''}{conv.content}
                          </p>
                          {conv.senderId === user.uid && (
                            <div className="flex-shrink-0 ml-2">
                              {conv.read ? (
                                <CheckCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <Check className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                        {otherUser?.college && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {otherUser.college}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="hidden md:flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => selectedUserProfile && handleProfileClick(selectedConversation, selectedUserProfile.name)}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {selectedUserProfile?.avatar ? (
                    <img
                      src={selectedUserProfile.avatar}
                      alt={selectedUserProfile.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <span className="text-primary font-semibold text-lg">
                        {selectedUserProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <button
                    onClick={() => selectedUserProfile && handleProfileClick(selectedConversation, selectedUserProfile.name)}
                    className="text-left hover:opacity-80 transition-opacity"
                  >
                    <h2 className="font-semibold text-lg">{selectedUserProfile?.name || 'Unknown User'}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {selectedUserProfile?.college && (
                        <span>{selectedUserProfile.college}</span>
                      )}
                      {selectedUserProfile?.location && selectedUserProfile?.college && (
                        <span>•</span>
                      )}
                      {selectedUserProfile?.location && (
                        <span>{selectedUserProfile.location}</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                selectedMessages.map(msg => {
                  const isCurrentUser = msg.senderId === user.uid;
                  const senderProfile = isCurrentUser ? profile : getProfileById(msg.senderId);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <button
                          onClick={() => senderProfile && handleProfileClick(msg.senderId, senderProfile.name)}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          {senderProfile?.avatar ? (
                            <img
                              src={senderProfile.avatar}
                              alt={senderProfile.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-xs">
                                {senderProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </button>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
                        <div
                          className={`message-bubble px-4 py-3 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-1 px-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isCurrentUser && (
                            <div className="flex items-center">
                              {msg.read ? (
                                <CheckCheck className="w-3 h-3 text-primary" />
                              ) : (
                                <Check className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {isCurrentUser && (
                        <div className="flex-shrink-0 order-2">
                          {profile?.avatar ? (
                            <img
                              src={profile.avatar}
                              alt={profile.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-xs">
                                {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !messageText.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        userId={profileModalUser?.id || null}
        userName={profileModalUser?.name || ''}
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setProfileModalUser(null);
        }}
        onSendMessage={(userId) => {
          setSelectedConversation(userId);
          setProfileModalOpen(false);
          setProfileModalUser(null);
        }}
      />
    </div>
  );
}