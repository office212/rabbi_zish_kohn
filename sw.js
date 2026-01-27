/* App Version: 3.2.0 - Ironclad */
const CACHE_NAME = 'mc-ironclad-v3.2.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        CORE_ASSETS.map(url => fetch(url).then(res => {
          if (res.ok) return cache.put(url, res);
          console.warn(`[SW] Failed to cache: ${url}`);
        }).catch(err => console.error(`[SW] Fetch error for ${url}:`, err)))
      );
    })
  );
});

self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          // Cache YouTube thumbnails dynamically for offline view
          if (response.ok && event.request.url.includes('ytimg.com')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') return caches.match('./index.html');
        return null;
      });
    })
  );
});
