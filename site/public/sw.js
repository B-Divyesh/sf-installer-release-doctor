const CACHE = 'release-doctor-v9';
const SHELL = ['/', '/demo', '/privacy', '/terms', '/favicon.svg', '/assets/release-inspection-640.webp'];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(async function (cache) {
    await cache.addAll(SHELL);
    const html = await fetch('/').then(function (response) { return response.text(); });
    const assets = Array.from(html.matchAll(/\/(assets\/[^"']+\.(?:js|css))/g)).map(function (match) { return '/' + match[1]; });
    await cache.addAll(assets);
  }));
  self.skipWaiting();
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.open(CACHE).then(function (cache) { return cache.match(new URL(event.request.url).pathname); }).then(function (cached) {
    return cached || fetch(event.request).then(function (response) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.put(event.request, copy); }));
      return response;
    });
  }));
});
