import { useEffect, useState } from 'react';
import { Ban, Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { sendAdminWelcomeEmail } from '@/lib/emailService';
import {
  collection, getDocs, doc, updateDoc, setDoc,
  writeBatch, Timestamp
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { UserProfile } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Add admin dialog state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      setUsers(snap.docs.map(d => ({ ...d.data(), id: d.id, uid: d.id } as UserProfile)));
      setLoading(false);
    });
  }, []);

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

    await batch.commit();
    setUsers(prev => prev.map(u => u.uid === target.uid ? { ...u, isBlocked: true } as any : u));
    toast({ title: `${target.name} blocked` });
  };

  const unblockUser = async (target: UserProfile) => {
    await updateDoc(doc(db, 'users', target.uid), { isBlocked: false });
    setUsers(prev => prev.map(u => u.uid === target.uid ? { ...u, isBlocked: false } as any : u));
    toast({ title: `${target.name} unblocked` });
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (adminForm.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setAddingAdmin(true);
    // Use a secondary app instance so we don't sign out the current admin
    const secondaryApp = initializeApp(
      {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      },
      `secondary-${Date.now()}`
    );

    try {
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, adminForm.email.trim(), adminForm.password);
      const uid = cred.user.uid;

      // Write using the main db — allowed because the current user isAdmin()
      await setDoc(doc(db, 'users', uid), {
        uid,
        name: adminForm.name.trim(),
        email: adminForm.email.trim(),
        isAdmin: true,
        isBlocked: false,
        bio: 'Admin',
        skills: [],
        lookingForTeam: false,
        avatar: '',
        createdAt: Timestamp.now(),
      });

      // Capture values before clearing the form
      const createdName = adminForm.name.trim();
      const createdEmail = adminForm.email.trim();
      const createdPassword = adminForm.password;

      const newAdmin: any = {
        uid, id: uid,
        name: createdName,
        email: createdEmail,
        isAdmin: true,
        isBlocked: false,
      };
      setUsers(prev => [newAdmin, ...prev]);
      setAdminForm({ name: '', email: '', password: '' });
      setShowAddAdmin(false);
      toast({ title: `Admin "${createdName}" created successfully` });

      // Send credentials email (non-blocking)
      sendAdminWelcomeEmail(createdEmail, createdName, createdPassword)
        .catch(err => console.error('Failed to send admin welcome email:', err));
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setFormError('This email is already registered.');
      } else {
        setFormError(err.message || 'Failed to create admin.');
      }
    } finally {
      await deleteApp(secondaryApp);
      setAddingAdmin(false);
    }
  };

  const filtered = users
    .filter(u => filter === 'all' ? true : filter === 'blocked' ? (u as any).isBlocked : !(u as any).isBlocked)
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-slate-500">{users.length} total · {users.filter(u => (u as any).isBlocked).length} blocked</p>
        </div>
        <Button
          onClick={() => { setShowAddAdmin(true); setFormError(''); }}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add Admin
        </Button>
      </div>

      {/* Add Admin Dialog */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Admin</h2>
              <button onClick={() => setShowAddAdmin(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
                <Input
                  placeholder="Admin name"
                  value={adminForm.name}
                  onChange={e => setAdminForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminForm.email}
                  onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Password</label>
                <Input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={adminForm.password}
                  onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddAdmin(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" disabled={addingAdmin}>
                  {addingAdmin ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'blocked'] as const).map(f => (
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
        <div className="text-slate-400 text-center py-12">No users found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.uid} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                  {u.avatar ? <img src={u.avatar} className="h-9 w-9 object-cover" alt="" /> : u.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                    {u.name}
                    {(u as any).isBlocked && <Badge variant="destructive" className="text-xs">Blocked</Badge>}
                    {(u as any).isAdmin && <Badge className="text-xs bg-purple-600">Admin</Badge>}
                  </p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:block capitalize">{u.reliabilityLevel || 'newbie'}</span>
                {(u as any).isAdmin ? null : (u as any).isBlocked ? (
                  <Button size="sm" variant="outline" onClick={() => unblockUser(u)}>Unblock</Button>
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
    </div>
  );
}
