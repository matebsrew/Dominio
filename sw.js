const CACHE='treino-v4-9';
const ASSETS=['./','./index.html','./app.js','./guides.js','./guides-anatomical-v8.js','./guides-force-v3.js','./guides-init.js','./assets/supino-reto-anatomico.webp','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const path=new URL(req.url).pathname;
  if(req.mode==='navigate' || path.endsWith('/app.js') || path.endsWith('/guides.js') || path.endsWith('/guides-anatomical-v8.js') || path.endsWith('/guides-force-v3.js') || path.endsWith('/guides-init.js') || path.endsWith('/assets/supino-reto-anatomico.webp')){
    const fresh=new Request(req,{cache:'reload'});
    e.respondWith(fetch(fresh).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r;}).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});