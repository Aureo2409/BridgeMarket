const CACHE_NAME = 'bridge-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos cache.addAll de forma tolerante a falhas
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Erro ao pré-carregar recursos no cache do Service Worker:', err);
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Ignorar pedidos do Supabase, websockets, ou APIs externas
  if (
    e.request.url.includes('supabase.co') || 
    e.request.url.includes('api') || 
    e.request.url.startsWith('chrome-extension:')
  ) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
