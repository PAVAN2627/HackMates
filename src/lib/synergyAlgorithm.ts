import { UserProfile } from '@/types';
import { SynergyScore, MatchResult } from '@/types/synergy';

/**
 * Calculate synergy score between two users
 * Returns a percentage (0-100) indicating compatibility
 */
export function calculateSynergyScore(
  user1: UserProfile,
  user2: UserProfile
): SynergyScore {
  // Default scores
  let goalMatch = 50;
  let timeMatch = 50;
  let commitmentMatch = 50;
  let skillMatch = 0;

  // 1. GOAL MATCH (30% weight)
  // Never pair "win" with "learn" - they will fight
  if (user1.workStyle && user2.workStyle) {
    if (user1.workStyle.goal === user2.workStyle.goal) {
      goalMatch = 100; // Perfect match
    } else {
      goalMatch = 20; // Incompatible
    }
  }

  // 2. TIME MATCH (25% weight)
  // Code collaboration fails when schedules don't align
  if (user1.workStyle && user2.workStyle) {
    const time1 = user1.workStyle.timePreference;
    const time2 = user2.workStyle.timePreference;
    
    if (time1 === time2) {
      timeMatch = 100; // Same schedule
    } else if (time1 === 'flexible' || time2 === 'flexible') {
      timeMatch = 80; // One is flexible
    } else {
      timeMatch = 30; // Opposite schedules (night-owl vs early-bird)
    }
  }

  // 3. COMMITMENT MATCH (25% weight)
  // Match availability levels
  if (user1.workStyle && user2.workStyle) {
    const hours1 = user1.workStyle.hoursAvailable;
    const hours2 = user2.workStyle.hoursAvailable;
    const hoursDiff = Math.abs(hours1 - hours2);
    
    if (hoursDiff <= 5) {
      commitmentMatch = 100; // Very similar availability
    } else if (hoursDiff <= 15) {
      commitmentMatch = 70; // Somewhat similar
    } else {
      commitmentMatch = 40; // Very different availability
    }
  }

  // 4. SKILL MATCH (20% weight)
  // Complementary skills are better than identical skills
  const skills1 = new Set(user1.skills || []);
  const skills2 = new Set(user2.skills || []);
  
  const commonSkills = [...skills1].filter(s => skills2.has(s)).length;
  const totalUniqueSkills = new Set([...skills1, ...skills2]).size;
  
  if (totalUniqueSkills > 0) {
    // Sweet spot: 30-50% overlap (some common ground, but complementary)
    const overlapPercentage = (commonSkills / totalUniqueSkills) * 100;
    
    if (overlapPercentage >= 30 && overlapPercentage <= 50) {
      skillMatch = 100; // Perfect balance
    } else if (overlapPercentage >= 20 && overlapPercentage <= 60) {
      skillMatch = 80; // Good balance
    } else if (overlapPercentage < 20) {
      skillMatch = 50; // Too different
    } else {
      skillMatch = 60; // Too similar
    }
  }

  // Calculate weighted overall score
  const overall = Math.round(
    goalMatch * 0.30 +
    timeMatch * 0.25 +
    commitmentMatch * 0.25 +
    skillMatch * 0.20
  );

  return {
    overall,
    goalMatch,
    timeMatch,
    commitmentMatch,
    skillMatch,
    breakdown: {
      goal: getGoalMatchDescription(goalMatch),
      time: getTimeMatchDescription(timeMatch),
      commitment: getCommitmentMatchDescription(commitmentMatch),
      skills: getSkillMatchDescription(skillMatch)
    }
  };
}

/**
 * Find best matches for a user from a list of candidates
 */
export function findBestMatches(
  currentUser: UserProfile,
  candidates: UserProfile[],
  limit: number = 10
): MatchResult[] {
  const matches: MatchResult[] = candidates
    .filter(candidate => candidate.uid !== currentUser.uid)
    .map(candidate => {
      const synergyScore = calculateSynergyScore(currentUser, candidate);
      return {
        userId: candidate.uid,
        userName: candidate.name,
        userAvatar: candidate.avatar,
        synergyScore,
        isHighSynergy: synergyScore.overall >= 75,
        compatibilityBadge: 
          synergyScore.overall >= 75 ? 'high' :
          synergyScore.overall >= 50 ? 'medium' : 'low'
      };
    })
    .sort((a, b) => b.synergyScore.overall - a.synergyScore.overall)
    .slice(0, limit);

  return matches;
}

// Helper functions for descriptions
function getGoalMatchDescription(score: number): string {
  if (score >= 90) return 'Both focused on winning';
  if (score >= 70) return 'Both focused on learning';
  if (score >= 40) return 'Somewhat aligned goals';
  return 'Conflicting goals - may cause friction';
}

function getTimeMatchDescription(score: number): string {
  if (score >= 90) return 'Perfect schedule alignment';
  if (score >= 70) return 'Good schedule compatibility';
  if (score >= 40) return 'Some schedule overlap';
  return 'Opposite schedules - coordination difficult';
}

function getCommitmentMatchDescription(score: number): string {
  if (score >= 90) return 'Similar time availability';
  if (score >= 60) return 'Compatible availability';
  return 'Different availability levels';
}

function getSkillMatchDescription(score: number): string {
  if (score >= 90) return 'Perfect skill balance';
  if (score >= 70) return 'Complementary skills';
  if (score >= 50) return 'Some skill overlap';
  return 'Skills too similar or too different';
}

/**
 * Get synergy badge color
 */
export function getSynergyBadgeColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get synergy badge text
 */
export function getSynergyBadgeText(score: number): string {
  if (score >= 85) return 'Excellent Match';
  if (score >= 75) return 'High Synergy';
  if (score >= 60) return 'Good Match';
  if (score >= 50) return 'Moderate Match';
  return 'Low Compatibility';
}
