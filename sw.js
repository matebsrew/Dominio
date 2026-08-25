const CACHE='treino-v4-6';
const ASSETS=['./','./index.html','./app.js','./guides.js','./guides-visual-v2.js','./guides-force-v3.js','./guides-init.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const path=new URL(req.url).pathname;
  if(req.mode==='navigate' || path.endsWith('/app.js') || path.endsWith('/guides.js') || path.endsWith('/guides-visual-v2.js') || path.endsWith('/guides-force-v3.js') || path.endsWith('/guides-init.js')){
    e.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r;}).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});