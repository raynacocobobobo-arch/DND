/* Severed Ember: bounded, on-demand image cache for revisits.
 * No precaching of the entire codex, no offline-first HTML, no stale navigation.
 */
'use strict';
const CACHE_NAME='ember-image-cache-v3-20261125-ember-white-protected-originals';
const CACHE_PREFIX='ember-image-cache-';
const MAX_ENTRIES=120;

self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME)
      .map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
async function trimImages(cache){
  const keys=await cache.keys();
  if(keys.length>MAX_ENTRIES)
    await Promise.all(keys.slice(0,keys.length-MAX_ENTRIES).map(key=>cache.delete(key)));
}
async function storeImage(cache,request,response){
  if(!response.ok||response.type!=='basic')return;
  const size=+(response.headers.get('content-length')||0);
  if(size>1024*1024)return;
  try{await cache.put(request,response.clone());await trimImages(cache)}catch(_){}
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  // HTML/JS/CSS/manifest/service-worker updates always go to the network.
  // Their freshness is controlled by the hosting server's cache headers.
  if(!/\.(?:webp|png|jpg|jpeg|gif|svg|ico)$/i.test(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const saved=await cache.match(request);
    const download=fetch(request).then(response=>{
      if(response.ok)event.waitUntil(storeImage(cache,request,response));
      return response;
    });
    if(saved){
      event.waitUntil(download.catch(()=>undefined));
      return saved;
    }
    try{return await download}catch(_){return Response.error()}
  })());
});
