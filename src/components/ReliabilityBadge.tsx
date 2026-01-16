import { ReliabilityBadge as ReliabilityBadgeType } from '@/types/reliability';
import { getReliabilityBadgeInfo, getTrustScoreDescription } from '@/lib/reliabilitySystem';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Award } from 'lucide-react';

interface ReliabilityBadgeProps {
  badge: ReliabilityBadgeType;
  compact?: boolean;
  showDetails?: boolean;
}

export function ReliabilityBadge({ badge, compact = false, showDetails = false }: ReliabilityBadgeProps) {
  const badgeInfo = getReliabilityBadgeInfo(badge.level);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${badgeInfo.color} text-white cursor-help`}>
              <span className="mr-1">{badgeInfo.icon}</span>
              {badgeInfo.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{badgeInfo.description}</p>
              <p className="text-xs">Trust Score: {badge.score}/100</p>
              <p className="text-xs">Completed: {badge.projectsCompleted} hackathon{badge.projectsCompleted !== 1 ? 's' : ''}</p>
              {badge.completionRate > 0 && (
                <p className="text-xs">Success Rate: {badge.completionRate.toFixed(0)}%</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Reliability Badge
        </h3>
        <Badge className={`${badgeInfo.color} text-white text-lg px-3 py-1`}>
          <span className="mr-1">{badgeInfo.icon}</span>
          {badgeInfo.label}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{badgeInfo.description}</p>

      {showDetails && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Trust Score</span>
              <span className="font-medium">{badge.score}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`${badgeInfo.color} rounded-full h-2 transition-all`}
                style={{ width: `${badge.score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {getTrustScoreDescription(badge.score)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Hackathons Completed</p>
              <p className="text-2xl font-bold text-green-500">{badge.projectsCompleted}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-primary">
                {badge.completionRate.toFixed(0)}%
              </p>
            </div>
          </div>

          {badge.averageRating > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    className={star <= badge.averageRating ? 'text-yellow-500' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm font-medium">
                  {badge.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {badge.badges.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Award className="w-4 h-4" />
                Special Achievements
              </p>
              <div className="flex flex-wrap gap-2">
                {badge.badges.map(b => (
                  <Badge key={b} variant="outline" className="text-xs">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {badge.projectsGhosted > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-500">
                ⚠️ Ghosted {badge.projectsGhosted} hackathon{badge.projectsGhosted > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
