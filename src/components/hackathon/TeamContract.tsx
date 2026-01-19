import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * TeamContract - The Anti-Ghosting Lock
 * 
 * This component implements a commitment system where all team members must
 * click "Start Project" to lock the team. Once locked, leaving will impact
 * their reliability score.
 * 
 * Features:
 * - Visual progress of team commitment
 * - Lock mechanism after all members commit
 * - Warning about reliability score impact
 * - Shows who has committed and who hasn't
 * - Only team members (added by creator) can see and commit
 * - NOW: Per-team commitment tracking (each team tracks its own commitment)
 */

interface TeamMember {
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface TeamContractProps {
  hackathonId: string;
  teamId: string; // Added: Team ID for per-team commitment
  teamMembers: TeamMember[];
  committedMembers?: string[]; // User IDs who have clicked "Start Project" for THIS team
  isLocked?: boolean;
  teams: any[]; // Current teams array from hackathon
  onContractUpdate?: () => void;
}

export function TeamContract({ 
  hackathonId, 
  teamId,
  teamMembers, 
  committedMembers = [], 
  isLocked = false,
  teams,
  onContractUpdate 
}: TeamContractProps) {
  const { user, profile } = useAuth();
  const [committing, setCommitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const hasUserCommitted = user ? committedMembers.includes(user.uid) : false;
  // Only count committed members who are actually in the team
  const committedInTeam = committedMembers.filter(uid => teamMembers.some(m => m.userId === uid));
  const commitmentProgress = (committedInTeam.length / teamMembers.length) * 100;
  const allCommitted = committedInTeam.length === teamMembers.length;

  const handleCommit = async () => {
    if (!user || hasUserCommitted || !teamId) return;

    // Check if teams array is valid
    if (!teams || !Array.isArray(teams) || teams.length === 0) {
      console.error('Teams array is invalid:', teams);
      toast.error('Unable to commit - team data not loaded. Please refresh the page.');
      return;
    }

    setCommitting(true);
    try {
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      
      // Update the specific team's committedMemberIds
      // We need to properly serialize the teams data to avoid Firestore issues
      const updatedTeams = teams.map(team => {
        if (team.id === teamId) {
          const currentCommitted = team.committedMemberIds || [];
          const newCommitted = [...currentCommitted, user.uid];
          const allMembersCommitted = team.memberIds.every((id: string) => newCommitted.includes(id));
          
          // Create a clean copy of the team object with only serializable data
          return {
            id: team.id,
            name: team.name,
            memberIds: team.memberIds || [],
            leaderId: team.leaderId,
            createdAt: team.createdAt || new Date(),
            projectTitle: team.projectTitle || '',
            projectDescription: team.projectDescription || '',
            techStack: team.techStack || [],
            projectStatus: team.projectStatus || 'planning',
            committedMemberIds: newCommitted,
            isTeamLocked: allMembersCommitted,
            teamLockedAt: allMembersCommitted ? new Date() : (team.teamLockedAt || null)
          };
        }
        // Return clean copy for other teams too
        return {
          id: team.id,
          name: team.name,
          memberIds: team.memberIds || [],
          leaderId: team.leaderId,
          createdAt: team.createdAt || new Date(),
          projectTitle: team.projectTitle || '',
          projectDescription: team.projectDescription || '',
          techStack: team.techStack || [],
          projectStatus: team.projectStatus || 'planning',
          committedMemberIds: team.committedMemberIds || [],
          isTeamLocked: team.isTeamLocked || false,
          teamLockedAt: team.teamLockedAt || null
        };
      });

      // Update the hackathon with the modified teams array
      await updateDoc(hackathonRef, {
        teams: updatedTeams,
        updatedAt: new Date()
      });

      // Check if all members of THIS team have committed
      const thisTeam = updatedTeams.find(t => t.id === teamId);
      
      if (thisTeam?.isTeamLocked) {
        toast.success('🔒 Your team is now locked! All members have committed.');
      } else {
        toast.success('✅ You have committed to the project!');
      }

      onContractUpdate?.();
    } catch (error) {
      console.error('Error committing to team contract:', error);
      toast.error('Failed to commit. Please try again.');
    } finally {
      setCommitting(false);
    }
  };

  if (isLocked && hasUserCommitted) {
    return (
      <div className="glass rounded-xl p-4 border-2 border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Lock className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Team Locked
              <Badge className="bg-green-500 text-white text-xs">Active</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              All members have committed to the project
            </p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                ⚠️ Anti-Ghosting Protection Active
              </p>
              <p className="text-yellow-600 dark:text-yellow-500">
                Leaving this hackathon now will significantly impact your reliability score. 
                Only leave if you have a genuine emergency.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium">Committed ({committedInTeam.length}/{teamMembers.length}):</p>
          <div className="grid grid-cols-2 gap-2">
            {teamMembers.map((member) => {
              const isCommitted = committedMembers.includes(member.userId);
              return (
                <div key={member.userId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                  <AvatarUpload
                    currentAvatar={member.userAvatar || null}
                    userName={member.userName}
                    size="xs"
                    editable={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{member.userName}</p>
                  </div>
                  {isCommitted ? (
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-yellow-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show contract even if team is locked, if current user hasn't committed yet
  if (isLocked && !hasUserCommitted) {
    return (
      <div className="glass rounded-xl p-6 border-2 border-yellow-500/30 bg-yellow-500/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Team is Locked - Action Required</h3>
            <p className="text-sm text-muted-foreground">
              You haven't committed yet, but the team is now active
            </p>
          </div>
        </div>

        {/* What is the Team Contract? */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-semibold text-blue-700 dark:text-blue-400">
                What is the Team Contract?
              </p>
              <ul className="space-y-1 text-blue-600 dark:text-blue-500">
                <li>• Click "Start Project" to commit to this hackathon</li>
                <li>• Once you commit, the team gets locked</li>
                <li>• Leaving after committing will hurt your reliability score</li>
                <li>• This ensures everyone is serious about the project</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Members Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Team Members Status:</p>
          <div className="grid grid-cols-1 gap-2">
            {teamMembers.map((member) => {
              const hasCommitted = committedMembers.includes(member.userId);
              const isCurrentUser = user?.uid === member.userId;
              
              return (
                <div 
                  key={member.userId} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all",
                    hasCommitted 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : "bg-muted/50 border border-border"
                  )}
                >
                  <AvatarUpload
                    currentAvatar={member.userAvatar || null}
                    userName={member.userName}
                    size="sm"
                    editable={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.userName}
                      {isCurrentUser && <span className="text-yellow-500 ml-1">(You - Pending)</span>}
                    </p>
                  </div>
                  {hasCommitted ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Committed</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {user && teamMembers.some(m => m.userId === user.uid) && (
          <div className="space-y-3">
            {showWarning && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 animate-fade-in">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ By clicking "Start Project", you commit to completing this hackathon. 
                  Leaving after this will negatively impact your reliability score.
                </p>
              </div>
            )}
            
            <Button
              onClick={() => {
                if (!showWarning) {
                  setShowWarning(true);
                  setTimeout(() => setShowWarning(false), 10000);
                } else {
                  handleCommit();
                }
              }}
              disabled={committing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              size="lg"
            >
              {committing ? (
                'Committing...'
              ) : showWarning ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm: Start Project
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Start Project
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 border-2 border-primary/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Team Contract</h3>
          <p className="text-sm text-muted-foreground">
            The Anti-Ghosting Lock
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Team Commitment Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {committedMembers.length} / {teamMembers.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                allCommitted ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${commitmentProgress}%` }}
            />
          </div>
        </div>

        {/* Team Members Status */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Team Members:</p>
          <div className="grid grid-cols-1 gap-2">
            {teamMembers.map((member) => {
              const hasCommitted = committedMembers.includes(member.userId);
              const isCurrentUser = user?.uid === member.userId;
              
              return (
                <div 
                  key={member.userId} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all",
                    hasCommitted 
                      ? "bg-green-500/10 border border-green-500/30" 
                      : "bg-muted/50 border border-border"
                  )}
                >
                  <AvatarUpload
                    currentAvatar={member.userAvatar || null}
                    userName={member.userName}
                    size="sm"
                    editable={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.userName}
                      {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                    </p>
                  </div>
                  {hasCommitted ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Committed</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning Box */}
        {!hasUserCommitted && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  What is the Team Contract?
                </p>
                <ul className="space-y-1 text-blue-600 dark:text-blue-500">
                  <li>• Click "Start Project" to commit to this hackathon</li>
                  <li>• Once all members commit, the team gets locked</li>
                  <li>• Leaving after locking will hurt your reliability score</li>
                  <li>• This ensures everyone is serious about the project</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!hasUserCommitted && user && teamMembers.some(m => m.userId === user.uid) && (
          <div className="space-y-3">
            {showWarning && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 animate-fade-in">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ By clicking "Start Project", you commit to completing this hackathon. 
                  Leaving after the team is locked will negatively impact your reliability score.
                </p>
              </div>
            )}
            
            <Button
              onClick={() => {
                if (!showWarning) {
                  setShowWarning(true);
                  setTimeout(() => setShowWarning(false), 10000); // Hide after 10 seconds
                } else {
                  handleCommit();
                }
              }}
              disabled={committing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              size="lg"
            >
              {committing ? (
                'Committing...'
              ) : showWarning ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirm: Start Project
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Start Project
                </>
              )}
            </Button>
          </div>
        )}

        {hasUserCommitted && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-sm">
                <p className="font-semibold text-green-700 dark:text-green-400">
                  ✅ You've committed to this project!
                </p>
                <p className="text-green-600 dark:text-green-500">
                  {allCommitted 
                    ? "All team members have committed. Team is now locked!"
                    : `Waiting for ${teamMembers.length - committedMembers.length} more member(s) to commit.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
