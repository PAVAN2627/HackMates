import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, Calendar, MapPin, ExternalLink, Edit, Trash2, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathons } from '@/hooks/useHackathons';
import { useProfiles } from '@/hooks/useProfiles';
import { HackathonCard } from '@/components/HackathonCardNew';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface UpcomingAd {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city?: string;
  mode?: string;
  themes?: string[];
  theme?: string | string[];
  link?: string;
  imageUrl?: string;
  creatorId: string;
}

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const { hackathons, loading: hackathonsLoading } = useHackathons();
  const { profiles } = useProfiles();
  const navigate = useNavigate();

  const [myUpcoming, setMyUpcoming] = useState<UpcomingAd[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), where('creatorId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      setMyUpcoming(snap.docs.map(d => ({ id: d.id, ...d.data() } as UpcomingAd)));
      setUpcomingLoading(false);
    });
    return unsub;
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const myHackathons = hackathons.filter(h => h.creatorId === user.uid);
  const joinedHackathons = hackathons.filter(h =>
    h.teamMembers && h.teamMembers.includes(user.uid) && h.creatorId !== user.uid
  );

  const getThemes = (ad: UpcomingAd): string[] => {
    if (Array.isArray(ad.themes) && ad.themes.length) return ad.themes;
    if (Array.isArray(ad.theme)) return ad.theme;
    if (typeof ad.theme === 'string' && ad.theme) return [ad.theme];
    return [];
  };

  const handleDeleteUpcoming = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const stats = [
    { title: 'My Hackathons', value: myHackathons.length, icon: Trophy, description: 'Hackathons you created' },
    { title: 'Joined Hackathons', value: joinedHackathons.length, icon: Users, description: 'Hackathons you joined' },
    { title: 'Upcoming Posted', value: myUpcoming.length, icon: Calendar, description: 'Upcoming ads you posted' },
    { title: 'Total Users', value: profiles.length, icon: Users, description: 'Platform users' },
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
            <Plus className="w-4 h-4" /> Create Hackathon
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : myHackathons.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't created any hackathons yet.</p>
              <Button onClick={() => navigate('/create-hackathon')}>Create Your First Hackathon</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHackathons.map(h => (
                <HackathonCard key={h.id} hackathon={h} onViewDetails={id => navigate(`/hackathons/${id}`)} isCreator />
              ))}
            </div>
          )}
        </div>

        {/* Joined Hackathons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Joined Hackathons</h2>
          {hackathonsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : joinedHackathons.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't joined any hackathons yet.</p>
              <Button onClick={() => navigate('/hackathons')}>Browse Hackathons</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedHackathons.map(h => (
                <HackathonCard key={h.id} hackathon={h} onViewDetails={id => navigate(`/hackathons/${id}`)} joined />
              ))}
            </div>
          )}
        </div>

        {/* My Upcoming Hackathon Ads */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Upcoming Ads</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/upcoming')} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Post New
            </Button>
          </div>

          {upcomingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map(i => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : myUpcoming.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't posted any upcoming hackathon ads yet.</p>
              <Button onClick={() => navigate('/upcoming')}>Post an Upcoming Hackathon</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myUpcoming.map(ad => (
                <Card key={ad.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                  {ad.imageUrl && (
                    <div className="w-full bg-black flex items-center justify-center max-h-40 overflow-hidden">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full object-contain max-h-40"
                        onError={e => { (e.target as HTMLImageElement).src = '/assets/hackmatesroundlogo.png'; }} />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base text-primary leading-tight line-clamp-2">{ad.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize flex-shrink-0">{ad.mode || 'online'}</span>
                    </div>

                    {getThemes(ad).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getThemes(ad).slice(0, 3).map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground flex items-center gap-1">
                            <Tag className="h-2.5 w-2.5" />{t}
                          </span>
                        ))}
                        {getThemes(ad).length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{getThemes(ad).length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{ad.date} · {ad.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{ad.venue}{ad.city && ad.city !== 'N/A' ? `, ${ad.city}` : ''}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                      {ad.link && (
                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                            <ExternalLink className="h-3 w-3" /> Register
                          </Button>
                        </a>
                      )}
                      <Button variant="outline" size="sm" className="gap-1 text-xs"
                        onClick={() => navigate('/upcoming')}>
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="outline" size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeleteUpcoming(ad.id, ad.title)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
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
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/upcoming')}>
            <Calendar className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Upcoming Hackathons</h3>
            <p className="text-sm text-muted-foreground">Browse and post upcoming external hackathons</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
