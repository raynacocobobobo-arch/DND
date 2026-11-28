'use strict';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const keys=await caches.keys();
 for(const key of keys){
  if(key==='enwan-shotlist-v5-reviewed-visual-2')await caches.delete(key);
 }
 await self.registration.unregister();
})()));
