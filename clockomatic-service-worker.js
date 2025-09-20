// Choose a cache name
const cacheName = 'clockomatic-cache-v3.11.5';
// List the files to precache
const precacheResources = [
  '/',
  '/clockomaticscript.js',
  '/favicon.ico',
  '/index.html',
  '/site.webmanifest',
  '/stylesheet.css',
  '/images/icons/android-chrome-192x192.png',
  '/images/icons/android-chrome-512x512.png',
  '/images/icons/apple-touch-icon.png',
  '/images/icons/disable-fullscreen-hover.png',
  '/images/icons/disable-fullscreen.png',
  '/images/icons/enable-fullscreen-hover.png',
  '/images/icons/enable-fullscreen.png',
  '/images/icons/favicon-16x16.png',
  '/images/icons/favicon-32x32.png',
  '/images/icons/favicon.ico',
  '/images/icons/link-icon-hover.png',
  '/images/icons/link-icon.png',
  '/images/icons/menu-hover.png',
  '/images/icons/menu.png',
  '/images/icons/mstile-150x150.png',
  '/images/logos/clock-o-matic-logo.png',
];


// Helper function to cache files and handle errors

const filesUpdate = async (cache) => {
  const stack = [];
  precacheResources.forEach(file => stack.push(
    cache.add(file).catch(() => console.error(`[Service Worker] Can't load ${file} to cache`))
  ));
  return Promise.all(stack);
};


// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  console.log('[Service Worker] Caching files:', precacheResources.length, precacheResources);
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      await filesUpdate(cache);
    })(),
  );
});

// Activate event: clean up old caches and takes control of the page. Forces an update if available.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Force the service worker to take control of the page immediately
  return self.clients.claim();
});



// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const r = await caches.match(event.request);
      console.log(`[Service Worker] Fetching resource: ${event.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(event.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
      cache.put(event.request, response.clone());
      return response;
    })(),
  );
});