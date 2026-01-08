import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Tag, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileCard } from '@/components/ProfileCard';
import { UserProfileModal } from '@/components/UserProfileModal';
import { Loading } from '@/components/Loading';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { toast } from 'sonner';

const skillsOptions = [
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
];

const locationOptions = [
  'Bangalore', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad', 
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Indore',
  'Chandigarh', 'Lucknow', 'Nagpur', 'Bhopal', 'Coimbatore', 'Other'
];

const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];

export default function Profiles() {
  const { profiles, loading, refreshProfiles } = useProfiles();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { sendMessage } = useDirectMessages();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedAvailability, setSelectedAvailability] = useState<'online' | 'in-person' | 'both' | ''>('');
  const [selectedExperience, setSelectedExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<{ id: string; name: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingMessageTo, setSendingMessageTo] = useState<string | null>(null);

  // Filter profiles
  let filtered = profiles;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.bio?.toLowerCase().includes(term)
    );
  }

  if (selectedSkills.length > 0) {
    filtered = filtered.filter(p =>
      p.skills.some(skill => selectedSkills.includes(skill))
    );
  }

  if (selectedLocation) {
    filtered = filtered.filter(p => p.location === selectedLocation);
  }

  if (selectedAvailability) {
    filtered = filtered.filter(p =>
      p.availableFor === selectedAvailability || p.availableFor === 'both'
    );
  }

  if (selectedExperience) {
    filtered = filtered.filter(p => p.experience === selectedExperience);
  }

  // Remove current user from results
  if (user) {
    filtered = filtered.filter(p => p.uid !== user.uid);
  }

  const handleMessage = async (recipientId: string) => {
    if (!user || !profile) {
      toast.error('Please log in to send messages');
      return;
    }

    // Find the recipient profile to personalize the message
    const recipientProfile = profiles.find(p => p.uid === recipientId);
    if (!recipientProfile) {
      toast.error('Profile not found');
      return;
    }

    setSendingMessageTo(recipientId);

    try {
      // Create personalized professional message
      let message = `Hi ${recipientProfile.name}! 👋\n\n`;
      message += `I came across your profile on HackMates and I'm impressed with your background. `;
      
      if (recipientProfile.skills && recipientProfile.skills.length > 0) {
        const skillsToMention = recipientProfile.skills.slice(0, 3);
        message += `Your expertise in ${skillsToMention.join(', ')} `;
        if (recipientProfile.skills.length > 3) {
          message += `and other technologies `;
        }
        message += `caught my attention. `;
      }
      
      if (recipientProfile.college) {
        message += `It's great to connect with someone from ${recipientProfile.college}. `;
      }
      
      message += `\n\nI'm always looking to connect with talented developers `;
      
      if (recipientProfile.lookingForTeam) {
        message += `and I noticed you're looking for team opportunities. `;
      }
      
      message += `Would you be interested in collaborating on future projects or hackathons? `;
      message += `I believe we could create something amazing together!\n\n`;
      message += `Looking forward to hearing from you! 🚀`;

      await sendMessage(recipientId, message, profile.name, profile.avatar);
      toast.success(`Message sent to ${recipientProfile.name}!`);
      navigate(`/messages?with=${recipientId}`);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSendingMessageTo(null);
    }
  };

  const handleViewProfile = (userId: string, userName: string) => {
    setSelectedProfileUser({ id: userId, name: userName });
    setProfileModalOpen(true);
  };

  const handleProfileModalMessage = (userId: string) => {
    setProfileModalOpen(false);
    navigate(`/messages?with=${userId}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      refreshProfiles();
      toast.success('Profiles refreshed!');
    } catch (error) {
      toast.error('Failed to refresh profiles');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000); // Show loading for at least 1 second
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">HackMates</h1>
          </div>
          <p className="text-muted-foreground">Search and connect with developers, designers, and creators</p>
          <p className="text-xs text-muted-foreground mt-2">Developed by NoobcodersIND</p>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 space-y-4 pt-4 border-t border-border">
              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                >
                  <option value="">All Locations</option>
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {experienceOptions.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedExperience(selectedExperience === level ? '' : level as any)}
                      className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                        selectedExperience === level
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:border-primary'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Availability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['online', 'in-person', 'both'] as const).map(option => (
                    <button
                      key={option}
                      onClick={() => setSelectedAvailability(selectedAvailability === option ? '' : option)}
                      className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                        selectedAvailability === option
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:border-primary'
                      }`}
                    >
                      {option === 'in-person' ? 'In-Person' : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4" />
                  Skills
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillsOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:border-primary'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedSkills.length > 0 || selectedLocation || selectedAvailability || selectedExperience) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSkills([]);
                    setSelectedLocation('');
                    setSelectedAvailability('');
                    setSelectedExperience('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <Loading 
            message="Loading profiles..." 
            size="sm" 
            inline={true}
          />
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Found {filtered.length} profile{filtered.length !== 1 ? 's' : ''} (Total: {profiles.length})
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {profiles.length === 0 
                    ? "No profiles found in the database. Make sure users have completed their profiles."
                    : "No profiles found matching your filters"
                  }
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedSkills([]);
                  setSelectedLocation('');
                  setSelectedAvailability('');
                  setSelectedExperience('');
                }}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onMessage={handleMessage}
                    onViewProfile={handleViewProfile}
                    showContact={true}
                    isMessageLoading={sendingMessageTo === profile.uid}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Profile Modal */}
        <UserProfileModal
          userId={selectedProfileUser?.id || null}
          userName={selectedProfileUser?.name || ''}
          isOpen={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedProfileUser(null);
          }}
          onSendMessage={handleProfileModalMessage}
        />
      </div>
    </div>
  );
}
