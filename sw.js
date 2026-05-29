const CACHE = 'gold-ledger-v4';

// On install — cache assets but don't block on it
self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately, don't wait
});

// On activate — delete ALL old caches so stale files are gone
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k))) // delete every old cache
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy: NETWORK FIRST, fall back to cache only when offline
self.addEventListener('fetch', e => {
  // Only handle GET requests for our own origin
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Got a fresh response — clone it into cache for offline use
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Network failed (offline) — serve from cache
        return caches.match(e.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
