import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Trophy,
  Share2,
  X,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Users,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnnouncementSection } from '@/components/hackathon/AnnouncementSection';
import { ChatSection } from '@/components/hackathon/ChatSection';
import { UserProfileModal } from '@/components/UserProfileModal';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathon, useHackathons } from '@/hooks/useHackathons';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useChat } from '@/hooks/useChat';
import { useProfiles } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function HackathonDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hackathon, loading } = useHackathon(id || '');
  const { updateHackathonStatus, deleteHackathon, joinHackathon, leaveHackathon } = useHackathons();
  const { announcements, loading: announcementsLoading, createAnnouncement } = useAnnouncements(id || '');
  const { messages, loading: chatLoading, sendMessage } = useChat(id || '');
  const { getProfileById } = useProfiles();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<{ id: string; name: string } | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        <div className="glass rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-4" />
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Hackathon not found</h2>
        <Link to="/hackathons">
          <Button variant="outline">Back to Hackathons</Button>
        </Link>
      </div>
    );
  }

  const isHackathonCreator = user?.uid === hackathon?.creatorId;
  const isUserJoined = hackathon?.teamMembers?.includes(user?.uid || '') || false;

  const handleJoinLeave = async () => {
    if (!hackathon || !user) return;
    
    // Prevent join/leave for closed hackathons
    if (hackathon.status === 'closed') {
      toast.error('Cannot join or leave a closed hackathon');
      return;
    }

    try {
      if (isUserJoined) {
        await leaveHackathon(hackathon.id);
        toast.success('You left the hackathon successfully!');
      } else {
        await joinHackathon(hackathon.id);
        toast.success('You joined the hackathon successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hackathon membership');
    }
  };

  const handlePostAnnouncement = async (title: string, content: string) => {
    try {
      await createAnnouncement(title, content);
      toast.success('Announcement posted!');
    } catch (error) {
      toast.error('Failed to post announcement');
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleStatusToggle = async () => {
    if (!hackathon || !isHackathonCreator) return;
    
    try {
      const newStatus = hackathon.status === 'open' ? 'closed' : 'open';
      await updateHackathonStatus(hackathon.id, newStatus);
      toast.success(`Hackathon ${newStatus === 'open' ? 'reopened' : 'closed'} successfully!`);
    } catch (error) {
      toast.error('Failed to update hackathon status');
    }
  };

  const handleDelete = async () => {
    if (!hackathon || !isHackathonCreator) return;
    
    if (window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      try {
        await deleteHackathon(hackathon.id);
        toast.success('Hackathon deleted successfully!');
        navigate('/hackathons');
      } catch (error) {
        toast.error('Failed to delete hackathon');
      }
    }
  };

  const handleProfileClick = (userId: string, userName: string) => {
    setProfileModalUser({ id: userId, name: userName });
    setProfileModalOpen(true);
  };

  const statusColors = {
    open: 'bg-success/20 text-success border-success/30',
    closed: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/hackathons">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Hackathons
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Image Header */}
        {hackathon.image && (
          <div className="relative overflow-hidden">
            <img 
              src={hackathon.image} 
              alt={hackathon.title}
              className="w-full max-h-96 object-contain cursor-pointer hover:opacity-80 transition-opacity bg-muted/20"
              onClick={() => setImageModalOpen(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          </div>
        )}
        
        <div className="p-6 md:p-8 relative">
          {!hackathon.image && (
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
          )}
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 md:mb-6 gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn('border text-xs md:text-sm', statusColors[hackathon.status as keyof typeof statusColors])}>
                  {hackathon.status}
                </Badge>
                <Badge variant="outline" className="text-xs md:text-sm">
                  {hackathon.mode}
                </Badge>
              </div>
              
              {/* Action Buttons - Mobile Responsive */}
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                {/* Join/Leave Button for Non-Creators */}
                {!isHackathonCreator && (
                  <Button
                    variant={isUserJoined ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleJoinLeave}
                    disabled={hackathon.status === 'closed'}
                    className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[70px]"
                  >
                    {isUserJoined ? (
                      <>
                        <UserMinus className="h-3 w-3 md:h-4 md:w-4" />
                        <span>Leave</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                        <span>Join</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* Creator Actions */}
                {isHackathonCreator && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/hackathons/${hackathon.id}/edit`)}
                      className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[60px]"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant={hackathon.status === 'open' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={handleStatusToggle}
                      className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[70px]"
                    >
                      {hackathon.status === 'open' ? (
                        <>
                          <Lock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Close</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Reopen</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[70px]"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Delete</span>
                    </Button>
                  </>
                )}
                
                {/* Share Button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1 px-3 py-2 min-w-[65px]"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: hackathon.title,
                        text: hackathon.description,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">Share</span>
                </Button>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{hackathon.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 max-w-3xl">
              {hackathon.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-xs md:text-sm font-medium">
                    {new Date(`${hackathon.date}T${hackathon.time}`).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })} at {new Date(`${hackathon.date}T${hackathon.time}`).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-xs md:text-sm font-medium">{hackathon.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Team Size</p>
                  <p className="text-xs md:text-sm font-medium text-primary">{hackathon.teamSize} members</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mode</p>
                  <p className="text-xs md:text-sm font-medium">{hackathon.mode}</p>
                </div>
              </div>
            </div>

            {/* Skills Tags */}
            {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {hackathon.requiredSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gender Preference */}
            {hackathon.preferredGender && hackathon.preferredGender !== 'any' && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Gender Preference:</p>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm capitalize">
                  {hackathon.preferredGender === 'mixed' ? 'Mixed Gender' : hackathon.preferredGender}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="announcements" className="data-[state=active]:bg-background">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-background">
            General Chat
          </TabsTrigger>
          {isHackathonCreator && (
            <TabsTrigger value="members" className="data-[state=active]:bg-background">
              Team Members ({hackathon.teamMembers?.length || 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementSection
            announcements={announcements}
            isOrganizer={isHackathonCreator}
            onPostAnnouncement={handlePostAnnouncement}
            loading={announcementsLoading}
          />
        </TabsContent>

        <TabsContent value="chat">
          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            onProfileClick={handleProfileClick}
            loading={chatLoading}
            hackathon={hackathon ? {
              id: hackathon.id,
              teamMembers: hackathon.teamMembers,
              creatorId: hackathon.creatorId,
              status: hackathon.status
            } : undefined}
          />
        </TabsContent>

        {isHackathonCreator && (
          <TabsContent value="members">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">Team Members</h3>
                <Badge variant="secondary">
                  {hackathon.teamMembers?.length || 0} / {hackathon.teamSize}
                </Badge>
              </div>

              {!hackathon.teamMembers || hackathon.teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No team members yet</h4>
                  <p className="text-muted-foreground">
                    Share your hackathon to get people to join your team!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hackathon.teamMembers.map((memberId) => {
                    const memberProfile = getProfileById(memberId);
                    const isCreator = memberId === hackathon.creatorId;
                    
                    return (
                      <div
                        key={memberId}
                        className={cn(
                          "p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                          isCreator 
                            ? "bg-primary/5 border-primary/30" 
                            : "bg-background border-border hover:border-primary/50"
                        )}
                        onClick={() => handleProfileClick(memberId, memberProfile?.name || 'Unknown User')}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <AvatarUpload
                            currentAvatar={memberProfile?.avatar || null}
                            userName={memberProfile?.name || 'Unknown User'}
                            size="md"
                            editable={false}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate">
                                {memberProfile?.name || 'Unknown User'}
                              </h4>
                              {isCreator && (
                                <Badge variant="default" className="text-xs">
                                  Creator
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {memberProfile?.college || 'Unknown College'}
                            </p>
                          </div>
                        </div>

                        {memberProfile?.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {memberProfile.bio}
                          </p>
                        )}

                        {memberProfile?.skills && memberProfile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {memberProfile.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {memberProfile.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{memberProfile.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{memberProfile?.experience || 'Beginner'}</span>
                            <span>{memberProfile?.availableFor || 'Both'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hackathon.teamMembers && hackathon.teamMembers.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Team Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {hackathon.teamMembers.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Members</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">
                        {hackathon.teamSize - hackathon.teamMembers.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Spots Left</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">
                        {Math.round((hackathon.teamMembers.length / hackathon.teamSize) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Team Full</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">
                        {hackathon.teamMembers.filter(id => {
                          const profile = getProfileById(id);
                          return profile?.lookingForTeam;
                        }).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Active Members</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Full Screen Image Modal */}
      {imageModalOpen && hackathon?.image && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={hackathon.image} 
              alt={`${hackathon.title} - Full size`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <UserProfileModal
        userId={profileModalUser?.id || null}
        userName={profileModalUser?.name || ''}
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setProfileModalUser(null);
        }}
        onSendMessage={(userId) => {
          navigate(`/messages?with=${userId}`);
        }}
      />
    </div>
  );
}
