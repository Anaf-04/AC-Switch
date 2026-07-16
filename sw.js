const CACHE  = 'ac-switch-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './img/switch.png',
  './img/leverOff.png',
  './img/leverOn.png',
  './img/home.png',
  './img/time.png',
  'https://unpkg.com/mqtt/dist/mqtt.min.js',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// Drop old caches when a new version installs.
self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
);

// Cache-first, then network. Anything new fetched over the network gets
// cached so the app keeps working fully offline after the first load.
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      });
    })
  );
});
