import { useState, useEffect } from 'react';
import { MessageCircle, X, Linkedin, Github, Globe, MapPin, Tag, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { SynergyBadge } from '@/components/SynergyBadge';
import { ReliabilityBadge } from '@/components/ReliabilityBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useTeamFeedback } from '@/hooks/useTeamFeedback';
import { calculateSynergyScore } from '@/lib/synergyAlgorithm';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

interface UserProfileModalProps {
  userId: string | null;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (userId: string) => void;
}

export function UserProfileModal({ 
  userId, 
  userName, 
  isOpen, 
  onClose, 
  onSendMessage 
}: UserProfileModalProps) {
  const { user, profile: currentUserProfile } = useAuth();
  const { sendMessage } = useDirectMessages();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Load reliability badge and calculate synergy score
  const { reliabilityBadge, feedbacks } = useTeamFeedback(userId || undefined);
  const synergyScore = currentUserProfile && profile && currentUserProfile.workStyle && profile.workStyle
    ? calculateSynergyScore(currentUserProfile, profile)
    : null;

  useEffect(() => {
    if (userId && isOpen) {
      loadProfile();
    }
  }, [userId, isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (!userId) return;

      const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const fullProfile = {
          id: profileDoc.id,
          uid: userId,
          ...profileData,
          createdAt: profileData.createdAt?.toDate?.() || new Date(),
        } as UserProfile;
        
        setProfile(fullProfile);
      } else {
        // Fallback profile if not found
        setProfile({
          id: userId,
          uid: userId,
          name: userName,
          email: 'No email available',
          college: 'Unknown',
          location: 'Unknown',
          skills: [],
          bio: 'No bio available',
          availableFor: 'both',
          lookingForTeam: false,
          createdAt: new Date(),
        } as UserProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({
        id: userId || '',
        uid: userId || '',
        name: userName,
        email: 'No email available',
        college: 'Unknown',
        location: 'Unknown',
        skills: [],
        bio: 'No bio available',
        availableFor: 'both',
        lookingForTeam: false,
        createdAt: new Date(),
      } as UserProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userId || !user || !currentUserProfile || !profile) {
      toast.error('Unable to send message');
      return;
    }

    setSendingMessage(true);

    try {
      // Create personalized professional message
      let message = `Hi ${profile.name}! 👋\n\n`;
      message += `I came across your profile on HackMates and I'm impressed with your background. `;
      
      if (profile.skills && profile.skills.length > 0) {
        const skillsToMention = profile.skills.slice(0, 3);
        message += `Your expertise in ${skillsToMention.join(', ')} `;
        if (profile.skills.length > 3) {
          message += `and other technologies `;
        }
        message += `caught my attention. `;
      }
      
      if (profile.college && profile.college !== 'Unknown') {
        message += `It's great to connect with someone from ${profile.college}. `;
      }
      
      message += `\n\nI'm always looking to connect with talented developers `;
      
      if (profile.lookingForTeam) {
        message += `and I noticed you're looking for team opportunities. `;
      }
      
      message += `Would you be interested in collaborating on future projects or hackathons? `;
      message += `I believe we could create something amazing together!\n\n`;
      message += `Looking forward to hearing from you! 🚀`;

      await sendMessage(userId, message, currentUserProfile.name, currentUserProfile.avatar);
      toast.success(`Message sent to ${profile.name}!`);
      onSendMessage(userId); // This will navigate to the messages page
      onClose();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!userId) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="pt-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : profile ? (
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="text-center space-y-3">
                  <div className="mx-auto">
                    <AvatarUpload 
                      currentAvatar={profile.avatar || null}
                      userName={profile.name}
                      userGender={profile.gender as any}
                      size="lg"
                      editable={false}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.college}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{profile.location}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                    {profile.bio}
                  </div>
                )}

                {/* Synergy Score & Reliability Badge */}
                {(synergyScore || reliabilityBadge) && (
                  <div className="space-y-3">
                    {synergyScore && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Compatibility</span>
                          </div>
                          <Badge className={`${
                            synergyScore.overall >= 75 ? 'bg-green-500' :
                            synergyScore.overall >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          } text-white`}>
                            {synergyScore.overall}% Match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {synergyScore.overall >= 75 ? '🎯 High synergy - Great match!' :
                           synergyScore.overall >= 50 ? '👍 Moderate compatibility' :
                           '⚠️ Low compatibility'}
                        </p>
                      </div>
                    )}
                    
                    {reliabilityBadge && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Reliability</span>
                          </div>
                          <Badge className={`${
                            reliabilityBadge.level === 'legend' ? 'bg-yellow-500' :
                            reliabilityBadge.level === 'finisher' ? 'bg-green-500' :
                            reliabilityBadge.level === 'reliable' ? 'bg-blue-500' :
                            'bg-gray-500'
                          } text-white`}>
                            {reliabilityBadge.level === 'legend' ? '👑' :
                             reliabilityBadge.level === 'finisher' ? '⭐' :
                             reliabilityBadge.level === 'reliable' ? '✓' : '🌱'} {reliabilityBadge.level}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{reliabilityBadge.projectsCompleted} hackathon{reliabilityBadge.projectsCompleted !== 1 ? 's' : ''} completed</span>
                          {reliabilityBadge.completionRate > 0 && (
                            <span>{reliabilityBadge.completionRate.toFixed(0)}% success rate</span>
                          )}
                        </div>
                        {/* Debug badge data */}
                        {console.log('Badge data:', reliabilityBadge)}
                      </div>
                    )}
                  </div>
                )}

                {/* Experience and Availability */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.experience && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${experienceColor[profile.experience]}`}>
                      {profile.experience}
                    </span>
                  )}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${availabilityColor[profile.availableFor]}`}>
                    {profile.availableFor === 'in-person' ? 'In-Person' : profile.availableFor.charAt(0).toUpperCase() + profile.availableFor.slice(1)}
                  </span>
                  {profile.lookingForTeam && (
                    <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Looking for Team
                    </span>
                  )}
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Skills</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {profile.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Interests</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {profile.interests.map(interest => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(profile.linkedin || profile.github || profile.portfolio) && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Connect</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors text-sm"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {profile.github && (
                        <a
                          href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 transition-colors text-sm"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {profile.portfolio && (
                        <a
                          href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors text-sm"
                          title="Portfolio"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Team Feedback Reviews */}
                {feedbacks && feedbacks.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
                      Team Feedback ({feedbacks.length})
                    </p>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{feedback.hackathonTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                From: {feedback.fromUserName}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < feedback.rating
                                      ? 'text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {feedback.didContribute ? (
                            <>
                              {feedback.skills && feedback.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {feedback.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {feedback.comment && (
                                <p className="text-xs text-muted-foreground italic">
                                  "{feedback.comment}"
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-destructive">
                              Did not contribute
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Debug: Show if feedbacks exist but not rendering */}
                {console.log('UserProfileModal - feedbacks:', feedbacks, 'length:', feedbacks?.length)}

                {/* Actions */}
                {userId !== user?.uid && (
                  <div className="border-t border-border pt-4">
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage}
                      className="w-full gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Profile not found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}