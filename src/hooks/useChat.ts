import { useState, useEffect, useRef, useCallback } from 'react';
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

interface ProfileCache {
  [key: string]: {
    name: string;
    avatar: string | null;
    timestamp: number;
  };
}

// Global profile cache shared across hooks
const globalProfileCache: ProfileCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache (reduced for faster updates)

// Function to clear cache for a specific user
export function clearChatProfileCache(uid?: string) {
  if (uid) {
    delete globalProfileCache[uid];
  } else {
    Object.keys(globalProfileCache).forEach(key => delete globalProfileCache[key]);
  }
}

export function useChat(hackathonId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const profileCacheRef = useRef<ProfileCache>(globalProfileCache);
  const rawMessagesRef = useRef<any[]>([]);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { uid, profile: updatedProfile } = event.detail;
      if (uid && updatedProfile) {
        // Update the cache immediately
        profileCacheRef.current[uid] = {
          name: updatedProfile.name || 'Unknown',
          avatar: updatedProfile.avatar || null,
          timestamp: Date.now()
        };
        globalProfileCache[uid] = profileCacheRef.current[uid];
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  // Function to get profile from cache or fetch directly from Firestore (like TeamDetails.tsx)
  const getProfile = useCallback(async (authorId: string): Promise<{ name: string; avatar: string | null }> => {
    const now = Date.now();
    
    // Check cache first (with short TTL)
    const cached = profileCacheRef.current[authorId];
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return { name: cached.name, avatar: cached.avatar };
    }

    // Always fetch from Firestore for most up-to-date data (like TeamDetails.tsx pattern)
    try {
      const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, authorId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        const profileData = { 
          name: data.name || 'Unknown', 
          avatar: data.avatar || null 
        };
        // Cache the result
        profileCacheRef.current[authorId] = { ...profileData, timestamp: now };
        globalProfileCache[authorId] = { ...profileData, timestamp: now };
        return profileData;
      }
    } catch (error) {
      console.error('Error fetching author profile:', error);
    }

    return { name: 'Unknown', avatar: null };
  }, []);

  // Function to enrich messages with profile data
  const enrichMessagesWithProfiles = useCallback(async (messagesData: any[]) => {
    // Get unique author IDs
    const authorIds = [...new Set(messagesData.map(m => m.authorId))];
    
    // Fetch all profiles in parallel
    const profiles = await Promise.all(
      authorIds.map(async (authorId) => {
        const profile = await getProfile(authorId);
        return { authorId, ...profile };
      })
    );

    // Create a map for quick lookup
    const profileMap = profiles.reduce((acc, p) => {
      acc[p.authorId] = { name: p.name, avatar: p.avatar };
      return acc;
    }, {} as { [key: string]: { name: string; avatar: string | null } });

    // Enrich messages
    return messagesData.map(message => ({
      ...message,
      authorName: profileMap[message.authorId]?.name || 'Unknown',
      authorAvatar: profileMap[message.authorId]?.avatar || null,
    }));
  }, [getProfile]);

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
            editedAt: data.editedAt?.toDate?.() || null,
          });
        });

        // Sort messages by creation time (oldest first for chat display)
        messagesData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        rawMessagesRef.current = messagesData;

        // Enrich with profile data
        const enrichedMessages = await enrichMessagesWithProfiles(messagesData);
        setMessages(enrichedMessages);
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
  }, [hackathonId, enrichMessagesWithProfiles]);

  // Update messages when profile cache is invalidated
  useEffect(() => {
    if (rawMessagesRef.current.length > 0) {
      // Re-enrich messages with fresh profile data
      enrichMessagesWithProfiles(rawMessagesRef.current).then(setMessages);
    }
  }, [enrichMessagesWithProfiles]);

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
