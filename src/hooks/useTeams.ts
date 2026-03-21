import { useState } from 'react';
import { doc, updateDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { HackathonTeam } from '@/types';
import { sendTeamAdditionEmail, sendTeamRemovalEmail } from '@/lib/emailService';
import { toast } from 'sonner';

export function useTeams() {
  const [loading, setLoading] = useState(false);

  const addMemberToTeam = async (
    hackathonId: string,
    hackathonTitle: string,
    teamId: string,
    teamName: string,
    userId: string,
    invitedByName: string,
    currentTeams: HackathonTeam[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const updatedTeams = currentTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            memberIds: [...team.memberIds, userId]
          };
        }
        return team;
      });

      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      await updateDoc(hackathonRef, {
        teams: updatedTeams
      });

      // Create notification for the added member
      const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
      await addDoc(notificationsRef, {
        userId,
        type: 'team_invite',
        title: 'Added to Team',
        message: `${invitedByName} added you to team "${teamName}" in ${hackathonTitle}`,
        read: false,
        hackathonId,
        hackathonTitle,
        teamId,
        teamName,
        invitedBy: invitedByName,
        createdAt: new Date()
      });

      // Send email notification to the added member
      try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userEmail = userData.email;
          const userName = userData.name;
          
          if (userEmail && userName) {
            sendTeamAdditionEmail(
              userEmail,
              userName,
              hackathonTitle,
              teamName,
              invitedByName,
              hackathonId
            ).then(() => {
              console.log('Team addition email queued for:', userEmail);
            }).catch(err => {
              console.error('Failed to queue team addition email:', err);
            });
          }
        }
      } catch (emailError) {
        console.error('Error queuing team addition email:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast.success('Member added to team!');
      return true;
    } catch (error) {
      console.error('Error adding member to team:', error);
      toast.error('Failed to add member to team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromTeam = async (
    hackathonId: string,
    teamId: string,
    userId: string,
    currentTeams: HackathonTeam[],
    hackathonTitle?: string,
    teamName?: string,
    removedByName?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      // Fetch fresh from Firestore to avoid stale/serialization issues
      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      const freshSnap = await getDoc(hackathonRef);
      const freshTeams: HackathonTeam[] = freshSnap.exists()
        ? (freshSnap.data().teams || [])
        : currentTeams;

      const updatedTeams = freshTeams.map(team => {
        if (team.id === teamId) {
          return { ...team, memberIds: team.memberIds.filter((id: string) => id !== userId) };
        }
        return team;
      });

      await updateDoc(hackathonRef, { teams: updatedTeams });

      // Send removal email
      try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.email && hackathonTitle && teamName && removedByName) {
            sendTeamRemovalEmail(
              userData.email,
              userData.name,
              hackathonTitle,
              teamName,
              removedByName,
              hackathonId
            ).catch(() => {});
          }
        }
      } catch {}

      // Notification
      try {
        await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
          userId,
          type: 'team_removed',
          title: 'Removed from Team',
          message: `${removedByName || 'Team leader'} removed you from team "${teamName}" in ${hackathonTitle}`,
          read: false,
          hackathonId,
          createdAt: new Date(),
        });
      } catch {}

      toast.success('Member removed from team!');
      return true;
    } catch (error) {
      console.error('Error removing member from team:', error);
      toast.error('Failed to remove member from team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeNonTeamMembers = async (
    hackathonId: string,
    teams: HackathonTeam[],
    allMemberIds: string[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get all team member IDs
      const teamMemberIds = new Set<string>();
      teams.forEach(team => {
        team.memberIds.forEach(id => teamMemberIds.add(id));
      });

      // Find members not in any team
      const membersToRemove = allMemberIds.filter(id => !teamMemberIds.has(id));

      if (membersToRemove.length === 0) {
        toast.info('All members are already in teams');
        return true;
      }

      // Update hackathon to remove non-team members
      const hackathonRef = doc(db, 'hackathons', hackathonId);
      const remainingMembers = allMemberIds.filter(id => teamMemberIds.has(id));
      
      await updateDoc(hackathonRef, {
        teamMembers: remainingMembers
      });

      toast.success(`Removed ${membersToRemove.length} non-team members from hackathon`);
      return true;
    } catch (error) {
      console.error('Error removing non-team members:', error);
      toast.error('Failed to remove non-team members');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (
    hackathonId: string,
    teamName: string,
    leaderId: string,
    currentTeams: HackathonTeam[] = []
  ): Promise<HackathonTeam | null> => {
    try {
      setLoading(true);
      
      const newTeam: HackathonTeam = {
        id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: teamName,
        memberIds: [leaderId],
        leaderId,
        createdAt: new Date()
      };

      const hackathonRef = doc(db, 'hackathons', hackathonId);
      await updateDoc(hackathonRef, {
        teams: [...currentTeams, newTeam]
      });

      toast.success('Team created successfully!');
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (
    hackathonId: string,
    teamId: string,
    userId: string,
    currentTeams: HackathonTeam[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const updatedTeams = currentTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            memberIds: [...team.memberIds, userId]
          };
        }
        return team;
      });

      const hackathonRef = doc(db, 'hackathons', hackathonId);
      await updateDoc(hackathonRef, {
        teams: updatedTeams
      });

      toast.success('Joined team successfully!');
      return true;
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async (
    hackathonId: string,
    teamId: string,
    userId: string,
    currentTeams: HackathonTeam[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const updatedTeams = currentTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            memberIds: team.memberIds.filter(id => id !== userId)
          };
        }
        return team;
      }).filter(team => team.memberIds.length > 0); // Remove empty teams

      const hackathonRef = doc(db, 'hackathons', hackathonId);
      await updateDoc(hackathonRef, {
        teams: updatedTeams
      });

      toast.success('Left team successfully!');
      return true;
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserTeam = (teams: HackathonTeam[] | undefined, userId: string): HackathonTeam | null => {
    if (!teams) return null;
    return teams.find(team => team.memberIds.includes(userId)) || null;
  };

  const isUserInAnyTeam = (teams: HackathonTeam[] | undefined, userId: string): boolean => {
    if (!teams) return false;
    return teams.some(team => team.memberIds.includes(userId));
  };

  const updateTeam = async (
    hackathonId: string,
    teamId: string,
    updates: Partial<HackathonTeam>,
    currentTeams: HackathonTeam[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const updatedTeams = currentTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            ...updates
          };
        }
        return team;
      });

      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      await updateDoc(hackathonRef, {
        teams: updatedTeams
      });

      toast.success('Team updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (
    hackathonId: string,
    teamId: string,
    currentTeams: HackathonTeam[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Remove the team from the teams array
      const updatedTeams = currentTeams.filter(team => team.id !== teamId);

      const hackathonRef = doc(db, COLLECTIONS.HACKATHONS, hackathonId);
      await updateDoc(hackathonRef, {
        teams: updatedTeams
      });

      toast.success('Team deleted successfully! All team data and commitments have been removed.');
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createTeam,
    joinTeam,
    leaveTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    removeNonTeamMembers,
    getUserTeam,
    isUserInAnyTeam,
    updateTeam,
    deleteTeam
  };
}
