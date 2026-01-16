import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp, doc, getDoc, writeBatch } from 'firebase/firestore';

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
  readBy?: string[];
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
      // Get hackathon details to fetch team members
      const hackathonDoc = await getDoc(doc(db, COLLECTIONS.HACKATHONS, hackathonId));
      if (!hackathonDoc.exists()) {
        throw new Error('Hackathon not found');
      }

      const hackathonData = hackathonDoc.data();
      const hackathonTitle = hackathonData.title || 'Hackathon';
      const teamMembers = hackathonData.teamMembers || [];
      const authorName = user.displayName || 'Organizer';

      // Create the announcement
      await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
        hackathonId,
        title: title.trim(),
        content: content.trim(),
        authorId: user.uid,
        isPinned: false,
        createdAt: Timestamp.now(),
      });

      // Create notifications for all team members (except the author)
      const batch = writeBatch(db);
      const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

      teamMembers.forEach((memberId: string) => {
        if (memberId !== user.uid) {
          const notifRef = doc(notificationsRef);
          batch.set(notifRef, {
            userId: memberId,
            type: 'announcement',
            title: 'New Announcement',
            message: `${authorName} posted: "${title}"`,
            read: false,
            hackathonId,
            hackathonTitle,
            announcementTitle: title,
            createdAt: new Date()
          });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  };

  const updateAnnouncement = async (announcementId: string, title: string, content: string) => {
    if (!user || !title.trim() || !content.trim()) return;

    try {
      const announcementRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
      await updateDoc(announcementRef, {
        title: title.trim(),
        content: content.trim(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!user) return;

    try {
      const announcementRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId);
      await deleteDoc(announcementRef);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  };

  return {
    announcements,
    loading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
