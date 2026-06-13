/*
 Pharmora Service Worker
*/


const CACHE_NAME =
"pharmora-cache-v1";



const FILES=[

"./",

"./index.html",

"./offline.html",

"./css/variables.css",

"./css/base.css",

"./css/components.css",

"./css/responsive.css",

"./js/app.js",

"./assets/branding/logo.svg"

];





self.addEventListener(
"fetch",
event=>{


event.respondWith(


caches.match(event.request)


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