import { useEffect, useState } from 'react';
import { Flag, Eye, CheckCircle, Clock, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, doc, updateDoc,
  query, orderBy, writeBatch, Timestamp
} from 'firebase/firestore';
import { UserProfile } from '@/types';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterName: string;
  reason: string;
  description: string;
  proofUrl?: string;
  proofs?: { name: string; dataUrl: string }[];
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: any;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'users')),
    ]).then(([rSnap, uSnap]) => {
      setReports(rSnap.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
      setUsers(uSnap.docs.map(d => ({ ...d.data(), id: d.id, uid: d.id } as UserProfile)));
      setLoading(false);
    });
  }, []);

  const markStatus = async (id: string, status: Report['status']) => {
    await updateDoc(doc(db, 'reports', id), { status });
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast({ title: `Marked as ${status}` });
  };

  const blockUser = async (target: UserProfile) => {
    if (!confirm(`Block ${target.name}? This will delete their content.`)) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', target.uid), { isBlocked: true, blockedAt: Timestamp.now() });

    const [dmSnap, tcSnap, annSnap, hackSnap] = await Promise.all([
      getDocs(collection(db, 'directMessages')),
      getDocs(collection(db, 'teamChat')),
      getDocs(collection(db, 'announcements')),
      getDocs(collection(db, 'hackathons')),
    ]);
    dmSnap.docs.filter(d => d.data().senderId === target.uid).forEach(d => batch.delete(d.ref));
    tcSnap.docs.filter(d => d.data().authorId === target.uid).forEach(d => batch.delete(d.ref));
    annSnap.docs.filter(d => d.data().authorId === target.uid).forEach(d => batch.delete(d.ref));
    hackSnap.docs.filter(d => d.data().creatorId === target.uid).forEach(d => batch.delete(d.ref));
    reports.filter(r => r.reportedUserId === target.uid)
      .forEach(r => batch.update(doc(db, 'reports', r.id), { status: 'resolved' }));

    await batch.commit();
    setUsers(prev => prev.map(u => u.uid === target.uid ? { ...u, isBlocked: true } : u));
    setReports(prev => prev.map(r => r.reportedUserId === target.uid ? { ...r, status: 'resolved' } : r));
    toast({ title: `${target.name} blocked and content removed` });
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-slate-500">{reports.filter(r => r.status === 'pending').length} pending</p>
        </div>
        <div className="flex gap-1">
          {(['all', 'pending', 'reviewed', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-400 text-center py-12">No reports.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <Flag className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      <span className="text-red-600">{r.reportedUserName}</span>
                      <span className="text-slate-400 mx-1">reported by</span>
                      <span>{r.reporterName}</span>
                    </p>
                    <p className="text-xs text-slate-500">{r.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'pending' ? 'destructive' : r.status === 'reviewed' ? 'secondary' : 'outline'}>
                    {r.status}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expanded === r.id && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                    <p className="text-sm">{r.description}</p>
                  </div>
                  {(r.proofs?.length > 0 || r.proofUrl) && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Proof</p>
                      {r.proofs?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {r.proofs.map((p: any, i: number) => (
                            <a key={i} href={p.dataUrl} target="_blank" rel="noopener noreferrer">
                              <img src={p.dataUrl} alt={p.name} className="w-full aspect-video object-cover rounded-lg border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <a href={r.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline break-all">{r.proofUrl}</a>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => markStatus(r.id, 'reviewed')}>
                        <Clock className="h-3 w-3 mr-1" /> Mark Reviewed
                      </Button>
                    )}
                    {r.status !== 'resolved' && (
                      <Button size="sm" variant="outline" onClick={() => markStatus(r.id, 'resolved')}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                      </Button>
                    )}
                    {(() => {
                      const target = users.find(u => u.uid === r.reportedUserId);
                      return target && !(target as any).isBlocked ? (
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => blockUser(target)}>
                          <Ban className="h-3 w-3 mr-1" /> Block User
                        </Button>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
