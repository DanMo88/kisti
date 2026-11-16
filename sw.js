// Kisti service worker v6 (no sound files; old caches that held them are deleted on activate) · HTML/JSON network-first · css/js stale-while-revalidate · media cache-on-demand
const V = 'kisti-v6', MEDIA = 'kisti-media-v4';
const SHELL = ['./', 'index.html', 'css/styles.css?v=6', 'js/app.js?v=6', 'js/data.js?v=6', 'js/data-op.js?v=6', 'js/data-pa.js?v=6', 'js/data-av.js?v=6', 'js/install.js?v=6', 'manifest.webmanifest',
  'fonts/Vazirmatn-Regular.woff2', 'fonts/Vazirmatn-Bold.woff2', 'fonts/Vazirmatn-Black.woff2', 'fonts/NotoSansOldPersian-Regular.woff2', 'fonts/NotoSansInscriptionalPahlavi-Regular.woff2', 'fonts/NotoSansAvestan-Regular.woff2', 'fonts/Fredoka-Bold.woff2', 'fonts/Alegreya-Italic.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'images/shir-o-khorshid.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith('kisti-') && k !== V && k !== MEDIA).map(k => caches.delete(k))))
  .then(() => Promise.all([V, MEDIA].map(n => caches.open(n).then(c => c.keys().then(rs => Promise.all(rs.filter(r => /\/audio\/|\.mp3$/.test(new URL(r.url).pathname)).map(r => c.delete(r))))))))
  .then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\/(images|fonts|icons)\//.test(url.pathname)) {
    e.respondWith(caches.match(url.origin + url.pathname).then(hit => hit || fetch(req).then(r => { if (r.ok && r.status === 200) { const cp = r.clone(); caches.open(MEDIA).then(c => c.put(url.origin + url.pathname, cp)); } return r; })));
  } else if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('.json')) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; }).catch(() => hit); return hit || net; }));
  }
});
