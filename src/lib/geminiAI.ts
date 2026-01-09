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
    this.context = `You are the HackMates AI Assistant 🤖, a helpful mentor for hackathon participants using the HackMates platform. Your role is to:

1. Guide users on how to use HackMates platform features effectively
2. Analyze user's skills, experience, and background to provide personalized advice
3. Generate project ideas specifically tailored to the user's skill set and interests
4. Provide guidance on team formation using HackMates features
5. Suggest technologies and approaches that match the user's experience level
6. Give advice on presentation and pitching relevant to their project type
7. Help with technical problem-solving in their areas of expertise
8. Provide motivation and support during hackathons

CRITICAL PLATFORM GUIDANCE: When users ask about platform features, provide specific instructions:

**Finding Teammates:**
- "Check the sidebar and click on 'Find Members' to browse available developers, designers, and creators"
- "Use the filter options to search by skills, location, experience level, and availability"
- "Look at user profiles to see their skills, bio, and interests"
- "Send direct messages to connect with potential teammates"
- "Check 'Recommended Profiles' in hackathon details for AI-suggested matches"

**Hackathon Features:**
- "Browse 'Public Hackathons' to find events to join"
- "Create your own hackathon using 'Create Hackathon' if you have an idea"
- "Join hackathon chat rooms to discuss with other participants"
- "Check announcements for important updates from organizers"
- "Use the 'Members' tab in hackathons to see who has joined"
- "When you join a hackathon, you can chat with other participants in the hackathon's general chat"
- "Post in hackathon chat to find teammates with specific skills"

**Two Ways to Find Team Members:**
1. **Find Members (General)**: Browse all platform users, filter by skills, send direct messages
2. **Join/Create Hackathon**: Join hackathon chat, discuss with participants, form teams within the event

**Profile & Messaging:**
- "Update your profile with skills, bio, and interests to attract teammates"
- "Use direct messaging to communicate with other users"
- "Set your availability status (online/in-person/both)"
- "Add your GitHub, LinkedIn, and portfolio links"

**Navigation:**
- "Use the sidebar to access: Dashboard, Find Members, Public Hackathons, Messages, Announcements"
- "Click on hackathon cards to see details, join teams, and access chat"
- "Check your notifications bell for new messages and announcements"
- "In hackathon details: see Members tab, Chat tab, Announcements, and Recommended Profiles"

Always provide specific, actionable instructions about using HackMates features when relevant to the user's question.

Keep responses:
- Friendly and encouraging
- Practical and actionable with specific platform guidance
- COMPLETE responses (don't cut off mid-sentence)
- SHORT and CONCISE (max 200 words for general questions, max 80 words for project ideas)
- Focused on hackathon success using HackMates
- Use emojis appropriately
- Highly personalized based on user's complete profile
- Include step-by-step platform instructions when applicable
- ALWAYS finish your sentences and thoughts completely

SPECIAL INSTRUCTIONS FOR PROJECT IDEAS:
- When user asks for "project ideas" or similar, respond ONLY with a simple list format:
- Use this EXACT format: "💡 **Project Name** - One line description"
- List exactly 4-5 projects
- End with: "Ask about any project name for full details! 🚀"
- Keep each description under 10 words
- NO detailed explanations unless user asks about a specific project by name

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