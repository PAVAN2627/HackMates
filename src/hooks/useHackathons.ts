import { useState, useEffect, useCallback } from 'react';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { Hackathon, HackathonChatMessage } from '@/types';

export function useHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Check cache first for faster initial load
    const cachedHackathons = localStorage.getItem('hackathons_cache');
    if (cachedHackathons) {
      try {
        const cached = JSON.parse(cachedHackathons);
        setHackathons(cached);
        setLoading(false);
      } catch (e) {
        localStorage.removeItem('hackathons_cache');
      }
    }

    const q = query(
      collection(db, COLLECTIONS.HACKATHONS), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hackathonsData: Hackathon[] = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          // Handle deleted hackathons - they will be automatically removed from the array
          console.log('Hackathon deleted:', change.doc.id);
        }
      });
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        hackathonsData.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || undefined,
        } as Hackathon);
      });
      
      setHackathons(hackathonsData);
      setLoading(false);
      
      // Cache for faster future loads (cache for 5 minutes)
      localStorage.setItem('hackathons_cache', JSON.stringify(hackathonsData));
      localStorage.setItem('hackathons_cache_time', Date.now().toString());
    }, (error) => {
      console.error('Error loading hackathons:', error);
      setLoading(false);
    });

    // Clear old cache (older than 5 minutes)
    const cacheTime = localStorage.getItem('hackathons_cache_time');
    if (cacheTime && Date.now() - parseInt(cacheTime) > 5 * 60 * 1000) {
      localStorage.removeItem('hackathons_cache');
      localStorage.removeItem('hackathons_cache_time');
    }

    return unsubscribe;
  }, []);

  const createHackathon = useCallback(async (hackathonData: Omit<Hackathon, 'id' | 'createdAt' | 'creatorId' | 'creatorName' | 'creatorAvatar' | 'teamMembers' | 'generalChat'>) => {
    if (!user || !profile) throw new Error('Must be logged in');

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.HACKATHONS), {
        ...hackathonData,
        creatorId: user.uid,
        creatorName: profile.name,
        creatorAvatar: profile.avatar,
        teamMembers: [user.uid],
        generalChat: [],
        createdAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create hackathon');
    }
  }, [user, profile]);

  const updateHackathon = useCallback(async (hackathonId: string, updates: Partial<Hackathon>) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      await updateDoc(hackathonRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      
      // Clear cache to force refresh
      localStorage.removeItem('hackathons_cache');
      localStorage.removeItem('hackathons_cache_time');
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update hackathon');
    }
  }, [user]);

  const deleteHackathon = useCallback(async (hackathonId: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      await deleteDoc(hackathonRef);
      
      // Clear cache to force refresh
      localStorage.removeItem('hackathons_cache');
      localStorage.removeItem('hackathons_cache_time');
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete hackathon');
    }
  }, [user]);

  const updateHackathonStatus = useCallback(async (hackathonId: string, status: 'open' | 'closed') => {
    if (!user) throw new Error('Must be logged in');

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      await updateDoc(hackathonRef, {
        status,
        updatedAt: Timestamp.now(),
      });
      
      // Clear cache to force refresh
      localStorage.removeItem('hackathons_cache');
      localStorage.removeItem('hackathons_cache_time');
      
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update hackathon status');
    }
  }, [user]);

  const closeHackathon = useCallback(async (hackathonId: string) => {
    return updateHackathonStatus(hackathonId, 'closed');
  }, [updateHackathonStatus]);

  const addChatMessage = useCallback(async (hackathonId: string, message: Omit<HackathonChatMessage, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      const hackathonSnap = await getDocs(query(collection(db, COLLECTIONS.HACKATHONS), where('__name__', '==', hackathonId)));
      
      if (hackathonSnap.empty) throw new Error('Hackathon not found');

      const hackathonData = hackathonSnap.docs[0].data();
      const currentChat = hackathonData.generalChat || [];
      
      const newMessage: HackathonChatMessage = {
        id: `msg_${Date.now()}`,
        ...message,
        createdAt: new Date(),
      };

      await updateDoc(hackathonRef, {
        generalChat: [...currentChat, newMessage],
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message');
    }
  }, [user]);

  const joinHackathon = useCallback(async (hackathonId: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      const hackathonSnap = await getDocs(query(collection(db, COLLECTIONS.HACKATHONS), where('__name__', '==', hackathonId)));
      
      if (hackathonSnap.empty) throw new Error('Hackathon not found');

      const hackathonData = hackathonSnap.docs[0].data();
      
      // Check if hackathon is closed
      if (hackathonData.status === 'closed') {
        throw new Error('Cannot join a closed hackathon');
      }
      
      const currentMembers = hackathonData.teamMembers || [];
      
      if (!currentMembers.includes(user.uid)) {
        await updateDoc(hackathonRef, {
          teamMembers: [...currentMembers, user.uid],
        });
        
        // Clear cache to force refresh
        localStorage.removeItem('hackathons_cache');
        localStorage.removeItem('hackathons_cache_time');
      } else {
        throw new Error('You are already a member of this hackathon');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to join hackathon');
    }
  }, [user]);

  const leaveHackathon = useCallback(async (hackathonId: string) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      const hackathonSnap = await getDocs(query(collection(db, COLLECTIONS.HACKATHONS), where('__name__', '==', hackathonId)));
      
      if (hackathonSnap.empty) throw new Error('Hackathon not found');

      const hackathonData = hackathonSnap.docs[0].data();
      
      // Check if hackathon is closed
      if (hackathonData.status === 'closed') {
        throw new Error('Cannot leave a closed hackathon');
      }
      
      const currentMembers = hackathonData.teamMembers || [];
      
      if (currentMembers.includes(user.uid)) {
        await updateDoc(hackathonRef, {
          teamMembers: currentMembers.filter((memberId: string) => memberId !== user.uid),
        });
        
        // Clear cache to force refresh
        localStorage.removeItem('hackathons_cache');
        localStorage.removeItem('hackathons_cache_time');
      } else {
        throw new Error('You are not a member of this hackathon');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to leave hackathon');
    }
  }, [user]);

  const getHackathonById = useCallback((hackathonId: string) => {
    return hackathons.find(h => h.id === hackathonId);
  }, [hackathons]);

  const filterBySkills = useCallback((skills: string[]) => {
    return hackathons.filter(h => 
      h.requiredSkills?.some(skill => skills.includes(skill))
    );
  }, [hackathons]);

  const filterByMode = useCallback((mode: 'online' | 'in-person' | 'both') => {
    return hackathons.filter(h => h.mode === mode || h.mode === 'both');
  }, [hackathons]);

  const filterByStatus = useCallback((status: 'open' | 'closed') => {
    return hackathons.filter(h => h.status === status);
  }, [hackathons]);

  return {
    hackathons,
    loading,
    createHackathon,
    updateHackathon,
    updateHackathonStatus,
    closeHackathon,
    deleteHackathon,
    addChatMessage,
    joinHackathon,
    leaveHackathon,
    getHackathonById,
    filterBySkills,
    filterByMode,
    filterByStatus,
  };
}

export function useHackathon(id: string) {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, COLLECTIONS.HACKATHONS, id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHackathon({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || undefined,
        } as Hackathon);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id]);

  return { hackathon, loading };
}
