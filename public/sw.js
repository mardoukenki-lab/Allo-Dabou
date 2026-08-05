// Allô Dabou VTC - Service Worker for Lock Screen & Background Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Background Push Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '🚖 Allô Dabou VTC',
    body: 'Nouvelle alerte de course !',
    url: '/',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Alerte course',
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    vibrate: [500, 150, 500, 150, 500, 150, 800],
    requireInteraction: true,
    renotify: true,
    tag: 'allo-dabou-alert',
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: '🚖 VOIR LA COURSE' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🚖 Allô Dabou VTC', options)
  );
});

// Notification click listener -> opens or focuses the app tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
