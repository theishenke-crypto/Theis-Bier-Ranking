const CACHE = 'beerlog-v3';
const ASSETS = [
  '/Theis-Bier-Ranking/',
  '/Theis-Bier-Ranking/index.html',
  '/Theis-Bier-Ranking/manifest.json',
  '/Theis-Bier-Ranking/icon-192.png',
  '/Theis-Bier-Ranking/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
