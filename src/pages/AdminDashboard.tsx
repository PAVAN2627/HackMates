import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Users, Flag, BarChart2, Ban, CheckCircle, Clock,
  Trash2, Eye, AlertTriangle, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, writeBatch, Timestamp
} from 'firebase/firestore';
import { UserProfile } from '@/types';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserEmail: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  proofUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: any;
}

type Tab = 'overview' | 'reports' | 'users' | 'hackathons';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read tab from URL query param
  const urlTab = new URLSearchParams(location.search).get('tab') as Tab | null;
  const [tab, setTab] = useState<Tab>(urlTab || 'overview');

  // Sync tab when URL changes (sidebar clicks)
  useEffect(() => {
    const t = new URLSearchParams(location.search).get('tab') as Tab | null;
    if (t && ['overview', 'reports', 'users'].includes(t)) setTab(t);
    else if (!t) setTab('overview');
  }, [location.search]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [hackathonCount, setHackathonCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // Guard: only admins
  useEffect(() => {
    if (profile && !profile.isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.isAdmin) return;
    fetchAll();
  }, [profile]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reportsSnap, usersSnap, hackSnap] = await Promise.all([
        getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'hackathons')),
      ]);
      setReports(reportsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
      setUsers(usersSnap.docs.map(d => ({ ...d.data(), id: d.id, uid: d.id } as UserProfile)));
      const hackList = hackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHackathons(hackList);
      setHackathonCount(hackSnap.size);
    } catch (e) {
      toast({ title: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const markReportStatus = async (reportId: string, status: Report['status']) => {
    await updateDoc(doc(db, 'reports', reportId), { status });
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    toast({ title: `Report marked as ${status}` });
  };

  const blockUser = async (targetUser: UserProfile) => {
    if (!confirm(`Block ${targetUser.name}? This will delete all their data.`)) return;
    try {
      const batch = writeBatch(db);

      batch.update(doc(db, 'users', targetUser.uid), { isBlocked: true, blockedAt: Timestamp.now() });

      const [hackSnap, annSnap, dmSnap, tcSnap] = await Promise.all([
        getDocs(collection(db, 'hackathons')),
        getDocs(collection(db, 'announcements')),
        getDocs(collection(db, 'directMessages')),
        getDocs(collection(db, 'teamChat')),
      ]);

      hackSnap.docs.filter(d => d.data().creatorId === targetUser.uid).forEach(d => batch.delete(d.ref));
      annSnap.docs.filter(d => d.data().authorId === targetUser.uid).forEach(d => batch.delete(d.ref));
      dmSnap.docs.filter(d => d.data().senderId === targetUser.uid).forEach(d => batch.delete(d.ref));
      tcSnap.docs.filter(d => d.data().authorId === targetUser.uid).forEach(d => batch.delete(d.ref));

      reports
        .filter(r => r.reportedUserId === targetUser.uid)
        .forEach(r => batch.update(doc(db, 'reports', r.id), { status: 'resolved' }));

      await batch.commit();

      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, isBlocked: true } : u));
      setReports(prev => prev.map(r =>
        r.reportedUserId === targetUser.uid ? { ...r, status: 'resolved' } : r
      ));
      toast({ title: `${targetUser.name} has been blocked and their data removed.` });
    } catch (e) {
      console.error('Block user error:', e);
      toast({ title: 'Failed to block user', variant: 'destructive' });
    }
  };

  const unblockUser = async (targetUser: UserProfile) => {
    await updateDoc(doc(db, 'users', targetUser.uid), { isBlocked: false });
    setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, isBlocked: false } : u));
    toast({ title: `${targetUser.name} unblocked` });
  };

  if (!profile?.isAdmin) return null;

  const pendingReports = reports.filter(r => r.status === 'pending');
  const blockedUsers = users.filter(u => (u as any).isBlocked);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart2 },
    { key: 'hackathons', label: `Hackathons (${hackathonCount})`, icon: Trophy },
    { key: 'reports', label: `Reports (${pendingReports.length})`, icon: Flag },
    { key: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Shield className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform management & moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Hackathons', value: hackathonCount, icon: Trophy, color: 'from-purple-500 to-pink-500' },
                  { label: 'Pending Reports', value: pendingReports.length, icon: Flag, color: 'from-orange-500 to-red-500' },
                  { label: 'Blocked Users', value: blockedUsers.length, icon: Ban, color: 'from-red-500 to-rose-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {pendingReports.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                      {pendingReports.length} pending report{pendingReports.length > 1 ? 's' : ''} need review
                    </span>
                  </div>
                  <Button size="sm" onClick={() => setTab('reports')} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Review Reports
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Hackathons */}
          {tab === 'hackathons' && (
            <div className="space-y-2">
              {hackathons.length === 0 && (
                <div className="text-center py-12 text-slate-400">No hackathons yet.</div>
              )}
              {hackathons.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-sm">{h.title}</p>
                    <p className="text-xs text-slate-500">{h.mode} · {h.location} · by {h.creatorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                      {h.status}
                    </Badge>
                    <span className="text-xs text-slate-400">{h.teamMembers?.length || 0} members</span>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={async () => {
                        if (!confirm(`Delete hackathon "${h.title}"?`)) return;
                        await deleteDoc(doc(db, 'hackathons', h.id));
                        setHackathons(prev => prev.filter(x => x.id !== h.id));
                        setHackathonCount(c => c - 1);
                        toast({ title: 'Hackathon deleted' });
                      }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports */}
          {tab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 && (
                <div className="text-center py-12 text-slate-400">No reports yet.</div>
              )}
              {reports.map(report => (
                <div key={report.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Flag className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          <span className="text-red-600">{report.reportedUserName}</span>
                          <span className="text-slate-400 mx-1">reported by</span>
                          <span>{report.reporterName}</span>
                        </p>
                        <p className="text-xs text-slate-500">{report.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        report.status === 'pending' ? 'destructive' :
                        report.status === 'reviewed' ? 'secondary' : 'outline'
                      }>
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedReport === report.id && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                        <p className="text-sm">{report.description}</p>
                      </div>
                      {report.proofUrl && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Proof</p>
                          <a href={report.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline break-all">
                            {report.proofUrl}
                          </a>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {report.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => markReportStatus(report.id, 'reviewed')}>
                            <Clock className="h-3 w-3 mr-1" /> Mark Reviewed
                          </Button>
                        )}
                        {report.status !== 'resolved' && (
                          <Button size="sm" variant="outline" onClick={() => markReportStatus(report.id, 'resolved')}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Resolve
                          </Button>
                        )}
                        {/* Quick block from report */}
                        {(() => {
                          const target = users.find(u => u.uid === report.reportedUserId);
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

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.uid} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {u.avatar ? <img src={u.avatar} className="h-9 w-9 object-cover" /> : u.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {u.name}
                        {(u as any).isBlocked && <Badge variant="destructive" className="text-xs">Blocked</Badge>}
                        {(u as any).isAdmin && <Badge className="text-xs bg-purple-600">Admin</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:block">{u.reliabilityLevel || 'newbie'}</span>
                    {(u as any).isBlocked ? (
                      <Button size="sm" variant="outline" onClick={() => unblockUser(u)}>
                        Unblock
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => blockUser(u)}>
                        <Ban className="h-3 w-3 mr-1" /> Block
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
