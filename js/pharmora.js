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









const BACKGROUND=[

"/dist/pharmora.platform.js",

"/dist/pharmora.search.js"

];





const USER=[

"/dist/pharmora.user.js"

];


const ADMIN=[

"/dist/pharmora.admin.js"

];



async function loadRequiredModules(){



let needed=new Set();




document

.querySelectorAll("[data-render]")

.forEach(el=>{



let group =
MODULES[
el.dataset.render
];



if(group){


group.forEach(

x=>needed.add(x)

);


}



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
type==="forum"
&&
window.renderForum
){


renderForum(el.id);


}



});



}









async function start(){


console.log(
"⚕ Pharmora v2 starting..."
);



await loadMany(
CORE
);





if(window.PharmoraDatabaseReady){


await window.PharmoraDatabaseReady;


}




await loadRequiredModules();




autoRender();




window.dispatchEvent(

new Event("pharmora-ready")

);




console.log(
"⚡ Pharmora Ready"
);







setTimeout(async()=>{


await loadMany(
BACKGROUND
);




// logged users only

if(
localStorage.getItem("pharmora_user")
){

await loadMany(
USER
);

}




// admin pages only

if(
location.pathname
.startsWith("/admin")
){

await loadMany(
ADMIN
);

}


},800);







return{


start,

loadScript


};



})();





Pharmora.start();