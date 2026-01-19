// Firebase Cloud Messaging Service Worker - Static fallback
// This file serves as a fallback. The actual service worker is generated dynamically
// with environment variables to avoid exposing secrets in the repository.

// If you see this message in the console, the dynamic service worker registration failed
console.log('Using static fallback service worker - dynamic registration may have failed');

// Basic service worker functionality without Firebase config
self.addEventListener('install', (event) => {
  console.log('Static service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Static service worker activated');
});

// Handle notification clicks (basic functionality)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});