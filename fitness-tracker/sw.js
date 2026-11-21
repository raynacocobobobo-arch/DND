const CACHE='fitness-tracker-v5.17.0-readable';
const ASSETS=['./','./index.html','./app.css?v=5.13.3','./app.js?v=5.13.3','./noir-theme.css?v=5.14.0','./v517-live.css?v=5.17.0','./art/noir-hero.webp','./art/noir-workouts.webp','./imperial-fortress.svg','./art/background.webp','./art/fortress.webp','./art/stats.webp','./art/card.webp','./art/astramilitarum-training-sprite.webp','./art/nav.webp','./art/nav-active.webp','./art/banner.webp','./art/steel-legion-header.webp','./art/steel-legion-flag.webp','./manifest.webmanifest?v=5.13.0','./icon-180.png?v=5.13.0','./icon-192.png?v=5.13.0','./icon-512.png?v=5.13.0'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('fitness-tracker-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||!req.url.startsWith(self.registration.scope))return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}return r;}).catch(()=>caches.match('./index.html')));
  } else {
    e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return r;})));
  }
});
