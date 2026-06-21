// TODO: Generate and place /icon-192.png and /icon-512.png in /public before PWA install prompt works.

const CACHE_NAME = "tandas-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Network-first strategy; fall back to cache for navigation requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful navigation responses
        if (request.mode === "navigate" && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: serve cached navigation page
        if (request.mode === "navigate") {
          return caches.match(request).then(
            (cached) => cached || caches.match("/")
          );
        }
        return caches.match(request);
      })
  );
});
