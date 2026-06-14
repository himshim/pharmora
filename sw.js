/*
 Pharmora Service Worker
 Development Mode
 Network First Strategy
*/


const CACHE_NAME =
"pharmora-dev-v3";



const OFFLINE_PAGE =
"/offline.html";






/* INSTALL */


self.addEventListener(
"install",
event=>{


self.skipWaiting();


}

);







/* ACTIVATE */


self.addEventListener(
"activate",
event=>{


event.waitUntil(


caches.keys()

.then(cacheNames=>{


return Promise.all(


cacheNames.map(cache=>{


return caches.delete(cache);


})


);


})


);



self.clients.claim();


}

);










/* FETCH */


self.addEventListener(
"fetch",
event=>{


event.respondWith(



fetch(event.request)


.then(response=>{


return response;


})



.catch(()=>{


return caches.match(event.request)


.then(cached=>{


return cached ||

caches.match(OFFLINE_PAGE);


});


})



);


});