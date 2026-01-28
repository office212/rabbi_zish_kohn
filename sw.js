```javascript
/* SW Version: 3.2.6 - Fixed Navigation */
const CACHE_NAME = 'mc-ironclad-v3.2.6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install - Cache core assets
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

// 2. Activate - Clean old caches
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
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  
  // CRITICAL: Never cache YouTube/Google APIs
  if (url.hostname.includes('googleapis.com') || 
      url.hostname.includes('youtube.com')) {
    return; // Let browser handle it normally
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Strategy 1: For HTML pages (navigation), always fetch fresh
      if (e.request.mode === 'navigate') {
        return fetch(e.request)
          .then(res => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
            }
            return res;
          })
          .catch(() => cached || caches.match('./'));
      }

      // Strategy 2: For static assets, cache-first for speed
      if (cached) {
        return cached;
      }

      // Strategy 3: For new assets, fetch and cache
      return fetch(e.request)
        .then(res => {
          // Cache YouTube thumbnails (even opaque responses)
          if (url.hostname.includes('ytimg.com')) {
            const copy = res.clone();
            caches.open(CACHE_NAME)
              .then(c => c.put(e.request, copy))
              .catch(err => console.warn('Cache failed:', err));
          } 
          // Cache other successful responses
          else if (res.ok && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME)
              .then(c => c.put(e.request, copy))
              .catch(err => console.warn('Cache failed:', err));
          }
          return res;
        })
        .catch(() => cached || null);
    })
  );
});
```