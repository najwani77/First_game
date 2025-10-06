self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest"])));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // never cache Next.js build assets
  if (url.pathname.startsWith("/_next/")) return;

  // never cache episode JSON (we always want fresh)
  if (url.pathname.startsWith("/episodes/")) return;

  // cache-first for the rest (images, icons, etc.)
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
