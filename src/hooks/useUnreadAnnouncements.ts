import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc, getDocs, where } from 'firebase/firestore';

export function useUnreadAnnouncements() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      setUnreadAnnouncements([]);
      setLoading(false);
      return;
    }

    // Listen to all announcements
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

        // Check which announcements are read by this user
        const readAnnouncementIds: string[] = [];
        try {
          const readQuery = query(
            collection(db, 'readAnnouncements'),
            where('userId', '==', user.uid)
          );
          const readSnapshot = await getDocs(readQuery);
          readSnapshot.forEach(doc => {
            readAnnouncementIds.push(doc.data().announcementId);
          });
        } catch (error) {
          console.error('Error fetching read announcements:', error);
        }

        // Filter out read announcements
        const unreadAnnouncementsData = announcementsData.filter(
          announcement => !readAnnouncementIds.includes(announcement.id)
        );

        setUnreadAnnouncements(unreadAnnouncementsData);
        setUnreadCount(unreadAnnouncementsData.length);
        setLoading(false);
      } catch (error) {
        console.error('Error loading unread announcements:', error);
        setUnreadCount(0);
        setUnreadAnnouncements([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const markAsRead = useCallback(async (announcementId: string) => {
    if (!user?.uid || !announcementId) return;

    try {
      // Create a document in readAnnouncements collection
      const readDocId = `${user.uid}_${announcementId}`;
      await setDoc(doc(db, 'readAnnouncements', readDocId), {
        userId: user.uid,
        announcementId: announcementId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  }, [user?.uid]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid || unreadAnnouncements.length === 0) return;

    try {
      const promises = unreadAnnouncements.map(announcement => 
        markAsRead(announcement.id)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
    }
  }, [user?.uid, unreadAnnouncements, markAsRead]);

  return { 
    unreadCount, 
    unreadAnnouncements, 
    loading,
    markAllAsRead, 
    markAsRead
  };
}