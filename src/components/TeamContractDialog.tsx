import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * TeamContractDialog - Shows before joining a hackathon
 * User must accept the anti-ghosting contract to join
 */

interface TeamContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  hackathonTitle: string;
  loading?: boolean;
}

export function TeamContractDialog({
  isOpen,
  onClose,
  onAccept,
  hackathonTitle,
  loading = false
}: TeamContractDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Team Contract Agreement
          </DialogTitle>
          <DialogDescription>
            Please read and accept the terms before joining "{hackathonTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What is Team Contract */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  What is the Team Contract?
                </p>
                <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-500">
                  <li>• After joining, you'll need to click "Start Project" to commit</li>
                  <li>• Once all members commit, the team gets locked</li>
                  <li>• Leaving after locking will hurt your reliability score</li>
                  <li>• This ensures everyone is serious about the project</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Commitment */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-green-700 dark:text-green-400">
                  By Joining, You Commit To:
                </p>
                <ul className="space-y-1 text-sm text-green-600 dark:text-green-500">
                  <li>✓ Actively participate in the hackathon</li>
                  <li>✓ Communicate with your team members</li>
                  <li>✓ Complete the project or inform team if you can't continue</li>
                  <li>✓ Click "Start Project" when you're ready to begin</li>
                  <li>✓ Stay until the hackathon ends (unless emergency)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                  ⚠️ Anti-Ghosting Protection
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Leaving after the team is locked will:
                </p>
                <ul className="space-y-1 text-sm text-yellow-600 dark:text-yellow-500">
                  <li>• Drop your reliability score by 20-30 points</li>
                  <li>• Potentially downgrade your badge level</li>
                  <li>• Be recorded in your hackathon history</li>
                  <li>• Be visible to future teammates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="space-y-2">
              <p className="font-semibold text-purple-700 dark:text-purple-400">
                🎯 Why This Matters
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-500">
                This system protects serious developers from ghosters and ensures everyone 
                on your team is committed. It builds trust and creates better hackathon experiences 
                for everyone.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {loading ? (
              'Joining...'
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                I Accept - Join Hackathon
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
