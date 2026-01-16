import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

export interface TeamChatMessage {
  id: string;
  teamId: string;
  hackathonId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: Date;
  edited?: boolean;
}

export function useTeamChat(hackathonId: string, teamId: string) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!hackathonId || !teamId) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, COLLECTIONS.TEAM_CHAT);
    const q = query(
      messagesRef,
      where('hackathonId', '==', hackathonId),
      where('teamId', '==', teamId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const messagesData: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messagesData.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        });

        // Fetch author details for each message
        const messagesWithDetails = await Promise.all(
          messagesData.map(async (message) => {
            let authorName = 'Unknown';
            let authorAvatar = null;
            
            try {
              const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, message.authorId));
              if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                authorName = profileData.name || 'Unknown';
                authorAvatar = profileData.avatar || null;
              }
            } catch (error) {
              console.error('Error fetching author profile:', error);
            }

            return {
              ...message,
              authorName,
              authorAvatar,
            };
          })
        );

        setMessages(messagesWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team chat messages:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error in team chat listener:', error);
      // Try without orderBy if index doesn't exist
      const simpleQuery = query(
        messagesRef,
        where('hackathonId', '==', hackathonId),
        where('teamId', '==', teamId)
      );
      
      const unsubscribeSimple = onSnapshot(simpleQuery, async (snapshot) => {
        const messagesData: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          messagesData.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        });

        // Sort manually
        messagesData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        // Fetch author details
        const messagesWithDetails = await Promise.all(
          messagesData.map(async (message) => {
            let authorName = 'Unknown';
            let authorAvatar = null;
            
            try {
              const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, message.authorId));
              if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                authorName = profileData.name || 'Unknown';
                authorAvatar = profileData.avatar || null;
              }
            } catch (error) {
              console.error('Error fetching author profile:', error);
            }

            return {
              ...message,
              authorName,
              authorAvatar,
            };
          })
        );

        setMessages(messagesWithDetails);
        setLoading(false);
      });

      return unsubscribeSimple;
    });

    return unsubscribe;
  }, [hackathonId, teamId]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      await addDoc(collection(db, COLLECTIONS.TEAM_CHAT), {
        hackathonId,
        teamId,
        content: content.trim(),
        authorId: user.uid,
        createdAt: Timestamp.now(),
        edited: false,
      });
    } catch (error) {
      console.error('Error sending team chat message:', error);
      throw error;
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;

    try {
      const messageRef = doc(db, COLLECTIONS.TEAM_CHAT, messageId);
      await updateDoc(messageRef, {
        content: newContent.trim(),
        edited: true,
        editedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error editing team chat message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const messageRef = doc(db, COLLECTIONS.TEAM_CHAT, messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting team chat message:', error);
      throw error;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
