// Service Worker for PWA Support
const CACHE_NAME = 'impact-resell-pwa-v1';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Pass through non-GET requests, dev server requests, Firestore / Firebase auth / Google APIs directly
  const url = event.request.url;
  if (
    event.request.method !== 'GET' ||
    url.includes('/@vite/') ||
    url.includes('/@fs/') ||
    url.includes('/node_modules/') ||
    url.includes('?v=') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com') ||
    url.includes('firebaseinstallations.googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('chrome-extension://')
  ) {
    return;
  }

  // Network first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response('Offline or Network Error', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
