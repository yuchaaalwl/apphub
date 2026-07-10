// ランチャー自身のシェルだけをキャッシュする最小限の Service Worker。
// リンク先の各アプリ（別オリジン）はキャッシュしない。
const CACHE = 'app-hub-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // 他オリジンへの遷移はそのまま素通し
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
