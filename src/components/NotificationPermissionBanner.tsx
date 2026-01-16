import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationPermissionBanner() {
  const { user } = useAuth();
  const { permission, requestPermission, loading, isSupported } = usePushNotifications(user?.uid || null);
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const isDismissed = localStorage.getItem('notification-banner-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Show banner after 3 seconds if permission is default
    if (permission === 'default' && isSupported && user) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [permission, isSupported, user]);

  const handleAllow = async () => {
    const success = await requestPermission();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!showBanner || dismissed || permission !== 'default' || !isSupported || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="glass rounded-xl p-4 border-2 border-primary/30 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Enable Notifications 🔔
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get instant updates about announcements, team invitations, and hackathon reminders - even when the app is closed!
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAllow}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? 'Enabling...' : 'Allow'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="flex-1"
              >
                Not Now
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
