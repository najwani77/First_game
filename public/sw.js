// public/sw.js
const CACHE = "moral-cache-v5";

self.addEventListener("install", (e) => {
  self.skipWaiting(); // activate immediately
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(["/", "/manifest.webmanifest"])
    )
  );
});

self.addEventListener("activate", (e) => {
  clients.claim(); // control all open tabs
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Never cache Next build assets or episode JSON (always fresh)
  if (url.pathname.startsWith("/_next/")) return;
  if (url.pathname.startsWith("/episodes/")) return;

  // HTML/navigations: NETWORK-FIRST to avoid stale home page
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else (images/icons): CACHE-FIRST
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
