import { ReliabilityBadge, ReliabilityLevel, TeamFeedback, RELIABILITY_THRESHOLDS } from '@/types/reliability';

/**
 * Calculate reliability badge based on feedback history
 * Note: This is based on feedback RECEIVED from teammates, not given
 */
export function calculateReliabilityBadge(feedbacks: TeamFeedback[]): ReliabilityBadge {
  // Group feedbacks by hackathon to count unique hackathons
  const uniqueHackathons = new Set(feedbacks.map(f => f.hackathonId));
  const totalProjects = uniqueHackathons.size;
  
  if (feedbacks.length === 0) {
    return {
      level: 'newbie',
      score: 0,
      projectsCompleted: 0,
      projectsGhosted: 0,
      totalProjects: 0,
      completionRate: 0,
      averageRating: 0,
      badges: []
    };
  }

  // Count hackathons where user contributed vs ghosted
  const hackathonContributions = new Map<string, boolean>();
  feedbacks.forEach(f => {
    const current = hackathonContributions.get(f.hackathonId);
    // If any teammate says they contributed, mark as contributed
    if (current === undefined || f.didContribute) {
      hackathonContributions.set(f.hackathonId, f.didContribute);
    }
  });
  
  const projectsCompleted = Array.from(hackathonContributions.values()).filter(v => v).length;
  const projectsGhosted = Array.from(hackathonContributions.values()).filter(v => !v).length;
  const completionRate = totalProjects > 0 ? (projectsCompleted / totalProjects) * 100 : 0;
  
  const ratings = feedbacks.filter(f => f.didContribute).map(f => f.rating);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
    : 0;

  // Calculate score (0-100)
  const completionWeight = 0.7;
  const ratingWeight = 0.3;
  const score = Math.round(
    (completionRate * completionWeight) + 
    ((averageRating / 5) * 100 * ratingWeight)
  );

  // Determine level based on UNIQUE hackathons completed
  let level: ReliabilityLevel = 'newbie';
  if (score >= RELIABILITY_THRESHOLDS.legend.min && projectsCompleted >= RELIABILITY_THRESHOLDS.legend.projects) {
    level = 'legend';
  } else if (score >= RELIABILITY_THRESHOLDS.finisher.min && projectsCompleted >= RELIABILITY_THRESHOLDS.finisher.projects) {
    level = 'finisher';
  } else if (score >= RELIABILITY_THRESHOLDS.reliable.min && projectsCompleted >= RELIABILITY_THRESHOLDS.reliable.projects) {
    level = 'reliable';
  }

  // Award special badges
  const badges: string[] = [];
  if (projectsCompleted >= 10) badges.push('Veteran');
  if (completionRate === 100 && totalProjects >= 5) badges.push('Never Ghosted');
  if (averageRating >= 4.5 && ratings.length >= 5) badges.push('Highly Rated');
  if (projectsCompleted >= 3 && projectsGhosted === 0) badges.push('Perfect Record');

  return {
    level,
    score,
    projectsCompleted,
    projectsGhosted,
    totalProjects,
    completionRate,
    averageRating,
    badges
  };
}

/**
 * Get badge display info
 */
export function getReliabilityBadgeInfo(level: ReliabilityLevel) {
  const info = {
    newbie: {
      label: 'Newbie',
      description: 'No hackathon history yet',
      color: 'bg-gray-500',
      icon: '🌱'
    },
    reliable: {
      label: 'Reliable',
      description: 'Completed 1+ hackathon',
      color: 'bg-blue-500',
      icon: '✓'
    },
    finisher: {
      label: 'Finisher',
      description: 'Completed 3+ hackathons',
      color: 'bg-green-500',
      icon: '⭐'
    },
    legend: {
      label: 'Legend',
      description: 'Completed 10+ hackathons with excellence',
      color: 'bg-yellow-500',
      icon: '👑'
    }
  };

  return info[level];
}

/**
 * Check if user should be flagged for ghosting
 */
export function shouldFlagForGhosting(badge: ReliabilityBadge): boolean {
  return badge.totalProjects >= 2 && badge.completionRate < 50;
}

/**
 * Get trust score description
 */
export function getTrustScoreDescription(score: number): string {
  if (score >= 90) return 'Extremely reliable teammate';
  if (score >= 75) return 'Very reliable';
  if (score >= 60) return 'Generally reliable';
  if (score >= 40) return 'Somewhat unreliable';
  return 'High risk of ghosting';
}

/**
 * Calculate team quality score based on members' reliability
 */
export function calculateTeamQualityScore(memberBadges: ReliabilityBadge[]): number {
  if (memberBadges.length === 0) return 0;
  
  const avgScore = memberBadges.reduce((sum, badge) => sum + badge.score, 0) / memberBadges.length;
  return Math.round(avgScore);
}
