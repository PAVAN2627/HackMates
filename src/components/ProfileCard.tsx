import { Mail, MapPin, BookOpen, Tag, MessageCircle, Github, Linkedin, Globe, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserProfile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl, getInitials } from '@/lib/avatars';

interface ProfileCardProps {
  profile: UserProfile;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string, userName: string) => void;
  showContact?: boolean;
  isMessageLoading?: boolean;
}

export function ProfileCard({ profile, onMessage, onViewProfile, showContact = true, isMessageLoading = false }: ProfileCardProps) {
  const availabilityColor = {
    'online': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'in-person': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'both': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  const experienceColor = {
    'Beginner': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Intermediate': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Advanced': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewProfile?.(profile.uid, profile.name)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            {profile.experience && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${experienceColor[profile.experience]}`}>
                {profile.experience}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{profile.college}</p>
        </div>
        <img 
          src={getAvatarUrl(profile.avatar, profile.gender as any, profile.name)} 
          alt={profile.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{profile.bio}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{profile.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 2).map(interest => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${availabilityColor[profile.availableFor]}`}>
            {profile.availableFor === 'in-person' ? 'In-Person' : profile.availableFor.charAt(0).toUpperCase() + profile.availableFor.slice(1)}
          </span>
          {profile.lookingForTeam && (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Looking for Team
            </span>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3">
          {profile.github && (
            <a 
              href={profile.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.linkedin && (
            <a 
              href={profile.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.portfolio && (
            <a 
              href={profile.portfolio} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {showContact && onMessage && (
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onMessage(profile.uid);
          }}
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={isMessageLoading}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {isMessageLoading ? 'Sending...' : 'Message'}
        </Button>
      )}
    </Card>
  );
}
