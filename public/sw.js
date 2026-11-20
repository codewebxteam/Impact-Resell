// Service Worker for PWA Support
const CACHE_NAME = 'impact-resell-pwa-v2';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients immediately and flush obsolete caches
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

// Fetch event - network first with cache fallback for same-origin assets
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Only intercept same-origin GET requests.
  // Never intercept external CDNs, ImageKit, Unsplash, Firebase, or Google APIs.
  if (
    event.request.method !== 'GET' ||
    !url.startsWith(self.location.origin) ||
    url.includes('/@vite/') ||
    url.includes('/@fs/') ||
    url.includes('/node_modules/') ||
    url.includes('/api/') ||
    url.includes('?v=')
  ) {
    return;
  }

  // Network first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache valid same-origin static responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // Try cache fallback
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // If navigation fails while offline, serve cached index
        if (event.request.mode === 'navigate') {
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;
        }

        return Response.error();
      })
  );
});
