import { useState, useEffect, useCallback } from 'react';
import { db, COLLECTIONS } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { UserProfile } from '@/types';

export function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any cached profile data on mount
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('profile_cache_') || key.startsWith('profiles_cache')
    );
    cacheKeys.forEach(key => localStorage.removeItem(key));

    // Use createdAt for ordering since all profiles have this field
    const q = query(
      collection(db, COLLECTIONS.USERS), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profilesData: UserProfile[] = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          // Profile removed
        } else if (change.type === 'modified') {
          // Profile updated
        }
      });
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Ensure we have required fields
        if (data.name && data.email) {
          profilesData.push({
            id: docSnap.id,
            uid: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
            skills: data.skills || [],
            interests: data.interests || [],
          } as UserProfile);
        }
      });
      
      setProfiles(profilesData);
      setLoading(false);
      
      // Cache profiles for 2 minutes only
      const cacheData = {
        profiles: profilesData,
        timestamp: Date.now()
      };
      localStorage.setItem('profiles_cache', JSON.stringify(cacheData));
    }, (error) => {
      console.error('Error loading profiles:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getProfileById = useCallback((userId: string) => {
    const profile = profiles.find(p => p.id === userId || p.uid === userId);
    
    // If profile not found in current list, try to get from cache but mark as potentially stale
    if (!profile) {
      try {
        const cached = localStorage.getItem(`profile_cache_${userId}`);
        if (cached) {
          const cachedProfile = JSON.parse(cached);
          const cacheAge = Date.now() - (cachedProfile.cacheTime || 0);
          
          // Only use cache if less than 1 minute old
          if (cacheAge < 60000) {
            return cachedProfile;
          } else {
            localStorage.removeItem(`profile_cache_${userId}`);
          }
        }
      } catch (error) {
        console.error('Error reading cached profile:', error);
      }
    }
    
    return profile;
  }, [profiles]);

  const refreshProfiles = useCallback(() => {
    // Clear cache and force refresh
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('profile_cache_') || key.startsWith('profiles_cache')
    );
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    setLoading(true);
    // The onSnapshot listener will automatically refresh the data
  }, []);

  const searchByName = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return profiles.filter(p => 
      p.name?.toLowerCase().includes(term) ||
      p.bio?.toLowerCase().includes(term)
    );
  }, [profiles]);

  const filterBySkills = useCallback((skills: string[]) => {
    if (skills.length === 0) return profiles;
    return profiles.filter(p => 
      p.skills?.some(skill => skills.includes(skill))
    );
  }, [profiles]);

  const filterByLocation = useCallback((location: string) => {
    return profiles.filter(p => p.location === location);
  }, [profiles]);

  const filterByAvailability = useCallback((availability: 'online' | 'in-person' | 'both') => {
    return profiles.filter(p => 
      p.availableFor === availability || p.availableFor === 'both'
    );
  }, [profiles]);

  const filterByCollege = useCallback((college: string) => {
    return profiles.filter(p => p.college === college);
  }, [profiles]);

  const advancedSearch = useCallback((filters: {
    name?: string;
    skills?: string[];
    location?: string;
    availability?: 'online' | 'in-person' | 'both';
    college?: string;
    lookingForTeam?: boolean;
  }) => {
    let filtered = profiles;

    if (filters.name) {
      const term = filters.name.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term)
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(p => 
        p.skills?.some(skill => filters.skills!.includes(skill))
      );
    }

    if (filters.location) {
      filtered = filtered.filter(p => p.location === filters.location);
    }

    if (filters.availability) {
      filtered = filtered.filter(p => 
        p.availableFor === filters.availability || p.availableFor === 'both'
      );
    }

    if (filters.college) {
      filtered = filtered.filter(p => p.college === filters.college);
    }

    if (filters.lookingForTeam !== undefined) {
      filtered = filtered.filter(p => p.lookingForTeam === filters.lookingForTeam);
    }

    return filtered;
  }, [profiles]);

  const getSuggestions = useCallback((userSkills: string[], limit = 5) => {
    return profiles
      .filter(p => p.skills?.some(skill => userSkills.includes(skill)))
      .slice(0, limit);
  }, [profiles]);

  return {
    profiles,
    loading,
    getProfileById,
    refreshProfiles,
    searchByName,
    filterBySkills,
    filterByLocation,
    filterByAvailability,
    filterByCollege,
    advancedSearch,
    getSuggestions,
  };
}
