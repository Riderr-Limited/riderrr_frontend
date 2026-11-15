/* Riderr service worker.
 *
 * - Pages: network first, falling back to the last copy we saw, then /offline.
 * - Hashed build assets (/_next/static) and icons: cache first; they never change in place.
 * - Everything else (the API, Google Maps, sockets) goes straight to the network and is
 *   never cached, so delivery and payment data is always live.
 */

const VERSION = "riderr-v1";
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

// The page asks the waiting worker to take over when the user accepts an update.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse;
          const response = preloaded || (await fetch(request));
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(PAGES).then((c) => c.put(request, copy)).then(() => trimCache(PAGES, 40));
          }
          return response;
        } catch {
          const cached = await caches.match(request, { ignoreSearch: true });
          return cached || (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Immutable build output and static images
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(png|svg|jpg|jpeg|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          caches.open(ASSETS).then((c) => c.put(request, copy)).then(() => trimCache(ASSETS, 200));
        }
        return response;
      })(),
    );
  }
});
