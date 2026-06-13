/*
 Pharmora Service Worker
 Offline Learning Support
*/


const CACHE_NAME =
"pharmora-v2";



const FILES_TO_CACHE = [


"./",

"./index.html",


/* Core */

"./offline.html",

"./manifest.json",


/* Styles */

"./css/variables.css",

"./css/base.css",

"./css/components.css",

"./css/responsive.css",


/* Scripts */

"./js/app.js",

"./js/data-loader.js",


/* Pages */

"./learn/",

"./teach/",

"./tools/",

"./library/",

"./community/",

"./contribute/",


/* Branding */

"./assets/branding/logo.svg",

"./assets/branding/favicon.svg"


];








/* Install */


self.addEventListener(
"install",
event=>{


event.waitUntil(


caches.open(
CACHE_NAME
)

.then(cache=>{


return cache.addAll(
FILES_TO_CACHE
);


})


);


self.skipWaiting();


}

);









/* Activate */


self.addEventListener(
"activate",
event=>{


event.waitUntil(


caches.keys()
.then(keys=>{


return Promise.all(


keys.map(key=>{


if(key!==CACHE_NAME){


return caches.delete(key);


}


})


);


})


);


self.clients.claim();


}

);









/* Fetch */


self.addEventListener(
"fetch",
event=>{


event.respondWith(



caches.match(
event.request
)

.then(response=>{


return response ||


fetch(event.request)

.catch(()=>{


return caches.match(
"./offline.html"
);


});


})



);


}

);