import { useState } from 'react';
import { Github, RefreshCw, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  GitHubActivity, 
  getActivityLevelDescription, 
  getGitHubBadgeInfo,
  formatTimeSinceActivity,
  isVerificationStale
} from '@/lib/githubVerification';
import { cn } from '@/lib/utils';

interface GitHubVerificationBadgeProps {
  activity: GitHubActivity | null;
  compact?: boolean;
  showDetails?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function GitHubVerificationBadge({ 
  activity, 
  compact = false, 
  showDetails = false,
  onRefresh,
  refreshing = false
}: GitHubVerificationBadgeProps) {
  if (!activity) {
    return (
      <Badge variant="outline" className="text-xs">
        <Github className="w-3 h-3 mr-1" />
        Not Verified
      </Badge>
    );
  }

  const badgeInfo = getGitHubBadgeInfo(
    activity.pushEvents === 0 ? 'inactive' :
    activity.pushEvents >= 60 ? 'prolific-coder' :
    'active-coder'
  );

  const isStale = isVerificationStale(activity.verifiedAt);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn(
              'text-white cursor-help',
              badgeInfo?.color || 'bg-gray-500'
            )}>
              <span className="mr-1">{badgeInfo?.icon}</span>
              {activity.pushEvents} commits
              {isStale && <RefreshCw className="w-3 h-3 ml-1 opacity-50" />}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{badgeInfo?.label}</p>
              <p className="text-xs">{getActivityLevelDescription(activity.activityLevel)}</p>
              <p className="text-xs">Last activity: {formatTimeSinceActivity(activity.lastActivityDate)}</p>
              {isStale && (
                <p className="text-xs text-yellow-500">⚠️ Verification is outdated</p>
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
          <Github className="w-5 h-5 text-primary" />
          GitHub Verification
        </h3>
        <div className="flex items-center gap-2">
          {badgeInfo && (
            <Badge className={cn('text-white', badgeInfo.color)}>
              <span className="mr-1">{badgeInfo.icon}</span>
              {badgeInfo.label}
            </Badge>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>

      {isStale && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-400">
            <p className="font-medium">Verification Outdated</p>
            <p>Last verified {formatTimeSinceActivity(activity.verifiedAt)}. Click refresh to update.</p>
          </div>
        </div>
      )}

      {showDetails && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activity Level</span>
              <span className="font-medium">{getActivityLevelDescription(activity.activityLevel)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Commits (3 months)</span>
              <span className="font-bold text-primary">{activity.pushEvents}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Events</span>
              <span className="font-medium">{activity.totalEvents}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Activity</span>
              <span className="font-medium">{formatTimeSinceActivity(activity.lastActivityDate)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Repos</span>
              <span className="font-medium">{activity.repositories.length}</span>
            </div>
          </div>

          {activity.repositories.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Recent Repositories:</p>
              <div className="flex flex-wrap gap-1">
                {activity.repositories.slice(0, 5).map((repo) => (
                  <Badge key={repo} variant="outline" className="text-xs">
                    {repo.split('/')[1] || repo}
                  </Badge>
                ))}
                {activity.repositories.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{activity.repositories.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {!activity.isActive && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 dark:text-red-400">
                <p className="font-medium">⚠️ Inactive Developer Warning</p>
                <p>No coding activity detected in the last 3 months. This may impact your profile visibility and trust score.</p>
              </div>
            </div>
          )}

          {activity.isActive && activity.pushEvents >= 30 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400">
                ✅ Verified active developer with consistent contributions
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <a
              href={`https://github.com/${activity.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              View GitHub Profile →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
