import { MessageCircle, Eye, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { SynergyBadge } from '@/components/SynergyBadge';
import { ReliabilityBadge } from '@/components/ReliabilityBadge';
import { UserProfile } from '@/types';
import { SynergyScore } from '@/types/synergy';
import { ReliabilityBadge as ReliabilityBadgeType } from '@/types/reliability';

interface EnhancedProfileCardProps {
  profile: UserProfile;
  synergyScore?: SynergyScore;
  reliabilityBadge?: ReliabilityBadgeType;
  onMessage: (userId: string) => void;
  onViewProfile: (userId: string, userName: string) => void;
  showContact?: boolean;
  isMessageLoading?: boolean;
}

export function EnhancedProfileCard({
  profile,
  synergyScore,
  reliabilityBadge,
  onMessage,
  onViewProfile,
  showContact = true,
  isMessageLoading = false
}: EnhancedProfileCardProps) {
  const getBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-green-500 hover:bg-green-600';
    if (score >= 50) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getReliabilityColor = (level: string) => {
    switch (level) {
      case 'legend': return 'bg-yellow-500';
      case 'finisher': return 'bg-green-500';
      case 'reliable': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getReliabilityIcon = (level: string) => {
    switch (level) {
      case 'legend': return '👑';
      case 'finisher': return '⭐';
      case 'reliable': return '✓';
      default: return '🌱';
    }
  };

  return (
    <div className="glass rounded-xl p-6 hover:shadow-lg transition-all border border-border">
      {/* Header with Avatar and Badges */}
      <div className="flex items-start gap-4 mb-4">
        <AvatarUpload
          currentAvatar={profile.avatar || null}
          userName={profile.name}
          userGender={profile.gender as any}
          size="md"
          editable={false}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{profile.college}</p>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mt-2">
            {synergyScore && (
              <Badge className={`${getBadgeColor(synergyScore.overall)} text-white text-xs`}>
                {synergyScore.overall}% Match
              </Badge>
            )}
            
            {reliabilityBadge && (
              <Badge className={`${getReliabilityColor(reliabilityBadge.level)} text-white text-xs`}>
                {getReliabilityIcon(reliabilityBadge.level)} {reliabilityBadge.level}
              </Badge>
            )}
            
            {profile.lookingForTeam && (
              <Badge variant="outline" className="text-xs">
                Looking for Team
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {profile.bio}
        </p>
      )}

      {/* Work Style (if available) */}
      {profile.workStyle && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Work Style</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Goal:</span>
              <p className="font-medium capitalize">{profile.workStyle.goal}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>
              <p className="font-medium capitalize">{profile.workStyle.timePreference.replace('-', ' ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Commit:</span>
              <p className="font-medium capitalize">{profile.workStyle.commitment.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{profile.location}</span>
        </div>
        
        {profile.experience && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>{profile.experience}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 4).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{profile.skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Synergy Details */}
      {synergyScore && synergyScore.overall >= 50 && (
        <div className={`border rounded-lg p-3 mb-4 ${
          synergyScore.overall >= 75 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          <p className={`text-sm font-medium mb-2 ${
            synergyScore.overall >= 75 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {synergyScore.overall >= 75 ? '🎯 High Synergy Match!' : '✨ Good Compatibility'}
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• {synergyScore.breakdown.goal}</p>
            <p>• {synergyScore.breakdown.time}</p>
            <p>• {synergyScore.breakdown.commitment}</p>
            <p>• {synergyScore.breakdown.skills}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {showContact && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(profile.uid, profile.name)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onMessage(profile.uid)}
            disabled={isMessageLoading}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isMessageLoading ? 'Sending...' : 'Message'}
          </Button>
        </div>
      )}
    </div>
  );
}
