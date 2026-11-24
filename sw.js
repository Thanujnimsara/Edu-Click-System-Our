// EDU CLICK Progressive Web App (PWA) Service Worker
// Enables offline access to timetable, receipts, and cached learning materials

const CACHE_NAME = 'edu-click-v4.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/brand/logo.svg',
  '/brand/icon.svg',
  '/brand/app-icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching core offline shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for local UI assets, Network-first for dynamic API data
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, clone and cache for offline backup
          if (response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, respClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback from cache for cached API endpoints (e.g. timetable/classes)
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(JSON.stringify({ offline: true, message: 'You are currently offline. Showing cached information.' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
  }
});
