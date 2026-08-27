// Sem cache: o app é pequeno e a rede sempre traz a versão mais nova.
// Este arquivo existe apenas para remover service workers antigos que
// ainda possam estar instalados em algum aparelho da casa.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
  })());
});
