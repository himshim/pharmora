/*
 Pharmora Service Worker
 Production Ready
 Network + Cache Strategy
*/





const CACHE_NAME =
"pharmora-v1";





const CORE_ASSETS = [


"./",

"./index.html",

"./offline.html",



"./css/variables.css",

"./css/base.css",

"./css/components.css",

"./css/responsive.css",



"./js/app.js",

"./js/search.js",



"./config/site.json",

"./config/navigation.json",



"./assets/branding/logo.svg",



"./manifest.json"


];









/* =========================
   INSTALL
========================= */


self.addEventListener(

"install",

event=>{



event.waitUntil(



caches

.open(

CACHE_NAME

)

.then(cache=>{


return cache.addAll(

CORE_ASSETS

);


})



);



self.skipWaiting();



}

);










/* =========================
   ACTIVATE
========================= */


self.addEventListener(

"activate",

event=>{



event.waitUntil(



caches.keys()

.then(keys=>{



return Promise.all(



keys

.filter(key=>key!==CACHE_NAME)

.map(key=>caches.delete(key))



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


/*
Ignore unsupported requests
(chrome extensions etc.)
*/


if(

!event.request.url.startsWith("http")

){


return;


}




event.respondWith(



fetch(event.request)


.then(response=>{



let clone =
response.clone();




caches.open(

CACHE_NAME

)

.then(cache=>{



cache.put(

event.request,

clone

)

.catch(()=>{});



});





return response;



})





.catch(()=>{



return caches.match(

event.request

)


.then(cached=>{



return cached ||

caches.match(

OFFLINE_PAGE

);



});



})



);



});