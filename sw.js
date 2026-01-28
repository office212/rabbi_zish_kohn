/* SW Version: 3.2.4 - Professional Ironclad */
const CACHE_NAME = 'mc-ironclad-v3.2.4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install - Cache the app shell
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate - Take control and clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    clients.claim().then(() =>
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )
      )
    )
  );
});

// 3. Fetch - Smart caching strategy
self.addEventListener('fetch', e => {
  // Only handle standard GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  
  // BYPASS CACHE FOR LIVE API CALLS (Always fresh from YouTube)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('youtube.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache YouTube thumbnails dynamically (handles opaque responses)
        if (url.hostname.includes('ytimg.com')) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => {
        // Offline Fallback logic
        if (e.request.destination === 'document') {
          return caches.match('./');
        }
        return caches.match(e.request);
      })
  );
});
