import { Label } from '@/components/ui/label';
import { Target, Clock, Zap } from 'lucide-react';

interface WorkStyle {
  goal: 'win' | 'learn';
  timePreference: 'night-owl' | 'early-bird' | 'flexible';
  commitment: 'full-time' | 'part-time' | 'casual';
  hoursAvailable: number;
}

interface WorkStyleSelectorProps {
  workStyle: WorkStyle;
  onChange: (workStyle: WorkStyle) => void;
}

export function WorkStyleSelector({ workStyle, onChange }: WorkStyleSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Work Style Preferences
        </h3>
        <p className="text-sm text-muted-foreground">
          Help us find teammates who match your working style
        </p>
      </div>

      {/* Goal */}
      <div className="space-y-3">
        <Label className="text-base">What's your primary goal?</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...workStyle, goal: 'win' })}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              workStyle.goal === 'win'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold mb-1">🏆 Here to WIN</div>
            <div className="text-sm opacity-90">
              Hardcore mode. Sleep is for the weak. Let's build something amazing and win!
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...workStyle, goal: 'learn' })}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              workStyle.goal === 'learn'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            <div className="font-semibold mb-1">📚 Here to LEARN</div>
            <div className="text-sm opacity-90">
              Relaxed pace. Focus on learning new skills and having fun.
            </div>
          </button>
        </div>
      </div>

      {/* Time Preference */}
      <div className="space-y-3">
        <Label className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          When are you most productive?
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...workStyle, timePreference: 'night-owl' })}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              workStyle.timePreference === 'night-owl'
                ? 'bg-secondary border-secondary text-secondary-foreground'
                : 'bg-background border-border hover:border-secondary/50'
            }`}
          >
            <div className="text-2xl mb-1">🦉</div>
            <div className="font-semibold">Night Owl</div>
            <div className="text-xs opacity-80">10 PM - 4 AM</div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...workStyle, timePreference: 'early-bird' })}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              workStyle.timePreference === 'early-bird'
                ? 'bg-secondary border-secondary text-secondary-foreground'
                : 'bg-background border-border hover:border-secondary/50'
            }`}
          >
            <div className="text-2xl mb-1">🌅</div>
            <div className="font-semibold">Early Bird</div>
            <div className="text-xs opacity-80">6 AM - 12 PM</div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...workStyle, timePreference: 'flexible' })}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              workStyle.timePreference === 'flexible'
                ? 'bg-secondary border-secondary text-secondary-foreground'
                : 'bg-background border-border hover:border-secondary/50'
            }`}
          >
            <div className="text-2xl mb-1">🔄</div>
            <div className="font-semibold">Flexible</div>
            <div className="text-xs opacity-80">Anytime works</div>
          </button>
        </div>
      </div>

      {/* Commitment Level */}
      <div className="space-y-3">
        <Label className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4" />
          How much time can you commit?
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...workStyle, commitment: 'full-time', hoursAvailable: 40 })}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              workStyle.commitment === 'full-time'
                ? 'bg-accent border-accent text-accent-foreground'
                : 'bg-background border-border hover:border-accent/50'
            }`}
          >
            <div className="font-semibold">Full-Time</div>
            <div className="text-xs opacity-80">40+ hours/week</div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...workStyle, commitment: 'part-time', hoursAvailable: 20 })}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              workStyle.commitment === 'part-time'
                ? 'bg-accent border-accent text-accent-foreground'
                : 'bg-background border-border hover:border-accent/50'
            }`}
          >
            <div className="font-semibold">Part-Time</div>
            <div className="text-xs opacity-80">15-25 hours/week</div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...workStyle, commitment: 'casual', hoursAvailable: 10 })}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              workStyle.commitment === 'casual'
                ? 'bg-accent border-accent text-accent-foreground'
                : 'bg-background border-border hover:border-accent/50'
            }`}
          >
            <div className="font-semibold">Casual</div>
            <div className="text-xs opacity-80">5-10 hours/week</div>
          </button>
        </div>
      </div>

      {/* Hours Available Slider */}
      <div className="space-y-3">
        <Label className="text-base">
          Exact hours available per week: {workStyle.hoursAvailable}h
        </Label>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={workStyle.hoursAvailable}
          onChange={(e) => onChange({ ...workStyle, hoursAvailable: parseInt(e.target.value) })}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5h</span>
          <span>30h</span>
          <span>60h</span>
        </div>
      </div>
    </div>
  );
}
