import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Megaphone, Pin, Calendar, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { LinkRenderer } from '@/lib/linkDetector';
import { AvatarUpload } from '@/components/AvatarUpload';
import { RelativeTime, RelativeTimeTooltip } from '@/components/RelativeTime';
import { useUnreadAnnouncements } from '@/hooks/useUnreadAnnouncements';
import { Button } from '@/components/ui/button';

interface Announcement {
  id: string;
  hackathonId: string;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string | null;
  hackathonTitle?: string;
}

export default function Announcements() {
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAllAsRead, markAsRead, unreadAnnouncements } = useUnreadAnnouncements();

  // Check if an announcement is unread
  const isUnread = (announcementId: string) => {
    return unreadAnnouncements.some(a => a.id === announcementId);
  };

  useEffect(() => {
    if (!authLoading && user) {
      const unsubscribe = loadAnnouncements();
      return unsubscribe;
    }
  }, [authLoading, user]);

  const loadAnnouncements = () => {
    const q = query(collection(db, COLLECTIONS.ANNOUNCEMENTS), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, async (snapshot) => {
      try {
        const announcementsData: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          announcementsData.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        });

        // Fetch additional details for each announcement and filter by joined hackathons
        const announcementsWithDetails = await Promise.all(
          announcementsData.map(async (announcement) => {
            // Get hackathon details first to check if user is a member
            let hackathonTitle = 'Unknown Hackathon';
            let isUserMember = false;
            let hackathonExists = false;
            
            try {
              const hackathonDoc = await getDoc(doc(db, COLLECTIONS.HACKATHONS, announcement.hackathonId));
              if (hackathonDoc.exists()) {
                hackathonExists = true;
                const hackathonData = hackathonDoc.data();
                hackathonTitle = hackathonData.title || 'Unknown Hackathon';
                
                // Check if user is a member of this hackathon
                const teamMembers = hackathonData.teamMembers || [];
                isUserMember = teamMembers.includes(user?.uid);
              }
            } catch (error) {
              console.error('Error fetching hackathon:', error);
            }

            // Only process announcements from hackathons that exist and the user has joined
            if (!hackathonExists || !isUserMember) {
              return null;
            }

            // Get author profile
            let authorName = 'Unknown';
            let authorAvatar = null;
            try {
              const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, announcement.authorId));
              if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                authorName = profileData.name || 'Unknown';
                authorAvatar = profileData.avatar || null;
              }
            } catch (error) {
              console.error('Error fetching author profile:', error);
            }

            return {
              ...announcement,
              authorName,
              authorAvatar,
              hackathonTitle,
            };
          })
        );

        // Filter out null values (announcements from hackathons user hasn't joined or that don't exist)
        const filteredAnnouncements = announcementsWithDetails.filter(Boolean);

        // Sort announcements: pinned first, then by date (newest first)
        const sortedAnnouncements = filteredAnnouncements.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return b.isPinned ? 1 : -1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setAnnouncements(sortedAnnouncements);
        setLoading(false);
      } catch (error) {
        console.error('Error loading announcements:', error);
        setLoading(false);
      }
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-6 animate-pulse">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
            <div className="h-6 bg-muted rounded w-2/3 mb-3" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-primary" />
              My Announcements
            </h1>
            <p className="text-muted-foreground mt-1">
              Announcements from hackathons you've joined
            </p>
          </div>
          {unreadAnnouncements.length > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Mark All as Read ({unreadAnnouncements.length})
            </Button>
          )}
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Announcements Yet</h3>
          <p className="text-muted-foreground">
            Join hackathons to see announcements from their creators
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`glass rounded-xl p-6 hover:shadow-lg transition-all duration-200 relative ${
                announcement.isPinned 
                  ? 'border-2 border-primary/30 bg-primary/5' 
                  : 'hover:border-primary/20'
              } ${
                isUnread(announcement.id) 
                  ? 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10' 
                  : ''
              }`}
            >
              {/* Unread indicator and mark as read button */}
              {isUnread(announcement.id) && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                    New
                  </span>
                  <Button
                    onClick={() => markAsRead(announcement.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4 text-orange-600" />
                  </Button>
                </div>
              )}
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <AvatarUpload 
                  currentAvatar={announcement.authorAvatar || null}
                  userName={announcement.authorName}
                  size="md"
                  editable={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{announcement.authorName}</h4>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-primary font-medium">
                        {announcement.hackathonTitle}
                      </span>
                      {announcement.isPinned && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
                          <Pin className="h-3 w-3" />
                          <span className="text-xs font-medium">Pinned</span>
                        </div>
                      )}
                    </div>
                    <div title={RelativeTimeTooltip(announcement.createdAt.toISOString())} className="text-xs text-muted-foreground">
                      <RelativeTime timestamp={announcement.createdAt.toISOString()} format="full" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {(() => {
                        try {
                          return announcement.createdAt.toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch {
                          return 'Just now';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="ml-15">
                <h3 className="font-bold text-xl mb-3 text-primary">
                  {announcement.title}
                </h3>
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  <LinkRenderer text={announcement.content} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}