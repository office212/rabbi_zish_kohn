/* SW Version: 3.4.2 - Offline Support */
const CACHE_NAME = 'mc-app-v3.4.2';
const ASSETS = [
  './', 
  './index.html', 
  './manifest.json', 
  './icon-192.png', 
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  return clients.claim();
});

// ×××¨×× ××§×©××ª ××¨×©×ª ××××¤×× ××××¤×××× (Network First)
self.addEventListener('fetch', e => {
  // × ××¤× ×¨×§ ×××§×©××ª GET ×¨×××××ª (×× ×××§×©××ª ×-API ×©× ×××××× ×××©×)
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // ××© ×§××××: ×©×××¨×× ××ª ×××¨×¡× ××××©× ×-Cache ×××¦×××× ×××ª×
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // ××× ×§××××: ×©×××¤×× ××ª ××¢×××/××§××¦×× ××-Cache
        return caches.match(e.request);
      })
  );
});
