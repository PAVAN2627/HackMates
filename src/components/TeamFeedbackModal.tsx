import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2 } from 'lucide-react';
import { TeamFeedback } from '@/types/reliability';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

/**
 * TeamFeedbackModal - Collects feedback from team members after hackathon closes
 * 
 * IMPORTANT: This modal only shows teammates from the user's small team (not all hackathon participants).
 * Users must form teams within the hackathon, and feedback is limited to team members only.
 * This prevents the issue of having to rate dozens of people in large hackathons.
 */

interface TeamFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathonId: string;
  hackathonTitle: string;
  teamMembers: { userId: string; userName: string }[];
  onSubmit: (feedback: Omit<TeamFeedback, 'id' | 'createdAt'>) => Promise<boolean>;
}

export function TeamFeedbackModal({
  isOpen,
  onClose,
  hackathonId,
  hackathonTitle,
  teamMembers,
  onSubmit
}: TeamFeedbackModalProps) {
  const { user } = useAuth();
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Map<string, {
    didContribute: boolean;
    rating: number;
    comment: string;
    skills: string[];
  }>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Check for existing feedback when modal opens
  useEffect(() => {
    if (isOpen && user) {
      checkExistingFeedback();
    }
  }, [isOpen, user, hackathonId]);

  const checkExistingFeedback = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const feedbacksRef = collection(db, COLLECTIONS.TEAM_FEEDBACKS);
      const q = query(
        feedbacksRef,
        where('hackathonId', '==', hackathonId),
        where('fromUserId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const ratedUserIds = new Set<string>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        ratedUserIds.add(data.toUserId);
      });
      
      setAlreadyRated(ratedUserIds);
      
      if (ratedUserIds.size > 0) {
        toast.info(`You've already rated ${ratedUserIds.size} teammate(s)`);
      }
    } catch (error) {
      console.error('Error checking existing feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMember = teamMembers[currentMemberIndex];
  const isAlreadyRated = currentMember && alreadyRated.has(currentMember.userId);
  const currentFeedback = feedbacks.get(currentMember?.userId) || {
    didContribute: true,
    rating: 5,
    comment: '',
    skills: []
  };

  const skillOptions = [
    'Frontend', 'Backend', 'UI/UX', 'Database', 'DevOps',
    'Problem Solving', 'Communication', 'Leadership', 'Debugging'
  ];

  const updateCurrentFeedback = (updates: Partial<typeof currentFeedback>) => {
    const newFeedbacks = new Map(feedbacks);
    newFeedbacks.set(currentMember.userId, { ...currentFeedback, ...updates });
    setFeedbacks(newFeedbacks);
  };

  const handleNext = () => {
    if (currentMemberIndex < teamMembers.length - 1) {
      setCurrentMemberIndex(currentMemberIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentMemberIndex > 0) {
      setCurrentMemberIndex(currentMemberIndex - 1);
    }
  };

  const handleSubmitAll = async () => {
    if (!user) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting feedback submission for', teamMembers.length, 'members');
      
      // Submit feedback for all members
      let successCount = 0;
      for (const member of teamMembers) {
        const feedback = feedbacks.get(member.userId);
        if (feedback) {
          console.log('Submitting feedback for:', member.userName, feedback);
          const success = await onSubmit({
            hackathonId,
            hackathonTitle,
            fromUserId: user.uid,
            fromUserName: user.displayName || 'Anonymous',
            toUserId: member.userId,
            toUserName: member.userName,
            ...feedback
          });
          
          if (success) {
            successCount++;
            console.log('Feedback submitted successfully for:', member.userName);
          } else {
            console.error('Failed to submit feedback for:', member.userName);
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully submitted feedback for ${successCount} teammate(s)!`);
        onClose();
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedbacks:', error);
      toast.error('An error occurred while submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentMember) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Team Feedback - {hackathonTitle}</DialogTitle>
          <DialogDescription>
            Help build a reliable community by rating your teammates
            ({currentMemberIndex + 1} of {teamMembers.length})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Member Info */}
          <div className="glass rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">{currentMember.userName}</h3>
                <p className="text-sm text-muted-foreground">
                  How was your experience working with this teammate?
                </p>
              </div>
              {isAlreadyRated && (
                <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-600">
                  ✓ Already Rated
                </Badge>
              )}
            </div>
          </div>

          {isAlreadyRated ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold mb-2">You've already rated this teammate</p>
              <p className="text-sm text-muted-foreground">
                You can only rate each teammate once per hackathon
              </p>
            </div>
          ) : (
            <>
              {/* Did Contribute */}
              <div className="space-y-3">
            <Label className="text-base">Did this person contribute to the project?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateCurrentFeedback({ didContribute: true })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentFeedback.didContribute
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-background border-border hover:border-green-500/50'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Yes, they contributed</div>
              </button>

              <button
                type="button"
                onClick={() => updateCurrentFeedback({ didContribute: false })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  !currentFeedback.didContribute
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-background border-border hover:border-red-500/50'
                }`}
              >
                <div className="text-2xl mb-2">👻</div>
                <div className="font-semibold">No, they ghosted</div>
              </button>
            </div>
          </div>

          {currentFeedback.didContribute && (
            <>
              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-base">How would you rate their contribution?</Label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateCurrentFeedback({ rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= currentFeedback.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {currentFeedback.rating === 5 && 'Outstanding!'}
                  {currentFeedback.rating === 4 && 'Great work'}
                  {currentFeedback.rating === 3 && 'Good'}
                  {currentFeedback.rating === 2 && 'Below expectations'}
                  {currentFeedback.rating === 1 && 'Poor'}
                </p>
              </div>

              {/* Skills Demonstrated */}
              <div className="space-y-3">
                <Label className="text-base">What skills did they demonstrate?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const skills = currentFeedback.skills.includes(skill)
                          ? currentFeedback.skills.filter(s => s !== skill)
                          : [...currentFeedback.skills, skill];
                        updateCurrentFeedback({ skills });
                      }}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        currentFeedback.skills.includes(skill)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <Label htmlFor="comment">Additional Comments (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience working with this teammate..."
                  value={currentFeedback.comment}
                  onChange={(e) => updateCurrentFeedback({ comment: e.target.value })}
                  rows={3}
                />
              </div>
            </>
          )}
            </>
          )}

          {/* Navigation */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t sticky bottom-0 bg-background">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentMemberIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-1">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentMemberIndex
                      ? 'bg-primary'
                      : alreadyRated.has(member.userId)
                      ? 'bg-green-500'
                      : feedbacks.has(member.userId)
                      ? 'bg-blue-500'
                      : 'bg-muted'
                  }`}
                  title={
                    alreadyRated.has(member.userId)
                      ? 'Already rated'
                      : feedbacks.has(member.userId)
                      ? 'Feedback ready'
                      : 'Not rated yet'
                  }
                />
              ))}
            </div>

            {currentMemberIndex < teamMembers.length - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmitAll} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit All Feedback'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
