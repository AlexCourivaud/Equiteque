// Service Worker pour PWA
const CACHE_NAME = "equiteque-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/products.js",
  "/js/storage.js",
  "/js/pdf-generator.js",
  "/assets/Certification_bio_AB.jpg",
  "/assets/Eurofeuille_couleurAB.jpg",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache ouvert");
      return cache.addAll(urlsToCache);
    }),
  );
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Suppression ancien cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - retourner la réponse
      if (response) {
        return response;
      }

      // Cloner la requête
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Cloner la réponse
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});

// Made with Bob
