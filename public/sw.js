// bump this when you deploy new versions so clients update
const CACHE = "moral-cache-v4";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest"]))
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Never cache Next.js build assets
  if (url.pathname.startsWith("/_next/")) return;

  // Always fetch fresh episode JSON
  if (url.pathname.startsWith("/episodes/")) return;

  // Cache-first for everything else (images, icons, etc.)
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
