/* App Version: 3.2.1 - Ironclad Pro */
const CACHE_NAME = 'mc-ironclad-v3.2.1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Installation - Cache shell assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// 2. Activation - Clean old caches
self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// 3. Fetch Strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ALWAYS BYPASS CACHE FOR YOUTUBE API CALLS
  if (url.hostname.includes('googleapis.com')) {
    return; // Let the browser handle it normally
  }

  // STRATEGY FOR INDEX.HTML: Network First, then Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // STRATEGY FOR IMAGES AND OTHER ASSETS: Cache First, then Network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && (url.hostname.includes('ytimg.com') || response.type === 'basic')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => null);
    })
  );
});
