import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const HACKATHON_THEMES = [
  'AI / Machine Learning', 'Web Development', 'Mobile Apps',
  'Blockchain / Web3', 'IoT / Hardware', 'Cybersecurity',
  'Data Science', 'Cloud Computing', 'HealthTech', 'FinTech',
  'EdTech', 'AgriTech', 'CleanTech / Sustainability', 'Social Impact',
  'Game Development', 'AR / VR', 'Open Innovation',
  'UI/UX Design', 'DevOps', 'Robotics', 'Space Tech',
  'Smart Cities', 'LegalTech', 'HRTech', 'RetailTech', 'Other',
];

interface EditData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  mode: 'online' | 'offline' | 'hybrid';
  themes: string[];
  contactEmail: string;
  link: string;
  imageUrl: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: EditData | null;
  onSaved?: () => void;
}

export function PostUpcomingDialog({ open, onOpenChange, editData, onSaved }: Props) {
  const { user } = useAuth();

  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [date, setDate] = useState(editData?.date || '');
  const [time, setTime] = useState(editData?.time || '');
  const [venue, setVenue] = useState(editData?.venue || '');
  const [city, setCity] = useState(editData?.city || '');
  const [mode, setMode] = useState<'online' | 'offline' | 'hybrid'>(editData?.mode || 'online');
  const [themes, setThemes] = useState<string[]>(editData?.themes || []);
  const [contactEmail, setContactEmail] = useState(editData?.contactEmail || '');
  const [link, setLink] = useState(editData?.link || '');
  const [previewUrl, setPreviewUrl] = useState(editData?.imageUrl || '');
  const [submitting, setSubmitting] = useState(false);

  // Reset when editData changes
  const reset = () => {
    setTitle(''); setDescription(''); setDate(''); setTime('');
    setVenue(''); setCity(''); setMode('online'); setThemes([]);
    setContactEmail(''); setLink(''); setPreviewUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 750 * 1024) { toast.error('Image must be under 750KB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleTheme = (t: string) =>
    setThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const data = { title, description, date, time, venue, city, mode, themes, contactEmail, link, imageUrl: previewUrl, creatorId: user.uid };
      if (editData?.id) {
        await updateDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, editData.id), data);
        toast.success('Updated!');
      } else {
        await addDoc(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), { ...data, createdAt: Timestamp.now() });
        toast.success('Posted!');
      }
      reset();
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData?.id ? 'Edit Upcoming Hackathon' : 'Post Upcoming Hackathon'}</DialogTitle>
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
            <label className="text-sm font-medium">Theme / Domain <span className="text-muted-foreground text-xs">(select multiple)</span></label>
            <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md bg-background max-h-48 overflow-y-auto">
              {HACKATHON_THEMES.map(t => (
                <button key={t} type="button" onClick={() => toggleTheme(t)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    themes.includes(t)
                      ? 'bg-blue-700 border-blue-700 text-white'                      : 'bg-background border-border hover:border-blue-500 text-foreground'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            {themes.length > 0 && (
              <p className="text-xs text-muted-foreground">{themes.length} selected: {themes.join(', ')}</p>
            )}
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
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="poster-upload-dialog" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('poster-upload-dialog')?.click()}>
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
            {submitting ? 'Saving...' : editData?.id ? 'Save Changes' : 'Post Advertisement'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
