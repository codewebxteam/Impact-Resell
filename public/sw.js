// Service Worker for PWA Support
const CACHE_NAME = 'impact-resell-pwa-v3';
const DYNAMIC_MANIFEST_CACHE = 'pwa-dynamic-manifest-v2';

let cachedDynamicManifest = null;

// Message listener from AgencyContext to dynamically update PWA manifest
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_DYNAMIC_MANIFEST') {
    cachedDynamicManifest = event.data.manifest;
    caches.open(DYNAMIC_MANIFEST_CACHE).then((cache) => {
      cache.put(
        '/manifest.json',
        new Response(JSON.stringify(event.data.manifest), {
          headers: {
            'Content-Type': 'application/manifest+json; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        })
      );
    });
  }
});

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
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_MANIFEST_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with cache fallback for same-origin assets
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. Dynamic Manifest Interception for Multi-tenant Theme Branding
  if (url.endsWith('/manifest.json')) {
    event.respondWith(
      (async () => {
        if (cachedDynamicManifest) {
          return new Response(JSON.stringify(cachedDynamicManifest), {
            headers: {
              'Content-Type': 'application/manifest+json; charset=utf-8',
              'Cache-Control': 'public, max-age=0, must-revalidate',
            },
          });
        }
        try {
          const cache = await caches.open(DYNAMIC_MANIFEST_CACHE);
          const cached = await cache.match('/manifest.json');
          if (cached) return cached;
        } catch (e) {
          // Ignore cache read error and fall through
        }
        return fetch(event.request);
      })()
    );
    return;
  }

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
