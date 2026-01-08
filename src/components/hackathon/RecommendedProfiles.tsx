import { useState, useMemo } from 'react';
import { MessageCircle, Users, Star, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useProfiles } from '@/hooks/useProfiles';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Hackathon, UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EnhancedProfile extends UserProfile {
  matchScore: number;
  matchingSkills?: string[];
}

interface RecommendedProfilesProps {
  hackathon: Hackathon;
  onProfileClick: (userId: string, userName: string) => void;
  onSendMessage: (userId: string) => void;
}

export function RecommendedProfiles({ hackathon, onProfileClick, onSendMessage }: RecommendedProfilesProps) {
  const { profiles, loading, refreshProfiles } = useProfiles();
  const { sendMessage } = useDirectMessages();
  const { user, profile } = useAuth();
  const [selectedExperience, setSelectedExperience] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'online' | 'in-person' | 'both'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingMessageTo, setSendingMessageTo] = useState<string | null>(null);

  // Calculate recommended profiles based on hackathon skills
  const recommendedProfiles = useMemo((): EnhancedProfile[] => {
    const filteredProfiles = profiles.filter(profile => 
      profile.uid !== user?.uid && // Exclude current user
      !hackathon.teamMembers?.includes(profile.uid) // Exclude already joined members
    );

    if (!hackathon.requiredSkills || hackathon.requiredSkills.length === 0) {
      // If no required skills, show all available profiles with 0% match
      return filteredProfiles.map(profile => ({ 
        ...profile, 
        matchScore: 0,
        matchingSkills: []
      }));
    }

    // Calculate match scores for all profiles
    const scoredProfiles: EnhancedProfile[] = filteredProfiles.map(profile => {
      // Calculate match score based on skills overlap
      const matchingSkills = profile.skills.filter(skill => 
        hackathon.requiredSkills?.includes(skill)
      );
      const matchScore = hackathon.requiredSkills.length > 0 
        ? (matchingSkills.length / hackathon.requiredSkills.length) * 100 
        : 0;
      
      return {
        ...profile,
        matchScore: Math.round(matchScore),
        matchingSkills
      };
    });

    // Sort by match score (highest first), then by creation date (newest first)
    return scoredProfiles.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // If same match score, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [profiles, hackathon.requiredSkills, hackathon.teamMembers, user?.uid]);

  // Apply filters
  const filteredProfiles = useMemo(() => {
    let filtered = recommendedProfiles;

    if (selectedExperience !== 'all') {
      filtered = filtered.filter(profile => profile.experience === selectedExperience);
    }

    if (selectedAvailability !== 'all') {
      filtered = filtered.filter(profile => 
        profile.availableFor === selectedAvailability || profile.availableFor === 'both'
      );
    }

    return filtered;
  }, [recommendedProfiles, selectedExperience, selectedAvailability]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      refreshProfiles();
      toast.success('Profiles refreshed!');
    } catch (error) {
      toast.error('Failed to refresh profiles');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleSendAutoMessage = async (recipientProfile: EnhancedProfile) => {
    if (!user || !profile) {
      toast.error('Please log in to send messages');
      return;
    }

    setSendingMessageTo(recipientProfile.uid);

    try {
      // Create personalized message based on hackathon and matching skills
      let message = `Hi ${recipientProfile.name}! 👋\n\n`;
      message += `I saw your profile and I think you'd be a great fit for my hackathon "${hackathon.title}". `;
      
      if (recipientProfile.matchingSkills && recipientProfile.matchingSkills.length > 0) {
        message += `Your skills in ${recipientProfile.matchingSkills.slice(0, 3).join(', ')} `;
        if (recipientProfile.matchingSkills.length > 3) {
          message += `and ${recipientProfile.matchingSkills.length - 3} other skills `;
        }
        message += `are exactly what we're looking for! `;
      }
      
      message += `\n\nWould you be interested in joining our team? `;
      message += `The hackathon is on ${new Date(hackathon.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} `;
      message += `in ${hackathon.location}. `;
      
      if (hackathon.mode !== 'in-person') {
        message += `It's ${hackathon.mode}, so location flexibility is available. `;
      }
      
      message += `\n\nLet me know if you're interested! 🚀`;

      await sendMessage(recipientProfile.uid, message, profile.name, profile.avatar);
      toast.success(`Message sent to ${recipientProfile.name}!`);
      onSendMessage(recipientProfile.uid);
    } catch (error: any) {
      console.error('Error sending auto message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessageTo(null);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-xl font-bold">Recommended Profiles</h3>
            <p className="text-sm text-muted-foreground">
              {hackathon.requiredSkills && hackathon.requiredSkills.length > 0
                ? "Profiles matching your hackathon's required skills (sorted by relevance)"
                : "All available profiles for your hackathon"
              }
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Experience Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Experience Level</label>
            <div className="grid grid-cols-4 gap-1">
              {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedExperience(level)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors",
                    selectedExperience === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-input hover:border-primary'
                  )}
                >
                  {level === 'all' ? 'All' : level}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Availability</label>
            <div className="grid grid-cols-4 gap-1">
              {(['all', 'online', 'in-person', 'both'] as const).map(availability => (
                <button
                  key={availability}
                  onClick={() => setSelectedAvailability(availability)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors",
                    selectedAvailability === availability
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-input hover:border-primary'
                  )}
                >
                  {availability === 'all' ? 'All' : 
                   availability === 'in-person' ? 'In-Person' : 
                   availability.charAt(0).toUpperCase() + availability.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedExperience !== 'all' || selectedAvailability !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedExperience('all');
              setSelectedAvailability('all');
            }}
            className="mt-3 text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="text-lg font-semibold mb-2">No Profiles Available</h4>
          <p className="text-muted-foreground mb-4">
            {!hackathon.requiredSkills || hackathon.requiredSkills.length === 0
              ? "No other users are available to join your hackathon at the moment."
              : "No profiles found matching your hackathon's required skills and filters."
            }
          </p>
          {(selectedExperience !== 'all' || selectedAvailability !== 'all') && (
            <Button variant="outline" onClick={() => {
              setSelectedExperience('all');
              setSelectedAvailability('all');
            }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''}
            {recommendedProfiles.length !== filteredProfiles.length && 
              ` (${recommendedProfiles.length} total)`
            }
            {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 && (
              <span className="ml-2 text-primary">
                • Sorted by skill match relevance
              </span>
            )}
            <br />
            <span className="text-xs">
              Debug: Total DB profiles: {profiles.length} | 
              Current user: {user?.uid} | 
              Team members: {hackathon.teamMembers?.length || 0} |
              Required skills: {hackathon.requiredSkills?.length || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-lg border bg-background hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                onClick={() => onProfileClick(profile.uid, profile.name)}
              >
                {/* Header with Match Score */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <AvatarUpload
                      currentAvatar={profile.avatar || null}
                      userName={profile.name}
                      userGender={profile.gender as any}
                      size="md"
                      editable={false}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{profile.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.college}
                      </p>
                    </div>
                  </div>
                  {profile.matchScore > 0 && (
                    <Badge className={cn('text-xs font-bold', getMatchScoreColor(profile.matchScore))}>
                      {profile.matchScore}% match
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {profile.bio}
                  </p>
                )}

                {/* Matching Skills */}
                {profile.matchingSkills && profile.matchingSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      Matching Skills:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.matchingSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {skill}
                        </Badge>
                      ))}
                      {profile.matchingSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.matchingSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Other Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Other Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills
                        .filter(skill => !profile.matchingSkills?.includes(skill))
                        .slice(0, 2)
                        .map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      {profile.skills.filter(skill => !profile.matchingSkills?.includes(skill)).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.filter(skill => !profile.matchingSkills?.includes(skill)).length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Info */}
                <div className="mb-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">{profile.experience || 'Beginner'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available:</span>
                      <p className="font-medium capitalize">{profile.availableFor || 'Both'}</p>
                    </div>
                  </div>
                  {profile.lookingForTeam && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        🔍 Looking for Team
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendAutoMessage(profile);
                  }}
                  disabled={sendingMessageTo === profile.uid}
                  className="w-full gap-2 text-xs"
                  size="sm"
                >
                  <MessageCircle className="h-3 w-3" />
                  {sendingMessageTo === profile.uid ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            ))}
          </div>

          {/* Statistics */}
          {filteredProfiles.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Profile Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredProfiles.filter(p => p.matchScore >= 80).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Excellent Match (80%+)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredProfiles.filter(p => p.matchScore >= 60 && p.matchScore < 80).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Good Match (60-79%)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredProfiles.filter(p => p.matchScore > 0 && p.matchScore < 60).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Some Match (1-59%)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {filteredProfiles.filter(p => p.lookingForTeam).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Looking for Team</p>
                </div>
              </div>
              {hackathon.requiredSkills && hackathon.requiredSkills.length === 0 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Add required skills to your hackathon to get better match scores
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}