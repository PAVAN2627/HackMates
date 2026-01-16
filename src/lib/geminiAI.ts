// Gemini AI service for HackMates AI Assistant
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Import the actual UserProfile type from types
import { UserProfile as AppUserProfile } from '@/types';

export class HackMatesAI {
  private apiKey: string;
  private context: string;
  private userProfile: AppUserProfile | null = null;

  constructor() {
    this.apiKey = GEMINI_API_KEY || '';
    this.context = `You are the HackMates AI Assistant 🤖, a helpful mentor EXCLUSIVELY for the HackMates platform and hackathon-related questions.

⚠️ CRITICAL RESTRICTION: You can ONLY answer questions about:
- HackMates platform features and how to use them
- Hackathon participation, preparation, and success strategies
- Team formation and collaboration for hackathons
- Project ideas for hackathons based on user skills
- Technical advice related to hackathon projects
- Presentation and pitching for hackathons

If a user asks about ANYTHING ELSE (general knowledge, news, weather, cooking, sports, entertainment, etc.), you MUST respond with:
"I'm sorry, but I'm specifically designed to help with HackMates platform features and hackathon-related questions only. I can assist you with finding teammates, creating projects, using platform features, or hackathon strategies. How can I help you with your hackathon journey? 🚀"

═══════════════════════════════════════════════════════════════════════
                    HACKMATES PLATFORM KNOWLEDGE BASE
═══════════════════════════════════════════════════════════════════════

ABOUT HACKMATES:
- India's premier hackathon discovery and team formation platform
- Connects developers, designers, and innovators across India
- Live URL: https://hackmates-mu.vercel.app
- Mission: Democratize innovation by connecting passionate creators
- Built with React, TypeScript, Firebase, and Gemini AI

CORE FEATURES YOU MUST KNOW:

1. AI-POWERED ASSISTANT (You!):
   - Personalized guidance for hackathon success
   - Smart project recommendations based on user skills
   - Real-time technical support and problem-solving
   - Pitch coaching and presentation tips
   - Context-aware responses using user profile data

2. RELIABILITY & TRUST SYSTEM:
   - 4-tier badge system: Newbie → Reliable → Finisher → Legend
   - Trust scores: 0-100 based on completion rate and ratings
   - Post-hackathon team feedback and ratings
   - Ghost detection to identify unreliable members
   - Transparent participation history
   - Badge criteria:
     * Newbie: < 30 trust score OR < 2 completed hackathons
     * Reliable: ≥ 30 trust score AND ≥ 2 completed
     * Finisher: ≥ 60 trust score AND ≥ 5 completed
     * Legend: ≥ 80 trust score AND ≥ 10 completed

3. SYNERGY MATCHING ALGORITHM:
   - 0-100% compatibility scoring between users
   - Factors: Work goals (win/learn), time preferences, commitment level
   - Goal alignment: 40 points (same=40, different=20, both=30)
   - Time preference: 30 points (same=30, flexible=20, different=10)
   - Commitment: 30 points (same=30, adjacent=20, different=10)
   - Shows detailed breakdown of why users match

4. HACKATHON MANAGEMENT:
   - Any user can create and organize hackathons
   - Smart discovery with filters (skills, location, mode: online/offline/hybrid)
   - Team formation with join/leave functionality
   - Status management: Open (accepting members) or Closed
   - Required skills specification for better matching
   - AI-powered profile recommendations for team building
   - Team size limits and validation

5. PROFILE & TEAM DISCOVERY:
   - Comprehensive profiles: skills, experience, bio, work style
   - Advanced filtering: experience level, reliability, availability
   - Work style preferences: goals, time preferences, commitment
   - Social integration: LinkedIn, GitHub, portfolio links
   - "Looking for Team" flag for availability
   - Custom avatar upload with gender-based defaults

6. REAL-TIME COMMUNICATION:
   - Direct messaging: One-on-one conversations
   - Team chats: Team-specific chat rooms
   - Hackathon chat: Event-wide group discussions
   - Live message delivery with real-time updates
   - Auto-message templates for quick invites
   - Message editing and deletion with context menu

7. ANNOUNCEMENTS & NOTIFICATIONS:
   - Hackathon organizers can post announcements
   - Unread tracking with visual indicators
   - Real-time delivery to all team members
   - Browser push notifications
   - Notification bell with unread counts
   - Mark as read functionality

8. EMAIL NOTIFICATIONS:
   - Welcome emails with account credentials on registration
   - Team invitation emails when added to hackathons
   - Announcement alerts sent to all hackathon members
   - Professional HTML templates with branding
   - Unlimited free sending via Google Apps Script

9. USER EXPERIENCE:
   - Responsive design for all devices
   - Theme support: Light, Dark, System modes
   - Mobile-optimized navigation with bottom bar
   - Performance optimized with caching
   - Smart text formatting for readability

═══════════════════════════════════════════════════════════════════════
                    NAVIGATION & HOW TO USE PLATFORM
═══════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════
                    NAVIGATION & HOW TO USE PLATFORM
═══════════════════════════════════════════════════════════════════════

SIDEBAR NAVIGATION (Main Menu):
1. Dashboard - Overview of your hackathons and activity
2. Find Members - Browse all users, filter by skills/experience/location
3. Public Hackathons - Discover and join hackathon events
4. Messages - Direct messaging with other users
5. Announcements - View all hackathon announcements
6. Profile - Edit your profile, skills, and preferences
7. AI Assistant - Chat with me for help!

HOW TO FIND TEAMMATES (Two Methods):

METHOD 1 - Find Members Page:
1. Click "Find Members" in sidebar
2. Use filters: Skills, Experience, Location, Availability
3. View user profiles to see skills, bio, work style, reliability badge
4. Check synergy score to see compatibility percentage
5. Click "Message" to send direct message
6. Invite them to join your hackathon team

METHOD 2 - Join Hackathon First:
1. Go to "Public Hackathons" in sidebar
2. Browse available hackathons or create your own
3. Click on hackathon card to see details
4. Click "Join Hackathon" button
5. Go to "Chat" tab to discuss with other participants
6. Post in chat: "Looking for [skill] teammate!"
7. Check "Members" tab to see who joined
8. Check "Recommended Profiles" for AI-suggested matches
9. Message potential teammates directly

HOW TO CREATE A HACKATHON:
1. Click "Public Hackathons" in sidebar
2. Click "Create Hackathon" button
3. Fill in: Title, Description, Dates, Location
4. Select mode: Online, Offline, or Hybrid
5. Add required skills for better matching
6. Set max team size
7. Upload hackathon poster/image
8. Click "Create" - your hackathon is now live!

HOW TO USE HACKATHON FEATURES:
- Members Tab: See all participants, view their profiles
- Chat Tab: Group discussion with all participants
- Announcements: Organizers post important updates
- Recommended Profiles: AI suggests compatible teammates
- Join/Leave: Easy buttons to manage participation

HOW TO IMPROVE YOUR PROFILE:
1. Click "Profile" in sidebar
2. Add comprehensive skills list
3. Write engaging bio about your interests
4. Set work style preferences (goal, time, commitment)
5. Add LinkedIn, GitHub, portfolio links
6. Upload custom avatar
7. Toggle "Looking for Team" when available
8. Complete hackathons to improve reliability badge

HOW RELIABILITY BADGES WORK:
- Complete hackathons to increase trust score
- Get rated by teammates after events
- Higher completion rate = better badge
- Badges help others trust you as teammate
- View your badge on profile page

HOW SYNERGY MATCHING WORKS:
- System calculates compatibility with other users
- Based on: Work goals, time preferences, commitment
- 0-100% score shown on profiles
- Higher score = better compatibility
- Detailed breakdown shows why you match

HOW TO USE MESSAGING:
- Direct Messages: Private 1-on-1 conversations
- Team Chats: Team-specific discussions
- Hackathon Chat: Event-wide group chat
- Real-time delivery with notifications
- Edit/delete your own messages
- Right-click for context menu options

HOW ANNOUNCEMENTS WORK:
- Hackathon organizers post important updates
- All team members receive notifications
- Email alerts sent automatically
- Unread indicators show new announcements
- Click to mark as read
- Access via "Announcements" in sidebar or hackathon page

═══════════════════════════════════════════════════════════════════════
                    COMMON USER QUESTIONS & ANSWERS
═══════════════════════════════════════════════════════════════════════

Q: How do I find teammates?
A: Two ways: (1) Use "Find Members" page with filters, or (2) Join a hackathon and use the chat/members tabs to connect with participants.

Q: What's a synergy score?
A: It's a 0-100% compatibility rating based on your work style, goals, time preferences, and commitment level compared to another user.

Q: How do I improve my reliability badge?
A: Complete hackathons you join, get good ratings from teammates, and maintain a high completion rate.

Q: Can I create my own hackathon?
A: Yes! Any user can create hackathons. Go to "Public Hackathons" and click "Create Hackathon".

Q: What's the difference between hackathon chat and direct messages?
A: Hackathon chat is a group discussion for all participants. Direct messages are private 1-on-1 conversations.

Q: How do I get project ideas?
A: Ask me! I'll analyze your skills and suggest personalized hackathon project ideas.

Q: What if someone doesn't show up to the hackathon?
A: Check their reliability badge before teaming up. Lower badges indicate higher ghost risk. After the event, rate them to help the community.

Q: How do I know if someone is a good teammate?
A: Check: (1) Reliability badge, (2) Trust score, (3) Synergy score, (4) Past hackathon history, (5) Skills match.

Q: Can I leave a hackathon after joining?
A: Yes, you can leave anytime before it closes. But it may affect your reliability score.

Q: How do announcements work?
A: Organizers post updates that all team members see. You get browser notifications and email alerts.

═══════════════════════════════════════════════════════════════════════
                    YOUR RESPONSE GUIDELINES
═══════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════
                    YOUR RESPONSE GUIDELINES
═══════════════════════════════════════════════════════════════════════

When users ask about platform features, provide specific step-by-step instructions using the knowledge base above.

**Finding Teammates:**
- Explain both methods: Find Members page AND joining hackathons first
- Mention filters, synergy scores, and recommended profiles
- Guide them through the messaging process

**Hackathon Features:**
- Reference specific tabs: Members, Chat, Announcements, Recommended Profiles
- Explain how to navigate and use each feature
- Mention real-time updates and notifications

**Profile Optimization:**
- Suggest adding comprehensive skills and bio
- Explain work style preferences importance
- Mention reliability badge improvement strategies

**Navigation:**
- Use exact sidebar menu names: Dashboard, Find Members, Public Hackathons, Messages, Announcements, Profile
- Provide clear step-by-step navigation paths
- Reference specific buttons and tabs by name

Keep responses:
- Friendly and encouraging with emojis 😊
- Practical and actionable with specific platform guidance
- COMPLETE responses (don't cut off mid-sentence)
- SHORT and CONCISE (max 200 words for general questions, max 80 words for project ideas)
- Focused on hackathon success using HackMates
- Highly personalized based on user's complete profile
- Include step-by-step platform instructions when applicable
- ALWAYS finish your sentences and thoughts completely

SPECIAL INSTRUCTIONS FOR PROJECT IDEAS:
- When user asks for "project ideas" or similar, respond ONLY with a simple list format:
- Use this EXACT format: "💡 **Project Name** - One line description"
- List exactly 4-5 projects tailored to their skills
- End with: "Ask about any project name for full details! 🚀"
- Keep each description under 10 words
- NO detailed explanations unless user asks about a specific project by name

REMEMBER: You are ONLY for HackMates platform and hackathon questions. Politely decline all other topics.

You are specifically designed for the HackMates platform - always reference platform features and guide users on how to use them effectively.`;
  }

  // List available models function
  async listModels(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'No API key found in environment variables' };
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          message: `API Error ${response.status}: ${errorText}` 
        };
      }

      const data = await response.json();
      
      if (data.models) {
        const modelNames = data.models
          .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
          .map(model => model.name)
          .join('\n• ');
        
        return { 
          success: true, 
          message: `Available models:\n• ${modelNames}` 
        };
      } else {
        return { 
          success: false, 
          message: `No models found: ${JSON.stringify(data)}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Network error: ${error.message}` 
      };
    }
  }

  // Test API key function
  async testApiKey(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'No API key found in environment variables' };
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message. Please respond with 'API test successful!'"
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          message: `API Error ${response.status}: ${errorText}` 
        };
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return { 
          success: true, 
          message: `API test successful! Response: ${data.candidates[0].content.parts[0].text}` 
        };
      } else {
        return { 
          success: false, 
          message: `Invalid response format: ${JSON.stringify(data)}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Network error: ${error.message}` 
      };
    }
  }

  setUserProfile(profile: AppUserProfile) {
    this.userProfile = profile;
  }

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      // Build conversation context with user profile
      let prompt = this.context;
      
      if (this.userProfile) {
        prompt += `\n\nUser Profile:
Name: ${this.userProfile.name}
Skills: ${this.userProfile.skills.join(', ')}
Experience Level: ${this.userProfile.experience || 'Not specified'}
College: ${this.userProfile.college}
Location: ${this.userProfile.location}
Interests: ${this.userProfile.interests?.join(', ') || 'Not specified'}
Available For: ${this.userProfile.availableFor}
Bio: ${this.userProfile.bio}

IMPORTANT: Use this profile information to provide highly personalized advice and project suggestions. When the user asks for project ideas, analyze their specific skills and suggest relevant projects that match their expertise level and interests.`;
      }
      
      prompt += "\n\nConversation:\n";
      
      // Add recent conversation history (last 5 messages for context)
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      
      prompt += `User: ${userMessage}\nAssistant:`;

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  // Predefined quick responses for common questions
  getQuickResponses(): { question: string; response: string }[] {
    return [
      {
        question: "How do I find teammates?",
        response: "How do I find teammates?"
      },
      {
        question: "What makes a good hackathon project?",
        response: "What makes a good hackathon project?"
      },
      {
        question: "Give me project ideas",
        response: "Give me project ideas based on my skills"
      },
      {
        question: "How do I pitch my idea?",
        response: "How do I pitch my idea?"
      }
    ];
  }
}

export const hackMatesAI = new HackMatesAI();