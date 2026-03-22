import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Send, CheckCircle, X, Upload, ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { toast } from '@/hooks/use-toast';

const REPORT_REASONS = [
  { label: 'Scam or Fraud', emoji: '💸' },
  { label: 'Harassment or Bullying', emoji: '🚫' },
  { label: 'Fake Profile / Impersonation', emoji: '🎭' },
  { label: 'Spam', emoji: '📢' },
  { label: 'Inappropriate Content', emoji: '⚠️' },
  { label: 'Ghosting / Unreliable', emoji: '👻' },
  { label: 'Hate Speech', emoji: '🔇' },
  { label: 'Other', emoji: '📝' },
];

const MAX_PROOF_FILES = 5;
const MAX_FILE_SIZE = 1048487; // ~1MB per file

export default function ReportUser() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Step tracking
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — user search
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Step 2 — reason + description
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  // Step 3 — proof uploads
  const [proofFiles, setProofFiles] = useState<{ name: string; dataUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load all users once
  useEffect(() => {
    if (usersLoaded) return;
    getDocs(collection(db, 'users')).then(snap => {
      const list = snap.docs
        .map(d => ({ ...d.data(), id: d.id, uid: d.id } as UserProfile))
        .filter(u => u.uid !== user?.uid && !(u as any).isAdmin);
      setAllUsers(list);
      setUsersLoaded(true);
    });
  }, [usersLoaded, user?.uid]);

  // Live filtered results
  const searchResults = searchQuery.trim().length < 2
    ? []
    : allUsers.filter(u => {
        const q = searchQuery.toLowerCase();
        return (
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.skills?.some(s => s.toLowerCase().includes(q))
        );
      }).slice(0, 8);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PROOF_FILES - proofFiles.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast({ title: `${file.name} is not an image`, variant: 'destructive' });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: `${file.name} exceeds 1MB limit`, variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        setProofFiles(prev => [
          ...prev,
          { name: file.name, dataUrl: ev.target?.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const removeProof = (idx: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedUser || !reason || !description.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reportedUserId: selectedUser.uid,
        reportedUserName: selectedUser.name,
        reportedUserEmail: selectedUser.email || '',
        reporterId: user!.uid,
        reporterName: profile?.name || '',
        reason,
        description,
        proofs: proofFiles.map(f => ({ name: f.name, dataUrl: f.dataUrl })),
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      setSubmitted(true);
    } catch {
      toast({ title: 'Failed to submit report', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Our team will review your report within 48 hours. Thank you for helping keep HackMates safe.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Report a User</h1>
          <p className="text-sm text-slate-500">Help us keep the community safe</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? 'bg-purple-600 text-white' :
              step > s ? 'bg-green-500 text-white' :
              'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === s ? 'text-purple-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Find User' : s === 2 ? 'Describe Issue' : 'Add Proof'}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 w-6 sm:w-12" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Find User ── */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="font-semibold">Find the user you want to report</h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, email or skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Search results */}
          {searchQuery.trim().length >= 2 && (
            <div className="space-y-2">
              {!usersLoaded ? (
                <p className="text-xs text-slate-400 text-center py-4">Loading users...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No users found for "{searchQuery}"</p>
              ) : (
                searchResults.map(u => (
                  <button
                    key={u.uid}
                    onClick={() => { setSelectedUser(u); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                      {u.avatar
                        ? <img src={u.avatar} className="h-10 w-10 object-cover" alt="" />
                        : u.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      {u.skills?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {u.skills.slice(0, 3).map(s => (
                            <span key={s} className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Selected user */}
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                {selectedUser.avatar
                  ? <img src={selectedUser.avatar} className="h-10 w-10 object-cover" alt="" />
                  : selectedUser.name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!selectedUser}
            onClick={() => setStep(2)}
          >
            Continue
          </Button>
        </div>
      )}

      {/* ── STEP 2: Reason + Description ── */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
              {selectedUser?.avatar
                ? <img src={selectedUser.avatar} className="h-9 w-9 object-cover" alt="" />
                : selectedUser?.name?.[0] || '?'}
            </div>
            <div>
              <p className="font-medium text-sm">Reporting {selectedUser?.name}</p>
              <button onClick={() => setStep(1)} className="text-xs text-purple-500 hover:underline">Change user</button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>What's the issue?</Label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map(r => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setReason(r.label)}
                  className={`flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-xl border transition-all ${
                    reason === r.label
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Describe what happened</Label>
            <Textarea
              id="description"
              placeholder="Provide as much detail as possible — what happened, when, and how it affected you..."
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <p className="text-xs text-slate-400">{description.length} characters</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!reason || description.trim().length < 10}
              onClick={() => setStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Proof Upload ── */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-5">
          <div>
            <h2 className="font-semibold">Upload proof (optional)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Screenshots, images — up to {MAX_PROOF_FILES} files, 1MB each</p>
          </div>

          {/* Upload area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileAdd}
          />

          {proofFiles.length < MAX_PROOF_FILES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all"
            >
              <Upload className="h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-500">Click to upload images</p>
              <p className="text-xs text-slate-400">{MAX_PROOF_FILES - proofFiles.length} slot{MAX_PROOF_FILES - proofFiles.length !== 1 ? 's' : ''} remaining</p>
            </button>
          )}

          {/* Preview grid */}
          {proofFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {proofFiles.map((f, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-900">
                  <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <button
                      onClick={() => removeProof(i)}
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                    <p className="text-white text-xs truncate">{f.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {proofFiles.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">
              <ImageIcon className="h-4 w-4 flex-shrink-0" />
              No proof uploaded — you can still submit without it
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Reporting</span>
              <span className="font-medium">{selectedUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reason</span>
              <span className="font-medium">{reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Proof files</span>
              <span className="font-medium">{proofFiles.length}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Report
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
