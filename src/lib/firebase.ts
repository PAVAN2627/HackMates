import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM05tXh8rj_XjcDdYYBKnJmgHvSPteHXA",
  authDomain: "hackathon-team-formation.firebaseapp.com",
  projectId: "hackathon-team-formation",
  storageBucket: "hackathon-team-formation.firebasestorage.app",
  messagingSenderId: "207850066898",
  appId: "1:207850066898:web:69684b1451466465ae2e0b",
  measurementId: "G-VFCQ7Y8C02"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  HACKATHONS: 'hackathons',
  HACKATHON_CHAT: 'hackathonChat',
  DIRECT_MESSAGES: 'directMessages',
  ANNOUNCEMENTS: 'announcements'
} as const;