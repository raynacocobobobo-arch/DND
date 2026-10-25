// The Forbidden Arcana offline cache, V2.
const CACHE_NAME = 'forbidden-arcana-v2-20261025';
const PRECACHE = [
  "./",
  "./index.html",
  "./assets/card-back.svg",
  "./assets/cards/img-00.webp",
  "./assets/cards/img-01.webp",
  "./assets/cards/img-02.webp",
  "./assets/cards/img-03.webp",
  "./assets/cards/img-04.webp",
  "./assets/cards/img-05.webp",
  "./assets/cards/img-06.webp",
  "./assets/cards/img-07.webp",
  "./assets/cards/img-08.webp",
  "./assets/cards/img-09.webp",
  "./assets/cards/img-10.webp",
  "./assets/cards/img-11.webp",
  "./assets/cards/img-12.webp",
  "./assets/cards/img-13.webp",
  "./assets/cards/img-14.webp",
  "./assets/cards/img-15.webp",
  "./assets/cards/img-16.webp",
  "./assets/cards/img-17.webp",
  "./assets/cards/img-18.webp",
  "./assets/cards/img-19.webp",
  "./assets/cards/img-20.webp",
  "./assets/cards/img-21.webp"
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(PRECACHE.map(async url => {
      const response = await fetch(new Request(url, {cache:'reload'}));
      if (!response.ok) throw new Error('Precache HTTP '+response.status+' '+url);
      await cache.put(url, response);
    }));
    const critical = results.slice(0,3);
    if (critical.some(r => r.status !== 'fulfilled')) throw new Error('Offline core assets unavailable');
    self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('forbidden-arcana-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  if(req.mode === 'navigate'){
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if(res.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put('./index.html',res.clone()).catch(()=>{});
          return res;
        }
        throw new Error('Offline');
      } catch {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(req, {ignoreSearch:true});
    if(cached) return cached;
    try {
      const res=await fetch(req);
      if(res.ok){
        const cache=await caches.open(CACHE_NAME);
        cache.put(req,res.clone()).catch(()=>{});
      }
      return res;
    } catch {
      return Response.error();
    }
  })());
});
