import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HackathonCard } from '@/components/HackathonCardNew';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathons } from '@/hooks/useHackathons';
import { toast } from 'sonner';

const skillsOptions = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'DevOps', 'Cloud', 'ML', 'Web3', 'Mobile', 'UI/UX', 'Data Science'];

export default function Hackathons() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { hackathons, loading, closeHackathon, joinHackathon, leaveHackathon, deleteHackathon } = useHackathons();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'in-person' | 'both'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter hackathons
  let filtered = hackathons;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(h => 
      h.title.toLowerCase().includes(term) ||
      h.description.toLowerCase().includes(term)
    );
  }

  if (selectedSkills.length > 0) {
    filtered = filtered.filter(h =>
      h.requiredSkills?.some(skill => selectedSkills.includes(skill))
    );
  }

  if (selectedMode !== 'all') {
    filtered = filtered.filter(h => h.mode === selectedMode || h.mode === 'both');
  }

  if (selectedStatus !== 'all') {
    filtered = filtered.filter(h => h.status === selectedStatus);
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleViewDetails = (hackathonId: string) => {
    navigate(`/hackathons/${hackathonId}`);
  };

  const handleJoin = async (hackathonId: string) => {
    try {
      const hackathon = hackathons.find(h => h.id === hackathonId);
      
      // Prevent join/leave for closed hackathons
      if (hackathon?.status === 'closed') {
        toast.error('Cannot join or leave a closed hackathon');
        return;
      }
      
      const isJoined = hackathon?.teamMembers?.includes(user?.uid || '');
      
      if (isJoined) {
        await leaveHackathon(hackathonId);
        toast.success('You left the hackathon successfully!');
      } else {
        await joinHackathon(hackathonId);
        toast.success('You joined the hackathon successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hackathon membership');
    }
  };

  const handleClose = async (hackathonId: string) => {
    try {
      await closeHackathon(hackathonId);
      toast.success('Hackathon closed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to close hackathon');
    }
  };

  const handleDelete = async (hackathonId: string) => {
    if (window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      try {
        await deleteHackathon(hackathonId);
        toast.success('Hackathon deleted successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete hackathon');
      }
    }
  };

  const isJoinedHackathon = (hackathonId: string) => {
    const hackathon = hackathons.find(h => h.id === hackathonId);
    return hackathon?.teamMembers?.includes(user?.uid || '');
  };

  const isCreator = (creatorId: string) => {
    return creatorId === user?.uid;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover Hackathons</h1>
            <p className="text-sm md:text-base text-muted-foreground">Find and join amazing hackathons</p>
          </div>
          <Button 
            onClick={() => navigate('/create-hackathon')} 
            size="sm"
            className="md:size-lg w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Post Hackathon</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 mb-3 md:mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-border">
              {/* Mode Filter */}
              <div>
                <label className="text-xs md:text-sm font-medium block mb-2">Mode</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['all', 'online', 'in-person', 'both'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`px-2 md:px-3 py-2 rounded-md border text-xs md:text-sm font-medium transition-colors ${
                        selectedMode === mode
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:border-primary'
                      }`}
                    >
                      {mode === 'all' ? 'All' : mode === 'in-person' ? 'In-Person' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs md:text-sm font-medium block mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'open', 'closed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-2 md:px-3 py-2 rounded-md border text-xs md:text-sm font-medium transition-colors ${
                        selectedStatus === status
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:border-primary'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="text-xs md:text-sm font-medium flex items-center gap-2 mb-2">
                  <Tag className="w-3 h-3 md:w-4 md:h-4" />
                  Required Skills
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillsOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2 md:px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:border-primary'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedSkills.length > 0 || selectedMode !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSkills([]);
                    setSelectedMode('all');
                    setSelectedStatus('all');
                  }}
                  className="w-full text-xs md:text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-8 md:py-12">
            <div className="text-sm md:text-base text-muted-foreground">Loading hackathons...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-sm md:text-base text-muted-foreground mb-4">No hackathons found matching your filters</p>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm('');
              setSelectedSkills([]);
              setSelectedMode('all');
              setSelectedStatus('all');
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
              Found {filtered.length} hackathon{filtered.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filtered.map(hackathon => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  onViewDetails={handleViewDetails}
                  onJoin={handleJoin}
                  onClose={handleClose}
                  onDelete={handleDelete}
                  isCreator={isCreator(hackathon.creatorId)}
                  joined={isJoinedHackathon(hackathon.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
