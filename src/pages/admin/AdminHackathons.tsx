import { useEffect, useState } from 'react';
import { Trash2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, 'hackathons'), orderBy('createdAt', 'desc')))
      .then(snap => {
        setHackathons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
  }, []);

  const handleDelete = async (h: any) => {
    if (!confirm(`Delete "${h.title}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'hackathons', h.id));
    setHackathons(prev => prev.filter(x => x.id !== h.id));
    toast({ title: `"${h.title}" deleted` });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hackathons</h1>
        <p className="text-sm text-slate-500">{hackathons.length} total</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Loading...</div>
      ) : hackathons.length === 0 ? (
        <div className="text-slate-400 text-center py-12">No hackathons yet.</div>
      ) : (
        <div className="space-y-2">
          {hackathons.map(h => (
            <div key={h.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
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
    </div>
  );
}
