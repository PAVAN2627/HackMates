interface LoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export function Loading({ message = 'Loading...', className = '', size = 'md', inline = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClass = inline 
    ? `flex items-center justify-center py-8 md:py-12 ${className}`
    : `min-h-screen bg-background flex items-center justify-center ${className}`;

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          <img 
            src="/assets/roundlogohackmates.png" 
            alt="HackMates Logo" 
            className={`${sizeClasses[size]} rounded-full animate-pulse`}
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            HackMates
          </span>
        </div>
        <p className={`text-muted-foreground ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  );
}

export default Loading;