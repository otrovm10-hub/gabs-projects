self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("gabs-cache-v1").then(cache => {
      return cache.addAll([
        "/empleados.html",
        "/admin.html",
        "/manifest-empleado.json",
        "/manifest-admin.json",
        "/icons/empleado-192.png",
        "/icons/empleado-512.png",
        "/icons/admin-192.png",
        "/icons/admin-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});