/* SW Version: 3.4.1 - Offline Support */
const CACHE_NAME = 'mc-app-v3.4.1';
const ASSETS = [
  './', 
  './index.html', 
  './manifest.json', 
  './icon-192.png', 
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  return clients.claim();
});

// יירוט בקשות הרשת וטיפול באופליין (Network First)
self.addEventListener('fetch', e => {
  // נטפל רק בבקשות GET רגילות (לא בבקשות ל-API של יוטיוב למשל)
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // יש קליטה: שומרים את הגרסה החדשה ב-Cache ומציגים אותה
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // אין קליטה: שולפים את העמוד/הקבצים מה-Cache
        return caches.match(e.request);
      })
  );
});
