// Service Worker Registration and Firebase Config Injection
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    // Create service worker content with Firebase config
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // Create service worker content as a blob
    const swContent = `
// Firebase Cloud Messaging Service Worker - Generated dynamically
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase with injected config
firebase.initializeApp(${JSON.stringify(firebaseConfig)});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'HackMates Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/assets/roundlogohackmates.png',
    badge: '/assets/roundlogohackmates.png',
    tag: payload.data?.type || 'general',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
`;

    // Create blob URL for the service worker
    const blob = new Blob([swContent], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    // Register the service worker
    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('SW registered successfully:', registration);
    
    return registration;
  } catch (error) {
    console.error('SW registration failed:', error);
    return null;
  }
};