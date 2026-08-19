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
  Star,
  CheckCircle,
  Plus,
  Search,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AnnouncementSection } from '@/components/hackathon/AnnouncementSection';
import { ChatSection } from '@/components/hackathon/ChatSection';
import { TeamContract } from '@/components/hackathon/TeamContract';
import { TeamContractDialog } from '@/components/TeamContractDialog';
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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'announcements');
  const { hackathon, loading } = useHackathon(id || '');
  const { updateHackathonStatus, deleteHackathon, joinHackathon, leaveHackathon } = useHackathons();
  const { announcements, loading: announcementsLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(id || '');
  const { messages, loading: chatLoading, sendMessage, editMessage, deleteMessage } = useChat(id || '');
  const { getProfileById, profiles } = useProfiles();
  const { submitFeedback } = useTeamFeedback();
  const { getUserTeam, isUserInAnyTeam, addMemberToTeam, removeMemberFromTeam, removeNonTeamMembers, leaveTeam, deleteTeam, createTeam, markTeamCompleted } = useTeams();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<{ id: string; name: string } | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [addToTeamDialogOpen, setAddToTeamDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [joiningHackathon, setJoiningHackathon] = useState(false);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string; memberCount: number } | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  // Confirm dialogs (replacing native confirm())
  const [confirmDeleteHackathon, setConfirmDeleteHackathon] = useState(false);
  const [confirmRemoveNonTeam, setConfirmRemoveNonTeam] = useState(false);
  const [confirmLeaveTeam, setConfirmLeaveTeam] = useState<{ teamId: string } | null>(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{ teamId: string; memberId: string; memberName: string } | null>(null);

  // Create team inline state
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Calculate derived values
  const isHackathonCreator = user?.uid === hackathon?.creatorId;
  
  // Check admin status - first from profile context, then fallback to localStorage cache if needed
  let isAdmin = profile?.isAdmin || false;
  if (!isAdmin && user) {
    // Fallback: Check localStorage cache in case profile hasn't loaded yet
    try {
      const cachedProfileStr = localStorage.getItem(`profile_cache_${user.uid}`);
      if (cachedProfileStr) {
        const cachedProfile = JSON.parse(cachedProfileStr);
        isAdmin = cachedProfile.isAdmin || false;
      }
    } catch (e) {
      console.error('Error reading cached profile:', e);
    }
  }
  
  const isCreatorOrAdmin = isHackathonCreator || isAdmin;
  const isUserJoined = hackathon?.teamMembers?.includes(user?.uid || '') || false;
  const userTeam = getUserTeam(hackathon?.teams, user?.uid || '');
  const isUserInTeam = isUserInAnyTeam(hackathon?.teams, user?.uid || '');
  
  // Debug: Log admin status when page loads
  useEffect(() => {
    console.log('HackathonDetails loaded:', {
      isAdmin,
      isHackathonCreator,
      hasProfile: !!profile,
      userId: user?.uid,
      hackathonCreatorId: hackathon?.creatorId
    });
  }, [isAdmin, isHackathonCreator, profile, user?.uid, hackathon?.creatorId]);
  
  // Any joined member can see the Teams tab (to create or view their team)
  // Admins should NOT see teams tab - they're not participants
  const canSeeTeamsTab = (isUserJoined || isHackathonCreator) && !isAdmin;
  
  // Members tab is ONLY visible to creator or admin (for management)
  const canSeeMembersTab = isCreatorOrAdmin;
  
  // Only creator can manage announcements/teams, admins can only view
  const canManageHackathon = isHackathonCreator;
  const canViewOnly = isAdmin;

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

  const handleJoinLeave = async () => {
    if (!hackathon || !user) return;
    
    // Prevent join/leave for in-progress or completed hackathons
    if (hackathon.status !== 'open') {
      toast.error('Cannot join or leave a hackathon that is not open');
      return;
    }

    try {
      if (isUserJoined) {
        // Check if user has committed to any team in this hackathon
        const hasCommittedToAnyTeam = hackathon.teams?.some(
          team => team.memberIds?.includes(user.uid) && team.committedMemberIds?.includes(user.uid)
        );
        
        if (hasCommittedToAnyTeam) {
          toast.error('❌ You cannot leave after committing to the project! This protects your reliability score.');
          return;
        }
        
        // Leaving hackathon (only if not committed to any team)
        await leaveHackathon(hackathon.id);
        toast.success('You left the hackathon successfully!');
      } else {
        // Joining hackathon - show contract dialog
        setContractDialogOpen(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hackathon membership');
    }
  };

  const handleAcceptContract = async () => {
    if (!hackathon) return;
    
    setJoiningHackathon(true);
    try {
      await joinHackathon(hackathon.id);
      toast.success('You joined the hackathon successfully! Go to Teams tab to start the project.');
      setContractDialogOpen(false);
      // Switch to teams tab
      setActiveTab('teams');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join hackathon');
    } finally {
      setJoiningHackathon(false);
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
    if (!hackathon || !isCreatorOrAdmin) return;
    
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
    if (!hackathon || !isCreatorOrAdmin) return;
    try {
      await deleteHackathon(hackathon.id);
      toast.success('Hackathon deleted successfully!');
      navigate('/hackathons');
    } catch (error) {
      toast.error('Failed to delete hackathon');
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
    await removeNonTeamMembers(
      hackathon.id,
      hackathon.teams || [],
      hackathon.teamMembers || []
    );
  };

  const handleDeleteTeam = async () => {
    if (!hackathon || !teamToDelete) return;
    
    setDeletingTeam(true);
    try {
      const success = await deleteTeam(hackathon.id, teamToDelete.id, hackathon.teams || []);
      if (success) {
        setDeleteTeamDialogOpen(false);
        setTeamToDelete(null);
      }
    } finally {
      setDeletingTeam(false);
    }
  };

  const openDeleteTeamDialog = (team: { id: string; name: string; memberIds?: string[] }) => {
    setTeamToDelete({
      id: team.id,
      name: team.name,
      memberCount: team.memberIds?.length || 0
    });
    setDeleteTeamDialogOpen(true);
  };

  const handleCreateTeamInline = async () => {
    if (!user || !newTeamName.trim() || !hackathon) return;
    setCreatingTeam(true);
    const result = await createTeam(hackathon.id, newTeamName.trim(), user.uid, hackathon.teams || []);
    if (result) {
      setCreateTeamDialogOpen(false);
      setNewTeamName('');
      toast.success(`Team "${newTeamName.trim()}" created! Now invite members by searching below.`);
    }
    setCreatingTeam(false);
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
                {/* Join/Leave Button for Regular Users Only (Not Creators/Admins) */}
                {!isHackathonCreator && !isAdmin && (
                  <Button
                    variant={isUserJoined ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleJoinLeave}
                    disabled={
                      hackathon.status !== 'open' || 
                      (isUserJoined && hackathon.committedMembers?.includes(user?.uid || ''))
                    }
                    className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[70px]"
                  >
                    {isUserJoined ? (
                      <>
                        <UserMinus className="h-3 w-3 md:h-4 md:w-4" />
                        <span>
                          {hackathon.committedMembers?.includes(user?.uid || '') 
                            ? 'Committed' 
                            : 'Leave'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                        <span>Join</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* Creator/Admin Actions */}
                {isCreatorOrAdmin && (
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
                      onClick={() => setConfirmDeleteHackathon(true)}
                      className="gap-1 text-xs md:text-sm px-3 py-2 min-w-[70px]"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Delete</span>
                    </Button>
                  </>
                )}
                
                {/* Rate Teammates Button - Show for team members when hackathon is completed OR their team is completed */}
                {(hackathon.status === 'completed' || (userTeam as any)?.status === 'completed') && userTeam && userTeam.memberIds.length > 1 && (
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

      {/* Feedback Reminder Banner for Completed Hackathons */}
      {(hackathon.status === 'completed' || (userTeam as any)?.status === 'completed') && userTeam && userTeam.memberIds.length > 1 && (
        <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">
                  Rate Your Teammates!
                </h4>
                <p className="text-sm text-muted-foreground">
                  This hackathon is completed. Please rate your team members to help build trust in the community.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setFeedbackModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Star className="h-4 w-4 mr-2" />
              Give Feedback
            </Button>
          </div>
        </div>
      )}

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
            {/* Teams tab - Only visible to creator and users who are in a team */}
            {canSeeTeamsTab && (
              <TabsTrigger value="teams" className="data-[state=active]:bg-background whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Teams ({hackathon.teams?.length || 0})</span>
                <span className="sm:hidden">Teams ({hackathon.teams?.length || 0})</span>
              </TabsTrigger>
            )}
            {/* Members tab - ONLY visible to creator */}
            {canSeeMembersTab && (
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

        <TabsContent value="chat" className="space-y-6">
          <ChatSection
            messages={messages}
            onSendMessage={!canViewOnly ? handleSendMessage : undefined}
            onEditMessage={!canViewOnly ? editMessage : undefined}
            onDeleteMessage={!canViewOnly ? deleteMessage : undefined}
            onProfileClick={handleProfileClick}
            loading={chatLoading}
            isAdmin={canViewOnly}
            hackathon={hackathon ? {
              id: hackathon.id,
              teamMembers: hackathon.teamMembers,
              creatorId: hackathon.creatorId,
              status: hackathon.status
            } : undefined}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="glass rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Teams
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hackathon.teams?.length || 0} team{(hackathon.teams?.length || 0) !== 1 ? 's' : ''} formed
                </p>
              </div>
              {/* Create Team — any joined member without a team */}
              {isUserJoined && hackathon.status === 'open' && !userTeam && (
                <Button onClick={() => setCreateTeamDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              )}
            </div>

            {/* Teams list */}
            {hackathon.teams && hackathon.teams.length > 0 ? (
              <div className="space-y-4">
                {hackathon.teams.map((team) => {
                  const isMemberOfThisTeam = team.memberIds?.includes(user?.uid || '');
                  const isLeaderOfThisTeam = team.leaderId === user?.uid;
                  const hasCommitted = (team.committedMemberIds || []).includes(user?.uid || '');

                  // Candidates for invite: hackathon members first, then rest of platform
                  // Mode matching: profile's availableFor must be compatible with hackathon mode
                  // online hackathon → show online + both profiles
                  // in-person hackathon → show in-person + both profiles
                  // both/hybrid hackathon → show all profiles
                  const hackathonMode = hackathon.mode as string;
                  const modeMatch = (profileMode?: string) => {
                    if (!profileMode || profileMode === 'both') return true;
                    if (hackathonMode === 'both' || hackathonMode === 'hybrid') return true;
                    return profileMode === hackathonMode;
                  };

                  // Split into two groups for display
                  const alreadyInATeam = new Set(
                    (hackathon.teams || []).flatMap(t => t.memberIds || [])
                  );
                  const hackathonCandidates = profiles.filter(p =>
                    p.uid !== user?.uid &&
                    !alreadyInATeam.has(p.uid) &&
                    hackathon.teamMembers?.includes(p.uid) &&
                    modeMatch(p.availableFor) &&
                    (memberSearch.trim() === '' ||
                      p.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      p.skills?.some(s => s.toLowerCase().includes(memberSearch.toLowerCase())))
                  );
                  const platformCandidates = profiles.filter(p =>
                    p.uid !== user?.uid &&
                    !alreadyInATeam.has(p.uid) &&
                    !hackathon.teamMembers?.includes(p.uid) &&
                    modeMatch(p.availableFor) &&
                    (memberSearch.trim() === '' ||
                      p.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      p.skills?.some(s => s.toLowerCase().includes(memberSearch.toLowerCase())))
                  );

                  return (
                    <div
                      key={team.id}
                      className={cn(
                        'p-4 rounded-lg border transition-all',
                        isMemberOfThisTeam
                          ? 'bg-green-500/5 border-green-500/30'
                          : 'bg-muted/50 border-border'
                      )}
                    >
                      {/* Team name + badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-base">{team.name}</h4>
                          {isMemberOfThisTeam && (
                            <Badge className="bg-green-500 text-white text-xs">Your Team</Badge>
                          )}
                          {isLeaderOfThisTeam && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Crown className="h-3 w-3 text-yellow-500" /> Leader
                            </Badge>
                          )}
                          {team.isTeamLocked && (
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
                              🔒 Locked
                            </Badge>
                          )}
                        </div>
                        {isCreatorOrAdmin && hackathon.status === 'open' && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => openDeleteTeamDialog(team)}
                            className="h-7 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Team leader can mark their team as completed */}
                        {isLeaderOfThisTeam && (team as any).status !== 'completed' && hackathon.status !== 'completed' && (
                          <Button
                            variant="outline" size="sm"
                            className="h-7 px-2 text-xs gap-1 border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={async () => {
                              if (!confirm('Mark this team as completed? Members will be able to rate each other.')) return;
                              await markTeamCompleted(hackathon.id, team.id, hackathon.teams || []);
                            }}
                          >
                            <Trophy className="h-3 w-3" /> Mark Complete
                          </Button>
                        )}
                        {(team as any).status === 'completed' && (
                          <Badge className="text-xs bg-green-500/20 text-green-600 border-green-400">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>

                      {/* Members chips */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {team.memberIds?.map(memberId => {
                          const p = getProfileById(memberId);
                          const isLeader = memberId === team.leaderId;
                          const committed = (team.committedMemberIds || []).includes(memberId);
                          const canRemove = isLeaderOfThisTeam && !isLeader; // Leader can always remove misbehaving members
                          return (
                            <div
                              key={memberId}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border text-xs hover:border-primary/50 group"
                            >
                              <span
                                className="flex items-center gap-1.5 cursor-pointer"
                                onClick={() => handleProfileClick(memberId, p?.name || 'User')}
                              >
                                <AvatarUpload currentAvatar={p?.avatar || null} userName={p?.name || '?'} userGender={p?.gender as any} size="sm" editable={false} />
                                <span>{memberId === user?.uid ? 'You' : p?.name || 'Unknown'}</span>
                                {isLeader && <Crown className="h-3 w-3 text-yellow-500" />}
                                {committed && <CheckCircle className="h-3 w-3 text-green-500" />}
                              </span>
                              {canRemove && (
                                <button
                                  className="ml-1 text-muted-foreground hover:text-red-500 transition-colors"
                                  title="Remove from team"
                                  onClick={async () => {
                                    setConfirmRemoveMember({
                                      teamId: team.id,
                                      memberId,
                                      memberName: p?.name || 'this member',
                                    });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Invite section — team leader only */}
                      {isLeaderOfThisTeam && hackathon.status === 'open' && !team.isTeamLocked && (
                        <div className="mb-3 border rounded-lg p-3 bg-muted/30">
                          <p className="text-xs font-medium mb-2 flex items-center gap-1">
                            <UserPlus className="h-3.5 w-3.5" /> Add Members
                          </p>
                          <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search by name or skill..."
                              value={memberSearch}
                              onChange={e => setMemberSearch(e.target.value)}
                              className="pl-8 h-8 text-xs"
                            />
                          </div>

                          {/* Hackathon participants first */}
                          {hackathonCandidates.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground mb-1 px-1">Already joined this hackathon</p>
                              <div className="space-y-1 max-h-36 overflow-y-auto">
                                {hackathonCandidates.slice(0, 8).map(candidate => (
                                  <div key={candidate.uid} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-background transition-colors">
                                    <div className="flex items-center gap-2">
                                      <AvatarUpload currentAvatar={candidate.avatar || null} userName={candidate.name} userGender={candidate.gender as any} size="sm" editable={false} />
                                      <div>
                                        <p className="text-xs font-medium">{candidate.name}</p>
                                        <p className="text-xs text-muted-foreground">{candidate.skills?.slice(0, 2).join(', ')}</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm" className="h-6 text-xs px-2"
                                      disabled={invitingMemberId === candidate.uid}
                                      onClick={async () => {
                                        setInvitingMemberId(candidate.uid);
                                        await addMemberToTeam(hackathon.id, hackathon.title, team.id, team.name, candidate.uid, profiles.find(p => p.uid === user?.uid)?.name || 'Team Leader', hackathon.teams || []);
                                        setInvitingMemberId(null);
                                      }}
                                    >
                                      {invitingMemberId === candidate.uid ? '...' : 'Invite'}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Platform users (not yet joined hackathon) */}
                          {platformCandidates.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1 px-1">Other platform users</p>
                              <div className="space-y-1 max-h-36 overflow-y-auto">
                                {platformCandidates.slice(0, 8).map(candidate => (
                                  <div key={candidate.uid} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-background transition-colors">
                                    <div className="flex items-center gap-2">
                                      <AvatarUpload currentAvatar={candidate.avatar || null} userName={candidate.name} userGender={candidate.gender as any} size="sm" editable={false} />
                                      <div>
                                        <p className="text-xs font-medium">{candidate.name}</p>
                                        <p className="text-xs text-muted-foreground">{candidate.skills?.slice(0, 2).join(', ')}</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm" variant="outline" className="h-6 text-xs px-2"
                                      disabled={invitingMemberId === candidate.uid}
                                      onClick={async () => {
                                        setInvitingMemberId(candidate.uid);
                                        // First join them to hackathon, then add to team
                                        await addMemberToTeam(hackathon.id, hackathon.title, team.id, team.name, candidate.uid, profiles.find(p => p.uid === user?.uid)?.name || 'Team Leader', hackathon.teams || []);
                                        setInvitingMemberId(null);
                                      }}
                                    >
                                      {invitingMemberId === candidate.uid ? '...' : 'Invite'}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {hackathonCandidates.length === 0 && platformCandidates.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              {memberSearch.trim() ? 'No users match your search' : 'No available users to invite'}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Contract + Leave — team members only */}
                      {isMemberOfThisTeam && (
                        <div className="space-y-3 pt-3 border-t border-border">
                          <TeamContract
                            hackathonId={hackathon.id}
                            teamId={team.id}
                            teamMembers={team.memberIds?.map(memberId => {
                              const p = getProfileById(memberId);
                              return { userId: memberId, userName: p?.name || memberId, userAvatar: p?.avatar };
                            }) || []}
                            committedMembers={team.committedMemberIds || []}
                            isLocked={team.isTeamLocked || false}
                            teams={hackathon.teams || []}
                            onContractUpdate={() => {}}
                          />
                          {!hasCommitted && (
                            <Button
                              variant="destructive" size="sm" className="w-full gap-2"
                              onClick={() => setConfirmLeaveTeam({ teamId: team.id })}
                            >
                              <UserMinus className="h-4 w-4" /> Leave Team
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h4 className="text-lg font-semibold mb-2">No teams yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {isUserJoined ? 'Be the first to create a team!' : 'Join the hackathon to create or join a team'}
                </p>
                {isUserJoined && hackathon.status === 'open' && (
                  <Button onClick={() => setCreateTeamDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create First Team
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Create Team Dialog */}
          <Dialog open={createTeamDialogOpen} onOpenChange={open => { setCreateTeamDialogOpen(open); if (!open) { setNewTeamName(''); setMemberSearch(''); } }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Create a Team
                </DialogTitle>
                <DialogDescription>
                  Give your team a name. You'll be the leader and can invite members right after.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Team Name</label>
                  <Input
                    placeholder="e.g. Code Warriors, Team Alpha..."
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !creatingTeam && newTeamName.trim() && handleCreateTeamInline()}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateTeamDialogOpen(false)}>Cancel</Button>
                  <Button disabled={!newTeamName.trim() || creatingTeam} onClick={handleCreateTeamInline}>
                    {creatingTeam ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {canSeeMembersTab && (
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
                    onClick={() => setConfirmRemoveNonTeam(true)}
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

      {/* Team Feedback Modal - Only show committed team members */}
      {hackathon && userTeam && (
        <TeamFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          hackathonId={hackathon.id}
          hackathonTitle={hackathon.title}
          teamMembers={userTeam.memberIds
            .filter(memberId => 
              memberId !== user?.uid && 
              // Only include members who have committed to the team
              (userTeam.committedMemberIds?.includes(memberId) ?? false)
            )
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

      {/* Team Contract Dialog - Shows before joining */}
      {hackathon && (
        <TeamContractDialog
          isOpen={contractDialogOpen}
          onClose={() => setContractDialogOpen(false)}
          onAccept={handleAcceptContract}
          hackathonTitle={hackathon.title}
          loading={joiningHackathon}
        />
      )}

      {/* Confirm: Delete Hackathon */}
      <ConfirmDialog
        open={confirmDeleteHackathon}
        title="Delete Hackathon"
        description={`Are you sure you want to delete "${hackathon.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmDeleteHackathon(false); handleDelete(); }}
        onCancel={() => setConfirmDeleteHackathon(false)}
      />

      {/* Confirm: Remove Non-Team Members */}
      <ConfirmDialog
        open={confirmRemoveNonTeam}
        title="Remove Non-Team Members"
        description="This will remove all members who are not in any team from this hackathon. Are you sure?"
        confirmLabel="Remove"
        onConfirm={() => { setConfirmRemoveNonTeam(false); handleRemoveNonTeamMembers(); }}
        onCancel={() => setConfirmRemoveNonTeam(false)}
      />

      {/* Confirm: Leave Team */}
      <ConfirmDialog
        open={!!confirmLeaveTeam}
        title="Leave Team"
        description="Are you sure you want to leave this team? You can rejoin or create a new team later."
        confirmLabel="Leave"
        onConfirm={async () => {
          if (!confirmLeaveTeam) return;
          setConfirmLeaveTeam(null);
          await leaveTeam(hackathon.id, confirmLeaveTeam.teamId, user?.uid, hackathon.teams || []);
          navigate('/hackathons');
        }}
        onCancel={() => setConfirmLeaveTeam(null)}
      />

      {/* Confirm: Remove Member */}
      <ConfirmDialog
        open={!!confirmRemoveMember}
        title="Remove Member"
        description={`Remove ${confirmRemoveMember?.memberName || 'this member'} from the team?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!confirmRemoveMember) return;
          const { teamId, memberId } = confirmRemoveMember;
          setConfirmRemoveMember(null);
          const team = hackathon.teams?.find(t => t.id === teamId);
          const leaderProfile = getProfileById(user?.uid || '');
          const leaderName = leaderProfile?.name || user?.displayName || 'Team Leader';
          await removeMemberFromTeam(
            hackathon.id, teamId, memberId,
            hackathon.teams || [], hackathon.title,
            team?.name || '', leaderName
          );
        }}
        onCancel={() => setConfirmRemoveMember(null)}
      />

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Team
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete team "{teamToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                ⚠️ This action will permanently delete:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-500 space-y-1 ml-4">
                <li>• All team data and project information</li>
                <li>• All member commitments for this team</li>
                <li>• Team lock status and history</li>
                <li>• {teamToDelete?.memberCount || 0} member(s) will be removed from this team</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Members will remain in the hackathon but will no longer be part of this team.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteTeamDialogOpen(false);
                  setTeamToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteTeam}
                disabled={deletingTeam}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {deletingTeam ? 'Deleting...' : 'Delete Team'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
