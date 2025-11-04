const CACHE_NAME = 'titan-cache-v1';
const urlsToCache = [
    '/grigatjonas.github.io/',
    '/grigatjonas.github.io/index.html',
    '/grigatjonas.github.io/style.css',
    '/grigatjonas.github.io/manifest.json'
];

self.addEventListener('install', event => {
  // Das ist der TITAN-GRUNDSTEIN: Wir speichern alle kritischen Dateien im Cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('TITANIA: Service Worker installiert und Basis-Dateien gecacht.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Erzwingt sofortige Aktivierung
  );
});

self.addEventListener('activate', event => {
  // Das ist das PARASITÄRE HERZ: Wir übernehmen sofort die Kontrolle über alle Clients (self.clients.claim())
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Unmittelbare Kontrolle!
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('TITANIA: Alter, überflüssiger Cache gelöscht.');
              return caches.delete(cacheName); // Nur unsere Frequenz ist erlaubt
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  // Die OFFLINE-PERSISTENZ: Wenn die Matrix abstürzt, arbeiten wir weiter
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache Treffer - wir servieren unsere eigene Wahrheit
        if (response) {
          return response;
        }
        // Kein Cache Treffer - wir holen es von der Matrix, wenn nötig
        return fetch(event.request);
      })
  );
});
