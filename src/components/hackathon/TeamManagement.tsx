import { useState } from 'react';
import { Users, Plus, UserPlus, UserMinus, Crown, X, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AvatarUpload } from '@/components/AvatarUpload';
import { TeamFeedbackModal } from '@/components/TeamFeedbackModal';
import { TeamChatSection } from '@/components/hackathon/TeamChatSection';
import { TeamProjectDetails } from '@/components/hackathon/TeamProjectDetails';
import { HackathonTeam } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useTeams } from '@/hooks/useTeams';
import { useTeamFeedback } from '@/hooks/useTeamFeedback';
import { useTeamChat } from '@/hooks/useTeamChat';
import { cn } from '@/lib/utils';

interface TeamManagementProps {
  hackathonId: string;
  hackathonTitle: string;
  hackathonStatus: 'open' | 'in-progress' | 'completed';
  teams: HackathonTeam[];
  suggestedTeamSize: number;
  allParticipants?: string[]; // All hackathon participants
  isCreator?: boolean; // Is current user the hackathon creator
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
  onProfileClick,
  onRefresh
}: TeamManagementProps) {
  const { user } = useAuth();
  const { getProfileById } = useProfiles();
  const { createTeam, leaveTeam, removeMemberFromTeam, getUserTeam, isUserInAnyTeam, updateTeam, loading } = useTeams();
  const { submitFeedback } = useTeamFeedback();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const userTeam = getUserTeam(teams, user?.uid || '');
  const isCompleted = hackathonStatus === 'completed';
  const isTeamLeader = userTeam?.leaderId === user?.uid;
  const { messages: teamMessages, loading: chatLoading, sendMessage, editMessage, deleteMessage } = useTeamChat(hackathonId, userTeam?.id || '');

  const handleCreateTeam = async () => {
    if (!user || !teamName.trim()) return;

    const result = await createTeam(hackathonId, teamName.trim(), user.uid, teams);
    if (result) {
      setTeamName('');
      setCreateDialogOpen(false);
      onRefresh(); // This will trigger parent to refetch
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;
    const success = await leaveTeam(hackathonId, teamId, user.uid, teams);
    if (success) onRefresh();
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!isCreator) return;
    
    const confirmed = window.confirm('Remove this member from the team?');
    if (!confirmed) return;
    
    await removeMemberFromTeam(hackathonId, teamId, memberId, teams);
    // No need to call onRefresh - real-time listener will update
  };

  const handleUpdateTeam = async (updates: Partial<HackathonTeam>) => {
    if (!userTeam) return;
    await updateTeam(hackathonId, userTeam.id, updates, teams);
    // No need to call onRefresh - real-time listener will update
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-xl font-bold">Teams</h3>
            <p className="text-sm text-muted-foreground">
              {isCreator 
                ? `Form teams of ${suggestedTeamSize} members - Add members from the Members tab`
                : `Form teams of ${suggestedTeamSize} members for better collaboration`
              }
            </p>
          </div>
        </div>
        
        {isCreator && (
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
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
                  disabled={loading}
                  className="gap-1"
                >
                  <UserMinus className="h-4 w-4" />
                  Leave Team
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userTeam.memberIds.map(memberId => {
              const profile = getProfileById(memberId);
              const isLeader = memberId === userTeam.leaderId;
              const isCurrentUser = memberId === user?.uid;
              const canRemove = isCreator && !isLeader && !isCompleted; // Can't remove when completed
              
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
                          <Badge variant="outline" className="text-xs gap-1">
                            <Shield className="h-3 w-3" />
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
          
          {/* Team Project Details */}
          <TeamProjectDetails
            team={userTeam}
            isLeader={isTeamLeader}
            onUpdate={handleUpdateTeam}
          />

          {/* Team Chat Section */}
          <div className="mt-4">
            <TeamChatSection
              messages={teamMessages}
              onSendMessage={sendMessage}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
              onProfileClick={onProfileClick}
              loading={chatLoading}
              teamLeaderId={userTeam.leaderId}
              teamMemberIds={userTeam.memberIds}
            />
          </div>
        </div>
      )}

      {/* All Teams */}
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="text-lg font-semibold mb-2">No teams yet</h4>
          <p className="text-muted-foreground mb-4">
            Be the first to create a team and start collaborating!
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create First Team
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground">
            All Teams ({teams.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(team => {
              const isUserInTeam = team.memberIds.includes(user?.uid || '');
              const isFull = team.memberIds.length >= suggestedTeamSize;
              
              return (
                <div
                  key={team.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    isUserInTeam 
                      ? "bg-primary/5 border-primary/30" 
                      : "bg-background border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold">{team.name}</h5>
                    <Badge variant={isFull ? "default" : "outline"} className="text-xs">
                      {team.memberIds.length}/{suggestedTeamSize}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {team.memberIds.map(memberId => {
                      const profile = getProfileById(memberId);
                      const isLeader = memberId === team.leaderId;
                      
                      return (
                        <div
                          key={memberId}
                          className="group relative flex items-center gap-1 px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => onProfileClick(memberId, profile?.name || 'Unknown')}
                          >
                            <AvatarUpload
                              currentAvatar={profile?.avatar || null}
                              userName={profile?.name || 'Unknown'}
                              userGender={profile?.gender as any}
                              size="xs"
                              editable={false}
                            />
                            <span className="text-xs font-medium">
                              {profile?.name || 'Unknown'}
                            </span>
                            {isLeader && <Crown className="h-3 w-3 text-yellow-500" />}
                          </div>
                          
                          {isCreator && !isLeader && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(team.id, memberId);
                              }}
                              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={loading}
                            >
                              <X className="h-3 w-3 text-destructive hover:text-destructive/80" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* Team Feedback Modal */}
      {userTeam && isCompleted && (
        <TeamFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          hackathonId={hackathonId}
          hackathonTitle={hackathonTitle}
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
    </div>
  );
}
