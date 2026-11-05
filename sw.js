// Forbidden Arcana: small offline shell, on-demand card image caching.
// Never pre-download the full tarot deck during first visit.
const CACHE_NAME = 'forbidden-arcana-v8-question-20261105';
const PRECACHE = [
  './',
  './index.html',
  './assets/cthulhu-tarot-back-v7.webp',
  './assets/forbidden-arcana-atmosphere-v7.webp'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(PRECACHE.map(async path => {
      const response = await fetch(new Request(path, {cache: 'reload'}));
      if (!response.ok) throw new Error('Precache failed: ' + path);
      await cache.put(path, response);
    }));
    if (results.slice(0, 3).some(r => r.status !== 'fulfilled')) {
      throw new Error('Offline shell unavailable');
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k =>
      k.startsWith('forbidden-arcana-') && k !== CACHE_NAME
    ).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // App shell must update when a new homepage is published; cache is offline fallback.
  if (request.mode === 'navigate' || /\.(?:js|css)$/.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(request, {cache: 'no-cache'}));
        if (!response.ok) throw new Error('Page resource unavailable');
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
        return response;
      } catch {
        return await caches.match(request)
          || (request.mode === 'navigate' ? await caches.match('./index.html') : null)
          || Response.error();
      }
    })());
    return;
  }

  // Artwork loads only when a page actually uses it. Subsequent visits use the cache.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, {ignoreSearch: true});
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch {
      return Response.error();
    }
  })());
});
