/* SW Version: 3.2.3 - Final Pro */
const CACHE_NAME = 'mc-ironclad-v3.2.3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // NEVER CACHE API CALLS
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('youtube.com')) return;

  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && url.hostname.includes('ytimg.com')) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request) || caches.match('./'))
  );
});
