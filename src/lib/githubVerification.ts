/**
 * GitHub Verification System - "Proof of Work"
 * 
 * This module verifies developer activity by checking their GitHub commits
 * in the last 3 months. It helps identify inactive developers and ensures
 * profile accuracy.
 */

export interface GitHubActivity {
  username: string;
  totalEvents: number;
  pushEvents: number; // Actual code commits
  lastActivityDate: Date | null;
  isActive: boolean; // Active if they have commits in last 3 months
  activityLevel: 'inactive' | 'low' | 'moderate' | 'high' | 'very-high';
  repositories: string[]; // List of repos they contributed to
  languages: string[]; // Programming languages used (estimated)
  verifiedAt: Date;
}

export interface GitHubVerificationResult {
  verified: boolean;
  activity: GitHubActivity | null;
  error?: string;
  trustScoreImpact: number; // -20 to +20 points
  badge?: 'inactive' | 'active-coder' | 'prolific-coder';
  warning?: string;
}

/**
 * Fetch user's GitHub activity from the last 3 months
 */
export async function verifyGitHubActivity(username: string): Promise<GitHubVerificationResult> {
  try {
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '').trim();
    
    if (!cleanUsername) {
      return {
        verified: false,
        activity: null,
        error: 'Invalid GitHub username',
        trustScoreImpact: 0
      };
    }

    // Fetch user's public events (last 90 days)
    const response = await fetch(`https://api.github.com/users/${cleanUsername}/events?per_page=100`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          verified: false,
          activity: null,
          error: 'GitHub user not found',
          trustScoreImpact: -10,
          warning: 'GitHub username does not exist'
        };
      }
      
      if (response.status === 403) {
        // Rate limit exceeded
        return {
          verified: false,
          activity: null,
          error: 'GitHub API rate limit exceeded. Please try again later.',
          trustScoreImpact: 0
        };
      }
      
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const events = await response.json();
    
    // Calculate activity metrics
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentEvents = events.filter((event: any) => {
      const eventDate = new Date(event.created_at);
      return eventDate >= threeMonthsAgo;
    });

    // Count push events (actual code commits)
    const pushEvents = recentEvents.filter((event: any) => event.type === 'PushEvent');
    
    // Extract unique repositories
    const repositories = [...new Set(recentEvents.map((event: any) => event.repo?.name).filter(Boolean))];
    
    // Get last activity date
    const lastActivityDate = recentEvents.length > 0 
      ? new Date(recentEvents[0].created_at)
      : null;

    // Determine activity level
    let activityLevel: GitHubActivity['activityLevel'] = 'inactive';
    let isActive = false;
    let trustScoreImpact = 0;
    let badge: GitHubVerificationResult['badge'] | undefined;
    let warning: string | undefined;

    if (pushEvents.length === 0) {
      activityLevel = 'inactive';
      isActive = false;
      trustScoreImpact = -15;
      badge = 'inactive';
      warning = '⚠️ No coding activity in the last 3 months';
    } else if (pushEvents.length < 10) {
      activityLevel = 'low';
      isActive = true;
      trustScoreImpact = 0;
      warning = 'Low coding activity detected';
    } else if (pushEvents.length < 30) {
      activityLevel = 'moderate';
      isActive = true;
      trustScoreImpact = +5;
      badge = 'active-coder';
    } else if (pushEvents.length < 60) {
      activityLevel = 'high';
      isActive = true;
      trustScoreImpact = +10;
      badge = 'active-coder';
    } else {
      activityLevel = 'very-high';
      isActive = true;
      trustScoreImpact = +15;
      badge = 'prolific-coder';
    }

    // Try to detect languages from recent events (limited info from events API)
    const languages: string[] = [];
    // Note: Events API doesn't provide language info directly
    // This would require additional API calls to each repo

    const activity: GitHubActivity = {
      username: cleanUsername,
      totalEvents: recentEvents.length,
      pushEvents: pushEvents.length,
      lastActivityDate,
      isActive,
      activityLevel,
      repositories: repositories.slice(0, 10), // Limit to 10 repos
      languages,
      verifiedAt: new Date()
    };

    return {
      verified: true,
      activity,
      trustScoreImpact,
      badge,
      warning
    };

  } catch (error) {
    console.error('GitHub verification error:', error);
    return {
      verified: false,
      activity: null,
      error: error instanceof Error ? error.message : 'Failed to verify GitHub activity',
      trustScoreImpact: 0
    };
  }
}

/**
 * Get activity level description
 */
export function getActivityLevelDescription(level: GitHubActivity['activityLevel']): string {
  const descriptions = {
    'inactive': '❌ No recent activity (0 commits in 3 months)',
    'low': '⚠️ Low activity (1-9 commits in 3 months)',
    'moderate': '✅ Moderate activity (10-29 commits in 3 months)',
    'high': '🔥 High activity (30-59 commits in 3 months)',
    'very-high': '🚀 Very high activity (60+ commits in 3 months)'
  };
  return descriptions[level];
}

/**
 * Get badge display info
 */
export function getGitHubBadgeInfo(badge: GitHubVerificationResult['badge']) {
  if (!badge) return null;
  
  const info = {
    'inactive': {
      label: 'Inactive Developer',
      color: 'bg-red-500',
      icon: '💤',
      description: 'No GitHub activity in the last 3 months'
    },
    'active-coder': {
      label: 'Active Coder',
      color: 'bg-green-500',
      icon: '✅',
      description: 'Regular GitHub contributions'
    },
    'prolific-coder': {
      label: 'Prolific Coder',
      color: 'bg-purple-500',
      icon: '🚀',
      description: 'Very active on GitHub with 60+ commits in 3 months'
    }
  };

  return info[badge];
}

/**
 * Check if verification is stale (older than 7 days)
 */
export function isVerificationStale(verifiedAt: Date): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(verifiedAt) < sevenDaysAgo;
}

/**
 * Format time since last activity
 */
export function formatTimeSinceActivity(date: Date | null): string {
  if (!date) return 'No recent activity';
  
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 90) return `${Math.floor(diffDays / 30)} months ago`;
  return 'Over 3 months ago';
}

/**
 * Validate GitHub username format
 */
export function isValidGitHubUsername(username: string): boolean {
  // GitHub username rules:
  // - May only contain alphanumeric characters or hyphens
  // - Cannot have multiple consecutive hyphens
  // - Cannot begin or end with a hyphen
  // - Maximum 39 characters
  const cleanUsername = username.replace('@', '').trim();
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return regex.test(cleanUsername);
}
