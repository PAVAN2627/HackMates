import { useState } from 'react';
import { Bell, X, MessageCircle, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUnreadAnnouncements } from '@/hooks/useUnreadAnnouncements';
import { useProfiles } from '@/hooks/useProfiles';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, markConversationAsRead } = useDirectMessages();
  const { unreadCount: unreadAnnouncementsCount, unreadAnnouncements, markAsRead } = useUnreadAnnouncements();
  const { getProfileById } = useProfiles();

  // Get unread messages
  const unreadMessages = messages.filter(m => 
    m.recipientId === user?.uid && !m.read
  );

  // Group unread messages by sender
  const unreadBySender = unreadMessages.reduce((acc, message) => {
    const senderId = message.senderId;
    if (!acc[senderId]) {
      acc[senderId] = [];
    }
    acc[senderId].push(message);
    return acc;
  }, {} as Record<string, typeof unreadMessages>);

  const totalUnreadCount = unreadMessages.length + unreadAnnouncementsCount;

  const handleMessageClick = async (senderId: string) => {
    // Mark messages as read before navigating
    await markConversationAsRead(senderId);
    navigate(`/messages?with=${senderId}`);
    setIsOpen(false);
  };

  const handleAnnouncementClick = async (announcementId: string) => {
    try {
      // Mark announcement as read and wait for it to complete
      await markAsRead(announcementId);
      // Small delay to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/announcements');
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      // Still navigate even if marking as read fails
      navigate('/announcements');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-5 w-5" />
        {totalUnreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-sm">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {totalUnreadCount === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Unread Announcements */}
                {unreadAnnouncements.map((announcement) => (
                  <div
                    key={`announcement-${announcement.id}`}
                    onClick={() => handleAnnouncementClick(announcement.id)}
                    className="p-4 hover:bg-muted transition-colors cursor-pointer border-l-4 border-l-orange-500/20 hover:border-l-orange-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border-2 border-orange-500/20">
                          <Megaphone className="h-5 w-5 text-orange-500" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              New Announcement
                            </p>
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                              New
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Megaphone className="h-3 w-3 text-orange-500" />
                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                          </div>
                        </div>
                        
                        <p className="text-sm text-foreground line-clamp-1 mb-1 font-medium">
                          {announcement.title}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            From: {announcement.authorName} • {announcement.hackathonTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(announcement.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Unread Messages */}
                {Object.entries(unreadBySender).map(([senderId, senderMessages]) => {
                  const senderProfile = getProfileById(senderId);
                  const latestMessage = senderMessages[0]; // Most recent message
                  
                  return (
                    <div
                      key={`message-${senderId}`}
                      onClick={() => handleMessageClick(senderId)}
                      className="p-4 hover:bg-muted transition-colors cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {senderProfile?.avatar ? (
                            <img
                              src={senderProfile.avatar}
                              alt={senderProfile.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                              <span className="text-primary font-semibold text-sm">
                                {senderProfile?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {senderProfile?.name || 'Unknown User'}
                              </p>
                              {senderMessages.length > 1 && (
                                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 font-medium">
                                  {senderMessages.length} new
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3 text-primary" />
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            </div>
                          </div>
                          
                          <p className="text-sm text-foreground line-clamp-2 mb-2 font-medium">
                            {latestMessage.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {new Date(latestMessage.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {senderProfile?.college && (
                              <p className="text-xs text-muted-foreground truncate max-w-24">
                                {senderProfile.college}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {totalUnreadCount > 0 && (
            <div className="p-3 border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                {unreadMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate('/messages');
                      setIsOpen(false);
                    }}
                    className="text-xs"
                  >
                    View Messages
                  </Button>
                )}
                {unreadAnnouncementsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigate('/announcements');
                      setIsOpen(false);
                    }}
                    className="text-xs"
                  >
                    View Announcements
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
