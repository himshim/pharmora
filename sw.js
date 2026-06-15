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











/* =========================
   FETCH
========================= */


self.addEventListener(

"fetch",

event=>{





if(

event.request.method !== "GET"

){


return;


}










event.respondWith(



fetch(

event.request

)



.then(response=>{





let copy =

response.clone();






caches

.open(

CACHE_NAME

)

.then(cache=>{


cache.put(

event.request,

copy

);


});






return response;



})








.catch(async()=>{






let cached =

await caches.match(

event.request

);





if(cached){


return cached;


}








if(

event.request.mode==="navigate"

){



return caches.match(

"./offline.html"

);



}



})



);



}

);