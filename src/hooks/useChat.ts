import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  hackathonId: string;
  content: string;
  authorId: string;
  messageType: 'text' | 'image' | 'link';
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string | null;
}

export function useChat(hackathonId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!hackathonId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.HACKATHON_CHAT),
      where('hackathonId', '==', hackathonId)
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

        // Sort messages by creation time (oldest first for chat display)
        messagesWithDetails.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setMessages(messagesWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error in chat listener:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [hackathonId]);

  const addMessage = async (content: string, messageType: 'text' | 'image' | 'link' = 'text') => {
    if (!user) throw new Error('Must be logged in');

    try {
      await addDoc(collection(db, COLLECTIONS.HACKATHON_CHAT), {
        hackathonId,
        content,
        authorId: user.uid,
        messageType,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const sendMessage = async (content: string) => {
    return addMessage(content, 'text');
  };

  return {
    messages,
    loading,
    addMessage,
    sendMessage,
  };
}
