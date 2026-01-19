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
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Team Contract
          </DialogTitle>
          <DialogDescription className="text-sm">
            Accept terms to join "{hackathonTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2">
          {/* What is Team Contract */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-blue-700 dark:text-blue-400">
                  What is the Team Contract?
                </p>
                <ul className="space-y-0.5 text-xs text-blue-600 dark:text-blue-500">
                  <li>• Click "Start Project" to commit after joining</li>
                  <li>• Team locks when all members commit</li>
                  <li>• Leaving after lock hurts reliability score</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Commitment */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-green-700 dark:text-green-400">
                  You Commit To:
                </p>
                <ul className="space-y-0.5 text-xs text-green-600 dark:text-green-500">
                  <li>✓ Actively participate & communicate</li>
                  <li>✓ Complete project or inform team</li>
                  <li>✓ Stay until hackathon ends</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ Anti-Ghosting
                </p>
                <ul className="space-y-0.5 text-xs text-yellow-600 dark:text-yellow-500">
                  <li>• Leaving drops reliability 20-30 points</li>
                  <li>• Badge level may downgrade</li>
                  <li>• Visible to future teammates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex-row gap-2 pt-3 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {loading ? (
              'Joining...'
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept & Join
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
