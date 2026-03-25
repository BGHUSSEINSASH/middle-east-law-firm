const CACHE_NAME = 'me-law-v34';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './laws-data.js',
  './laws-data-2.js',
  './laws-data-3.js',
  './laws-data-4.js',
  './laws-data-5.js',
  './laws-data-6.js',
  './laws-data-7.js',
  './laws-data-8.js',
  './laws-data-9.js',
  './laws-data-10.js',
  './ai-engine.js',
  './lang-data.js',
  './language-system.js',
  './admin-bridge.js',
  './manifest.json',
  './logo.svg',
  './lang/ar.json',
  './lang/en.json',
  './lang/ku.json',
  './lang/tr.json',
  './lang/fa.json',
  './lang/fr.json',
  './lang/de.json',
  './lang/es.json',
  './lang/ru.json',
  './lang/zh.json',
  './about.html',
  './blog.html',
  './booking.html',
  './career.html',
  './cases.html',
  './faq.html',
  './lawyers.html',
  './login.html',
  './admin.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy: always try network, fall back to cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Skip CDN requests (don't cache external resources)
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});