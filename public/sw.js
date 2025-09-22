self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("moral-cache-v1").then((c) => c.addAll(["/","/manifest.webmanifest"])));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
