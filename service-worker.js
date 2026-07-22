const CACHE_NAME = "leitmix-panel-v2";

const ARCHIVOS = [
  "admin/login.html",
  "admin/panel.html",
  "admin.js",
  "supabase.js",
  "assets/img/leitmix-logo.jpeg",
  "manifest.json"
];


// Instalar nueva versión
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(ARCHIVOS))

  );

});


// Activar y borrar caché vieja
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if(key !== CACHE_NAME){

            return caches.delete(key);

          }

        })

      );

    })

  );

  self.clients.claim();

});


// Buscar archivos
self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)
    .catch(()=>caches.match(event.request))

  );

});
