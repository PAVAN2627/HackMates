import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { Hackathon, HackathonTeam } from '@/types';

interface TeamWithHackathon extends HackathonTeam {
  hackathonId: string;
  hackathonName: string;
  creatorName: string;
}

export default function Teams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamWithHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'member'>('all');

  useEffect(() => {
    loadTeams();
  }, [user?.uid]);

  const loadTeams = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const hackathonsRef = collection(db, COLLECTIONS.HACKATHONS);
      const snapshot = await getDocs(hackathonsRef);
      
      const loadedTeams: TeamWithHackathon[] = [];

      snapshot.forEach(doc => {
        const hackathon = doc.data() as Hackathon;
        
        // Get teams from this hackathon where user is a member or creator
        if (hackathon.teams && Array.isArray(hackathon.teams)) {
          hackathon.teams.forEach(team => {
            const isTeamMember = team.memberIds?.includes(user.uid) || false;
            const isHackathonCreator = hackathon.creatorId === user.uid;
            
            // Show team if user is a member or if user is the hackathon creator
            if (isTeamMember || isHackathonCreator) {
              loadedTeams.push({
                ...team,
                hackathonId: doc.id,
                hackathonName: hackathon.title,
                creatorName: hackathon.creatorName,
              });
            }
          });
        }
      });

      setTeams(loadedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (filter === 'created') return team.leaderId === user?.uid;
    if (filter === 'member') return team.leaderId !== user?.uid && team.memberIds?.includes(user?.uid || '');
    return true;
  });

  const createdTeamsCount = teams.filter(t => t.leaderId === user?.uid).length;
  const memberTeamsCount = teams.filter(t => t.leaderId !== user?.uid && t.memberIds?.includes(user?.uid || '')).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">My Teams</h1>
        </div>
        <p className="text-muted-foreground">
          View all hackathon teams you've created or been added to
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All Teams ({teams.length})
        </button>
        <button
          onClick={() => setFilter('created')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'created'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Created ({createdTeamsCount})
        </button>
        <button
          onClick={() => setFilter('member')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'member'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Member ({memberTeamsCount})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-primary">Loading teams...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTeams.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {filter === 'all' && "You haven't been added to any team yet"}
            {filter === 'created' && "You haven't created any teams yet"}
            {filter === 'member' && "You aren't a member of any teams yet"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {filter === 'all' &&
              "Join hackathons and create or join teams to get started"}
            {filter === 'created' &&
              "Create a team in a hackathon to start building"}
            {filter === 'member' &&
              "Wait for creators to add you to their teams"}
          </p>
          <Button onClick={() => navigate('/hackathons')} className="gap-2">
            <Trophy className="h-4 w-4" />
            Browse Hackathons
          </Button>
        </div>
      )}

      {/* Teams Grid */}
      {!loading && filteredTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map(team => (
            <div
              key={team.id}
              className="glass rounded-xl p-6 border border-border hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => navigate(`/hackathons/${team.hackathonId}?tab=teams`)}
            >
              {/* Hackathon Name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{team.hackathonName}</p>
                  <h3 className="text-xl font-bold mt-1">{team.name}</h3>
                </div>
                {team.leaderId === user?.uid ? (
                  <Badge className="bg-primary">Leader</Badge>
                ) : (
                  <Badge variant="outline">Member</Badge>
                )}
              </div>

              {/* Team Info */}
              <div className="space-y-3">
                {/* Members */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Members ({team.memberIds?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {team.memberIds?.slice(0, 5).map(memberId => (
                      <span
                        key={memberId}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {memberId === user?.uid ? 'You' : 'Member'}
                      </span>
                    ))}
                    {team.memberIds && team.memberIds.length > 5 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        +{team.memberIds.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Info if available */}
                {team.projectTitle && (
                  <div>
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="text-sm font-medium">{team.projectTitle}</p>
                  </div>
                )}

                {/* Tech Stack if available */}
                {team.techStack && team.techStack.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tech Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {team.techStack.slice(0, 3).map(tech => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {team.techStack.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.techStack.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/teams/${team.hackathonId}/${team.id}`);
                }}
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
