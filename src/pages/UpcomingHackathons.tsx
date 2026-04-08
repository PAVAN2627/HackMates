import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, MapPin, ExternalLink, Upload, X, Trash2, Edit, Clock, Mail, Tag } from 'lucide-react';
import { toast } from 'sonner';

const HACKATHON_THEMES = [
  'AI / Machine Learning', 'Web Development', 'Mobile Apps', 'Blockchain / Web3',
  'IoT / Hardware', 'Cybersecurity', 'Data Science', 'Cloud Computing',
  'HealthTech', 'FinTech', 'EdTech', 'AgriTech', 'CleanTech / Sustainability',
  'Social Impact', 'Game Development', 'AR / VR', 'Open Innovation', 'Other',
];

interface UpcomingHackathon {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  contactEmail: string;
  link?: string;
  imageUrl?: string;
  createdAt: Date;
  creatorId: string;
  mode?: 'online' | 'offline' | 'hybrid';
  city?: string;
  theme?: string;
}

export default function UpcomingHackathons() {
  const { user, loading: authLoading } = useAuth();
  const [ads, setAds] = useState<UpcomingHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [mode, setMode] = useState<'online' | 'offline' | 'hybrid'>('online');
  const [theme, setTheme] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [link, setLink] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline' | 'hybrid'>('all');
  const [filterTheme, setFilterTheme] = useState('');
  const [filterVenue, setFilterVenue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail popup
  const [selectedAd, setSelectedAd] = useState<UpcomingHackathon | null>(null);
  const [expanded, setExpanded] = useState(false);

  const resetForm = () => {
    setEditId(null); setTitle(''); setDescription(''); setDate(''); setTime('');
    setVenue(''); setCity(''); setMode('online'); setTheme('');
    setContactEmail(''); setLink(''); setPreviewUrl('');
  };

  useEffect(() => {
    if (!authLoading && user) {
      const q = query(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const today = new Date().toISOString().split('T')[0];
        const adsData: UpcomingHackathon[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.date >= today || data.creatorId === user.uid) {
            adsData.push({ id: docSnap.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date() } as UpcomingHackathon);
          }
        });
        setAds(adsData);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [authLoading, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 750 * 1024) { toast.error('Image must be under 750KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleEdit = (ad: UpcomingHackathon) => {
    setEditId(ad.id); setTitle(ad.title); setDescription(ad.description);
    setDate(ad.date); setTime(ad.time); setVenue(ad.venue); setCity(ad.city || '');
    setMode(ad.mode || 'online'); setTheme(ad.theme || '');
    setContactEmail(ad.contactEmail); setLink(ad.link || ''); setPreviewUrl(ad.imageUrl || '');
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hackathon advertisement?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, id));
      toast.success('Deleted successfully');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const dataToSave = { title, description, date, time, venue, city, mode, theme, contactEmail, link, imageUrl: previewUrl, creatorId: user.uid };
      if (editId) {
        await updateDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, editId), dataToSave);
        toast.success('Updated!');
      } else {
        await addDoc(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), { ...dataToSave, createdAt: Timestamp.now() });
        toast.success('Posted!');
      }
      setOpen(false); resetForm();
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-pulse text-primary">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const filteredAds = ads.filter(ad => {
    if (filterMode !== 'all' && ad.mode !== filterMode) return false;
    if (filterTheme && ad.theme !== filterTheme) return false;
    if (filterVenue && !ad.venue?.toLowerCase().includes(filterVenue.toLowerCase()) && !ad.city?.toLowerCase().includes(filterVenue.toLowerCase())) return false;
    if (searchQuery && !ad.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const fmtDate = (d: string, t: string) => {
    try {
      return new Date(`${d}T${t}`).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return d; }
  };
  const fmtTime = (d: string, t: string) => {
    try {
      return new Date(`${d}T${t}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return t; }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Upcoming Hackathons
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">External hackathons advertised by the community</p>
        </div>

        {/* Post Dialog */}
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" /> Post Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Hackathon' : 'Post Upcoming Hackathon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title *</label>
                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Smart India Hackathon 2026" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description *</label>
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell us about the hackathon..." rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date *</label>
                  <Input required type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Time *</label>
                  <Input required type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mode *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['online', 'offline', 'hybrid'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setMode(m)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-center capitalize text-sm ${mode === m ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border hover:border-primary/50'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Theme / Domain *</label>
                <select
                  required
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                >
                  <option value="">Select a theme...</option>
                  {HACKATHON_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Venue *</label>
                  <Input required value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. IIT Delhi" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">City *</label>
                  <Input required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. New Delhi" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Contact Email *</label>
                <Input required type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="organizer@example.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Registration Link</label>
                <Input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Poster Image (Optional, max 750KB)</label>
                {!previewUrl ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-5 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mb-3">PNG, JPG up to 750KB</p>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="poster-upload" />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('poster-upload')?.click()}>
                      Choose Image
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-56 object-contain rounded-lg bg-muted" />
                    <button type="button" onClick={() => setPreviewUrl('')}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Post Advertisement'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Search by title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Input placeholder="Filter by venue or city..." value={filterVenue} onChange={e => setFilterVenue(e.target.value)} />
          <select
            value={filterTheme}
            onChange={e => setFilterTheme(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
          >
            <option value="">All Themes</option>
            {HACKATHON_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'online', 'offline', 'hybrid'] as const).map(option => (
            <Button key={option} variant={filterMode === option ? 'default' : 'outline'} size="sm"
              onClick={() => setFilterMode(option)} className="capitalize">
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass rounded-xl h-64 animate-pulse bg-muted/50" />)}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Upcoming Hackathons</h3>
          <p className="text-muted-foreground">Be the first to post one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="glass rounded-xl overflow-hidden hover:shadow-lg transition-all border border-muted/20 cursor-pointer flex flex-col"
              onClick={() => { setSelectedAd(ad); setExpanded(false); }}>
              {/* Poster — full image, no crop */}
              {ad.imageUrl && (
                <div className="w-full bg-muted flex items-center justify-center">
                  <img src={ad.imageUrl} alt={ad.title}
                    className="w-full object-contain max-h-64"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hackmatesroundlogo.png'; }} />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-bold text-primary leading-tight">{ad.title}</h3>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{ad.mode || 'online'}</span>
                    {ad.theme && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground">{ad.theme}</span>}
                  </div>
                </div>

                <p className="text-sm text-foreground/75 mb-3 line-clamp-2">{ad.description}</p>

                <div className="space-y-1.5 text-xs text-muted-foreground mt-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{fmtDate(ad.date, ad.time)} · {fmtTime(ad.date, ad.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ad.venue}{ad.city && ad.city !== 'N/A' ? `, ${ad.city}` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border" onClick={e => e.stopPropagation()}>
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline" onClick={() => { setSelectedAd(ad); setExpanded(false); }}>
                    View Details →
                  </span>
                  {ad.creatorId === user.uid && (
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => handleEdit(ad)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => handleDelete(ad.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Popup */}
      <Dialog open={!!selectedAd} onOpenChange={(o) => { if (!o) { setSelectedAd(null); setExpanded(false); } }}>
        <DialogContent className="sm:max-w-[660px] max-h-[92vh] overflow-y-auto p-0">
          {selectedAd && (
            <>
              {/* Full poster image */}
              {selectedAd.imageUrl && (
                <div className="w-full bg-black flex items-center justify-center rounded-t-lg overflow-hidden">
                  <img
                    src={selectedAd.imageUrl}
                    alt={selectedAd.title}
                    className="w-full object-contain max-h-[420px]"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hackmatesroundlogo.png'; }}
                  />
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Title + badges */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-primary leading-tight">{selectedAd.title}</h2>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary capitalize">{selectedAd.mode || 'online'}</span>
                    {selectedAd.theme && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground flex items-center gap-1">
                        <Tag className="h-3 w-3" />{selectedAd.theme}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description with read more */}
                <div>
                  <p className={`text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
                    {selectedAd.description}
                  </p>
                  {selectedAd.description.length > 300 && (
                    <button onClick={() => setExpanded(!expanded)}
                      className="text-xs text-primary font-medium mt-1 hover:underline">
                      {expanded ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{fmtDate(selectedAd.date, selectedAd.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{fmtTime(selectedAd.date, selectedAd.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="text-sm font-medium">{selectedAd.venue}{selectedAd.city && selectedAd.city !== 'N/A' ? `, ${selectedAd.city}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium break-all">{selectedAd.contactEmail}</p>
                    </div>
                  </div>
                </div>

                {selectedAd.link && (
                  <a href={selectedAd.link} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2">
                      View & Register <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}

                {selectedAd.creatorId === user.uid && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedAd(null); handleEdit(selectedAd); }}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => { setSelectedAd(null); handleDelete(selectedAd.id); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
