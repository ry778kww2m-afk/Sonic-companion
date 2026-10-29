/* Sonic Companion v1.2 cache clean-up worker. Network only; never serves stale app HTML. */
const CACHE_PREFIX = 'sonic-companion-shell-';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX)).map(key => caches.delete(key)));
  await self.clients.claim();
})()));
// Deliberately no fetch handler: requests go to the network. The v1.2 page unregisters this cleanup worker after removing old workers/caches.
