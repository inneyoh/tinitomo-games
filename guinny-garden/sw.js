// Offline cache for the prototype. Bump VERSION when files change.
const VERSION = 'gg-v18';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/main.js', 'js/state.js', 'js/data.js', 'js/art.js', 'js/ui.js',
  'js/minigames/shell.js', 'js/minigames/perfume.js', 'js/minigames/brew.js', 'js/minigames/pack.js',
  'js/tablet.js', 'js/teas.js', 'js/recipebook.js', 'js/brewtutorial.js', 'js/notepad.js', 'js/encyclopedia.js', 'js/scenes/shop.js', 'js/scenes/workshop.js', 'js/scenes/garden.js',
  'assets/img/guinny-apron.webp', 'assets/img/guinny-garden.webp', 'assets/img/logo.webp',
  'assets/img/ui-panel.webp',
  ...['wall', 'floor', 'window', 'board', 'counter'].flatMap((k) => [`assets/img/shop/landscape-${k}.webp`, `assets/img/shop/portrait-${k}.webp`]),
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png',
];
self.addEventListener('install', (e) => e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
// Network first so updates show up right away; cache when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // no-cache: always ask the server for a newer file, so updates show up right away
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => {
    const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
