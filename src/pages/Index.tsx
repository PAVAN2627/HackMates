import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/Loading';
import { IndexPageContent } from '@/components/IndexPageContent';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathons } from '@/hooks/useHackathons';
import { useTimeout } from '@/hooks/useTimeout';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export default function Index() {
  const { user, loading, error, signIn } = useAuth();
  const { hackathons } = useHackathons();
  const navigate = useNavigate();
  const isTimeout = useTimeout(20000); // Increased to 20 seconds
  const { isOnline, connectionSpeed } = useConnectionStatus();

  // Redirect authenticated users
  useEffect(() => {
    if (user && !loading) {
      navigate('/hackathons', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is being determined
  if (loading && !isTimeout) {
    return <Loading />;
  }

  // Show timeout error if loading takes too long
  if (loading && isTimeout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 mx-auto mb-4">
            {isOnline ? <Zap className="h-6 w-6 text-warning" /> : <WifiOff className="h-6 w-6 text-destructive" />}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {isOnline ? 'Loading Timeout' : 'Connection Issue'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {isOnline 
              ? `The page is taking longer than expected to load${connectionSpeed === 'slow' ? ' (slow connection detected)' : ''}. Please check your connection and try again.`
              : 'You appear to be offline. Please check your internet connection.'
            }
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              <Wifi className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button onClick={() => navigate('/hackathons')} variant="ghost" className="w-full">
              Continue to Hackathons
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mx-auto mb-4">
            <Zap className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Don't render the page content if user is authenticated (prevents flash)
  if (user) {
    return <Loading message="Redirecting..." />;
  }

  // Render the main content
  return <IndexPageContent hackathons={hackathons} signIn={signIn} />;
}