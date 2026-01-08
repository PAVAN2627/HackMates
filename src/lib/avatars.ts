// Single default avatar for all users - using a simple, reliable avatar
export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=3b82f6&color=ffffff';

/**
 * Generate a unique cartoon avatar based on user's name
 * @param userName - User's name to generate unique avatar
 * @returns Unique cartoon avatar URL
 */
export function generateUniqueAvatar(userName: string): string {
  if (!userName || userName.trim() === '') {
    return DEFAULT_AVATAR;
  }

  // Create a seed based on username for consistency
  const seed = userName.toLowerCase().replace(/\s+/g, '-');
  
  // Use initials style for more reliable loading
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6&color=ffffff`;
}

/**
 * Get the appropriate avatar URL based on user's avatar
 * @param userAvatar - User's uploaded avatar URL
 * @param userName - User's name for fallback
 * @returns Avatar URL to display
 */
export function getAvatarUrl(
  userAvatar: string | null | undefined, 
  userName?: string
): string {
  // If user has uploaded an avatar, use it
  if (userAvatar && userAvatar.trim() !== '') {
    return userAvatar;
  }
  
  // If we have a username, generate a unique avatar
  if (userName && userName.trim() !== '') {
    return generateUniqueAvatar(userName);
  }
  
  // Otherwise, use default avatar
  return DEFAULT_AVATAR;
}

/**
 * Generate a fun cartoon avatar using different styles
 * @param userName - User's name to generate unique avatar
 * @param style - Avatar style ('avataaars' | 'bottts' | 'personas' | 'initials')
 * @returns Cartoon avatar URL
 */
export function generateCartoonAvatar(
  userName: string,
  style: 'avataaars' | 'bottts' | 'personas' | 'initials' = 'initials'
): string {
  const seed = userName.toLowerCase().replace(/\s+/g, '-');
  
  switch (style) {
    case 'bottts':
      // Robot-style avatars
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6`;
    
    case 'personas':
      // Simple geometric avatars
      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6`;
    
    case 'avataaars':
      // Detailed cartoon avatars (might be slower to load)
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4&clothesColor=3c4f5c&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=brown&mouthType=smile&skinColor=light&topType=shortHairShortWaved`;
    
    default:
      // Use initials style for fastest, most reliable loading
      return generateUniqueAvatar(userName);
  }
}

/**
 * Generate initials from a name for fallback display
 * @param name - User's full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}