/* SW Version: 3.3.1 - Minimal Safe Elite */
const CACHE_NAME = 'mc-safe-v3.3.1';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    clients.claim().then(() =>
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      )
    )
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Cache ONLY icons and manifest - nothing else!
  // This ensures YouTube and index.html always load fresh and never stay grey.
  if (ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
