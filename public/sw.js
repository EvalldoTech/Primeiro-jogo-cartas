/**
 * sw.js — Service Worker.
 * Objetivo: o jogo abrir mesmo offline depois de instalado no celular/tablet.
 * Estratégia: cache-first para os arquivos do app, rede quando não houver cache.
 *
 * IMPORTANTE AO ATUALIZAR O JOGO: sempre que o build mudar, troque o número
 * em CACHE (v2, v3...). Assim o navegador descarta a versão antiga guardada e
 * baixa a nova — sem isso, quem já instalou continuaria vendo a versão velha.
 */
const CACHE = 'esmeralda-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
      return response;
    }).catch(() => cached)),
  );
});
