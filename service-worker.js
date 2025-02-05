const CACHE_NAME = 'bref-cache-v1';
const API_CACHE = 'api-cache-v1';
const API_URL = 'https://api.aelf.org/v1';
const LAST_UPDATE_KEY = 'last-update';

const urlsToCache = [
    './',
    './index.html',
    './js/main.js',
    './js/breviaire.js',
    './js/form.js',
    './js/jquery-3.6.0.js',
    './js/missel_functions.js',
    './js/psaumes_invitatoire.js',
    './js/psaumes.js',
    './js/sanctoral_functions.js',
    './js/sanctoral.js',
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
    './css/projection.css',
    './css/responsive.css',
    './css/freeSansBold.eot',
    './css/freeSansBold.ttf',
    './css/freeSansBold.woff',
    './css/freeSansBold.woff2',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                cache.addAll(urlsToCache);                
            }).then(() => {
                //preloadAPIDays(7);
                //cleanOldAPICache(7)
            })
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
      event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
      );
    }
  });
  
  // Fetch from network and cache the response
  function fetchAndCache(request, cache) {
    return fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());  // Cache the new response
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, fallback to cached data if available
        return cache.match(request);
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
            cleanOldAPICache(cache, 8);  // Remove old data
            preloadFutureData(cache, 8);  // Fetch data for the next 8 days
            cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));  // Update timestamp
          }
        });
      } else {
        // First-time cache initialization
        console.log('First-time cache initialization.');
        preloadFutureData(cache, 8);
        cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));
      }
    });
  
    // Always attempt to update the specific request in the background
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
          console.log(`Cache updated for request: ${request.url}`);
        }
      })
      .catch((error) => {
        console.error(`Failed to update cache for ${request.url}:`, error);
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
                                console.error(`Failed to preload data for ${formattedDate}:`, error);
                            });
                    } else {
                        console.log(`Data for ${formattedDate} is already cached. Skipping network request.`);
                    }
                });
            }
        }
    }
}

