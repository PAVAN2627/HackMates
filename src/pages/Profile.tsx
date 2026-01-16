import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Edit, Save, Linkedin, Github, Globe, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarUpload } from '@/components/AvatarUpload';
import { WorkStyleSelector } from '@/components/WorkStyleSelector';
import { SynergyBadge } from '@/components/SynergyBadge';
import { ReliabilityBadge } from '@/components/ReliabilityBadge';
import { calculateSynergyScore } from '@/lib/synergyAlgorithm';
import { useTeamFeedback } from '@/hooks/useTeamFeedback';
import { db, COLLECTIONS } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, profile: currentProfile, loading: authLoading, updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    skills: [] as string[],
    bio: '',
    linkedin: '',
    github: '',
    portfolio: '',
    experience: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    interests: [] as string[],
    availableFor: 'both' as 'online' | 'in-person' | 'both',
    gender: 'prefer-not-to-say' as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say',
    avatar: '' as string,
    workStyle: {
      goal: 'learn' as 'win' | 'learn',
      timePreference: 'flexible' as 'night-owl' | 'early-bird' | 'flexible',
      commitment: 'part-time' as 'full-time' | 'part-time' | 'casual',
      hoursAvailable: 20
    }
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  // Determine if viewing own profile
  const isOwnProfile = !userId || userId === currentUser?.uid;
  
  // Load reliability badge and synergy score
  const { reliabilityBadge, feedbacks, loading: feedbackLoading } = useTeamFeedback(profile?.uid);
  const synergyScore = currentProfile && profile && !isOwnProfile && currentProfile.workStyle && profile.workStyle
    ? calculateSynergyScore(currentProfile, profile)
    : null;

  useEffect(() => {
    if (!authLoading) {
      loadProfile();
    }
  }, [userId, authLoading, currentProfile]);

  // Simplified background sync - remove complex localStorage logic
  useEffect(() => {
    if (currentUser?.uid) {
      const backup = localStorage.getItem(`profile_backup_${currentUser.uid}`);
      if (backup) {
        try {
          const backupData = JSON.parse(backup);
          // Simple background sync without blocking UI
          const docRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
          setDoc(docRef, backupData, { merge: true })
            .then(() => {
              localStorage.removeItem(`profile_backup_${currentUser.uid}`);
              toast.success('Profile synced to server');
            })
            .catch(() => {
              // Keep backup for next attempt
              console.log('Background sync failed, will retry later');
            });
        } catch (error) {
          localStorage.removeItem(`profile_backup_${currentUser.uid}`);
        }
      }
    }
  }, [currentUser]);

  // Remove complex sync function - keep it simple
  const loadProfile = async () => {
    try {
      const targetUserId = userId || currentUser?.uid;
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      // If viewing own profile, use currentProfile from context first
      if (!userId && currentProfile) {
        setProfile(currentProfile);
        setFormData({
          name: currentProfile.name || '',
          college: currentProfile.college || '',
          skills: currentProfile.skills || [],
          bio: currentProfile.bio || '',
          linkedin: currentProfile.linkedin || '',
          github: currentProfile.github || '',
          portfolio: currentProfile.portfolio || '',
          experience: (currentProfile.experience as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
          interests: currentProfile.interests || [],
          availableFor: currentProfile.availableFor || 'both',
          gender: currentProfile.gender || 'prefer-not-to-say',
          avatar: currentProfile.avatar || '',
          workStyle: currentProfile.workStyle || {
            goal: 'learn',
            timePreference: 'flexible',
            commitment: 'part-time',
            hoursAvailable: 20
          }
        });
        setAvatarPreview(currentProfile.avatar || '');
        setLoading(false);
        return;
      }

      // For other users, get profile from Firebase with timeout
      const profileDoc = await Promise.race([
        getDoc(doc(db, COLLECTIONS.USERS, targetUserId)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile load timeout')), 5000)
        )
      ]) as any;
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const fullProfile = {
          id: profileDoc.id,
          uid: targetUserId,
          ...profileData,
          createdAt: profileData.createdAt?.toDate?.() || new Date(),
        } as UserProfile;
        
        setProfile(fullProfile);
        setFormData({
          name: fullProfile.name || '',
          college: fullProfile.college || '',
          skills: fullProfile.skills || [],
          bio: fullProfile.bio || '',
          linkedin: fullProfile.linkedin || '',
          github: fullProfile.github || '',
          portfolio: fullProfile.portfolio || '',
          experience: (fullProfile.experience as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
          interests: fullProfile.interests || [],
          availableFor: fullProfile.availableFor || 'both',
          gender: fullProfile.gender || 'prefer-not-to-say',
          avatar: fullProfile.avatar || '',
          workStyle: fullProfile.workStyle || {
            goal: 'learn',
            timePreference: 'flexible',
            commitment: 'part-time',
            hoursAvailable: 20
          }
        });
        setAvatarPreview(fullProfile.avatar || '');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  // Background sync function
  const syncToFirebase = async (data: any, retryCount = 0) => {
    if (retryCount >= 3) {
      return false;
    }

    try {
      const docRef = doc(db, COLLECTIONS.USERS, currentUser?.uid || '');
      await Promise.race([
        setDoc(docRef, data, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Background sync timeout')), 5000))
      ]);
      
      toast.success('Profile synced to server successfully!');
      
      // Remove from localStorage backup since it's now synced
      if (currentUser?.uid) {
        localStorage.removeItem(`profile_backup_${currentUser.uid}`);
        // Keep current profile data but mark it as synced
        try {
          const current = localStorage.getItem(`profile_current_${currentUser.uid}`);
          if (current) {
            const currentData = JSON.parse(current);
            localStorage.setItem(`profile_current_${currentUser.uid}`, JSON.stringify({
              ...currentData,
              synced: true
            }));
          }
        } catch (error) {
          console.log('Failed to update sync status');
        }
      }
      
      return true;
    } catch (error: any) {
      // Retry after delay
      setTimeout(() => {
        syncToFirebase(data, retryCount + 1);
      }, (retryCount + 1) * 2000); // Exponential backoff: 2s, 4s, 6s
      
      return false;
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Please sign in to update your profile');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.college.trim()) {
      toast.error('College is required');
      return;
    }

    setSaving(true);
    
    try {
      // Create update data
      const updateData = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        skills: formData.skills || [],
        bio: formData.bio?.trim() || '',
        linkedin: formData.linkedin?.trim() || '',
        github: formData.github?.trim() || '',
        portfolio: formData.portfolio?.trim() || '',
        experience: formData.experience || 'Beginner',
        interests: formData.interests || [],
        availableFor: formData.availableFor || 'both',
        gender: formData.gender || 'prefer-not-to-say',
        avatar: formData.avatar || '',
        workStyle: formData.workStyle,
        updatedAt: new Date(),
      };
      
      // Update local state immediately for instant UI feedback
      const updatedProfile = { 
        ...profile, 
        ...updateData
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
      // Update AuthContext (non-blocking)
      updateProfile(updateData).catch(console.error);
      
      // Firebase sync in background (non-blocking)
      const docRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
      setDoc(docRef, updateData, { merge: true }).catch(error => {
        console.error('Firebase sync failed:', error);
        // Store in localStorage as backup
        localStorage.setItem(`profile_backup_${currentUser.uid}`, JSON.stringify(updateData));
      });
      
    } catch (error: any) {
      toast.error(`Save failed: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 1048487 bytes ≈ 1MB)
      if (file.size > 1048487) {
        toast.error(`Image size should be less than 1MB. Current size: ${Math.round(file.size / 1024)}KB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleSendMessage = () => {
    if (!profile) return;
    navigate(`/messages?with=${profile.uid}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/profiles')}>Browse Profiles</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Profile Header */}
      <div className="glass rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {isEditing ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  {!avatarPreview ? (
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-primary/60" />
                        <p className="text-xs text-primary/60">Upload Photo</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Photo size must be less than 1MB
                </p>
              </div>
            ) : (
              <AvatarUpload
                currentAvatar={profile.avatar || null}
                userName={profile.name}
                userGender={profile.gender as any}
                size="lg"
                editable={false}
              />
            )}
          </div>

          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="college">College *</Label>
                    <Input
                      id="college"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="Your college/university"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <select
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value as any })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="availableFor">Available For</Label>
                    <select
                      id="availableFor"
                      value={formData.availableFor}
                      onChange={(e) => setFormData({ ...formData, availableFor: e.target.value as any })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="online">Online Only</option>
                      <option value="in-person">In-Person Only</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="mt-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-input rounded-md p-3">
                      {[
                        'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js',
                        'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
                        'JavaScript', 'TypeScript', 'HTML/CSS', 'Tailwind CSS',
                        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
                        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'DevOps',
                        'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
                        'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
                        'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop',
                        'Blockchain', 'Web3', 'Solidity', 'Smart Contracts',
                        'Game Development', 'Unity', 'Unreal Engine',
                        'Cybersecurity', 'Penetration Testing', 'Ethical Hacking',
                        'IoT', 'Arduino', 'Raspberry Pi', 'Embedded Systems',
                        'GraphQL', 'REST APIs', 'Microservices', 'System Design'
                      ].map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            const newSkills = formData.skills.includes(skill)
                              ? formData.skills.filter(s => s !== skill)
                              : [...formData.skills, skill];
                            setFormData({ ...formData, skills: newSkills });
                          }}
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            formData.skills.includes(skill)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Interests</Label>
                  <div className="mt-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-input rounded-md p-3">
                      {[
                        'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science',
                        'Blockchain', 'Game Development', 'IoT', 'Cybersecurity',
                        'Cloud Computing', 'DevOps', 'UI/UX Design', 'AR/VR',
                        'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Social Impact'
                      ].map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            const newInterests = formData.interests.includes(interest)
                              ? formData.interests.filter(i => i !== interest)
                              : [...formData.interests, interest];
                            setFormData({ ...formData, interests: newInterests });
                          }}
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            formData.interests.includes(interest)
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Social Links</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github">GitHub Profile</Label>
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Portfolio Website</Label>
                      <Input
                        id="portfolio"
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Style Preferences */}
                <div className="space-y-4">
                  <WorkStyleSelector 
                    workStyle={formData.workStyle} 
                    onChange={(workStyle) => setFormData({ ...formData, workStyle })} 
                  />
                </div>
              </div>
            ) : (
              <div>
                {/* Synergy & Reliability Badges */}
                {(synergyScore || reliabilityBadge) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {synergyScore && (
                      <SynergyBadge score={synergyScore} />
                    )}
                    {reliabilityBadge && (
                      <ReliabilityBadge badge={reliabilityBadge} showDetails />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <p className="text-muted-foreground">{profile.college}</p>
                  </div>
                  <div className="flex gap-2">
                    {!isOwnProfile && (
                      <Button onClick={handleSendMessage} className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                    )}
                    {isOwnProfile && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{profile.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p className="text-sm">{profile.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available For</p>
                    <p className="text-sm capitalize">{profile.availableFor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm">{profile.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Looking for Team</p>
                    <p className="text-sm">{profile.lookingForTeam ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(skill => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(interest => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex gap-4">
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>

                {/* Team Feedback Reviews */}
                {feedbacks && feedbacks.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">
                      Team Feedback ({feedbacks.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="glass rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{feedback.hackathonTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                From: {feedback.fromUserName}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
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
                                <p className="text-sm text-muted-foreground italic">
                                  "{feedback.comment}"
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-destructive">
                              Did not contribute to the project
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(feedback.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSave();
                  }} 
                  disabled={saving} 
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}