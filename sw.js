const CACHE = 'beerlog-v30';
const TILE_CACHE = 'beerlog-tiles-v1';
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
    Promise.all(keys.filter(k => k !== CACHE && k !== TILE_CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const isTile = e.request.url.indexOf('basemaps.cartocdn.com') !== -1;

  if (isTile) {
    // Map tiles never change once drawn — serve from cache instantly if we
    // have it, and refresh the cache in the background for next time.
    e.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(r => {
            cache.put(e.request, r.clone());
            return r;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
