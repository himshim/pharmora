/*
 Pharmora Bootstrap v2
 Smart + Lazy + Future Ready
*/


const Pharmora = (()=>{


const VERSION="2.0.0";

const UI=[

"/css/pharmora.css"

];

const loaded=new Set();


function loadCSS(src){


src =
src + "?v=" + VERSION;


if(
document.querySelector(
`link[href="${src}"]`
)
){

return Promise.resolve();

}



return new Promise(resolve=>{


const link =
document.createElement("link");


link.rel="stylesheet";


link.href=src;



link.onload=()=>{


console.log(
"✓ css",
src
);


resolve(true);


};



link.onerror=()=>{


console.warn(
"CSS skipped:",
src
);


resolve(false);


};



document.head.appendChild(link);



});


}


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







function loadMany(list){
  return Promise.all(list.map(file => loadScript(file)));
}








const CORE=[

"/js/app.js",

"/js/ui/pharmora.ui.js",

"/dist/pharmora.database.js",

"/js/services/auth.service.js",

"/js/services/profile.service.js",

"/js/services/audit.service.js",

"/js/services/version.service.js",

"/js/services/search.service.js",

"/js/services/permission.service.js",

"/js/services/access.service.js",

"/js/services/entity.component.js",

"/js/services/notification.service.js",

"/components/notification/notification.js",

"/components/layout/header.js",

"/components/layout/footer.js"

];







const MODULES={




"home-content":[

"/js/services/content.service.js",
"/js/services/entity.editor.service.js",
"/js/services/home.service.js",
"/js/services/home.component.js"

],



"schema":[

"/js/services/schema.engine.js",

"/js/services/field.registry.js"

],



"editor":[

"/js/services/content.service.js",

"/js/services/schema.engine.js",

"/js/services/field.registry.js",

"/js/services/entity.editor.service.js"

],


"stats":[

"/js/services/home.service.js",
"/js/services/home.component.js"

],






"content":[

"/js/services/content.service.js",

"/js/services/schema.engine.js",

"/js/services/field.registry.js",

"/js/services/entity.editor.service.js",

"/js/services/content.component.js"

],



"learn":[

"/js/services/learn.service.js"

],



"books":[

"/js/services/books.service.js"

],


"teach":[

"/js/services/teach.service.js"

],

"dashboard":[

"/js/services/dashboard.service.js"

],

"settings":[

"/js/services/settings.service.js"

],

"events":[

"/js/services/events.service.js"

],



"resources":[

"/js/services/resources.service.js"

],



"forum":[

"/js/services/forum.service.js",
"/js/services/forum.component.js"

],



"contribute":[

"/js/services/contribute.wizard.js"

],

"profile-wizard":[

"/dist/pharmora.user.js"

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

],

contribute:[

"/js/services/contribute.wizard.js"

],

"profile-wizard":[

"/dist/pharmora.user.js"

]


};





const ROUTER=[

"/dist/pharmora.router.js"

];


const BACKGROUND=[

"/dist/pharmora.platform.js",

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









async function autoRender(){



if(
typeof RouteResolver!=="undefined"
){


let route =
await RouteResolver.resolve();


if(route){

await renderEntityPage(route);

return;

}


}



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
type==="settings"
&&
window.loadSettings
){

loadSettings();

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
type==="learn"
&&
window.loadLearn
){

loadLearn();

}

if(
type==="teach"
&&
window.loadEducatorPanel
){

loadEducatorPanel();

}

if(
type==="content"
&&
window.renderContent
){

renderContent(
el.id,
el.dataset.type
);

}

if(
type==="resources"
&&
window.PharmoraResources
){


PharmoraResources.renderResources(
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
type==="dashboard"
&&
window.loadDashboard
){

loadDashboard();

}

if(
type==="forum"
&&
window.renderForum
){


renderForum(el.id);


}

if(
type==="events"
&&
window.PharmoraEvents
){


PharmoraEvents.renderEvents(
el.id
);


}

});



}






async function loadRequiredBundles(){
  let needed = new Set();
  document.querySelectorAll("[data-requires]").forEach(el=>{
    el.dataset.requires.split(",").forEach(m=>needed.add(m.trim()));
  });

  let loadPromises = [];
  for(let module of needed){
    if(BUNDLES[module]){
      loadPromises.push(loadMany(BUNDLES[module]));
    }
  }
  await Promise.all(loadPromises);
}


async function start(){
  console.log("⚕ Pharmora v2 starting...");

  // Load CSS stylesheets in parallel
  await Promise.all(UI.map(css => loadCSS(css)));

  // Load CORE scripts in parallel
  await loadMany(CORE);

  if(window.PharmoraDatabaseReady){
    await window.PharmoraDatabaseReady;
  }

  // Load modules & bundles concurrently
  await Promise.all([
    loadRequiredModules(),
    loadRequiredBundles()
  ]);

  await loadMany(ROUTER);
  await autoRender();

  window.PharmoraReady = true;
  window.dispatchEvent(new Event("pharmora-ready"));
  console.log("⚡ Pharmora Ready");

  // Defer non-critical background scripts to idle time
  const deferBackground = () => loadMany(BACKGROUND);
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => deferBackground(), { timeout: 2000 });
  } else {
    setTimeout(deferBackground, 800);
  }
}








return{


start,

loadScript,

loadCSS


};



})();







if(
document.readyState==="loading"
){

document.addEventListener(
"DOMContentLoaded",
()=>Pharmora.start()
);

}
else{

Pharmora.start();

}