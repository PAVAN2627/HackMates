import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  UserMinus,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnnouncementSection } from '@/components/hackathon/AnnouncementSection';
import { ChatSection } from '@/components/hackathon/ChatSection';
import { RecommendedProfiles } from '@/components/hackathon/RecommendedProfiles.tsx';
import { TeamManagement } from '@/components/hackathon/TeamManagement';
import { UserProfileModal } from '@/components/UserProfileModal';
import { AvatarUpload } from '@/components/AvatarUpload';
import { TeamFeedbackModal } from '@/components/TeamFeedbackModal';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathon, useHackathons } from '@/hooks/useHackathons';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useChat } from '@/hooks/useChat';
import { useProfiles } from '@/hooks/useProfiles';
import { useTeamFeedback } from '@/hooks/useTeamFeedback';
import { useTeams } from '@/hooks/useTeams';
import { cn } from '@/lib/utils';
import { formatTextForDisplay } from '@/lib/textFormatter';
import { toast } from 'sonner';

export default function HackathonDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'announcements');
  const { hackathon, loading } = useHackathon(id || '');
  const { updateHackathonStatus, deleteHackathon, joinHackathon, leaveHackathon } = useHackathons();
  const { announcements, loading: announcementsLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(id || '');
  const { messages, loading: chatLoading, sendMessage, editMessage, deleteMessage } = useChat(id || '');
  const { getProfileById } = useProfiles();
  const { submitFeedback } = useTeamFeedback();
  const { getUserTeam, isUserInAnyTeam, addMemberToTeam, removeNonTeamMembers } = useTeams();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<{ id: string; name: string } | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [addToTeamDialogOpen, setAddToTeamDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
  const userTeam = getUserTeam(hackathon?.teams, user?.uid || '');

  const handleJoinLeave = async () => {
    if (!hackathon || !user) return;
    
    // Prevent join/leave for in-progress or completed hackathons
    if (hackathon.status !== 'open') {
      toast.error('Cannot join or leave a hackathon that is not open');
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

  const handleUpdateAnnouncement = async (id: string, title: string, content: string) => {
    try {
      await updateAnnouncement(id, title, content);
      toast.success('Announcement updated!');
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted!');
    } catch (error) {
      toast.error('Failed to delete announcement');
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
      let newStatus: 'open' | 'in-progress' | 'completed';
      let message: string;
      
      if (hackathon.status === 'open') {
        newStatus = 'in-progress';
        message = 'Hackathon started! Teams can now work on their projects.';
      } else if (hackathon.status === 'in-progress') {
        newStatus = 'completed';
        message = 'Hackathon completed! Team members can now rate each other.';
      } else {
        newStatus = 'open';
        message = 'Hackathon reopened for registrations.';
      }
      
      await updateHackathonStatus(hackathon.id, newStatus);
      toast.success(message);
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

  const handleAddToTeam = async (teamId: string) => {
    if (!selectedMemberId || !hackathon || !user) return;
    
    const selectedTeam = hackathon.teams?.find(t => t.id === teamId);
    if (!selectedTeam) return;
    
    const success = await addMemberToTeam(
      hackathon.id,
      hackathon.title,
      teamId,
      selectedTeam.name,
      selectedMemberId,
      user.displayName || 'Hackathon Creator',
      hackathon.teams || []
    );
    
    if (success) {
      setAddToTeamDialogOpen(false);
      setSelectedMemberId(null);
      // No reload needed - useHackathon listener will update automatically
    }
  };

  const handleRemoveNonTeamMembers = async () => {
    if (!hackathon) return;
    
    const confirmed = window.confirm(
      'This will remove all members who are not in any team from the hackathon. Continue?'
    );
    
    if (confirmed) {
      await removeNonTeamMembers(
        hackathon.id,
        hackathon.teams || [],
        hackathon.teamMembers || []
      );
      // No reload needed - useHackathon listener will update automatically
    }
  };

  const statusColors = {
    open: 'bg-success/20 text-success border-success/30',
    'in-progress': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    completed: 'bg-muted text-muted-foreground border-muted',
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
                <Badge className={cn('border text-xs md:text-sm capitalize', statusColors[hackathon.status as keyof typeof statusColors])}>
                  {hackathon.status === 'in-progress' ? 'In Progress' : hackathon.status}
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
                    disabled={hackathon.status !== 'open'}
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
                      variant={hackathon.status === 'open' ? 'default' : hackathon.status === 'in-progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleStatusToggle}
                      className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[90px]"
                    >
                      {hackathon.status === 'open' ? (
                        <>
                          <Lock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Start</span>
                        </>
                      ) : hackathon.status === 'in-progress' ? (
                        <>
                          <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Complete</span>
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
                
                {/* Rate Teammates Button - Show for team members when hackathon is completed */}
                {hackathon.status === 'completed' && userTeam && userTeam.memberIds.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFeedbackModalOpen(true)}
                    className="gap-1 text-xs md:text-sm px-3 py-2"
                  >
                    <Star className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Rate Teammates</span>
                  </Button>
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
            <div className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6 max-w-3xl whitespace-pre-wrap">
              {formatTextForDisplay(hackathon.description)}
            </div>

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
                  <p className="text-xs text-muted-foreground">Suggested Team Size</p>
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
                  {hackathon.requiredSkills.map((skill: string) => (
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="bg-muted/50 p-1 w-full min-w-fit flex-nowrap">
            <TabsTrigger value="announcements" className="data-[state=active]:bg-background whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Announcements</span>
              <span className="sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-background whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">General Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-background whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Teams ({hackathon.teams?.length || 0})</span>
              <span className="sm:hidden">Teams ({hackathon.teams?.length || 0})</span>
            </TabsTrigger>
            {isHackathonCreator && (
              <TabsTrigger value="members" className="data-[state=active]:bg-background whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Team Members ({hackathon.teamMembers?.length || 0})</span>
                <span className="sm:hidden">Members ({hackathon.teamMembers?.length || 0})</span>
              </TabsTrigger>
            )}
            {isHackathonCreator && (
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-background whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Recommended Profiles</span>
                <span className="sm:hidden">Profiles</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="announcements">
          <AnnouncementSection
            announcements={announcements}
            isOrganizer={isHackathonCreator}
            onPostAnnouncement={handlePostAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            loading={announcementsLoading}
          />
        </TabsContent>

        <TabsContent value="chat">
          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
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

        <TabsContent value="teams">
          <TeamManagement
            hackathonId={hackathon.id}
            hackathonTitle={hackathon.title}
            hackathonStatus={hackathon.status}
            teams={hackathon.teams || []}
            suggestedTeamSize={hackathon.teamSize}
            allParticipants={hackathon.teamMembers || []}
            isCreator={isHackathonCreator}
            onProfileClick={handleProfileClick}
            onRefresh={() => {}} // Empty function - real-time listener handles updates
          />
        </TabsContent>

        {isHackathonCreator && (
          <TabsContent value="members">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Joined Members</h3>
                    <p className="text-sm text-muted-foreground">
                      Select members to add to teams
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {hackathon.teamMembers?.length || 0} joined
                  </Badge>
                </div>
                
                {hackathon.teams && hackathon.teams.length > 0 && hackathon.teamMembers && hackathon.teamMembers.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveNonTeamMembers}
                    className="gap-2"
                  >
                    <UserMinus className="h-4 w-4" />
                    Remove Non-Team Members
                  </Button>
                )}
              </div>

              {!hackathon.teamMembers || hackathon.teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">No members yet</h4>
                  <p className="text-muted-foreground">
                    Share your hackathon to get people to join!
                  </p>
                </div>
              ) : (
                <>
                  {/* Statistics */}
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {hackathon.teamMembers.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Joined</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">
                          {hackathon.teams?.reduce((sum, team) => sum + team.memberIds.length, 0) || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">In Teams</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">
                          {hackathon.teamMembers.filter(id => !isUserInAnyTeam(hackathon.teams, id)).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Not in Teams</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-500">
                          {hackathon.teams?.length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Teams</p>
                      </div>
                    </div>
                  </div>

                  {/* Members Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hackathon.teamMembers.map((memberId) => {
                      const memberProfile = getProfileById(memberId);
                      const isCreator = memberId === hackathon.creatorId;
                      const inTeam = isUserInAnyTeam(hackathon.teams, memberId);
                      
                      return (
                        <div
                          key={memberId}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            isCreator 
                              ? "bg-primary/5 border-primary/30" 
                              : inTeam
                              ? "bg-green-500/5 border-green-500/30"
                              : "bg-background border-border"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <AvatarUpload
                              currentAvatar={memberProfile?.avatar || null}
                              userName={memberProfile?.name || 'Unknown User'}
                              userGender={memberProfile?.gender as any}
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
                                {inTeam && !isCreator && (
                                  <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                                    In Team
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
                            <div className="flex flex-wrap gap-1 mb-3">
                              {memberProfile.skills.slice(0, 3).map((skill: string) => (
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

                          <div className="pt-3 border-t border-border space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{memberProfile?.experience || 'Beginner'}</span>
                              <span>{memberProfile?.availableFor || 'Both'}</span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1"
                                onClick={() => handleProfileClick(memberId, memberProfile?.name || 'Unknown User')}
                              >
                                <Users className="h-3 w-3" />
                                View Profile
                              </Button>
                              
                              {!isCreator && !inTeam && hackathon.teams && hackathon.teams.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1 gap-1"
                                  onClick={() => {
                                    setSelectedMemberId(memberId);
                                    setAddToTeamDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="h-3 w-3" />
                                  Add to Team
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        )}

        {isHackathonCreator && (
          <TabsContent value="recommendations">
            <RecommendedProfiles 
              hackathon={hackathon}
              onProfileClick={handleProfileClick}
              onSendMessage={(userId) => navigate(`/messages?with=${userId}`)}
            />
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

      {/* Team Feedback Modal */}
      {hackathon && userTeam && (
        <TeamFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          hackathonId={hackathon.id}
          hackathonTitle={hackathon.title}
          teamMembers={userTeam.memberIds
            .filter(memberId => memberId !== user?.uid)
            .map(memberId => {
              const memberProfile = getProfileById(memberId);
              return {
                userId: memberId,
                userName: memberProfile?.name || 'Unknown User'
              };
            })}
          onSubmit={submitFeedback}
        />
      )}

      {/* Add to Team Dialog */}
      {hackathon && selectedMemberId && (
        <Dialog open={addToTeamDialogOpen} onOpenChange={setAddToTeamDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member to Team</DialogTitle>
              <DialogDescription>
                Select which team to add {getProfileById(selectedMemberId)?.name || 'this member'} to
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              {hackathon.teams && hackathon.teams.length > 0 ? (
                hackathon.teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleAddToTeam(team.id)}
                    className="w-full p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{team.name}</h4>
                      <Badge variant={team.memberIds.length >= hackathon.teamSize ? "default" : "outline"}>
                        {team.memberIds.length}/{hackathon.teamSize}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}
                      {team.memberIds.length >= hackathon.teamSize && ' (Full)'}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No teams created yet</p>
                  <p className="text-sm text-muted-foreground">
                    Go to the Teams tab to create a team first
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
