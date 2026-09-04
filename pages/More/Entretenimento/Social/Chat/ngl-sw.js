/* ngl-sw.js — Service Worker para notificações NGL/Nostr */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION') {
    const title = data.title || 'Mensagem anônima';
    const body = (data.body || '').slice(0, 180);
    const options = {
      body,
      icon: data.icon || './Src/FavicoLW.png',
      badge: data.badge || './Src/FavicoLW.png',
      tag: data.tag || 'ngl-anon-msg',
      renotify: true,
      requireInteraction: false,
      data: { url: data.url || './' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'OPEN_INBOX' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
