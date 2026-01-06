import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  hackathonId: string;
  content: string;
  authorId: string;
  messageType: 'text' | 'image' | 'link';
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string | null;
  edited?: boolean;
  editedAt?: Date;
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
              editedAt: message.editedAt?.toDate?.() || null,
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

  const deleteMessage = async (messageId: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      // Check if the message belongs to the current user
      const message = messages.find(m => m.id === messageId);
      if (!message || message.authorId !== user.uid) {
        throw new Error('You can only delete your own messages');
      }

      const messageRef = doc(db, COLLECTIONS.HACKATHON_CHAT, messageId);
      await deleteDoc(messageRef);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete message');
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      // Check if the message belongs to the current user
      const message = messages.find(m => m.id === messageId);
      if (!message || message.authorId !== user.uid) {
        throw new Error('You can only edit your own messages');
      }

      const messageRef = doc(db, COLLECTIONS.HACKATHON_CHAT, messageId);
      await updateDoc(messageRef, { 
        content: newContent,
        edited: true,
        editedAt: Timestamp.now()
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to edit message');
    }
  };

  return {
    messages,
    loading,
    addMessage,
    sendMessage,
    deleteMessage,
    editMessage,
  };
}
