// Default avatar URLs based on gender - using cartoon/2D style avatars
export const DEFAULT_AVATARS = {
  male: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male-default&backgroundColor=b6e3f4&clothesColor=262e33&eyebrowType=default&eyeType=default&facialHairColor=auburn&facialHairType=blank&hairColor=auburn&hatColor=red&mouthType=smile&skinColor=light&topType=shortHairShortFlat',
  female: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female-default&backgroundColor=ffd5dc&clothesColor=3c4f5c&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=brown&hatColor=pink&mouthType=smile&skinColor=light&topType=longHairStraight',
  'non-binary': 'https://api.dicebear.com/7.x/avataaars/svg?seed=nonbinary-default&backgroundColor=e0e4cc&clothesColor=5199e4&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=black&hatColor=blue&mouthType=smile&skinColor=light&topType=shortHairShortWaved',
  'prefer-not-to-say': 'https://api.dicebear.com/7.x/avataaars/svg?seed=neutral-default&backgroundColor=f0f0f0&clothesColor=65c9ff&eyebrowType=default&eyeType=default&facialHairType=blank&hairColor=brown&hatColor=gray&mouthType=smile&skinColor=light&topType=shortHairDreads'
};

/**
 * Generate a unique cartoon avatar based on user's name and gender
 * @param userName - User's name to generate unique avatar
 * @param gender - User's gender preference
 * @returns Unique cartoon avatar URL
 */
export function generateUniqueAvatar(
  userName: string,
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' = 'prefer-not-to-say'
): string {
  // Create a seed based on username for consistency
  const seed = userName.toLowerCase().replace(/\s+/g, '-') + '-' + gender;
  
  // Gender-specific avatar styles
  const genderStyles = {
    male: {
      backgroundColor: ['b6e3f4', 'c7ceea', 'ffd5dc', 'ffdfbf', 'c0aede'],
      clothesColor: ['262e33', '3c4f5c', '929598', '65c9ff', '5199e4'],
      hairColor: ['auburn', 'black', 'blonde', 'brown', 'red'],
      topType: ['shortHairShortFlat', 'shortHairShortWaved', 'shortHairDreads', 'shortHairFrizzle', 'shortHairShaggyMullet'],
      facialHairType: ['blank', 'beardMedium', 'beardLight', 'moustacheFancy', 'moustacheMagnum']
    },
    female: {
      backgroundColor: ['ffd5dc', 'ffdfbf', 'c0aede', 'b6e3f4', 'e0e4cc'],
      clothesColor: ['3c4f5c', '5199e4', '65c9ff', 'ff488e', 'ff6b6b'],
      hairColor: ['auburn', 'black', 'blonde', 'brown', 'red'],
      topType: ['longHairStraight', 'longHairWavy', 'longHairCurly', 'longHairBigHair', 'longHairBob'],
      facialHairType: ['blank']
    },
    'non-binary': {
      backgroundColor: ['e0e4cc', 'f0f0f0', 'b6e3f4', 'ffd5dc', 'c7ceea'],
      clothesColor: ['5199e4', '65c9ff', '3c4f5c', 'ff6b6b', '929598'],
      hairColor: ['black', 'brown', 'blonde', 'auburn', 'red'],
      topType: ['shortHairShortWaved', 'longHairBob', 'shortHairDreads', 'longHairStraight', 'shortHairFrizzle'],
      facialHairType: ['blank', 'beardLight']
    },
    'prefer-not-to-say': {
      backgroundColor: ['f0f0f0', 'e0e4cc', 'c7ceea', 'b6e3f4', 'ffdfbf'],
      clothesColor: ['65c9ff', '3c4f5c', '929598', '5199e4', '262e33'],
      hairColor: ['brown', 'black', 'blonde', 'auburn'],
      topType: ['shortHairDreads', 'shortHairShortWaved', 'longHairBob', 'shortHairShortFlat'],
      facialHairType: ['blank']
    }
  };

  const style = genderStyles[gender];
  
  // Use simple hash function to pick consistent options based on name
  const hash = userName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const backgroundColor = style.backgroundColor[Math.abs(hash) % style.backgroundColor.length];
  const clothesColor = style.clothesColor[Math.abs(hash * 2) % style.clothesColor.length];
  const hairColor = style.hairColor[Math.abs(hash * 3) % style.hairColor.length];
  const topType = style.topType[Math.abs(hash * 4) % style.topType.length];
  const facialHairType = style.facialHairType[Math.abs(hash * 5) % style.facialHairType.length];

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
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' = 'prefer-not-to-say',
  userName?: string
): string {
  // If user has uploaded an avatar, use it
  if (userAvatar && userAvatar.trim() !== '') {
    return userAvatar;
  }
  
  // If we have a username, generate a unique cartoon avatar
  if (userName && userName.trim() !== '') {
    return generateCartoonAvatar(userName, gender, 'avataaars');
  }
  
  // Otherwise, use gender-based default avatar
  return DEFAULT_AVATARS[gender] || DEFAULT_AVATARS['prefer-not-to-say'];
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
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' = 'prefer-not-to-say',
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