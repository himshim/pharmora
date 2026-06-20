/*
 Pharmora Bootstrap v2
 Smart + Lazy + Future Ready
*/


const Pharmora = (()=>{


const VERSION="2.0.0";


const loaded=new Set();





function loadScript(src){


src =
src + "?v=" + VERSION;


if(loaded.has(src)){

return Promise.resolve();

}



return new Promise(resolve=>{


const s=document.createElement("script");


s.src=src;



s.onload=()=>{


loaded.add(src);


console.log(
"✓",
src
);


resolve(true);


};




s.onerror=()=>{


console.warn(
"Skipped:",
src
);


resolve(false);


};



document.head.appendChild(s);



});


}







async function loadMany(list){


for(const file of list){


await loadScript(file);


}


}








const CORE=[


"/js/app.js",

"/dist/pharmora.database.js",

"/components/layout/header.js",

"/components/layout/footer.js"


];








const MODULES={




"home-content":[

"/js/services/content.service.js",
"/js/services/home.service.js",
"/js/services/home.component.js"

],




"stats":[

"/js/services/home.service.js",
"/js/services/home.component.js"

],






"content":[

"/js/services/content.service.js",
"/js/services/filter.component.js",
"/js/services/content.component.js"

],







"books":[

"/js/services/books.service.js"

],






"events":[

"/js/services/events.service.js"

],







"forum":[

"/js/services/forum.service.js",
"/js/services/forum.component.js",
"/js/services/forum.modal.js"

]



};



const BUNDLES={


user:[

"/dist/pharmora.user.js"

],


admin:[

"/dist/pharmora.admin.js"

],


research:[

"/dist/pharmora.research.js"

],


career:[

"/dist/pharmora.career.js"

]


};





const BACKGROUND=[

"/dist/pharmora.platform.js",

"/dist/pharmora.router.js",

"/dist/pharmora.search.js"

];








async function loadRequiredModules(){



let needed =
new Set();




/*
Load modules required for rendering
*/


document

.querySelectorAll("[data-render]")

.forEach(el=>{



let module =
el.dataset.render;



if(
MODULES[module]
){


MODULES[module]
.forEach(

file=>needed.add(file)

);


}



});







/*
Load modules required as dependency
*/


document

.querySelectorAll("[data-requires]")

.forEach(el=>{



el.dataset.requires

.split(",")

.forEach(module=>{



module =
module.trim();



if(
MODULES[module]
){


MODULES[module]
.forEach(

file=>needed.add(file)

);


}



});



});








await loadMany(

[...needed]

);



}









function autoRender(){



document

.querySelectorAll("[data-render]")

.forEach(el=>{



let type =
el.dataset.render;





if(
type==="stats"
&&
window.renderHomeStats
){


renderHomeStats(el.id);


}




if(
type==="home-content"
&&
window.renderHomeContent
){


renderHomeContent(
el.id,
el.dataset.mode
);


}






if(
type==="content"
&&
window.renderContent
){


renderContent(
el.dataset.type,
el.id
);


}

if(
type==="books"
&&
window.PharmoraBooks
){


PharmoraBooks.renderBooks(
el.id
);


}



if(
type==="forum"
&&
window.renderForum
){


renderForum(el.id);


}



});



}






async function loadRequiredBundles(){



let needed =
new Set();




document

.querySelectorAll("[data-requires]")

.forEach(el=>{


let modules =
el.dataset.requires
.split(",");



modules.forEach(

m=>needed.add(

m.trim()

)

);


});







for(
let module of needed
){



if(
BUNDLES[module]
){


await loadMany(

BUNDLES[module]

);


}



}



}


async function start(){


console.log(
"⚕ Pharmora v2 starting..."
);




await loadMany(
CORE
);




if(
window.PharmoraDatabaseReady
){

await window.PharmoraDatabaseReady;

}




await loadRequiredModules();

await loadRequiredBundles();


autoRender();




window.dispatchEvent(

new Event(
"pharmora-ready"
)

);




console.log(
"⚡ Pharmora Ready"
);





/*
 Background loading
*/

setTimeout(()=>{


loadMany(
BACKGROUND
);


},800);



}








return{


start,

loadScript


};



})();







Pharmora.start();