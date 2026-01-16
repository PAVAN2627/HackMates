import { SynergyScore } from '@/types/synergy';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, Clock, Target, Code } from 'lucide-react';

interface SynergyBadgeProps {
  score: SynergyScore;
  compact?: boolean;
}

export function SynergyBadge({ score, compact = false }: SynergyBadgeProps) {
  const getBadgeColor = () => {
    if (score.overall >= 75) return 'bg-green-500 hover:bg-green-600';
    if (score.overall >= 50) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getBadgeText = () => {
    if (score.overall >= 85) return 'Excellent Match';
    if (score.overall >= 75) return 'High Synergy';
    if (score.overall >= 60) return 'Good Match';
    if (score.overall >= 50) return 'Moderate';
    return 'Low Match';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${getBadgeColor()} text-white cursor-help`}>
              <Zap className="w-3 h-3 mr-1" />
              {score.overall}% Match
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="w-64">
            <div className="space-y-2">
              <p className="font-semibold">{getBadgeText()}</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  <span>{score.breakdown.goal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{score.breakdown.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  <span>{score.breakdown.commitment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  <span>{score.breakdown.skills}</span>
                </div>
              </div>
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
          <Zap className="w-5 h-5 text-primary" />
          Synergy Score
        </h3>
        <Badge className={`${getBadgeColor()} text-white text-lg px-3 py-1`}>
          {score.overall}%
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{getBadgeText()}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goal Alignment
          </span>
          <span className="font-medium">{score.goalMatch}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all" 
            style={{ width: `${score.goalMatch}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{score.breakdown.goal}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Schedule Match
          </span>
          <span className="font-medium">{score.timeMatch}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all" 
            style={{ width: `${score.timeMatch}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{score.breakdown.time}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Commitment Level
          </span>
          <span className="font-medium">{score.commitmentMatch}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all" 
            style={{ width: `${score.commitmentMatch}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{score.breakdown.commitment}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Skill Compatibility
          </span>
          <span className="font-medium">{score.skillMatch}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all" 
            style={{ width: `${score.skillMatch}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{score.breakdown.skills}</p>
      </div>
    </div>
  );
}
