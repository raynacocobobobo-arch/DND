const CACHE='fitness-tracker-v5.21.0-fullbody-three-banners';
const ASSETS=["./v520-comic-sections.css?v=5.20.1","./","./index.html","./app.css?v=5.13.3","./app.js?v=5.18.0","./v519-one-screen.css?v=5.19.1","./manifest.webmanifest?v=5.13.0","./icon-180.png?v=5.13.0","./icon-192.png?v=5.13.0","./icon-512.png?v=5.13.0","./art/banner-crisp.webp?v=5.18.0","./art/paper-exact.webp?v=5.18.0","./art/nav-crisp.webp?v=5.18.0","./art/exercise-steps.webp?v=5.18.0","./art/exercise-situps-fixed.webp?v=5.18.0","./art/exercise-wall-sit.webp?v=5.18.0","./art/exercise-elliptical.webp?v=5.18.0","./art/exercise-bike.webp?v=5.18.0","./art/exercise-running.webp?v=5.18.0","./art/exercise-lat.webp?v=5.18.0","./art/exercise-row-fixed.webp?v=5.18.0","./art/exercise-fly.webp?v=5.18.0","./art/exercise-dumbbell.webp?v=5.18.0","./art/exercise-back.webp?v=5.18.0","./art/exercise-swim.webp?v=5.18.0","./v521-scene-heroes.css?v=5.21.0","./art/calendar-hero.webp?v=5.21.0","./art/history-hero.webp?v=5.21.0","./art/settings-hero.webp?v=5.21.0"];
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
