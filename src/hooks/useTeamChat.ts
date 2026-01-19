import { useState, useEffect, useRef, useCallback } from 'react';
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

interface ProfileCache {
  [key: string]: {
    name: string;
    avatar: string | null;
    timestamp: number;
  };
}

// Global profile cache to persist across component instances
const globalProfileCache: ProfileCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache (reduced for faster updates)

// Function to clear cache for a specific user
export function clearProfileCache(uid?: string) {
  if (uid) {
    delete globalProfileCache[uid];
  } else {
    Object.keys(globalProfileCache).forEach(key => delete globalProfileCache[key]);
  }
}

export function useTeamChat(hackathonId: string, teamId: string) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
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

    const processSnapshot = async (snapshot: any) => {
      try {
        const messagesData: any[] = [];
        snapshot.forEach((docSnap: any) => {
          const data = docSnap.data();
          messagesData.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          });
        });

        rawMessagesRef.current = messagesData;
        
        // Enrich with profile data
        const enrichedMessages = await enrichMessagesWithProfiles(messagesData);
        setMessages(enrichedMessages);
        setLoading(false);
      } catch (error) {
        console.error('Error processing team chat messages:', error);
        setLoading(false);
      }
    };

    const unsubscribe = onSnapshot(q, processSnapshot, (error) => {
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
        
        rawMessagesRef.current = messagesData;
        
        // Enrich with profile data
        const enrichedMessages = await enrichMessagesWithProfiles(messagesData);
        setMessages(enrichedMessages);
        setLoading(false);
      });

      return unsubscribeSimple;
    });

    return unsubscribe;
  }, [hackathonId, teamId, enrichMessagesWithProfiles]);

  // Update messages when profile cache is invalidated
  useEffect(() => {
    if (rawMessagesRef.current.length > 0) {
      // Re-enrich messages with fresh profile data
      enrichMessagesWithProfiles(rawMessagesRef.current).then(setMessages);
    }
  }, [enrichMessagesWithProfiles]);

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
