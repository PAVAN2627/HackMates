import { Zap } from 'lucide-react';

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = 'Loading...', className = '' }: LoadingProps) {
  return (
    <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4 animate-pulse">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default Loading;