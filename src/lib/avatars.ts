// Default avatar URLs based on gender - using cartoon/2D style avatars
export const DEFAULT_AVATARS = {
  male: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male-user&backgroundColor=b6e3f4&clothesColor=262e33&eyebrowType=default&eyeType=default&facialHairColor=auburn&facialHairType=blank&hairColor=auburn&mouthType=smile&skinColor=light&topType=shortHairShortFlat',
  female: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female-user&backgroundColor=ffd5dc&clothesColor=3c4f5c&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=brown&mouthType=smile&skinColor=light&topType=longHairStraight',
  'non-binary': 'https://api.dicebear.com/7.x/avataaars/svg?seed=nonbinary-user&backgroundColor=e0e4cc&clothesColor=5199e4&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=black&mouthType=smile&skinColor=light&topType=shortHairShortWaved',
  'prefer-not-to-say': 'https://api.dicebear.com/7.x/avataaars/svg?seed=neutral-user&backgroundColor=f0f0f0&clothesColor=65c9ff&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=brown&mouthType=smile&skinColor=light&topType=shortHairDreads'
};

/**
 * Generate a unique cartoon avatar based on user's name and gender
 * @param userName - User's name to generate unique avatar
 * @param gender - User's gender preference
 * @returns Unique cartoon avatar URL
 */
export function generateUniqueAvatar(
  userName: string,
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' = 'female'
): string {
  // Create a seed based on username for consistency
  const seed = userName.toLowerCase().replace(/\s+/g, '-') + '-' + gender;
  
  // Gender-specific avatar styles
  const genderStyles = {
    male: {
      backgroundColor: ['b6e3f4', 'c7ceea', 'ffdfbf', 'e0e4cc'],
      clothesColor: ['262e33', '3c4f5c', '929598', '65c9ff'],
      hairColor: ['auburn', 'black', 'blonde', 'brown'],
      topType: ['shortHairShortFlat', 'shortHairShortWaved', 'shortHairDreads', 'shortHairFrizzle'],
      facialHairType: ['blank', 'beardMedium', 'beardLight', 'moustacheFancy']
    },
    female: {
      backgroundColor: ['ffd5dc', 'ffdfbf', 'c0aede', 'b6e3f4'],
      clothesColor: ['3c4f5c', '5199e4', '65c9ff', 'ff6b6b'],
      hairColor: ['auburn', 'black', 'blonde', 'brown'],
      topType: ['longHairStraight', 'longHairWavy', 'longHairCurly', 'longHairBob'],
      facialHairType: ['blank']
    },
    'non-binary': {
      backgroundColor: ['e0e4cc', 'f0f0f0', 'b6e3f4', 'c7ceea'],
      clothesColor: ['5199e4', '65c9ff', '3c4f5c', '929598'],
      hairColor: ['black', 'brown', 'blonde', 'auburn'],
      topType: ['shortHairShortWaved', 'longHairBob', 'shortHairDreads', 'longHairStraight'],
      facialHairType: ['blank']
    },
    'prefer-not-to-say': {
      backgroundColor: ['f0f0f0', 'e0e4cc', 'c7ceea', 'b6e3f4'],
      clothesColor: ['65c9ff', '3c4f5c', '929598', '5199e4'],
      hairColor: ['brown', 'black', 'blonde', 'auburn'],
      topType: ['shortHairDreads', 'shortHairShortWaved', 'longHairBob', 'shortHairShortFlat'],
      facialHairType: ['blank']
    }
  };

  const style = genderStyles[gender] || genderStyles['female'];
  
  // Use simple hash function to pick consistent options based on name
  const hash = Math.abs(userName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const backgroundColor = style.backgroundColor[hash % style.backgroundColor.length];
  const clothesColor = style.clothesColor[(hash * 2) % style.clothesColor.length];
  const hairColor = style.hairColor[(hash * 3) % style.hairColor.length];
  const topType = style.topType[(hash * 4) % style.topType.length];
  const facialHairType = style.facialHairType[(hash * 5) % style.facialHairType.length];

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}&clothesColor=${clothesColor}&eyebrowType=default&eyeType=default&facialHairColor=auburn&facialHairType=${facialHairType}&hairColor=${hairColor}&mouthType=smile&skinColor=light&topType=${topType}`;
}

/**
 * Get the appropriate avatar URL based on user's avatar and gender
 * @param userAvatar - User's uploaded avatar URL
 * @param gender - User's gender preference
 * @param userName - User's name for fallback
 * @returns Avatar URL to display
 */
export function getAvatarUrl(
  userAvatar: string | null | undefined, 
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' = 'female',
  userName?: string
): string {
  // If user has uploaded an avatar, use it
  if (userAvatar && userAvatar.trim() !== '') {
    return userAvatar;
  }
  
  // If we have a username, generate a unique cartoon avatar
  if (userName && userName.trim() !== '') {
    return generateUniqueAvatar(userName, gender);
  }
  
  // Otherwise, use gender-based default avatar, defaulting to female if gender is invalid
  return DEFAULT_AVATARS[gender] || DEFAULT_AVATARS['female'];
}

/**
 * Generate a fun cartoon avatar using different styles
 * @param userName - User's name to generate unique avatar
 * @param gender - User's gender preference
 * @param style - Avatar style ('avataaars' | 'bottts' | 'personas')
 * @returns Cartoon avatar URL
 */
export function generateCartoonAvatar(
  userName: string,
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' = 'female',
  style: 'avataaars' | 'bottts' | 'personas' = 'avataaars'
): string {
  const seed = userName.toLowerCase().replace(/\s+/g, '-') + '-' + gender;
  
  switch (style) {
    case 'bottts':
      // Robot-style avatars (gender-neutral)
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c7ceea,ffd5dc,ffdfbf,c0aede`;
    
    case 'personas':
      // Simple geometric avatars
      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c7ceea,ffd5dc,ffdfbf,c0aede`;
    
    default:
      // Use the detailed avataaars style
      return generateUniqueAvatar(userName, gender);
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