/*
 Pharmora Global Bootstrap

 Single entry point for entire platform
*/


const PHARMORA_MODULES = [



/* =====================
 CORE
===================== */

"/js/app.js",



/* =====================
 DATABASE ENGINE
===================== */

"/js/services/database.bundle.js",





/* =====================
 SERVICES
===================== */


"/js/services/auth.service.js",

"/js/services/storage.service.js",



/* Content engines */

"/js/services/content.service.js",

"/js/services/books.service.js",

"/js/services/events.service.js",

"/js/services/resources.service.js",

"/js/services/learn.service.js",



/* Platform */

"/js/services/features.service.js",

"/js/services/analytics.service.js",

"/js/services/activity.service.js",

"/js/services/notification.service.js",

"/js/services/user-notification.service.js",

"/js/services/profile.service.js",

"/js/services/reputation.service.js",

"/js/services/verification.service.js",

"/js/services/permission.service.js",

"/js/services/version.service.js",







/* =====================
 COMPONENT HELPERS
===================== */


"/js/services/filter.component.js",

"/js/services/content.component.js",

"/js/services/forum.component.js",

"/js/services/forum.modal.js",







/* =====================
 UI COMPONENTS
===================== */


"/components/layout/header.js",

"/components/layout/footer.js",

"/components/notification/notification.js",







/* =====================
 FEATURES
===================== */


"/js/search.js"


];









function loadPharmoraScript(src){


return new Promise(resolve=>{


let script =
document.createElement("script");


script.src=src;



script.onload=()=>{


console.log(
"✓",
src
);



if(
src.includes("database.bundle.js")
&&
window.PharmoraDatabaseReady
){


window.PharmoraDatabaseReady
.then(()=>resolve(true));


}


else{


resolve(true);


}



};




script.onerror=()=>{


console.warn(
"Skipped:",
src
);


resolve(false);


};




document.head.appendChild(script);



});


}










async function bootPharmora(){



console.log(

"⚕ Starting Pharmora..."

);






for(
const file of PHARMORA_MODULES
){


await loadPharmoraScript(file);


}





window.dispatchEvent(

new Event(
"pharmora-ready"
)

);


function autoRender(){


document
.querySelectorAll("[data-render]")
.forEach(el=>{


let type =
el.dataset.render;



if(
type==="content"
&&
typeof renderContent==="function"
){

renderContent(
el.dataset.type,
el.id
);

}




if(
type==="books"
&&
typeof renderBooks==="function"
){

renderBooks(
el.id
);

}




if(
type==="events"
&&
typeof renderEvents==="function"
){

renderEvents(
el.id
);

}




if(
type==="forum"
&&
typeof renderForum==="function"
){

renderForum(
el.id
);

}



});


}

console.log(

"✅ Pharmora Ready"

);



}






bootPharmora();