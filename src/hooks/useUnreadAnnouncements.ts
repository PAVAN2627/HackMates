import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

export function useUnreadAnnouncements() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<any[]>([]);
  const { user } = useAuth();

  // Clear state when user changes or logs out
  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      setUnreadAnnouncements([]);
      return;
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      setUnreadAnnouncements([]);
      return;
    }

    // Listen to all announcements and filter by joined hackathons
    const q = query(
      collection(db, COLLECTIONS.ANNOUNCEMENTS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const announcementsData: any[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const announcement: any = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          };

          // Check if user is a member of this hackathon
          try {
            const hackathonDoc = await getDoc(doc(db, COLLECTIONS.HACKATHONS, announcement.hackathonId));
            if (hackathonDoc.exists()) {
              const hackathonData = hackathonDoc.data();
              const teamMembers = hackathonData.teamMembers || [];
              
              // Only include announcements from hackathons the user has joined
              // and exclude announcements created by the user themselves
              if (teamMembers.includes(user.uid) && announcement.authorId !== user.uid) {
                // Get hackathon title
                announcement.hackathonTitle = hackathonData.title || 'Unknown Hackathon';
                
                // Get author name
                try {
                  const authorDoc = await getDoc(doc(db, COLLECTIONS.USERS, announcement.authorId));
                  if (authorDoc.exists()) {
                    announcement.authorName = authorDoc.data()?.name || 'Unknown';
                  }
                } catch (error) {
                  announcement.authorName = 'Unknown';
                }
                
                announcementsData.push(announcement);
              }
            }
          } catch (error) {
            console.error('Error checking hackathon membership:', error);
          }
        }

        // Filter out read announcements - always get fresh from localStorage
        let readAnnouncementIds: string[] = [];
        try {
          const stored = localStorage.getItem(`readAnnouncements_${user.uid}`);
          readAnnouncementIds = stored ? JSON.parse(stored) : [];
          console.log('Loading announcements - Read IDs from localStorage:', readAnnouncementIds);
        } catch (error) {
          console.error('Error reading localStorage:', error);
          readAnnouncementIds = [];
          // Clear corrupted localStorage
          localStorage.removeItem(`readAnnouncements_${user.uid}`);
        }
        
        const unreadAnnouncementsData = announcementsData.filter(
          announcement => !readAnnouncementIds.includes(announcement.id)
        );

        console.log('Total announcements:', announcementsData.length, 'Unread:', unreadAnnouncementsData.length);
        setUnreadAnnouncements(unreadAnnouncementsData);
        setUnreadCount(unreadAnnouncementsData.length);
      } catch (error) {
        console.error('Error loading unread announcements:', error);
        setUnreadCount(0);
        setUnreadAnnouncements([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      const allAnnouncementIds = unreadAnnouncements.map(a => a.id);
      if (allAnnouncementIds.length === 0) return;
      
      // Get existing read IDs
      let existingReadIds: string[] = [];
      try {
        const stored = localStorage.getItem(`readAnnouncements_${user.uid}`);
        existingReadIds = stored ? JSON.parse(stored) : [];
      } catch (error) {
        existingReadIds = [];
      }
      
      const updatedReadIds = [...new Set([...existingReadIds, ...allAnnouncementIds])];
      localStorage.setItem(`readAnnouncements_${user.uid}`, JSON.stringify(updatedReadIds));
      
      // Update state immediately
      setUnreadCount(0);
      setUnreadAnnouncements([]);
    } catch (error) {
      console.error('Error marking announcements as read:', error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user?.uid || !announcementId) return;

    try {
      console.log('Marking announcement as read:', announcementId, 'for user:', user.uid);
      
      // Get existing read IDs
      let existingReadIds: string[] = [];
      try {
        const stored = localStorage.getItem(`readAnnouncements_${user.uid}`);
        existingReadIds = stored ? JSON.parse(stored) : [];
        console.log('Existing read IDs:', existingReadIds);
      } catch (error) {
        existingReadIds = [];
      }
      
      if (!existingReadIds.includes(announcementId)) {
        const updatedReadIds = [...existingReadIds, announcementId];
        localStorage.setItem(`readAnnouncements_${user.uid}`, JSON.stringify(updatedReadIds));
        console.log('Updated read IDs:', updatedReadIds);
        
        // Update state immediately
        setUnreadAnnouncements(prev => {
          const filtered = prev.filter(a => a.id !== announcementId);
          console.log('Updated unread announcements count:', filtered.length);
          return filtered;
        });
        setUnreadCount(prev => {
          const newCount = Math.max(0, prev - 1);
          console.log('Updated unread count:', newCount);
          return newCount;
        });
      } else {
        console.log('Announcement already marked as read');
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  return { 
    unreadCount, 
    unreadAnnouncements, 
    markAllAsRead, 
    markAsRead
  };
}