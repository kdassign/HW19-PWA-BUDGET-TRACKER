let FILES_TO_CACHE = [
    "/",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/index.html",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/budgetDB.js"
  ];
  
  let CACHE_NAME = "static-cache-v2";
  let DATA_CACHE_NAME = "data-cache-v1";
  
  

  self.addEventListener("install", function(event) {

      event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
          console.log(FILES_TO_CACHE);
          console.log("You're files were pre-cached successfully!");
          return cache.addAll(FILES_TO_CACHE);
        })
      );
    

      self.skipWaiting();
    });
  
  
    
    self.addEventListener("activate", function(evt) {
      evt.waitUntil(
        caches.keys().then(keyList => {
          return Promise.all(
            keyList.map(key => {
              if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                console.log("Removing old cache data", key);
                return caches.delete(key);
              }
            })
          );
        })
      );
    
      self.clients.claim();
    });
    
  

    self.addEventListener("fetch", function(event) {

      if (event.request.url.includes("/api/")) {
        console.log('[Service Worker] Fetch (data)', event.request.url);
        event.respondWith(
          caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(event.request)
              .then(response => {

                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
    
                return response;
              })
              .catch(err => {
   
                return cache.match(event.request);
              });
          }).catch(err => console.log(err))
        );
    
        return;
      };
  
      event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
          
        }));
  
    });