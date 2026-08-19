import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useReports, ReportProof } from '@/hooks/useReports';
import { toast } from 'sonner';

interface ReportUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  userName?: string;
}

const REPORT_REASONS = [
  'Scam/Fraud',
  'Harassment/Bullying',
  'Inappropriate Content',
  'Fake Profile',
  'Spam',
  'Cheating/Dishonesty',
  'Abusive Behavior',
  'Other',
];

const MAX_PROOFS = 5;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export function ReportUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: ReportUserDialogProps) {
  const { submitReport } = useReports();
  
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(userId);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [proofs, setProofs] = useState<ReportProof[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setStep(1);
    setSelectedUser(userId);
    setUserSearchInput('');
    setSelectedReason('');
    setDescription('');
    setProofs([]);
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      if (proofs.length >= MAX_PROOFS) {
        toast.error(`Maximum ${MAX_PROOFS} proofs allowed`);
        break;
      }

      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 1MB`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProofs((prev) => [
          ...prev,
          {
            name: file.name,
            dataUrl,
          },
        ]);
        toast.success(`${file.name} added`);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProof = (index: number) => {
    setProofs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedReason || description.trim().length < 10) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport(
        selectedUser,
        userName || 'Unknown User',
        selectedReason,
        description,
        proofs
      );
      toast.success('Report submitted successfully');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            Help us keep HackMates safe by reporting inappropriate behavior
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: User Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-search" className="text-sm font-medium">
                  Select User to Report *
                </Label>
                <Input
                  id="user-search"
                  placeholder="Search by name or email (min 2 characters)..."
                  value={userSearchInput}
                  onChange={(e) => setUserSearchInput(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedUser && `Selected: ${userName}`}
                </p>
              </div>
              <Button
                onClick={() => {
                  if (!selectedUser) {
                    toast.error('Please select a user');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full"
              >
                Next: Report Details
              </Button>
            </div>
          )}

          {/* Step 2: Report Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for Report *
                </Label>
                <select
                  id="reason"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a reason...</option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <textarea
                  id="description"
                  placeholder="Describe the issue in detail (minimum 10 characters)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (description.trim().length < 10) {
                      toast.error('Description must be at least 10 characters');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1"
                >
                  Next: Add Proof
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Proof Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Add Proof (Optional)
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload up to {MAX_PROOFS} images (max 1MB each) as proof
                </p>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Upload proof images</p>
                <p className="text-xs text-muted-foreground mb-3">
                  PNG, JPG, GIF (max 1MB each)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={proofs.length >= MAX_PROOFS}
                  className="hidden"
                  id="proof-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('proof-upload')?.click()}
                  disabled={proofs.length >= MAX_PROOFS}
                >
                  Choose Images
                </Button>
              </div>

              {/* Uploaded Proofs Preview */}
              {proofs.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Uploaded: {proofs.length}/{MAX_PROOFS}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {proofs.map((proof, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={proof.dataUrl}
                          alt={proof.name}
                          className="w-full aspect-square object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          onClick={() => removeProof(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{proof.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
