import { useState } from 'react';
import { Users, Plus, UserPlus, UserMinus, Crown, X, Star, Edit, Trash2, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AvatarUpload } from '@/components/AvatarUpload';
import { TeamFeedbackModal } from '@/components/TeamFeedbackModal';
import { HackathonTeam } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useTeams } from '@/hooks/useTeams';
import { useTeamFeedback } from '@/hooks/useTeamFeedback';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Tech stack options for selection
const TECH_STACK_OPTIONS = [
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'HTML/CSS', 'Tailwind CSS', 'Bootstrap',
  // Backend
  'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 
  'Go', 'Rust', 'Ruby', 'Rails', 'PHP', 'Laravel', '.NET', 'C#',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS',
  // Database
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Supabase', 'Redis', 'SQLite',
  // Cloud & DevOps
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Vercel', 'Netlify',
  // AI/ML
  'TensorFlow', 'PyTorch', 'OpenAI API', 'LangChain', 'Hugging Face', 'scikit-learn',
  // Other
  'GraphQL', 'REST API', 'WebSocket', 'Blockchain', 'Web3', 'Solidity', 'TypeScript', 'JavaScript'
];

interface TeamManagementProps {
  hackathonId: string;
  hackathonTitle: string;
  hackathonStatus: 'open' | 'in-progress' | 'completed';
  teams: HackathonTeam[];
  suggestedTeamSize: number;
  allParticipants?: string[]; // All hackathon participants
  isCreator?: boolean;
  committedMembers?: string[];
  isTeamLocked?: boolean;
  onProfileClick: (userId: string, userName: string) => void;
  onRefresh: () => void;
}

export function TeamManagement({
  hackathonId,
  hackathonTitle,
  hackathonStatus,
  teams,
  suggestedTeamSize,
  allParticipants = [],
  isCreator = false,
  committedMembers = [],
  isTeamLocked = false,
  onProfileClick,
  onRefresh
}: TeamManagementProps) {
  const { user } = useAuth();
  const { getProfileById, profiles } = useProfiles();
  const { createTeam, leaveTeam, removeMemberFromTeam, getUserTeam, isUserInAnyTeam, updateTeam, deleteTeam, addMemberToTeam, loading } = useTeams();
  const { submitFeedback } = useTeamFeedback();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<HackathonTeam | null>(null);
  const [teamName, setTeamName] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [techStackSearch, setTechStackSearch] = useState('');
  const [editData, setEditData] = useState({
    name: '',
    projectTitle: '',
    projectDescription: '',
    techStack: [] as string[],
  });

  // Invite members state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  const userTeam = getUserTeam(teams, user?.uid || '');
  const isCompleted = hackathonStatus === 'completed';
  const isTeamLeader = userTeam?.leaderId === user?.uid;
  const hasUserCommittedToTeam = userTeam?.committedMemberIds?.includes(user?.uid || '') || false;
  // Any joined participant can create a team (not just creator)
  const canCreateTeam = !isCompleted && hackathonStatus === 'open' && !userTeam;

  // Participants available to invite: joined hackathon, not already in any team
  const invitableCandidates = profiles.filter(p =>
    p.uid !== user?.uid &&
    allParticipants?.includes(p.uid) &&
    !teams.some(t => t.memberIds.includes(p.uid))
  ).filter(p =>
    inviteSearch.trim() === '' ||
    p.name.toLowerCase().includes(inviteSearch.toLowerCase()) ||
    p.skills?.some(s => s.toLowerCase().includes(inviteSearch.toLowerCase()))
  );

  const handleCreateTeam = async () => {
    if (!user || !teamName.trim()) return;

    const result = await createTeam(hackathonId, teamName.trim(), user.uid, teams);
    if (result) {
      setTeamName('');
      setCreateDialogOpen(false);
      onRefresh();
    }
  };

  const handleInviteMember = async (candidateId: string) => {
    if (!user || !userTeam) return;
    setInvitingUserId(candidateId);
    const candidateProfile = profiles.find(p => p.uid === candidateId);
    const success = await addMemberToTeam(
      hackathonId,
      hackathonTitle,
      userTeam.id,
      userTeam.name,
      candidateId,
      candidateProfile?.name || 'A teammate',
      teams
    );
    if (success) {
      setInviteSearch('');
      onRefresh();
    }
    setInvitingUserId(null);
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;
    
    // Get the specific team to check its commitment
    const teamToLeave = teams.find(t => t.id === teamId);
    const hasCommittedToThisTeam = teamToLeave?.committedMemberIds?.includes(user.uid) || false;
    
    // Check if user has committed to THIS specific team
    if (hasCommittedToThisTeam) {
      toast.error('❌ You cannot leave the team after committing to the project! This protects your reliability score.');
      return;
    }
    
    const success = await leaveTeam(hackathonId, teamId, user.uid, teams);
    if (success) onRefresh();
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!isCreator) return;
    
    const confirmed = true; // handled by ConfirmDialog in HackathonDetails
    if (!confirmed) return;
    
    await removeMemberFromTeam(hackathonId, teamId, memberId, teams);
    // No need to call onRefresh - real-time listener will update
  };

  const handleDeleteTeam = async () => {
    if (!isCreator || !teamToDelete) return;
    
    const success = await deleteTeam(hackathonId, teamToDelete.id, teams);
    if (success) {
      setDeleteConfirmDialogOpen(false);
      setTeamToDelete(null);
      onRefresh();
    }
  };

  const openDeleteConfirmDialog = (team: HackathonTeam) => {
    setTeamToDelete(team);
    setDeleteConfirmDialogOpen(true);
  };

  const handleUpdateTeam = async (updates: Partial<HackathonTeam>) => {
    if (!userTeam) return;
    await updateTeam(hackathonId, userTeam.id, updates, teams);
    // No need to call onRefresh - real-time listener will update
  };

  const handleOpenEditDialog = () => {
    if (!userTeam) return;
    setEditData({
      name: userTeam.name || '',
      projectTitle: userTeam.projectTitle || '',
      projectDescription: userTeam.projectDescription || '',
      techStack: userTeam.techStack || [],
    });
    setTechStackSearch('');
    setEditDialogOpen(true);
  };

  const handleSaveTeamChanges = async () => {
    if (!userTeam) return;

    try {
      await updateTeam(hackathonId, userTeam.id, {
        name: editData.name,
        projectTitle: editData.projectTitle,
        projectDescription: editData.projectDescription,
        techStack: editData.techStack,
      }, teams);
      setEditDialogOpen(false);
      setTechStackSearch('');
      toast.success('Team details updated!');
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team details');
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      {/* Hackathon Completed - Feedback Reminder Banner */}
      {isCompleted && userTeam && userTeam.memberIds.length > 1 && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                🎉 Hackathon Completed! Rate Your Teammates
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 mb-3">
                Help build a reliable community by providing feedback for your teammates. 
                Your ratings help others find great collaborators!
              </p>
              <Button
                onClick={() => setFeedbackModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Star className="h-4 w-4" />
                Rate Teammates Now
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-xl font-bold">Teams</h3>
            <p className="text-sm text-muted-foreground">
              {isCreator 
                ? `Form teams of ${suggestedTeamSize} members - Add members from the Members tab`
                : `Teams of ${suggestedTeamSize} members for better collaboration`
              }
            </p>
          </div>
        </div>
        
        {/* Any joined member without a team can create one */}
        {canCreateTeam && (
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        )}
        {/* Team leader can invite members */}
        {userTeam && isTeamLeader && !isCompleted && (
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Members
          </Button>
        )}
      </div>

      {/* User's Current Team */}
      {userTeam && (
        <div className="mb-6 p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">Your Team</Badge>
              <h4 className="font-semibold">{userTeam.name}</h4>
            </div>
            <div className="flex gap-2">
              {isCreator && !isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEditDialog}
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit Team
                </Button>
              )}
              {isCreator && !isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteConfirmDialog(userTeam)}
                  className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Team
                </Button>
              )}
              {isCompleted && userTeam.memberIds.length > 1 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setFeedbackModalOpen(true)}
                  className="gap-1"
                >
                  <Star className="h-4 w-4" />
                  Rate Teammates
                </Button>
              )}
              {!isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLeaveTeam(userTeam.id)}
                  disabled={loading || hasUserCommittedToTeam}
                  className="gap-1"
                >
                  <UserMinus className="h-4 w-4" />
                  {hasUserCommittedToTeam ? 'Committed' : 'Leave Team'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userTeam.memberIds.map(memberId => {
              const profile = getProfileById(memberId);
              const isLeader = memberId === userTeam.leaderId;
              const isCurrentUser = memberId === user?.uid;
              const canRemove = isCreator && !isLeader; // Leader can always remove, even after commit
              
              return (
                <div
                  key={memberId}
                  className="p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="cursor-pointer"
                      onClick={() => onProfileClick(memberId, profile?.name || 'Unknown')}
                    >
                      <AvatarUpload
                        currentAvatar={profile?.avatar || null}
                        userName={profile?.name || 'Unknown'}
                        userGender={profile?.gender as any}
                        size="sm"
                        editable={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <p className="text-sm font-medium truncate">
                          {isCurrentUser ? 'You' : profile?.name || 'Unknown'}
                        </p>
                        {isLeader && (
                          <Badge variant="default" className="text-xs gap-1 bg-yellow-500 hover:bg-yellow-600">
                            <Crown className="h-3 w-3" />
                            Leader
                          </Badge>
                        )}
                        {!isLeader && !isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            Member
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile?.college || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {canRemove && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1 text-xs"
                      onClick={() => handleRemoveMember(userTeam.id, memberId)}
                      disabled={loading}
                    >
                      <UserMinus className="h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {userTeam.memberIds.length} / {suggestedTeamSize} members
            </span>
            {userTeam.memberIds.length < suggestedTeamSize && !isCompleted && (
              <Badge variant="outline" className="text-xs">
                Looking for {suggestedTeamSize - userTeam.memberIds.length} more
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                Hackathon Completed
              </Badge>
            )}
          </div>
          
        </div>
      )}

      {/* Member without a team — prompt to create one */}
      {!userTeam && hackathonStatus === 'open' && (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h4 className="text-base font-semibold mb-1">You're not in a team yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create your own team and invite other participants, or wait to be invited.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create a Team
          </Button>
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Team</DialogTitle>
            <DialogDescription>
              Form a team of up to {suggestedTeamSize} members to collaborate on this hackathon
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g., Code Warriors, Team Alpha"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTeam} 
                disabled={!teamName.trim() || loading}
              >
                Create Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Details</DialogTitle>
            <DialogDescription>
              Update team name, project title, description, and tech stack
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g., Code Warriors, Team Alpha"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="projectTitle">Project Title</Label>
              <Input
                id="projectTitle"
                placeholder="e.g., AI Powered Task Manager"
                value={editData.projectTitle}
                onChange={(e) => setEditData({ ...editData, projectTitle: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="projectDescription">Project Description</Label>
              <textarea
                id="projectDescription"
                placeholder="Describe your project"
                value={editData.projectDescription}
                onChange={(e) => setEditData({ ...editData, projectDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 block">Tech Stack</Label>
              <p className="text-sm text-muted-foreground mb-3">Click to select technologies for your project</p>
              
              {/* Selected Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-3 border rounded-md bg-background">
                {editData.techStack.length > 0 ? (
                  editData.techStack.map(tech => (
                    <Badge 
                      key={tech} 
                      variant="default" 
                      className="cursor-pointer hover:bg-destructive py-1.5 px-3 text-sm"
                      onClick={() => setEditData({
                        ...editData,
                        techStack: editData.techStack.filter(t => t !== tech)
                      })}
                    >
                      {tech} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic">Click below to add technologies...</span>
                )}
              </div>
              
              {/* Search and Select */}
              <Input
                placeholder="🔍 Search technologies (e.g., React, Python, MongoDB)..."
                value={techStackSearch}
                onChange={(e) => setTechStackSearch(e.target.value)}
                className="mb-3"
              />
              
              {/* Tech Stack Options */}
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  {TECH_STACK_OPTIONS
                    .filter(tech => 
                      tech.toLowerCase().includes(techStackSearch.toLowerCase()) &&
                      !editData.techStack.includes(tech)
                    )
                    .map(tech => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
                        onClick={() => setEditData({
                          ...editData,
                          techStack: [...editData.techStack, tech]
                        })}
                      >
                        + {tech}
                      </Badge>
                    ))
                  }
                  {TECH_STACK_OPTIONS.filter(tech => 
                    tech.toLowerCase().includes(techStackSearch.toLowerCase()) &&
                    !editData.techStack.includes(tech)
                  ).length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No matching technologies. Try a different search.
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTeamChanges} 
                disabled={!editData.name.trim() || loading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Members Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Members to {userTeam?.name}
            </DialogTitle>
            <DialogDescription>
              Search and invite participants who haven't joined a team yet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skill..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {invitableCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {allParticipants?.length === 1
                    ? 'No other participants have joined this hackathon yet.'
                    : 'All participants are already in teams.'}
                </p>
              ) : (
                invitableCandidates.map(candidate => (
                  <div
                    key={candidate.uid}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors"
                  >
                    <AvatarUpload
                      currentAvatar={candidate.avatar || null}
                      userName={candidate.name}
                      userGender={candidate.gender as any}
                      size="sm"
                      editable={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {candidate.skills?.slice(0, 3).join(', ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={invitingUserId === candidate.uid || loading}
                      onClick={() => handleInviteMember(candidate.uid)}
                      className="shrink-0"
                    >
                      {invitingUserId === candidate.uid ? 'Inviting...' : 'Invite'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Feedback Modal - Only show committed team members */}
      {userTeam && isCompleted && (        <TeamFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          hackathonId={hackathonId}
          hackathonTitle={hackathonTitle}
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

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
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
                <li>• {teamToDelete?.memberIds?.length || 0} member(s) will be removed from this team</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Members will remain in the hackathon but will no longer be part of this team.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteConfirmDialogOpen(false);
                  setTeamToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteTeam}
                disabled={loading}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? 'Deleting...' : 'Delete Team'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
