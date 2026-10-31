const CACHE_NAME = 'yamicode-R1';
const ASSETS = [
  './',
  './index.html',
  './css/ropa.css',
  './js/cerebro.js',
  './js/sys_index.js',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
