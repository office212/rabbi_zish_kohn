/* SW Version: 3.4.0 - Invisible Shield */
const CACHE_NAME = 'mc-app-v3.4.0';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  return clients.claim();
});

// ZERO INTERFERENCE: Let the browser handle all networking.
// This is the only way to be 100% sure there are no grey screens.
self.addEventListener('fetch', e => { return; });
