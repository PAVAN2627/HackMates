import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

export interface Announcement {
  id: string;
  hackathonId: string;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string | null;
}

export function useAnnouncements(hackathonId: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!hackathonId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.ANNOUNCEMENTS),
      where('hackathonId', '==', hackathonId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
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

        // Fetch author details for each announcement
        const announcementsWithDetails = await Promise.all(
          announcementsData.map(async (announcement) => {
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
            };
          })
        );

        // Sort by pinned status first, then by creation date
        const sortedAnnouncements = announcementsWithDetails.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return b.isPinned ? 1 : -1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setAnnouncements(sortedAnnouncements);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error in announcements listener:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [hackathonId]);

  const createAnnouncement = async (title: string, content: string) => {
    if (!user || !title.trim() || !content.trim()) return;

    try {
      await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
        hackathonId,
        title: title.trim(),
        content: content.trim(),
        authorId: user.uid,
        isPinned: false,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };

  return {
    announcements,
    loading,
    createAnnouncement,
  };
}
