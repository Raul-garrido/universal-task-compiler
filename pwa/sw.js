const CACHE_NAME = "utc-pwa-v2";
const PRECACHE_URLS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo intercepta peticiones al propio origen (el app shell). Las llamadas a
// las APIs de Claude/Gemini son a otro origen y pasan siempre directas a la
// red, sin caché ni interferencia — el modo IA sigue funcionando igual.
//
// Estrategia: red primero, caché como respaldo (no al revés). Con
// cache-first (la v1 original) un usuario que ya hubiera abierto la PWA una
// vez se quedaba viendo la version vieja para siempre, aunque hubiera una
// actualizacion publicada y tuviera conexion — el Service Worker nunca
// volvia a pedir el archivo porque ya "estaba en cache". Con red-primero, si
// hay conexion siempre se coge la version mas reciente (y se actualiza la
// cache de paso); solo se usa la copia guardada si falla la red (modo
// offline real).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
