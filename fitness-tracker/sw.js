const CACHE='fitness-tracker-v5.24.1-calendar-title-only';
const ASSETS=["./v520-comic-sections.css?v=5.20.1","./","./index.html","./app.css?v=5.13.3","./app.js?v=5.24.1","./v519-one-screen.css?v=5.19.1","./manifest.webmanifest?v=5.23.0","./icon-180.png?v=5.23.0","./icon-192.png?v=5.23.0","./icon-512.png?v=5.23.0","./art/banner-crisp.webp?v=5.18.0","./art/paper-exact.webp?v=5.18.0","./art/nav-crisp.webp?v=5.18.0","./art/exercise-steps.webp?v=5.18.0","./art/exercise-situps-fixed.webp?v=5.18.0","./art/exercise-wall-sit.webp?v=5.18.0","./art/exercise-elliptical.webp?v=5.18.0","./art/exercise-bike.webp?v=5.18.0","./art/exercise-running.webp?v=5.18.0","./art/exercise-lat.webp?v=5.18.0","./art/exercise-row-fixed.webp?v=5.18.0","./art/exercise-fly.webp?v=5.18.0","./art/exercise-dumbbell.webp?v=5.18.0","./art/exercise-back.webp?v=5.18.0","./art/exercise-swim.webp?v=5.18.0","./v521-scene-heroes.css?v=5.21.0","./art/calendar-hero.webp?v=5.21.0","./art/history-hero.webp?v=5.21.0","./art/settings-hero.webp?v=5.21.0","./v522-action-banners.css?v=5.22.0","./art/calendar-action-v522.webp?v=5.22.0","./art/history-action-flipped-v522.webp?v=5.22.0","./art/settings-action-v522.webp?v=5.22.0","./v524-matched-titles.css?v=5.24.0","./art/calendar-title-v524.svg?v=5.24.0","./art/history-title-v524.svg?v=5.24.0","./art/settings-title-v524.svg?v=5.24.0"];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(k=>k.startsWith('fitness-tracker-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    clients.forEach(c=>c.postMessage({type:'FITNESS_RELEASE_READY',version:CACHE}));
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||!req.url.startsWith(self.registration.scope))return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}return r;}).catch(()=>caches.match('./index.html')));
  } else {
    if(req.destination==='style'||req.destination==='script'){
      e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
        if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
        return r;
      }).catch(()=>caches.match(req)));
    }else{
      e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{
        if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
        return r;
      })));
    }
  }
});
