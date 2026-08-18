import { useEffect, useState } from 'react';
import { Trash2, Trophy, Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db, COLLECTIONS } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // Edit Upcoming Hackathon State
  const [editingUpcoming, setEditingUpcoming] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    city: '',
    contactEmail: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, 'hackathons'), orderBy('createdAt', 'desc')))
      .then(snap => {
        setHackathons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      
    getDocs(query(collection(db, COLLECTIONS.UPCOMING_HACKATHONS), orderBy('createdAt', 'desc')))
      .then(snap => {
        setUpcoming(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoadingUpcoming(false);
      });
  }, []);

  const handleDelete = async (h: any) => {
    if (!confirm(`Delete "${h.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'hackathons', h.id));
      setHackathons(prev => prev.filter(x => x.id !== h.id));
      toast({ title: `"${h.title}" deleted` });
    } catch (err: any) {
      console.error('Delete hackathon error:', err);
      toast({ title: 'Error deleting hackathon', variant: 'destructive', description: err.message });
    }
  };

  const handleDeleteUpcoming = async (h: any) => {
    if (!confirm(`Delete Upcoming Hackathon "${h.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, h.id));
      setUpcoming(prev => prev.filter(x => x.id !== h.id));
      toast({ title: `"${h.title}" deleted` });
    } catch (err: any) {
      console.error('Delete upcoming hackathon error:', err);
      toast({ title: 'Error deleting hackathon', variant: 'destructive', description: err.message });
    }
  };

  const openEditUpcoming = (h: any) => {
    setEditingUpcoming(h);
    setEditForm({
      title: h.title || '',
      description: h.description || '',
      date: h.date || '',
      time: h.time || '',
      venue: h.venue || '',
      city: h.city || '',
      contactEmail: h.contactEmail || ''
    });
  };

  const saveUpcoming = async () => {
    if (!editingUpcoming) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.UPCOMING_HACKATHONS, editingUpcoming.id), editForm);
      setUpcoming(prev => prev.map(x => x.id === editingUpcoming.id ? { ...x, ...editForm } : x));
      toast({ title: 'Upcoming hackathon updated successfully' });
      setEditingUpcoming(null);
    } catch (err: any) {
      console.error('Save upcoming hackathon error:', err);
      toast({ title: 'Error updating hackathon', variant: 'destructive', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hackathon Management</h1>
        <p className="text-sm text-slate-500">Manage internal and upcoming external hackathons</p>
      </div>

      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="internal">Platform Hackathons</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Hackathons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal" className="space-y-4">
          {loading ? (
            <div className="text-slate-400 text-center py-12">Loading...</div>
          ) : hackathons.length === 0 ? (
            <div className="text-slate-400 text-center py-12">No hackathons yet.</div>
          ) : (
            <div className="space-y-2">
              {hackathons.map(h => (
                <div key={h.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{h.title}</p>
                      <p className="text-xs text-slate-500">
                        {h.mode} · {h.location} · by {h.creatorName} · {h.teamMembers?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === 'open' ? 'default' : 'secondary'} className="text-xs hidden sm:flex">
                      {h.status}
                    </Badge>
                    <Link to={`/hackathons/${h.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(h)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {loadingUpcoming ? (
            <div className="text-slate-400 text-center py-12">Loading...</div>
          ) : upcoming.length === 0 ? (
            <div className="text-slate-400 text-center py-12">No upcoming hackathons yet.</div>
          ) : (
            <div className="space-y-2">
              {upcoming.map(h => (
                <div key={h.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{h.title}</p>
                      <p className="text-xs text-slate-500">
                        {h.date} at {h.time} · {h.city || h.venue} · Mode: {h.mode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditUpcoming(h)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteUpcoming(h)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Upcoming Dialog */}
      <Dialog open={!!editingUpcoming} onOpenChange={(open) => !open && setEditingUpcoming(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Upcoming Hackathon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue</label>
                <Input value={editForm.venue} onChange={e => setEditForm({...editForm, venue: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input type="email" value={editForm.contactEmail} onChange={e => setEditForm({...editForm, contactEmail: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingUpcoming(null)}>Cancel</Button>
              <Button onClick={saveUpcoming} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
