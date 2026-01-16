// Reliability Badge & Karma System Types

export type ReliabilityLevel = 'newbie' | 'reliable' | 'finisher' | 'legend';

export interface ReliabilityBadge {
  level: ReliabilityLevel;
  score: number; // 0-100
  projectsCompleted: number;
  projectsGhosted: number;
  totalProjects: number;
  completionRate: number; // percentage
  averageRating: number; // 1-5 stars
  badges: string[]; // Special achievements
}

export interface TeamFeedback {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  didContribute: boolean;
  rating: number; // 1-5 stars
  comment?: string;
  skills: string[]; // Skills demonstrated
  createdAt: Date;
}

export interface ReliabilityHistory {
  userId: string;
  badge: ReliabilityBadge;
  feedbacks: TeamFeedback[];
  lastUpdated: Date;
}

// Badge thresholds
export const RELIABILITY_THRESHOLDS = {
  newbie: { min: 0, projects: 0, color: 'gray' },
  reliable: { min: 60, projects: 1, color: 'blue' },
  finisher: { min: 80, projects: 3, color: 'green' },
  legend: { min: 95, projects: 10, color: 'gold' }
} as const;
