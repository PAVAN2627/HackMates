import { useEffect, useState } from 'react';
import { Users, Trophy, Flag, Ban, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0, blocked: 0,
    hackathons: 0,
    pending: 0, reviewed: 0, resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ month: string; users: number }[]>([]);
  const [hackathonModes, setHackathonModes] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [usersSnap, hackSnap, reportsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'hackathons')),
        getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'))),
      ]);

      const users = usersSnap.docs.map(d => d.data());
      const hacks = hackSnap.docs.map(d => d.data());
      const reportsList = reportsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      setStats({
        users: users.length,
        blocked: users.filter(u => u.isBlocked).length,
        hackathons: hackSnap.size,
        pending: reportsList.filter(r => r.status === 'pending').length,
        reviewed: reportsList.filter(r => r.status === 'reviewed').length,
        resolved: reportsList.filter(r => r.status === 'resolved').length,
      });
      setRecentReports(reportsList.slice(0, 5));

      // User growth by month (last 6 months)
      const monthMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthMap[key] = 0;
      }
      users.forEach(u => {
        const ts = u.createdAt?.toDate?.() || (u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : null);
        if (!ts) return;
        const key = ts.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (key in monthMap) monthMap[key]++;
      });
      setUserGrowth(Object.entries(monthMap).map(([month, users]) => ({ month, users })));

      // Hackathon modes breakdown
      const modeMap: Record<string, number> = {};
      hacks.forEach(h => {
        const m = h.mode || 'Unknown';
        modeMap[m] = (modeMap[m] || 0) + 1;
      });
      setHackathonModes(Object.entries(modeMap).map(([name, count]) => ({ name, count })));

      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'from-blue-500 to-cyan-500', path: '/admin/users' },
    { label: 'Blocked Users', value: stats.blocked, icon: Ban, color: 'from-red-500 to-rose-500', path: '/admin/users' },
    { label: 'Hackathons', value: stats.hackathons, icon: Trophy, color: 'from-purple-500 to-pink-500', path: '/admin/hackathons' },
    { label: 'Pending Reports', value: stats.pending, icon: Flag, color: 'from-orange-500 to-red-500', path: '/admin/reports' },
    { label: 'Reviewed', value: stats.reviewed, icon: Clock, color: 'from-yellow-500 to-orange-400', path: '/admin/reports' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'from-green-500 to-emerald-500', path: '/admin/reports' },
  ];

  const reportBarData = [
    { name: 'Pending', value: stats.pending, color: '#ef4444' },
    { name: 'Reviewed', value: stats.reviewed, color: '#f59e0b' },
    { name: 'Resolved', value: stats.resolved, color: '#10b981' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs shadow-lg">
          <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-purple-600 font-semibold">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-slate-500">Platform analytics at a glance</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map(s => (
              <button
                key={s.label}
                onClick={() => navigate(s.path)}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 text-left hover:shadow-md hover:border-purple-300 transition-all"
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </button>
            ))}
          </div>

          {/* Pending alert */}
          {stats.pending > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  {stats.pending} pending report{stats.pending > 1 ? 's' : ''} need review
                </span>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/admin/reports')}>
                Review
              </Button>
            </div>
          )}

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User growth chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-sm mb-4">User Growth (Last 6 Months)</p>
              {userGrowth.every(d => d.users === 0) ? (
                <div className="h-40 flex items-center justify-center text-xs text-slate-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={userGrowth} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                    <Bar dataKey="users" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Reports status chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-sm mb-4">Reports by Status</p>
              {reportBarData.every(d => d.value === 0) ? (
                <div className="h-40 flex items-center justify-center text-xs text-slate-400">No reports yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={reportBarData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {reportBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Hackathon modes chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-sm mb-4">Hackathons by Mode</p>
              {hackathonModes.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs text-slate-400">No hackathons yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={hackathonModes} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Active vs Blocked users chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-sm mb-4">Users Overview</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { name: 'Active', value: stats.users - stats.blocked, color: '#8b5cf6' },
                    { name: 'Blocked', value: stats.blocked, color: '#ef4444' },
                  ]}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent reports */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recent Reports</h2>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/reports')}>View All</Button>
            </div>
            {recentReports.length === 0 ? (
              <p className="text-sm text-slate-400">No reports yet.</p>
            ) : (
              <div className="space-y-2">
                {recentReports.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium">
                        <span className="text-red-500">{r.reportedUserName}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-600 dark:text-slate-400">{r.reason}</span>
                      </p>
                      <p className="text-xs text-slate-400">by {r.reporterName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.status === 'pending' ? 'bg-red-100 text-red-600' :
                      r.status === 'reviewed' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
