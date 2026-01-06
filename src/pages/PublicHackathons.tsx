import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Tag, ArrowLeft, Calendar, MapPin, Users, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useHackathons } from '@/hooks/useHackathons';

const skillsOptions = ['React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'Python', 'Django', 'Flask', 'Java', 'TypeScript', 'DevOps', 'Cloud', 'ML', 'Web3', 'Mobile', 'UI/UX', 'Data Science'];

export default function PublicHackathons() {
  const { hackathons, loading } = useHackathons();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'in-person' | 'both'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed'>('open'); // Default to open only
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

  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/roundlogohackmates.png" 
                  alt="HackMates Logo" 
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  HackMates
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Hackathons
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Explore hackathons across India. Join HackMates to participate, form teams, and build amazing projects.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search hackathons by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 dark:border-slate-700"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-white/20">
              {/* Mode Filter */}
              <div>
                <label className="text-sm font-medium block mb-2">Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['all', 'online', 'in-person', 'both'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedMode === mode
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                      }`}
                    >
                      {mode === 'all' ? 'All' : mode === 'in-person' ? 'In-Person' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium block mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'open', 'closed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedStatus === status
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4" />
                  Required Skills
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {skillsOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium ${
                        selectedSkills.includes(skill)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400'
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
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600 dark:text-slate-400">Loading hackathons...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">No hackathons found matching your filters</p>
            <Button variant="outline" onClick={() => {
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
            <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Found {filtered.length} hackathon{filtered.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(hackathon => (
                <Card key={hackathon.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  {/* Image */}
                  {hackathon.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={hackathon.image} 
                        alt={hackathon.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {hackathon.title}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">by {hackathon.creatorName}</p>
                      </div>
                      <Badge className={statusColors[hackathon.status as keyof typeof statusColors]}>
                        {hackathon.status === 'open' ? 'Open' : 'Closed'}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {hackathon.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(`${hackathon.date}T${hackathon.time}`).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(`${hackathon.date}T${hackathon.time}`).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{hackathon.venue}, {hackathon.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>Team size: {hackathon.teamSize} members</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {hackathon.requiredSkills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {hackathon.requiredSkills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hackathon.requiredSkills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <div className="pt-4 border-t border-white/20">
                      <Link to="/auth">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                          Join to Participate
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Join the Community?</h2>
            <p className="text-lg mb-6 opacity-90">
              Sign up to participate in hackathons, form teams, and build amazing projects with talented developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Create Account
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}