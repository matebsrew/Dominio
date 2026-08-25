// V11: service worker de recuperação. Remove caches antigos e usa sempre a rede.
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(fetch(new Request(e.request,{cache:'no-store'})).catch(()=>new Response('Offline',{status:503,statusText:'Offline'})));});
