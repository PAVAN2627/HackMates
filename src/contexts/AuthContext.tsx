import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, COLLECTIONS } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { performanceMonitor } from '@/lib/performance';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (userData: Omit<UserProfile, 'id' | 'uid' | 'createdAt'> & { password: string; confirmPassword: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        
        // If user logged out (firebaseUser is null)
        if (!firebaseUser) {
          // Clear previous user's localStorage data if we had a user before
          if (user?.uid) {
            localStorage.removeItem(`readAnnouncements_${user.uid}`);
            localStorage.removeItem(`profile_cache_${user.uid}`);
            localStorage.removeItem(`profile_backup_${user.uid}`);
          }
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        // If user changed (different user logged in)
        if (user && firebaseUser.uid !== user.uid) {
          // Clear previous user's localStorage data
          localStorage.removeItem(`readAnnouncements_${user.uid}`);
          localStorage.removeItem(`profile_cache_${user.uid}`);
          localStorage.removeItem(`profile_backup_${user.uid}`);
        }
        
        setUser(firebaseUser);
        setLoading(false);
        
        // Load profile in background
        loadUserProfile(firebaseUser.uid);
      } catch (authError) {
        console.error('Auth state change error:', authError);
        setError('Authentication error occurred');
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  const loadUserProfile = async (uid: string) => {
    try {
      // Check localStorage first for faster loading
      const cachedProfile = localStorage.getItem(`profile_cache_${uid}`);
      if (cachedProfile) {
        try {
          const cached = JSON.parse(cachedProfile);
          setProfile(cached);
        } catch (e) {
          localStorage.removeItem(`profile_cache_${uid}`);
        }
      }

      // Then load from Firebase with performance tracking
      const profileDoc = await performanceMonitor.trackFirebaseOperation(
        () => getDoc(doc(db, COLLECTIONS.USERS, uid)),
        'Load User Profile',
        8000
      );
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        let profileData = {
          ...data,
          id: uid,
          uid: uid,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as UserProfile;
        
        // Check for local backup data
        try {
          const backup = localStorage.getItem(`profile_backup_${uid}`);
          if (backup) {
            const backupData = JSON.parse(backup);
            const backupTime = new Date(backupData.updatedAt);
            const firebaseTime = data.updatedAt?.toDate?.() || new Date(0);
            
            if (backupTime > firebaseTime) {
              profileData = { ...profileData, ...backupData };
            }
          }
        } catch (backupError) {
          console.log('Error reading backup data:', backupError);
        }
        
        setProfile(profileData);
        
        // Cache the profile for faster future loads
        localStorage.setItem(`profile_cache_${uid}`, JSON.stringify(profileData));
      }
    } catch (profileError) {
      console.error('Error fetching profile:', profileError);
      // Don't set error - user is still authenticated
    }
  };

  const signUp = async (userData: Omit<UserProfile, 'id' | 'uid' | 'createdAt'> & { password: string; confirmPassword: string }) => {
    const { email, password, confirmPassword, ...profileData } = userData;

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
        ...profileData,
        email,
        avatar: profileData.avatar || '',
        linkedin: profileData.linkedin || '',
        github: profileData.github || '',
        portfolio: profileData.portfolio || '',
        experience: profileData.experience || 'Beginner',
        interests: profileData.interests || [],
        gender: profileData.gender || 'prefer-not-to-say',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lookingForTeam: true,
        createdAt: Timestamp.now(),
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const currentUserId = user?.uid;
      
      // Clear all user-specific localStorage data before signing out
      if (currentUserId) {
        // Clear announcement read status
        localStorage.removeItem(`readAnnouncements_${currentUserId}`);
        // Clear profile cache
        localStorage.removeItem(`profile_cache_${currentUserId}`);
        localStorage.removeItem(`profile_backup_${currentUserId}`);
      }
      
      // Clear profile state immediately
      setProfile(null);
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      // Update local state immediately first
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Then try to update Firebase
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...updates,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      
    } catch (error: any) {
      console.error('AuthContext updateProfile error:', error);
      // Even if Firebase fails, keep the local state updated
      // Don't throw error so the UI update still works
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
