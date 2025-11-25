self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // כאן אפשר להוסיף בעתיד יכולות אופליין מתקדמות
  // כרגע זה רק נדרש כדי שההתקנה תעבוד
});
