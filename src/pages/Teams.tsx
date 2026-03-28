import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Plus, Search, Crown, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';
import { sendTeamAdditionEmail, sendTeamRemovalEmail } from '@/lib/emailService';
import { toast } from 'sonner';
import { Hackathon } from '@/types';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OffPlatformTeam {
  id: string;
  name: string;
  hackathonName: string;
  leaderId: string;
  memberIds: string[];
  createdAt: Date;
}

interface TeamWithHackathon {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  hackathonId: string;
  hackathonName: string;
  isOffPlatform: boolean;
  projectTitle?: string;
  techStack?: string[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Teams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profiles } = useProfiles();

  const [teams, setTeams] = useState<TeamWithHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'member'>('all');

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newHackathonName, setNewHackathonName] = useState('');
  const [creating, setCreating] = useState(false);

  // Per-team invite search
  const [inviteSearch, setInviteSearch] = useState<Record<string, string>>({});
  const [inviting, setInviting] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // teamId to delete

  // ── Load teams ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    loadAllTeams();
  }, [user?.uid]);

  const loadAllTeams = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const loaded: TeamWithHackathon[] = [];

      // 1. Hackathon-based teams (from platform hackathons)
      const hackSnap = await getDocs(collection(db, COLLECTIONS.HACKATHONS));
      hackSnap.forEach(d => {
        const h = d.data() as Hackathon;
        (h.teams || []).forEach(team => {
          if (team.memberIds?.includes(user.uid) || team.leaderId === user.uid) {
            loaded.push({
              id: team.id,
              name: team.name,
              leaderId: team.leaderId,
              memberIds: team.memberIds || [],
              hackathonId: d.id,
              hackathonName: h.title,
              isOffPlatform: false,
              projectTitle: team.projectTitle,
              techStack: team.techStack,
            });
          }
        });
      });

      // 2. Off-platform teams
      // Must use where clauses to comply with Firestore security rules, otherwise it fails with missing permissions
      const q1 = query(collection(db, 'offPlatformTeams'), where('leaderId', '==', user.uid));
      const q2 = query(collection(db, 'offPlatformTeams'), where('memberIds', 'array-contains', user.uid));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const seenOffPlatform = new Set<string>();
      
      const processOffPlatformDoc = (d: any) => {
        if (seenOffPlatform.has(d.id)) return;
        seenOffPlatform.add(d.id);
        const t = d.data() as OffPlatformTeam;
        loaded.push({
          id: d.id,
          name: t.name,
          leaderId: t.leaderId,
          memberIds: t.memberIds || [],
          hackathonId: '',
          hackathonName: t.hackathonName,
          isOffPlatform: true,
        });
      };

      snap1.forEach(processOffPlatformDoc);
      snap2.forEach(processOffPlatformDoc);

      setTeams(loaded);
    } catch (err) {
      console.error('Error loading teams:', err);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // ── Create off-platform team ────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!user || !newTeamName.trim() || !newHackathonName.trim()) return;
    setCreating(true);
    try {
      const ref = await addDoc(collection(db, 'offPlatformTeams'), {
        name: newTeamName.trim(),
        hackathonName: newHackathonName.trim(),
        leaderId: user.uid,
        memberIds: [user.uid],
        createdAt: Timestamp.now(),
      });
      setTeams(prev => [...prev, {
        id: ref.id,
        name: newTeamName.trim(),
        leaderId: user.uid,
        memberIds: [user.uid],
        hackathonId: '',
        hackathonName: newHackathonName.trim(),
        isOffPlatform: true,
      }]);
      setCreateOpen(false);
      setNewTeamName('');
      setNewHackathonName('');
      toast.success('Team created! Now invite members below.');
    } catch {
      toast.error('Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  // ── Invite member (off-platform) ────────────────────────────────────────────

  const handleInvite = async (team: TeamWithHackathon, candidateId: string) => {
    if (!user) return;
    setInviting(candidateId);
    try {
      const updated = [...team.memberIds, candidateId];
      await updateDoc(doc(db, 'offPlatformTeams', team.id), { memberIds: updated });

      const candidate = profiles.find(p => p.uid === candidateId);
      const leader = profiles.find(p => p.uid === user.uid);
      if (candidate?.email) {
        sendTeamAdditionEmail(
          candidate.email,
          candidate.name,
          team.hackathonName,
          team.name,
          leader?.name || 'Team Leader',
          ''
        ).catch(() => {});
      }

      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, memberIds: updated } : t));
      setInviteSearch(prev => ({ ...prev, [team.id]: '' }));
      toast.success(`${candidate?.name || 'Member'} invited!`);
    } catch {
      toast.error('Failed to invite member');
    } finally {
      setInviting(null);
    }
  };

  // ── Remove member (off-platform) ────────────────────────────────────────────

  const handleRemove = async (team: TeamWithHackathon, memberId: string) => {
    if (!user) return;
    setRemoving(memberId);
    try {
      const updated = team.memberIds.filter(id => id !== memberId);
      await updateDoc(doc(db, 'offPlatformTeams', team.id), { memberIds: updated });

      const member = profiles.find(p => p.uid === memberId);
      const leader = profiles.find(p => p.uid === user.uid);
      if (member?.email) {
        sendTeamRemovalEmail(
          member.email,
          member.name,
          team.hackathonName,
          team.name,
          leader?.name || 'Team Leader',
          ''
        ).catch(() => {});
      }

      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, memberIds: updated } : t));
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  // ── Delete off-platform team ────────────────────────────────────────────────

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteDoc(doc(db, 'offPlatformTeams', teamId));
      setTeams(prev => prev.filter(t => t.id !== teamId));
      toast.success('Team deleted');
    } catch {
      toast.error('Failed to delete team');
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────────

  const filtered = teams.filter(t => {
    if (filter === 'created') return t.leaderId === user?.uid;
    if (filter === 'member') return t.leaderId !== user?.uid && t.memberIds.includes(user?.uid || '');
    return true;
  });

  const createdCount = teams.filter(t => t.leaderId === user?.uid).length;
  const memberCount = teams.filter(t => t.leaderId !== user?.uid && t.memberIds.includes(user?.uid || '')).length;

  const filterTabs: [typeof filter, string][] = [
    ['all', `All (${teams.length})`],
    ['created', `Created (${createdCount})`],
    ['member', `Member (${memberCount})`],
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Teams</h1>
            <p className="text-sm text-muted-foreground">Platform hackathon teams + off-platform teams</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-border">
        {filterTabs.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors text-sm',
              filter === val
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground animate-pulse">Loading teams...</div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-bold mb-2">No teams yet</h2>
          <p className="text-muted-foreground mb-6">
            Create a team for any hackathon — even ones not listed on the platform.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Team
            </Button>
            <Button variant="outline" onClick={() => navigate('/hackathons')} className="gap-2">
              <Trophy className="h-4 w-4" /> Browse Hackathons
            </Button>
          </div>
        </div>
      )}

      {/* Teams grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(team => {
            const isLeader = team.leaderId === user?.uid;
            const search = inviteSearch[team.id] || '';

            // Candidates: all platform users not already in team, filtered by search (min 2 chars)
            // Mode matching: online matches online+both, in-person matches in-person+both, both matches all
            const candidates = search.length < 2 ? [] : profiles.filter(p =>
              p.uid !== user?.uid &&
              !team.memberIds.includes(p.uid) &&
              (p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())))
            );

            return (
              <div key={team.id} className="glass rounded-xl p-5 border border-border space-y-4">

                {/* Team header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{team.name}</h3>
                      {isLeader
                        ? <Badge className="bg-primary text-xs">Leader</Badge>
                        : <Badge variant="outline" className="text-xs">Member</Badge>
                      }
                      {team.isOffPlatform && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-400">
                          Off-Platform
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{team.hackathonName}</p>
                  </div>

                  <div className="flex gap-1">
                    {!team.isOffPlatform && (
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs px-2"
                        onClick={() => navigate(`/teams/${team.hackathonId}/${team.id}`)}
                      >
                        View
                      </Button>
                    )}
                    {isLeader && team.isOffPlatform && (
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setConfirmDelete(team.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Members */}
                <div className="flex flex-wrap gap-2">
                  {team.memberIds.map(memberId => {
                    const p = profiles.find(pr => pr.uid === memberId);
                    const isML = memberId === team.leaderId;
                    const canRemove = isLeader && !isML && team.isOffPlatform;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border text-xs group"
                      >
                        <AvatarUpload
                          currentAvatar={p?.avatar || null}
                          userName={p?.name || '?'}
                          userGender={p?.gender as any}
                          size="sm"
                          editable={false}
                        />
                        <span>{memberId === user?.uid ? 'You' : p?.name || 'Unknown'}</span>
                        {isML && <Crown className="h-3 w-3 text-yellow-500" />}
                        {canRemove && (
                          <button
                            className="ml-0.5 text-muted-foreground hover:text-red-500 transition-colors"
                            disabled={removing === memberId}
                            onClick={() => handleRemove(team, memberId)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Project info (platform teams) */}
                {team.projectTitle && (
                  <p className="text-xs text-muted-foreground">
                    Project: <span className="text-foreground font-medium">{team.projectTitle}</span>
                  </p>
                )}

                {/* Invite section — leader of off-platform team only */}
                {isLeader && team.isOffPlatform && (
                  <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                    <p className="text-xs font-medium">Add Members</p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or skill..."
                        value={search}
                        onChange={e => setInviteSearch(prev => ({ ...prev, [team.id]: e.target.value }))}
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto space-y-1">
                      {search.length < 2 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Type at least 2 characters to search members
                        </p>
                      ) : candidates.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No users match your search
                        </p>
                      ) : candidates.slice(0, 10).map(c => (
                        <div
                          key={c.uid}
                          className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-background transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <AvatarUpload
                              currentAvatar={c.avatar || null}
                              userName={c.name}
                              userGender={c.gender as any}
                              size="sm"
                              editable={false}
                            />
                            <div>
                              <p className="text-xs font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.skills?.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="h-6 text-xs px-2"
                            disabled={inviting === c.uid}
                            onClick={() => handleInvite(team, c.uid)}
                          >
                            {inviting === c.uid ? '...' : 'Invite'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Team"
        description="Delete this team? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDelete) handleDeleteTeam(confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Create Team Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={open => {
          setCreateOpen(open);
          if (!open) { setNewTeamName(''); setNewHackathonName(''); }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Create a Team
            </DialogTitle>
            <DialogDescription>
              For hackathons not listed on HackMates — create a team and invite members from the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Hackathon Name</label>
              <Input
                placeholder="e.g. Smart India Hackathon 2025"
                value={newHackathonName}
                onChange={e => setNewHackathonName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Team Name</label>
              <Input
                placeholder="e.g. Code Warriors"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !creating && newTeamName.trim() && newHackathonName.trim() && handleCreate()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                disabled={!newTeamName.trim() || !newHackathonName.trim() || creating}
                onClick={handleCreate}
              >
                {creating ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
