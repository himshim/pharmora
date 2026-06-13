/*
 Pharmora Service Worker
*/


const CACHE_NAME =
"pharmora-cache-v1";



const FILES=[

"./",

"./index.html",

"./css/variables.css",

"./css/base.css",

"./css/components.css",

"./css/responsive.css",

"./js/app.js",

"./assets/branding/logo.svg"

];





self.addEventListener(
"install",
event=>{


event.waitUntil(


caches.open(CACHE_NAME)

.then(cache=>{

return cache.addAll(FILES);

})


);


}

);







self.addEventListener(
"fetch",
event=>{


event.respondWith(


caches.match(event.request)

.then(response=>{


return response ||
fetch(event.request);


})


);


}

);