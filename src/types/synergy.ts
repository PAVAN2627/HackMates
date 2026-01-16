// Synergy Score & Matching System Types

export type GoalType = 'win' | 'learn';
export type TimePreference = 'night-owl' | 'early-bird' | 'flexible';
export type CommitmentLevel = 'full-time' | 'part-time' | 'casual';

export interface WorkStyle {
  goal: GoalType; // "win" = hardcore, "learn" = relaxed
  timePreference: TimePreference;
  commitment: CommitmentLevel;
  hoursAvailable: number; // Hours per week
  timezone?: string;
}

export interface SynergyScore {
  overall: number; // 0-100 percentage
  goalMatch: number; // 0-100
  timeMatch: number; // 0-100
  commitmentMatch: number; // 0-100
  skillMatch: number; // 0-100
  breakdown: {
    goal: string;
    time: string;
    commitment: string;
    skills: string;
  };
}

export interface MatchResult {
  userId: string;
  userName: string;
  userAvatar?: string;
  synergyScore: SynergyScore;
  isHighSynergy: boolean; // >= 75%
  compatibilityBadge: 'high' | 'medium' | 'low';
}
