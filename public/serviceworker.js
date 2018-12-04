self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('push', function(event) {

 
  event.waitUntil(

 
    self.registration.showNotification('Mail', {
      body: 'You have received a new message.',
    })
  );
});