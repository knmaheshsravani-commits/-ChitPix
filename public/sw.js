// ChitPix Service Worker - WHITE NAV FIX v4

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.map((key) => caches.delete(key)))
      ),
      self.clients.claim(),
    ])
  );
});
