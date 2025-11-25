// Service Worker Force Active
self.addEventListener('install', (event) => {
  // מדלג על שלב ההמתנה ומפעיל מיד
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // משתלט על הדף מיד בלי רענון
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // חייב להיות כאן כדי שהדפדפן יזהה שזו PWA
});
