/* Sonic Companion v1.3. The page unregisters legacy workers and clears prior shell caches. Network only; no stale HTML cache. */
const CACHE_PREFIX = 'sonic-companion-shell-';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
 const keys = await caches.keys();
 await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX)).map(key => caches.delete(key)));
 await self.clients.claim();
})()));
// Deliberately no fetch handler. This worker is retained only for cleanup compatibility.
