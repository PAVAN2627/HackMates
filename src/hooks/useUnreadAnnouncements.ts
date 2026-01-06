import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

export function useUnreadAnnouncements() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<any[]>([]);
  const { user } = useAuth();

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

        // Filter out read announcements
        const readAnnouncementIds = JSON.parse(
          localStorage.getItem(`readAnnouncements_${user.uid}`) || '[]'
        );
        
        const unreadAnnouncementsData = announcementsData.filter(
          announcement => !readAnnouncementIds.includes(announcement.id)
        );

        setUnreadAnnouncements(unreadAnnouncementsData);
        setUnreadCount(unreadAnnouncementsData.length);
      } catch (error) {
        console.error('Error loading unread announcements:', error);
        setUnreadCount(0);
        setUnreadAnnouncements([]);
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      const allAnnouncementIds = unreadAnnouncements.map(a => a.id);
      const existingReadIds = JSON.parse(
        localStorage.getItem(`readAnnouncements_${user.uid}`) || '[]'
      );
      
      const updatedReadIds = [...new Set([...existingReadIds, ...allAnnouncementIds])];
      localStorage.setItem(`readAnnouncements_${user.uid}`, JSON.stringify(updatedReadIds));
      
      setUnreadCount(0);
      setUnreadAnnouncements([]);
    } catch (error) {
      console.error('Error marking announcements as read:', error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user?.uid) return;

    try {
      const existingReadIds = JSON.parse(
        localStorage.getItem(`readAnnouncements_${user.uid}`) || '[]'
      );
      
      if (!existingReadIds.includes(announcementId)) {
        const updatedReadIds = [...existingReadIds, announcementId];
        localStorage.setItem(`readAnnouncements_${user.uid}`, JSON.stringify(updatedReadIds));
        
        setUnreadAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        setUnreadCount(prev => Math.max(0, prev - 1));
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