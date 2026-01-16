// Code-First Verification Types

export interface GitHubProfile {
  username: string;
  profileUrl: string;
  avatarUrl?: string;
  bio?: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  lastUpdated: Date;
}

export interface GitHubActivity {
  totalCommits: number;
  contributionGraph: {
    date: string;
    count: number;
  }[];
  languages: {
    name: string;
    percentage: number;
    commits: number;
  }[];
  topRepositories: {
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    url: string;
  }[];
}

export interface SkillVerification {
  skill: string;
  claimed: boolean;
  verified: boolean;
  evidence: {
    commits: number;
    repos: number;
    lastActivity: Date;
  };
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface CodeVerificationStatus {
  isVerified: boolean;
  githubConnected: boolean;
  githubProfile?: GitHubProfile;
  githubActivity?: GitHubActivity;
  skillVerifications: SkillVerification[];
  pinnedRepo?: {
    name: string;
    description: string;
    url: string;
    language: string;
    stars: number;
  };
  lastVerified: Date;
}
