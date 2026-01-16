import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { toast } from 'sonner';

export function usePushNotifications(userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (!userId) {
      toast.error('Please log in to enable notifications');
      return false;
    }

    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Get FCM token
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (token) {
          setFcmToken(token);
          
          // Save token to user profile
          const userRef = doc(db, COLLECTIONS.USERS, userId);
          await updateDoc(userRef, {
            fcmToken: token,
            notificationsEnabled: true,
            updatedAt: new Date()
          });

          toast.success('🔔 Notifications enabled! You\'ll receive updates even when the app is closed.');
          
          // Listen for foreground messages
          onMessage(messaging, (payload) => {
            console.log('Foreground message:', payload);
            
            // Show toast notification when app is open
            toast.info(payload.notification?.title || 'New Notification', {
              description: payload.notification?.body,
              duration: 5000
            });
          });

          return true;
        }
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable them in browser settings.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const disableNotifications = async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        notificationsEnabled: false,
        updatedAt: new Date()
      });

      setFcmToken(null);
      toast.success('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    }
  };

  return {
    permission,
    fcmToken,
    loading,
    requestPermission,
    disableNotifications,
    isSupported: 'Notification' in window
  };
}
