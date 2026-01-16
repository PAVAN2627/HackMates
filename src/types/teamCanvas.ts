// Team Canvas / Lobby System Types

export type TeamCanvasStatus = 'forming' | 'planning' | 'active' | 'completed' | 'disbanded';

export interface TeamIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  authorName: string;
  votes: string[]; // user IDs who voted
  createdAt: Date;
}

export interface TechStackItem {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'deployment' | 'other';
  agreedBy: string[]; // user IDs who agreed
  suggestedBy: string;
}

export interface TeamMemberAgreement {
  userId: string;
  userName: string;
  agreedToIdea: boolean;
  agreedToTechStack: boolean;
  agreedToCommitment: boolean;
  signedAt?: Date;
}

export interface TeamCanvas {
  id: string;
  hackathonId: string;
  teamName?: string;
  status: TeamCanvasStatus;
  
  // Members
  members: {
    userId: string;
    userName: string;
    userAvatar?: string;
    role?: string; // Frontend, Backend, Designer, etc.
    joinedAt: Date;
  }[];
  
  // Idea Board
  ideas: TeamIdea[];
  selectedIdeaId?: string;
  
  // Tech Stack
  techStack: TechStackItem[];
  
  // Agreements
  agreements: TeamMemberAgreement[];
  allAgreed: boolean;
  
  // Communication
  chatMessages: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: Date;
  }[];
  
  // Project Links
  githubRepo?: string;
  deploymentUrl?: string;
  figmaLink?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamContract {
  teamCanvasId: string;
  hackathonId: string;
  projectIdea: string;
  techStack: string[];
  commitments: {
    userId: string;
    userName: string;
    commitment: string;
    hoursPerWeek: number;
  }[];
  signatures: {
    userId: string;
    userName: string;
    signedAt: Date;
  }[];
  createdAt: Date;
}
