import { useState, useMemo, useEffect, useRef } from 'react';
import { MessageCircle, Users, Star, Filter, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { getAIMatchReasons, CandidateSummary } from '@/lib/matchingAI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { calculateSynergyScore } from '@/lib/synergyAlgorithm';
import { Hackathon, UserProfile } from '@/types';
import { cn } from '@/lib/utils';

interface EnhancedProfile extends UserProfile {
  matchScore: number;
  matchingSkills?: string[];
  matchingTechnologies?: string[];
  synergyScore?: number;
}

interface RecommendedProfilesProps {
  hackathon: Hackathon;
  onProfileClick: (userId: string, userName: string) => void;
  onSendMessage: (userId: string) => void;
}

export function RecommendedProfiles({ hackathon, onProfileClick, onSendMessage }: RecommendedProfilesProps) {
  const { profiles, loading, refreshProfiles } = useProfiles();
  const { user, profile: currentProfile } = useAuth();
  const [selectedExperience, setSelectedExperience] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'online' | 'in-person' | 'both'>('all');
  const [selectedReliability, setSelectedReliability] = useState<'all' | 'reliable+'>('all');
  const [showLookingForTeamOnly, setShowLookingForTeamOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'synergy' | 'skills' | 'recent'>('synergy');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI match reasons — fetched once for top 5 candidates
  const [aiReasons, setAiReasons] = useState<Map<string, string>>(new Map());
  const aiCalledRef = useRef(false);

  // Calculate recommended profiles based on hackathon skills, technologies, and interests
  const recommendedProfiles = useMemo((): EnhancedProfile[] => {
    const filteredProfiles = profiles.filter(profile => 
      profile.uid !== user?.uid && // Exclude current user
      !hackathon.teamMembers?.includes(profile.uid) // Exclude already joined members
    );

    const hasRequiredSkills = hackathon.requiredSkills && hackathon.requiredSkills.length > 0;
    const hasTechnologies = hackathon.technologies && hackathon.technologies.length > 0;

    if (!hasRequiredSkills && !hasTechnologies) {
      // If no required skills or technologies, show all available profiles with 0% match
      return filteredProfiles.map(profile => ({ 
        ...profile, 
        matchScore: 0,
        matchingSkills: []
      }));
    }

    // Calculate match scores for all profiles
    const scoredProfiles: EnhancedProfile[] = filteredProfiles.map(profile => {
      let totalScore = 0;
      let components = 0;
      
      // 1. Skills Match (40% weight)
      const matchingSkills = hasRequiredSkills 
        ? profile.skills.filter(skill => hackathon.requiredSkills?.includes(skill))
        : [];
      const skillsScore = hasRequiredSkills && hackathon.requiredSkills!.length > 0
        ? (matchingSkills.length / hackathon.requiredSkills!.length) * 100
        : 0;
      
      if (hasRequiredSkills) {
        totalScore += skillsScore * 0.4;
        components++;
      }
      
      // 2. Technology/Domain Match (40% weight)
      const matchingTechnologies = hasTechnologies && profile.interests
        ? profile.interests.filter(interest => hackathon.technologies?.includes(interest))
        : [];
      const techScore = hasTechnologies && hackathon.technologies!.length > 0 && profile.interests
        ? (matchingTechnologies.length / hackathon.technologies!.length) * 100
        : 0;
      
      if (hasTechnologies) {
        totalScore += techScore * 0.4;
        components++;
      }
      
      // 3. Location Match (10% weight)
      const locationMatch = hackathon.location && profile.location
        ? hackathon.location.toLowerCase().includes(profile.location.toLowerCase()) ||
          profile.location.toLowerCase().includes(hackathon.location.toLowerCase())
        : false;
      const locationScore = locationMatch ? 100 : 0;
      totalScore += locationScore * 0.1;
      components++;
      
      // 4. Availability Match (10% weight)
      const availabilityMatch = 
        hackathon.mode === 'both' || 
        profile.availableFor === 'both' ||
        hackathon.mode === profile.availableFor;
      const availabilityScore = availabilityMatch ? 100 : 50;
      totalScore += availabilityScore * 0.1;
      components++;
      
      // Calculate final match score
      const matchScore = components > 0 ? Math.round(totalScore) : 0;
      
      // Calculate synergy score if both users have work style
      const synergyScore = profile.workStyle && currentProfile?.workStyle
        ? calculateSynergyScore(currentProfile, profile).overall
        : undefined;
      
      return {
        ...profile,
        matchScore,
        matchingSkills,
        matchingTechnologies,
        synergyScore
      };
    });

    // Sort by synergy score first (if available), then match score, then creation date
    return scoredProfiles.sort((a, b) => {
      if (sortBy === 'synergy') {
        // Prioritize synergy score if both have it
        if (a.synergyScore !== undefined && b.synergyScore !== undefined) {
          if (b.synergyScore !== a.synergyScore) {
            return b.synergyScore - a.synergyScore;
          }
        }
        // Then by skill match score
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
      } else if (sortBy === 'skills') {
        // Sort by skill match score first
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // Then by synergy if available
        if (a.synergyScore !== undefined && b.synergyScore !== undefined) {
          if (b.synergyScore !== a.synergyScore) {
            return b.synergyScore - a.synergyScore;
          }
        }
      } else if (sortBy === 'recent') {
        // Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Default: sort by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [profiles, hackathon.requiredSkills, hackathon.technologies, hackathon.location, hackathon.mode, hackathon.teamMembers, user?.uid, currentProfile, sortBy]);

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

    if (selectedReliability === 'reliable+') {
      // Show only Reliable, Finisher, or Legend (exclude Newbie)
      filtered = filtered.filter(profile => 
        profile.reliabilityLevel && profile.reliabilityLevel !== 'newbie'
      );
    }

    if (showLookingForTeamOnly) {
      filtered = filtered.filter(profile => profile.lookingForTeam);
    }

    return filtered;
  }, [recommendedProfiles, selectedExperience, selectedAvailability, selectedReliability, showLookingForTeamOnly]);

  // Fire ONE Gemini batch call when top candidates are ready
  useEffect(() => {
    if (aiCalledRef.current || !currentProfile || filteredProfiles.length === 0) return;
    aiCalledRef.current = true;

    const top5: CandidateSummary[] = filteredProfiles.slice(0, 5).map(p => ({
      uid: p.uid,
      name: p.name,
      skills: p.skills ?? [],
      interests: p.interests,
      workStyle: p.workStyle
        ? {
            goal: p.workStyle.goal,
            timePreference: p.workStyle.timePreference,
            commitment: p.workStyle.commitment,
          }
        : undefined,
      experience: p.experience,
      synergyScore: p.synergyScore ?? 0,
    }));

    getAIMatchReasons(
      {
        name: currentProfile.name,
        skills: currentProfile.skills ?? [],
        interests: currentProfile.interests,
        workStyle: currentProfile.workStyle as Record<string, string> | undefined,
      },
      hackathon.title,
      hackathon.requiredSkills ?? [],
      top5
    ).then(reasons => setAiReasons(reasons));
  }, [filteredProfiles, currentProfile, hackathon]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshProfiles();
    setTimeout(() => setIsRefreshing(false), 1000);
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
              {(hackathon.requiredSkills && hackathon.requiredSkills.length > 0) || (hackathon.technologies && hackathon.technologies.length > 0)
                ? "Profiles matching your hackathon's skills, technologies, and interests"
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
      <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters & Sorting</span>
          </div>
          {(selectedExperience !== 'all' || selectedAvailability !== 'all' || selectedReliability !== 'all' || showLookingForTeamOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedExperience('all');
                setSelectedAvailability('all');
                setSelectedReliability('all');
                setShowLookingForTeamOnly(false);
              }}
              className="text-xs h-7"
            >
              Clear All
            </Button>
          )}
        </div>
        
        {/* Sort By */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Sort By</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSortBy('synergy')}
              className={cn(
                "px-3 py-2 rounded text-xs font-medium transition-colors",
                sortBy === 'synergy'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-input hover:border-primary'
              )}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Synergy
            </button>
            <button
              onClick={() => setSortBy('skills')}
              className={cn(
                "px-3 py-2 rounded text-xs font-medium transition-colors",
                sortBy === 'skills'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-input hover:border-primary'
              )}
            >
              <Star className="w-3 h-3 inline mr-1" />
              Skills
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={cn(
                "px-3 py-2 rounded text-xs font-medium transition-colors",
                sortBy === 'recent'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-input hover:border-primary'
              )}
            >
              Recent
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Experience Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Experience Level</label>
            <div className="grid grid-cols-2 gap-1">
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
            <div className="grid grid-cols-2 gap-1">
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

          {/* Reliability Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Reliability</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setSelectedReliability('all')}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                  selectedReliability === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-input hover:border-primary'
                )}
              >
                All
              </button>
              <button
                onClick={() => setSelectedReliability('reliable+')}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                  selectedReliability === 'reliable+'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-input hover:border-primary'
                )}
                title="Show only Reliable, Finisher, and Legend users (exclude Newbies)"
              >
                ✓ Reliable+
              </button>
            </div>
          </div>
        </div>

        {/* Looking for Team Filter */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLookingForTeamOnly}
              onChange={(e) => setShowLookingForTeamOnly(e.target.checked)}
              className="rounded border-input"
            />
            <span className="text-xs font-medium">Show only users looking for team</span>
          </label>
        </div>
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
            <span className="ml-2 text-primary">
              • Sorted by {sortBy === 'synergy' ? 'compatibility' : sortBy === 'skills' ? 'skill match' : 'most recent'}
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
                  <div className="flex flex-col gap-1">
                    {profile.synergyScore !== undefined && profile.synergyScore >= 50 && (
                      <Badge className={cn(
                        'text-xs font-bold',
                        profile.synergyScore >= 75 ? 'bg-green-500 hover:bg-green-600' :
                        profile.synergyScore >= 50 ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-red-500 hover:bg-red-600'
                      )}>
                        <Zap className="w-3 h-3 mr-1" />
                        {profile.synergyScore}% synergy
                      </Badge>
                    )}
                    {profile.matchScore > 0 && (
                      <Badge className={cn('text-xs font-bold', getMatchScoreColor(profile.matchScore))}>
                        {profile.matchScore}% skills
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {profile.bio}
                  </p>
                )}

                {/* AI Match Reason */}
                {aiReasons.get(profile.uid) && (
                  <div className="mb-3 flex items-start gap-1.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-md px-2 py-1.5">
                    <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{aiReasons.get(profile.uid)}</span>
                  </div>
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

                {/* Matching Technologies/Interests */}
                {profile.matchingTechnologies && profile.matchingTechnologies.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Matching Interests:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.matchingTechnologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="default" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {tech}
                        </Badge>
                      ))}
                      {profile.matchingTechnologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.matchingTechnologies.length - 3} more
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
                    onSendMessage(profile.uid);
                  }}
                  className="w-full gap-2 text-xs"
                  size="sm"
                  variant="outline"
                >
                  <MessageCircle className="h-3 w-3" />
                  Message
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