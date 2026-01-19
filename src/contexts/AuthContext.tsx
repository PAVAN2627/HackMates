import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, COLLECTIONS } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  signUpWithGoogle: (userData: Omit<UserProfile, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  completeGoogleSignUp: (userData: Omit<UserProfile, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
          // Clear previous user's cache data if we had a user before
          if (user?.uid) {
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
          // Clear previous user's cache data
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
      
      const profileToSave = {
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
      };

      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), profileToSave);
      
      // IMPORTANT: Cache the profile immediately for fast UI update
      const cachedProfile = {
        ...profileToSave,
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        createdAt: profileToSave.createdAt instanceof Timestamp ? profileToSave.createdAt.toDate() : new Date(),
      };
      localStorage.setItem(`profile_cache_${userCredential.user.uid}`, JSON.stringify(cachedProfile));
      
      // Update the context profile state immediately for instant UI update
      setProfile(cachedProfile as UserProfile);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signUpWithGoogle = async (userData: Omit<UserProfile, 'id' | 'uid' | 'createdAt'>) => {
    try {
      // Check if user is already authenticated from Google
      if (auth.currentUser) {
        // User already authenticated via Google on Auth page, just save profile
        const user = auth.currentUser;

        // Create the profile in Firestore
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
          ...userData,
          avatar: userData.avatar || user.photoURL || '',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          portfolio: userData.portfolio || '',
          experience: userData.experience || 'Beginner',
          interests: userData.interests || [],
          gender: userData.gender || 'prefer-not-to-say',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lookingForTeam: true,
          createdAt: Timestamp.now(),
        });
      } else {
        // This shouldn't happen in normal flow, but keep as fallback
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Create the profile in Firestore
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
          ...userData,
          avatar: userData.avatar || user.photoURL || '',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          portfolio: userData.portfolio || '',
          experience: userData.experience || 'Beginner',
          interests: userData.interests || [],
          gender: userData.gender || 'prefer-not-to-say',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lookingForTeam: true,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      }
      console.error('Google signup error:', error);
      throw new Error(error.message || 'Failed to complete registration');
    }
  };

  const completeGoogleSignUp = async (userData: Omit<UserProfile, 'id' | 'uid' | 'createdAt'>) => {
    try {
      // First check if user is currently authenticated
      if (auth.currentUser) {
        // User is logged in - use their UID
        const uid = auth.currentUser.uid;
        console.log('User is logged in. Saving profile for UID:', uid);
        
        const profileToSave = {
          ...userData,
          avatar: userData.avatar || auth.currentUser.photoURL || '',
          linkedin: userData.linkedin || '',
          github: userData.github || '',
          portfolio: userData.portfolio || '',
          experience: userData.experience || 'Beginner',
          interests: userData.interests || [],
          gender: userData.gender || 'prefer-not-to-say',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lookingForTeam: true,
          createdAt: Timestamp.now(),
        };

        console.log('Profile data to save:', profileToSave);
        
        await setDoc(doc(db, COLLECTIONS.USERS, uid), profileToSave);
        
        console.log('Profile saved successfully to Firestore');

        // IMPORTANT: Cache the profile immediately for fast UI update
        const cachedProfile = {
          ...profileToSave,
          id: uid,
          uid: uid,
          createdAt: profileToSave.createdAt instanceof Timestamp ? profileToSave.createdAt.toDate() : new Date(),
        };
        localStorage.setItem(`profile_cache_${uid}`, JSON.stringify(cachedProfile));
        
        // Update the context profile state immediately for instant UI update
        setProfile(cachedProfile as UserProfile);

        // Clear the session/storage data after successful signup
        sessionStorage.removeItem('googleUserData');
        sessionStorage.removeItem('signupMethod');
        localStorage.removeItem('pendingGoogleSignup');
        localStorage.removeItem('signupMethod');
        localStorage.removeItem('registrationComplete');
        localStorage.removeItem('newUserUID');

        console.log('Registration complete. User is authenticated and ready.');
        return;
      }

      // Fallback: Get UID from sessionStorage or localStorage
      let googleUserDataStr = sessionStorage.getItem('googleUserData');
      
      if (!googleUserDataStr) {
        googleUserDataStr = localStorage.getItem('pendingGoogleSignup');
      }

      console.log('Google signup data found:', !!googleUserDataStr);

      if (!googleUserDataStr) {
        throw new Error('User authentication data not found. Please sign in with Google first.');
      }

      const googleUserData = JSON.parse(googleUserDataStr);
      const uid = googleUserData.uid;
      
      console.log('Saving profile for UID:', uid);

      if (!uid) {
        throw new Error('User ID not found. Please sign in with Google first.');
      }

      // Create the profile in Firestore using the stored UID
      const profileToSave = {
        ...userData,
        avatar: userData.avatar || googleUserData.avatar || '',
        linkedin: userData.linkedin || '',
        github: userData.github || '',
        portfolio: userData.portfolio || '',
        experience: userData.experience || 'Beginner',
        interests: userData.interests || [],
        gender: userData.gender || 'prefer-not-to-say',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lookingForTeam: true,
        createdAt: Timestamp.now(),
      };

      console.log('Profile data to save:', profileToSave);
      
      await setDoc(doc(db, COLLECTIONS.USERS, uid), profileToSave);
      
      console.log('Profile saved successfully to Firestore');

      // IMPORTANT: Cache the profile immediately for fast UI update
      const cachedProfile = {
        ...profileToSave,
        id: uid,
        uid: uid,
        createdAt: profileToSave.createdAt instanceof Timestamp ? profileToSave.createdAt.toDate() : new Date(),
      };
      localStorage.setItem(`profile_cache_${uid}`, JSON.stringify(cachedProfile));
      
      // Update the context profile state immediately for instant UI update
      setProfile(cachedProfile as UserProfile);

      // Clear the session/storage data after successful signup
      sessionStorage.removeItem('googleUserData');
      sessionStorage.removeItem('signupMethod');
      localStorage.removeItem('pendingGoogleSignup');
      localStorage.removeItem('signupMethod');
      localStorage.removeItem('registrationComplete');
      localStorage.removeItem('newUserUID');

      console.log('Registration complete. User will be redirected to dashboard.');
    } catch (error: any) {
      console.error('Complete Google signup error:', error);
      throw new Error(error.message || 'Failed to complete registration');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled');
      } else if (error.message?.includes('ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL')) {
        // User signed up with Google but trying to sign in with password
        throw new Error('This email is linked to Google Sign-In. Please use "Sign in with Google" button instead.');
      } else {
        // Generic fallback error message
        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists
      const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      
      if (!profileDoc.exists()) {
        // New user - store Google data and UID, but KEEP USER LOGGED IN
        const googleUserData = {
          uid: user.uid, // Store UID for later use
          name: user.displayName || '',
          email: user.email || '',
          avatar: user.photoURL || '',
          isGoogleUser: true
        };
        
        // Store in both localStorage and sessionStorage for reliability
        localStorage.setItem('pendingGoogleSignup', JSON.stringify(googleUserData));
        sessionStorage.setItem('googleUserData', JSON.stringify(googleUserData));
        
        // IMPORTANT: Do NOT sign out the user - keep them logged in
        // They will stay logged in and be directed to register page
        // After they complete registration, they'll already be authenticated
        
        throw new Error('REDIRECT_TO_REGISTER');
      }
      
      // Existing user - they're already signed in, profile will load automatically
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      }
      if (error.message === 'REDIRECT_TO_REGISTER') {
        throw error; // Re-throw to handle in component
      }
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signOut = async () => {
    try {
      const currentUserId = user?.uid;
      
      // Clear all user-specific cache data before signing out
      if (currentUserId) {
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
      const updatedProfile = profile ? { ...profile, ...updates } : (updates as UserProfile);
      setProfile(updatedProfile);
      
      // IMPORTANT: Update the cached profile immediately so avatar initials are recalculated with new name
      localStorage.setItem(`profile_cache_${user.uid}`, JSON.stringify(updatedProfile));
      
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
    <AuthContext.Provider value={{ user, profile, loading, error, signUp, signUpWithGoogle, completeGoogleSignUp, signIn, signInWithGoogle, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
