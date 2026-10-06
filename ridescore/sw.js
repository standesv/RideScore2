// Service worker minimal pour RideScore (PWA) :
// met en cache la coquille de l'app (HTML/CSS/JS/icônes) pour un chargement instantané
// et un fonctionnement basique hors-ligne (les données météo restent en direct, réseau requis).
const CACHE_NAME = 'ridescore-shell-v3';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './ridescore-logo.png',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Les appels météo/géocodage restent toujours en réseau (données live, jamais en cache).
  if (req.url.includes('open-meteo.com')) return;

  // Pour la coquille de l'app : réseau d'abord, repli sur le cache si hors-ligne.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
