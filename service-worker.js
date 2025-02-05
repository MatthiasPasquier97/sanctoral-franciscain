const CACHE_NAME = 'bref-cache-v1';
const API_CACHE = 'api-cache-v1';
const API_URL = 'https://api.aelf.org/v1';
const LAST_UPDATE_KEY = 'last-update';

const urlsToCache = [
    '/',
    '/index.html',
    '/js/main.js',
    '/js/breviaire.js',
    '/js/form.js',
    '/js/jquery-3.6.0.js',
    '/js/missel_functions.js',
    '/js/psaumes_invitatoire.js',
    '/js/psaumes.js',
    '/js/sanctoral_functions.js',
    '/js/sanctoral.js',
    '/js/scroll.js',
    '/img/app-icon.png',
    '/img/close.svg',
    '/img/dropdown.svg',
    '/img/favicon.png',
    '/img/polygon_default.svg',
    '/img/polygon_green.svg',
    '/img/polygon_pink.svg',
    '/img/polygon_purple.svg',
    '/img/polygon_red.svg',
    '/img/polygon_white.svg',
    '/css/projection.css',
    '/css/responsive.css',
    '/css/freeSansBold.eot',
    '/css/freeSansBold.ttf',
    '/css/freeSansBold.woff',
    '/css/freeSansBold.woff2',
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


/*// Fonction pour précharger les données des 7 prochains jours
async function preloadAPIDays(days) {
    //cleanOldAPICache(7);
    console.log('Préchargement des données API pour les 7 prochains jours');
    const cache = await caches.open(API_CACHE);
    const today = new Date();
    const offices = ['informations', 'messes', 'laudes', 'lectures', 'tierce', 'sexte', 'none', 'vepres', 'complies'];
    const zones = ['romain', 'francais'];
    for (let i = 0; i < days; i++) {
        for (let j = 0; j < offices.length; j++) {
            for (let k = 0; k < zones.length; k++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const formattedDate = date.toISOString().split('T')[0];  // Format AAAA-MM-JJ
                const apiUrl = `${API_URL}/${offices[j]}/${formattedDate}/${zones[k]}`;
                try {
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        await cache.put(apiUrl, response.clone());
                    }
                } catch (error) {
                    console.error(`Erreur lors du préchargement des données pour ${formattedDate}`, error);
                }
                
            }
        }
    }
  }

  async function cleanOldAPICache(daysToKeep) {
    console.log('Nettoyage du cache API');
    const cache = await caches.open(API_CACHE);
    const cachedRequests = await cache.keys();
    const today = new Date();
  
    await Promise.all(
      cachedRequests.map(async (request) => {
        const url = new URL(request.url);
        //const dateParam = url.searchParams.get('date');  // On suppose que l'URL a un paramètre ?date=YYYY-MM-DD
        const dateParam = url.pathname.split('/')[3];
        
        
        if (dateParam) {
          const cachedDate = new Date(dateParam);
          const diffDays = (cachedDate-today) / (1000 * 60 * 60 * 24);  // Différence en jours
          console.log(diffDays);
          if (diffDays < -1) {
            await cache.delete(request);  // Supprime les données si plus anciennes que daysToKeep
            console.log(`Données supprimées du cache pour la date : ${dateParam}`);
          }
        }
      })
    );
  }


async function cache_api_update(params) {
    const lastUpdateResponse = await cache.match(LAST_UPDATE_KEY);
    const now = Date.now();

    if (lastUpdateResponse) {
        const lastUpdateTime = await lastUpdateResponse.json();
        const timeSinceLastUpdate = now - lastUpdateTime.timestamp;

        if (timeSinceLastUpdate > 24 * 60 * 60 * 1000) {  // Plus de 24h écoulées
            console.log('Plus de 24h depuis la dernière mise à jour, nettoyage et mise à jour du cache.');
            await cleanOldAPICache(8);  // Nettoyage des données obsolètes
            await preloadAPIDays(8);  // Préchargement des nouvelles données
            await cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));  // Mettre à jour le timestamp
        }
    } else {
        // Si aucun timestamp, on initialise la première mise à jour
        console.log('Première mise à jour du cache.');
        await preloadAPIDays(8);
        await cache.put(LAST_UPDATE_KEY, new Response(JSON.stringify({ timestamp: now })));
    }
  }
  

  self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
  
    // Si la requête concerne l'API, on applique le cache dynamique
    if (requestUrl.origin === new URL(API_URL).origin) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          // Si les données sont dans le cache, on les renvoie
          if (cachedResponse) {
            console.log('Données récupérées du cache');
            return cachedResponse;
          }
          // Sinon, on fait une requête réseau et on met à jour le cache
          return fetch(event.request).then((networkResponse) => {
            console.log('Données récupérées du réseau');
            
            return caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              //cache_api_update();
              return networkResponse;
            });
          }).catch(() => {
            // Si la requête échoue et rien n'est dans le cache, retourner un message d'erreur
            return new Response(JSON.stringify({ message: 'Données non disponibles hors ligne' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
      );
    } else {
      // Pour les autres requêtes (ressources statiques), on utilise le cache habituel
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    }
  });*/


/*// Gestion des requêtes fetch
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
  
    // Si la requête concerne l'API, on gère le cache dynamique
    if (requestUrl.origin === new URL(API_URL).origin) {
      event.respondWith(
        caches.open(API_CACHE).then(async (cache) => {
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            console.log('Données récupérées du cache');
            return cachedResponse;  // Retourne la réponse si elle est déjà dans le cache
          } else {
            // Si pas dans le cache, on fait une requête réseau
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok) {
              console.log('Données récupérées du réseau');
              cache.put(event.request, networkResponse.clone());  // Ajoute au cache
              await handleCacheUpdate(cache);  // Vérifie si le cache doit être nettoyé/mis à jour
              return networkResponse;
            }
          }
        }).catch(() => {
          // Si offline et pas dans le cache, retourner un message d'erreur
          return new Response(JSON.stringify({ message: 'Données non disponibles hors ligne' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    } else {
      // Pour les autres requêtes (fichiers statiques)
      event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
      );
    }
  });*/


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

                fetch(apiUrl)
                    .then((response) => {
                        if (response.ok) {
                            cache.put(apiUrl, response.clone());
                            console.log(`Preloaded data for: ${formattedDate}`);
                        }
                    })
                    .catch((error) => {
                        console.error(`Error preloading data for ${formattedDate}:`, error);
                    });
            }
        }
    }
}

