// Bridge — Service Worker
// Estratégia: network-first com fallback em cache, para garantir que dados
// financeiros (taxas, pedidos) são sempre os mais recentes possível, mas a
// app continua a abrir mesmo com ligação fraca ou intermitente.

const CACHE_VERSION = "bridge-v1";
const CACHE_NAME = `${CACHE_VERSION}-shell`;

// Apenas o essencial para a app abrir offline — o resto (JS/CSS com hash)
// é cacheado dinamicamente à medida que é pedido.
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("bridge-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Nunca intercepta chamadas à API do Supabase ou a outros domínios externos —
  // dados financeiros e de autenticação têm de ir sempre direto à rede.
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isApiCall = url.hostname.includes("supabase.co") || request.method !== "GET";

  if (!isSameOrigin || isApiCall) {
    return; // deixa o pedido passar normalmente, sem cache
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Guarda uma cópia da resposta fresca no cache para uso offline futuro
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Sem rede — tenta servir do cache; se não houver, falha graciosamente
        return caches.match(request).then((cached) => {
          return cached || caches.match("/");
        });
      })
  );
});
