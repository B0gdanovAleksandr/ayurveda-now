const CACHE_NAME = 'ayurveda-now-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Добавьте сюда пути к иконкам и основным js/css
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
}); 