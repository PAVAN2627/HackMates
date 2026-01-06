import { useState, useEffect } from 'react';
import { MessageCircle, X, Linkedin, Github, Globe, MapPin, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSendMessage = () => {
    if (userId) {
      onSendMessage(userId);
      onClose();
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

                {/* Actions */}
                {userId !== user?.uid && (
                  <div className="border-t border-border pt-4">
                    <Button
                      onClick={handleSendMessage}
                      className="w-full gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send Message
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