/* Service worker de Cahier_algo (SOFT-KEY).
   Met l'application en cache pour qu'elle fonctionne hors-ligne une fois
   installée, sur n'importe quel système d'exploitation supportant un
   navigateur moderne (Windows, macOS, Linux, ChromeOS, Android, iOS). */

const CACHE_NAME = 'cahier-algo-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Cache d'abord, réseau en secours (l'app n'a de toute façon aucune
   dépendance réseau pour fonctionner, hormis les polices Google Fonts). */
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if(cached) return cached;
      return fetch(event.request).catch(() => cached);
    })
  );
});
