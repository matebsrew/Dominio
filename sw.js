// V12: remove completamente o service worker antigo e todos os caches.
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
  })());
});
// Sem fetch handler: todas as requisições seguem direto para a rede.
