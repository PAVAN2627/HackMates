import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, MapPin, ExternalLink, Image as ImageIcon, Upload, X, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

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
  const [contactEmail, setContactEmail] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'offline' | 'hybrid'>('all');
  const [filterCity, setFilterCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setVenue('');
    setCity('');
    setMode('online');
    setContactEmail('');
    setLink('');
    setImageFile(null);
    setPreviewUrl('');
  };

  useEffect(() => {
    if (!authLoading && user) {
      const q = query(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const adsData: UpcomingHackathon[] = [];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter logic: show only if it's in the future OR the user created it
          if (data.date >= today || data.creatorId === user.uid) {
            adsData.push({
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
            } as UpcomingHackathon);
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
    if (file) {
      if (file.size > 750 * 1024) { // 750KB limit because Firestore document limit is 1MB
        toast.error('Image size should be less than 750KB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
  };

  const handleEdit = (ad: UpcomingHackathon) => {
    setEditId(ad.id);
    setTitle(ad.title);
    setDescription(ad.description);
    setDate(ad.date);
    setTime(ad.time);
    setVenue(ad.venue);
    setCity(ad.city || '');
    setMode(ad.mode || 'online');
    setContactEmail(ad.contactEmail);
    setLink(ad.link || '');
    setPreviewUrl(ad.imageUrl || '');
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hackathon advertisement?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, id));
      toast.success('Advertisement deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete advertisement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const dataToSave = {
        title,
        description,
        date,
        time,
        venue,
        city,
        mode,
        contactEmail,
        link,
        imageUrl: previewUrl,
        creatorId: user.uid,
      };

      if (editId) {
        await updateDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, editId), dataToSave);
        toast.success('Hackathon updated successfully!');
      } else {
        await addDoc(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), {
          ...dataToSave,
          createdAt: Timestamp.now()
        });
        toast.success('Upcoming hackathon posted successfully!');
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save hackathon');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-pulse text-primary">Loading...</div></div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const filteredAds = ads.filter(ad => {
    if (filterMode !== 'all' && ad.mode !== filterMode) return false;
    if (filterCity && !ad.city?.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (searchQuery && !ad.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Upcoming Hackathons
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            External hackathons advertised by the community
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Post Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Hackathon' : 'Post Next Hackathon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hackathon Title *</label>
                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Smart India Hackathon" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell us about the hackathon..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date *</label>
                  <Input required type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time *</label>
                  <Input required type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['online', 'offline', 'hybrid'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-center capitalize text-sm ${
                        mode === m
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Venue *</label>
                  <Input required value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. IIT Delhi or Online Platform" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <Input required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. New Delhi (or N/A for online)" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email *</label>
                <Input required type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="organizer@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Link</label>
                <Input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Poster Image (Optional)</label>
                <div className="mt-2">
                  {!previewUrl ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">Upload hackathon poster</p>
                      <p className="text-xs text-muted-foreground mb-3 md:mb-4">PNG, JPG up to 750KB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="poster-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('poster-upload')?.click()}
                      >
                        Choose Image
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-32 md:h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Post Advertisement'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border mt-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Input placeholder="Search hackathons..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full" />
        </div>
        <div className="flex-1 w-full">
          <Input placeholder="Filter by city..." value={filterCity} onChange={e => setFilterCity(e.target.value)} className="w-full" />
        </div>
        <div className="flex-1 w-full flex gap-2">
          {(['all', 'online', 'offline', 'hybrid'] as const).map(option => (
            <Button
              key={option}
              variant={filterMode === option ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode(option)}
              className="capitalize flex-1"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-xl h-64 animate-pulse bg-muted/50"></div>
          ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center mt-6">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Upcoming Hackathons</h3>
          <p className="text-muted-foreground">Be the first to post an upcoming hackathon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="glass rounded-xl overflow-hidden hover:shadow-lg transition-all border border-muted/20">
              {ad.imageUrl && (
                <div className="w-full h-48 bg-muted relative">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/hackmatesroundlogo.png'; }} />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-primary">{ad.title}</h3>
                <p className="text-sm text-foreground/80 mb-4 whitespace-pre-wrap line-clamp-3">{ad.description}</p>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> <span>{ad.date} at {ad.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> <span>{ad.venue}{ad.city && ad.city.trim() !== 'N/A' ? `, ${ad.city}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">{ad.mode || 'classic'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs bg-muted px-2 py-1 rounded">Contact:</span> <span>{ad.contactEmail}</span>
                  </div>
                </div>
                {ad.link && (
                  <a href={ad.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                    View & Register <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Edit & Delete Controls for Creator */}
                {ad.creatorId === user.uid && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(ad)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)} className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
