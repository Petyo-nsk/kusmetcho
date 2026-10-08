// Service worker — пази приложението на телефона, за да работи и без интернет.
// При промяна на файловете вдигни версията, за да се изчисти старият кеш.
const CACHE = 'kusmetcho-v3';
const LANGS = ['bg', 'en', 'ru', 'ro', 'el', 'it', 'es', 'fr', 'tr'];
const FILES = ['./', './index.html', './manifest.json', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './fonts/themes.css',
  ...['cyrillic-ext', 'cyrillic', 'greek', 'latin-ext', 'latin'].map((s) => `./fonts/comfortaa-${s}.woff2`),
  ...LANGS.map((l) => `./lang/${l}.js`)];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Първо от интернет (за да идва новата версия веднага), а без връзка — от кеша
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html')))
  );
});
