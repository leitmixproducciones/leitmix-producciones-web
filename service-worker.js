const CACHE_NAME = "leitmix-panel-v1";

const ARCHIVOS = [
  "admin/panel.html",
  "admin.js",
  "supabase.js",
  "assets/img/leitmix-logo.jpeg"
];


self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(ARCHIVOS))

  );

});


self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
    .then(response => {

      return response || fetch(event.request);

    })

  );

});
