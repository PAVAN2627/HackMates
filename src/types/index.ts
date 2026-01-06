export interface UserProfile {
  id: string;
  uid: string; // Firebase auth UID
  name: string;
  email: string;
  college: string;
  location: string;
  skills: string[];
  bio: string;
  availableFor: 'online' | 'in-person' | 'both';
  lookingForTeam: boolean;
  avatar?: string;
  // Social links
  linkedin?: string;
  github?: string;
  portfolio?: string;
  // Additional profile info
  experience?: string; // Beginner, Intermediate, Advanced
  interests?: string[];
  timezone?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  createdAt: Date;
  updatedAt?: Date;
}

export interface User extends UserProfile {}

export interface Hackathon {
  id: string;
  title: string;
  description: string; // includes info about member requirements
  venue: string;
  location: string;
  date: string; // ISO format date
  time: string; // HH:mm format
  mode: 'online' | 'in-person' | 'both';
  requiredSkills?: string[]; // filter tags
  teamSize: number; // Number of members required
  preferredGender?: 'male' | 'female' | 'mixed' | 'any'; // Gender preference
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  image?: string;
  image_url?: string; // For backward compatibility
  prizes?: string[]; // Prize information
  status: 'open' | 'closed'; // open for registrations, closed for completed
  teamMembers?: string[]; // array of user IDs who joined
  generalChat: HackathonChatMessage[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface HackathonChatMessage {
  id: string;
  hackathonId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  type: 'text' | 'image' | 'link';
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  content: string;
  createdAt: Date;
  read: boolean;
  edited?: boolean;
  editedAt?: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  image?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  author: User;
  assignee?: User;
  hackathonId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  hackathonId: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  isPinned: boolean;
}

export interface ChatMessage {
  id: string;
  hackathonId: string;
  content: string;
  author: User;
  createdAt: string;
  type: 'text' | 'image' | 'link';
}
