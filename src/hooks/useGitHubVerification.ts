import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { verifyGitHubActivity, GitHubVerificationResult } from '@/lib/githubVerification';
import { toast } from 'sonner';

export function useGitHubVerification() {
  const [verifying, setVerifying] = useState(false);

  const verifyAndUpdateProfile = async (userId: string, githubUsername: string): Promise<GitHubVerificationResult> => {
    setVerifying(true);
    
    try {
      // Verify GitHub activity
      const result = await verifyGitHubActivity(githubUsername);
      
      if (!result.verified || !result.activity) {
        toast.error(result.error || 'Failed to verify GitHub activity');
        return result;
      }

      // Update user profile with verification data
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        githubVerified: true,
        githubUsername: result.activity.username,
        githubActivity: {
          username: result.activity.username,
          totalEvents: result.activity.totalEvents,
          pushEvents: result.activity.pushEvents,
          lastActivityDate: result.activity.lastActivityDate,
          isActive: result.activity.isActive,
          activityLevel: result.activity.activityLevel,
          repositories: result.activity.repositories,
          languages: result.activity.languages,
          verifiedAt: result.activity.verifiedAt
        },
        updatedAt: new Date()
      });

      // Show appropriate message based on activity level
      if (result.warning) {
        toast.warning(result.warning);
      } else if (result.badge === 'prolific-coder') {
        toast.success('🚀 Verified! You\'re a prolific coder with excellent activity!');
      } else if (result.badge === 'active-coder') {
        toast.success('✅ GitHub verified! Active developer confirmed.');
      } else {
        toast.success('GitHub profile verified successfully!');
      }

      return result;
    } catch (error) {
      console.error('GitHub verification error:', error);
      toast.error('Failed to verify GitHub profile');
      return {
        verified: false,
        activity: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        trustScoreImpact: 0
      };
    } finally {
      setVerifying(false);
    }
  };

  const refreshVerification = async (userId: string, githubUsername: string): Promise<GitHubVerificationResult> => {
    return verifyAndUpdateProfile(userId, githubUsername);
  };

  return {
    verifying,
    verifyAndUpdateProfile,
    refreshVerification
  };
}
