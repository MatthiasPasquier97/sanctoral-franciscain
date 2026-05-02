const CACHE_NAME = 'static-v2';
const STATIC_CACHE = CACHE_NAME;
const API_CACHE = 'api-cache-v2';
const LAST_UPDATE_KEY = new Request('__last_api_update__');
const API_URL = 'https://api.aelf.org/v1';

const urlsToCache = [
  './',
  './sanctoral.webmanifest',
  './index.html',
  './js/main-v4.js',
  './js/breviaire-v5.js',
  './js/form-v4.js',
  './js/jquery-3.6.0.js',
  './js/missel_functions-v2.js',
  './js/psaumes_invitatoire-v2.js',
  './js/psaumes-v2.js',
  './js/hymnes-v2.js',
  './js/sanctoral_functions-v3.js',
  './js/scroll.js',
  './img/app-icon.png',
  './img/close.svg',
  './img/dropdown.svg',
  './img/favicon.png',
  './img/polygon_default.svg',
  './img/polygon_green.svg',
  './img/polygon_pink.svg',
  './img/polygon_purple.svg',
  './img/polygon_red.svg',
  './img/polygon_white.svg',
  './css/projection.css?v=1',
  './css/responsive.css?v=1',
  './css/FreeSansBold.eot',
  './css/FreeSansBold.ttf',
  './css/FreeSansBold.woff',
  './css/FreeSansBold.woff2',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@40,300,0,0',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      const apiCache = await caches.open(API_CACHE);

      await staticCache.addAll(urlsToCache);
      console.log('Static assets cached.');

      await preloadFutureData(apiCache, 7);
      console.log('Preloaded API data for next 7 days.');

      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  // Handle API requests
  if (requestUrl.origin === new URL(API_URL).origin) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          event.waitUntil(backgroundCacheUpdate(cache, request));
          return cachedResponse;
        } else {
          return fetchAndCache(request, cache);
        }
      }).catch(() => {
        return new Response(JSON.stringify({ message: 'Data not available offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
  } else {
    // Handle static assets
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // No network; return cached only
          });

          return cachedResponse || fetchPromise;
        })
      )
    );
  }
});

function fetchAndCache(request, cache) {
  return fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    return new Response(JSON.stringify({
      message: 'You are offline, and this resource could not be fetched.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  });
}

function backgroundCacheUpdate(cache, request) {
  const now = Date.now();

  return cache.match(LAST_UPDATE_KEY).then((lastUpdateResponse) => {
    if (lastUpdateResponse) {
      return lastUpdateResponse.json().then((lastUpdateTime) => {
        const timeSinceLastUpdate = now - lastUpdateTime.timestamp;

        if (timeSinceLastUpdate > 24 * 60 * 60 * 1000) {
          console.log('Updating API cache after 24h...');
          cleanOldAPICache(cache, 2);
          return preloadFutureData(cache, 8).then(() => {
            return cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));
          });
        }
      });
    } else {
      // First-time cache setup
      console.log('Initializing API cache...');
      return preloadFutureData(cache, 8).then(() => {
        return cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));
      });
    }
  });
}

function cleanOldAPICache(cache, daysToKeep) {
  cache.keys().then((cachedRequests) => {
    const today = new Date();

    cachedRequests.forEach((request) => {
      const url = new URL(request.url);
      const parts = url.pathname.split('/');
      const dateParam = parts[3];

      if (dateParam) {
        const cachedDate = new Date(dateParam);
        const diffDays = (today - cachedDate) / (1000 * 60 * 60 * 24);
        if (diffDays > daysToKeep) {
          cache.delete(request);
          console.log(`Deleted API cache for: ${dateParam}`);
        }
      }
    });
  });
}

function preloadFutureData(cache, daysAhead) {
  const today = new Date();
  const offices = ['informations', 'messes', 'laudes', 'lectures', 'tierce', 'sexte', 'none', 'vepres', 'complies'];
  const zones = ['romain', 'france'];

  const fetchTasks = [];

  for (let i = 0; i < daysAhead; i++) {
    for (const office of offices) {
      for (const zone of zones) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        const apiUrl = `${API_URL}/${office}/${formattedDate}/${zone}`;

        const fetchTask = cache.match(apiUrl).then(cachedResponse => {
          if (!cachedResponse) {
            return fetch(apiUrl)
              .then(response => {
                if (response.ok) {
                  return cache.put(apiUrl, response.clone());
                }
              })
              .catch(err => {
                console.warn(`Could not preload ${apiUrl}`, err);
              });
          }
        });

        fetchTasks.push(fetchTask);
      }
    }
  }

  return Promise.allSettled(fetchTasks);
}
