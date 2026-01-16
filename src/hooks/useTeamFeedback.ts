import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { TeamFeedback, ReliabilityBadge } from '@/types/reliability';
import { calculateReliabilityBadge } from '@/lib/reliabilitySystem';

export function useTeamFeedback(userId?: string) {
  const [feedbacks, setFeedbacks] = useState<TeamFeedback[]>([]);
  const [reliabilityBadge, setReliabilityBadge] = useState<ReliabilityBadge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadFeedbacks();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadFeedbacks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const feedbacksRef = collection(db, COLLECTIONS.TEAM_FEEDBACKS);
      
      // First try with orderBy, if it fails, try without
      let q = query(
        feedbacksRef,
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      console.log('Loading feedbacks for userId:', userId);
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (indexError: any) {
        // If index error, try without orderBy
        console.warn('Index not found, querying without orderBy:', indexError);
        q = query(feedbacksRef, where('toUserId', '==', userId));
        snapshot = await getDocs(q);
      }
      
      console.log('Feedbacks found:', snapshot.size);
      
      const feedbackData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Feedback doc:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
        };
      }) as TeamFeedback[];

      // Sort manually if we didn't use orderBy
      feedbackData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setFeedbacks(feedbackData);
      console.log('Processed feedbacks:', feedbackData);
      
      // Calculate reliability badge (will show "Newbie" for users with no feedback)
      const badge = calculateReliabilityBadge(feedbackData);
      console.log('Calculated badge:', badge);
      setReliabilityBadge(badge);
    } catch (error: any) {
      console.error('Error loading feedbacks:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Don't show error toast - just set default badge for new users
      const defaultBadge = calculateReliabilityBadge([]);
      setReliabilityBadge(defaultBadge);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (feedback: Omit<TeamFeedback, 'id' | 'createdAt'>) => {
    try {
      const feedbacksRef = collection(db, COLLECTIONS.TEAM_FEEDBACKS);
      
      // Check if feedback already exists from this user to this user for this hackathon
      const existingQuery = query(
        feedbacksRef,
        where('hackathonId', '==', feedback.hackathonId),
        where('fromUserId', '==', feedback.fromUserId),
        where('toUserId', '==', feedback.toUserId)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        console.log('⚠️ Feedback already exists, skipping duplicate');
        return true; // Return true to not block the flow, but don't create duplicate
      }
      
      console.log('Submitting feedback:', feedback);
      console.log('Collection name:', COLLECTIONS.TEAM_FEEDBACKS);
      
      const docRef = await addDoc(feedbacksRef, {
        ...feedback,
        createdAt: new Date()
      });
      
      console.log('✅ Feedback submitted successfully with ID:', docRef.id);
      await loadFeedbacks(); // Reload to update badge
      return true;
    } catch (error: any) {
      console.error('❌ Error submitting feedback:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check for permission errors
      if (error.code === 'permission-denied') {
        console.error('🔒 PERMISSION DENIED: Check Firebase security rules for teamFeedbacks collection');
      }
      
      return false;
    }
  };

  return {
    feedbacks,
    reliabilityBadge,
    loading,
    submitFeedback,
    reload: loadFeedbacks
  };
}
