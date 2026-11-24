const CACHE='fitness-tracker-v5.47.1-calendar-equivalent';
const ASSETS=["./art/title-overview-v5321.webp","./art/title-followalong-v5321.webp","./art/title-calendar-v5321.webp","./art/title-history-v5321.webp","./art/title-settings-v5321.webp","./v520-comic-sections.css?v=5.20.1","./","./index.html","./app.css?v=5.13.3","./v519-one-screen.css?v=5.31.3","./manifest.webmanifest?v=5.23.0","./icon-180.png?v=5.23.0","./icon-192.png?v=5.23.0","./icon-512.png?v=5.23.0","./art/banner-crisp.webp?v=5.18.0","./art/paper-exact.webp?v=5.18.0","./art/nav-crisp.webp?v=5.18.0","./art/exercise-steps.webp?v=5.18.0","./art/exercise-situps-fixed.webp?v=5.18.0","./art/exercise-wall-sit.webp?v=5.18.0","./art/exercise-elliptical.webp?v=5.18.0","./art/exercise-bike.webp?v=5.18.0","./art/exercise-running.webp?v=5.18.0","./art/exercise-lat.webp?v=5.18.0","./art/exercise-row-fixed.webp?v=5.18.0","./art/exercise-fly.webp?v=5.18.0","./art/exercise-dumbbell.webp?v=5.18.0","./art/exercise-back.webp?v=5.18.0","./art/exercise-swim.webp?v=5.18.0","./v521-scene-heroes.css?v=5.21.0","./art/calendar-hero.webp?v=5.21.0","./art/history-hero.webp?v=5.21.0","./art/settings-hero.webp?v=5.21.0","./v522-action-banners.css?v=5.22.0","./art/calendar-action-v522.webp?v=5.22.0","./art/history-action-flipped-v522.webp?v=5.22.0","./art/settings-action-v522.webp?v=5.22.0","./v524-matched-titles.css?v=5.24.0","./art/calendar-title-v524.svg?v=5.24.0","./art/history-title-v524.svg?v=5.24.0","./art/settings-title-v524.svg?v=5.24.0","./v526-clean-follow.css?v=5.27.1","./v528-unified-titles.css?v=5.28.0","./v530-nav-composite.css?v=5.35.0","./art/nav-buttons-v5320.webp","./art/title-overview-v528.webp?v=5.28.0","./art/title-followalong-v528.webp?v=5.28.0","./art/title-calendar-v528.webp?v=5.28.0","./art/title-history-v528.webp?v=5.28.0","./art/title-settings-v528.webp?v=5.28.0","./v543-ritual-timer.css?v=5.43.0","./art/follow-poster-crunch-v537.webp?v=5.37.0","./v538-eating-window.css?v=5.38.0","./v539-eating-phase.css?v=5.39.0","./v541-weekly-progress-fix.css?v=5.41.0","./v547-wall-plank.css?v=5.47.0","./v546-doubletap.css?v=5.46.0","./app.js?v=5.47.0","./art/follow-hero-v526.webp?v=5.26.0","./art/follow-title-v527.webp?v=5.27.1","./art/follow-title-v526.webp?v=5.26.0","./art/nav-five-v526.webp?v=5.26.0","./art/follow-poster-v543.webp?v=5.43.0","./art/nav-active-overview-v526.webp?v=5.26.1","./art/nav-active-followalong-v526.webp?v=5.26.1","./art/nav-active-calendar-v526.webp?v=5.26.1","./art/nav-active-history-v526.webp?v=5.26.1","./art/nav-active-settings-v526.webp?v=5.26.1"];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(k=>k.startsWith('fitness-tracker-')&&k!==CACHE).map(k=>caches.delete(k)));
    await caches.delete('fitness-video-v526-offline');
    if(names.includes('fitness-follow-user-v536')){
      const imports=await caches.open('fitness-follow-user-v536');
      await imports.delete('./media/1.mp4');
    }
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    clients.forEach(c=>c.postMessage({type:'FITNESS_RELEASE_READY',version:CACHE}));
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||!req.url.startsWith(self.registration.scope))return;
  // Let the browser negotiate HTTP byte ranges for actual MP4 playback.
  if(/\/media\/[12]\.mp4(?:\?|$)/.test(req.url))return;
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
