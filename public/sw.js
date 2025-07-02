const CACHE_NAME = "mi-deposito-cache-v1.01";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/index.css",
  "/js/main.js",
  "/firebase-config.js",
  "/images/icono1.png",
  "/images/icono2.png",
  "/pages/dashboard.html",
  "/pages/productos.html",
  "/pages/reposicion.html",
  "/pages/ingresos.html",
  "/pages/reportes.html",
  "/pages/gestionar-usuarios.html",
  "/css/dashboard.css", // Asegurate que exista
  "/js/dashboard.js", // Asegurate que exista
];

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker y limpieza de caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Intercepción de peticiones
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => caches.match("/index.html"))
      );
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
