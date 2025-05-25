const CACHE_NAME = 'bref-cache-v1';
const API_CACHE = 'api-cache-v1';
const API_URL = 'https://api.aelf.org/v1';
const LAST_UPDATE_KEY = 'last-update';
const VERSION = '6'; // Version of the service worker

const urlsToCache = [
    './',
    './sanctoral.webmanifest',
    './index.html',
    './js/main-v4.js',
    './js/breviaire-v4.js',
    './js/form-v4.js',
    './js/jquery-3.6.0.js',
    './js/missel_functions-v2.js',
    './js/psaumes_invitatoire-v2.js',
    './js/psaumes-v2.js',
    './js/hymnes-v2.js',
    './js/sanctoral_functions-v2.js',
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
        // Open caches for static assets and API data
        const staticCache = await caches.open(CACHE_NAME);
        const apiCache = await caches.open(API_CACHE);
  
        // Cache static assets
        await staticCache.addAll(urlsToCache);
  
        console.log('Static assets cached.');
        // Preload future API data (e.g., next 7 days)
        await preloadFutureData(apiCache, 7);
        console.log('Preloaded API data for the next 7 days.');
        // Force activation immediately
        self.skipWaiting();
      })()
    );
  });
  

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

  self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
  
    // Handle API requests
    if (requestUrl.origin === new URL(API_URL).origin) {
      event.respondWith(
        caches.open(API_CACHE).then(async (cache) => {
          const cachedResponse = await cache.match(event.request);
  
          if (cachedResponse) {
            // Return cached response immediately for faster performance
            console.log('Cached data retrieved');
            backgroundCacheUpdate(cache, event.request);  // Update cache in background
            return cachedResponse;
          } else {
            console.log('Fetching data from network');
            // If not in cache, fetch from network and cache it
            return fetchAndCache(event.request, cache);
          }
        }).catch(() => {
          // If offline and no cache available, return an error response
          return new Response(JSON.stringify({ message: 'Data not available offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    } else {
      // Handle non-API requests (static files)
      /*event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
      );*/
      event.respondWith(
        caches.open(STATIC_CACHE).then((cache) =>
          cache.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                // Update the cache with the latest version
                cache.put(request, networkResponse.clone());
                return networkResponse;
              })
              .catch(() => {
                // If the fetch fails, do nothing (we still return the cached version)
              });
  
            // Return cached version immediately, and update in background
            return cachedResponse || fetchPromise;
          })
        )
      );
    }
  });
  
  // Fetch from network and cache the response
  function fetchAndCache(request, cache) {
    return fetch(request)
      .then((response) => {
        // If fetch is successful, cache the response
        cache.put(request, response.clone());
        return response;
      })
      .catch(() => {
        // If network request fails, return a fallback response
        return new Response(JSON.stringify({
          message: 'You are offline, and this resource could not be fetched.',
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503  // Service Unavailable
        });
      });
  }
  
  
  // Background cache update logic
  function backgroundCacheUpdate(cache, request) {
    cache.match(LAST_UPDATE_KEY).then((lastUpdateResponse) => {
      const now = Date.now();
  
      if (lastUpdateResponse) {
        lastUpdateResponse.json().then((lastUpdateTime) => {
          const timeSinceLastUpdate = now - lastUpdateTime.timestamp;
  
          if (timeSinceLastUpdate > 24 * 60 * 60 * 1000) {  // More than 24 hours passed
            console.log('More than 24 hours since last update. Cleaning and updating cache.');
            cleanOldAPICache(cache, 2);  // Remove old data
            var success = preloadFutureData(cache, 8);  // Fetch data for the next 8 days
            if (success){
              cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));  // Update timestamp
            }
            
          }
        });
      } else {
        // First-time cache initialization
        console.log('First-time cache initialization.');
        preloadFutureData(cache, 8);
        cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));
      }
    });
  }

// Clean API data older than specified days
function cleanOldAPICache(cache, daysToKeep) {
  cache.keys().then((cachedRequests) => {
    const today = new Date();

    cachedRequests.forEach((request) => {
      const url = new URL(request.url);
      const dateParam = url.pathname.split('/')[3];

      if (dateParam) {
        const cachedDate = new Date(dateParam);
        const diffDays = (today - cachedDate) / (1000 * 60 * 60 * 24);

        if (diffDays > daysToKeep) {
          cache.delete(request);
          console.log(`Deleted cached data for: ${dateParam}`);
        }
      }
    });
  });
}

// Preload data for the next N days
function preloadFutureData(cache, daysAhead) {
    const today = new Date();
    const offices = ['informations', 'messes', 'laudes', 'lectures', 'tierce', 'sexte', 'none', 'vepres', 'complies'];
    const zones = ['romain', 'france'];
    var success = true;
    for (let i = 0; i < daysAhead; i++) {
        for (let j = 0; j < offices.length; j++) {
            for (let k = 0; k < zones.length; k++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const formattedDate = date.toISOString().split('T')[0];  // Format AAAA-MM-JJ
                const apiUrl = `${API_URL}/${offices[j]}/${formattedDate}/${zones[k]}`;

                // Check if the data for this date is already cached
                cache.match(apiUrl).then((cachedResponse) => {
                    if (!cachedResponse) {
                        // Only fetch from network if not already in cache
                        fetch(apiUrl)
                            .then((response) => {
                                if (response.ok) {
                                    cache.put(apiUrl, response.clone());
                                    console.log(`Preloaded and cached data for: ${formattedDate}`);
                                }
                            })
                            .catch((error) => {
                              success = false;
                              console.error(`Failed to preload data for ${formattedDate}:`, error);
                            });
                    } else {
                        console.log(`Data for ${formattedDate} is already cached. Skipping network request.`);
                    }
                });
            }
        }
    }
    return success;
}

