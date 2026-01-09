import { Navigate, useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathons } from '@/hooks/useHackathons';
import { useProfiles } from '@/hooks/useProfiles';
import { HackathonCard } from '@/components/HackathonCardNew';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const { hackathons, loading: hackathonsLoading } = useHackathons();
  const { profiles } = useProfiles();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Filter hackathons created by current user
  const myHackathons = hackathons.filter(h => h.creatorId === user.uid);
  const joinedHackathons = hackathons.filter(h => 
    h.teamMembers && h.teamMembers.includes(user.uid) && h.creatorId !== user.uid
  );

  const stats = [
    {
      title: 'My Hackathons',
      value: myHackathons.length,
      icon: Trophy,
      description: 'Hackathons you created'
    },
    {
      title: 'Joined Hackathons',
      value: joinedHackathons.length,
      icon: Users,
      description: 'Hackathons you joined'
    },
    {
      title: 'Total Users',
      value: profiles.length,
      icon: Users,
      description: 'Platform users'
    },
    {
      title: 'All Hackathons',
      value: hackathons.length,
      icon: Trophy,
      description: 'Total hackathons'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.name}!</p>
          </div>
          <Button onClick={() => navigate('/create-hackathon')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Hackathon
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 hidden md:block">{stat.description}</p>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
                  <stat.icon className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* My Hackathons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Hackathons</h2>
          {hackathonsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : myHackathons.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't created any hackathons yet.</p>
              <Button onClick={() => navigate('/create-hackathon')}>
                Create Your First Hackathon
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  onViewDetails={(id) => navigate(`/hackathons/${id}`)}
                  isCreator={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Joined Hackathons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Joined Hackathons</h2>
          {hackathonsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : joinedHackathons.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't joined any hackathons yet.</p>
              <Button onClick={() => navigate('/hackathons')}>
                Browse Hackathons
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedHackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  onViewDetails={(id) => navigate(`/hackathons/${id}`)}
                  joined={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/hackathons')}>
            <Trophy className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Browse Hackathons</h3>
            <p className="text-sm text-muted-foreground">Discover and join amazing hackathons</p>
          </Card>
          
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/profiles')}>
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Find Members</h3>
            <p className="text-sm text-muted-foreground">Connect with talented developers and designers</p>
          </Card>
          
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/messages')}>
            <Calendar className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Messages</h3>
            <p className="text-sm text-muted-foreground">Chat with your connections</p>
          </Card>
        </div>
      </div>
    </div>
  );
}