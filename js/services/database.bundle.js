/*
 Pharmora Database Bundle Loader
 Load order is important
*/


const DB_MODULES = [

/* identity */
"/js/services/database/identity/uuid.js",
"/js/services/database/core/registry.js",
"/js/services/database/identity/reference.js",


/* entity */
"/js/services/database/entity/metadata.js",
"/js/services/database/entity/ownership.js",
"/js/services/database/entity/lifecycle.js",


/* seo before factory */
"/js/services/database/seo/slug.js",


"/js/services/database/entity/factory.js",


/* query */
"/js/services/database/query/filter.js",
"/js/services/database/query/sort.js",
"/js/services/database/query/rank.js",
"/js/services/database/query/query.js",


/* taxonomy */
"/js/services/database/taxonomy/tags.js",
"/js/services/database/taxonomy/categories.js",
"/js/services/database/taxonomy/relations.js",


/* content */
"/js/services/database/content/revision.js",
"/js/services/database/content/moderation.js",


/* trust */
"/js/services/database/trust/rating.js",
"/js/services/database/trust/verification.js",


/* activity */
"/js/services/database/activity/analytics.js",
"/js/services/database/activity/audit.js",


/* security */
"/js/services/database/security/permissions.js",
"/js/services/database/security/visibility.js",


/* storage */
"/js/services/database/storage/files.js",
"/js/services/database/storage/versions.js",


/* backup */
"/js/services/database/backup/export.js",
"/js/services/database/backup/import.js",


/* migration */
"/js/services/database/migration/migration.js",


/* providers */
"/js/services/database/providers/local.provider.js",
"/js/services/database/providers/supabase.provider.js",

"/js/services/database/core/config.js",
"/js/services/database/core/providers.js",


/* engine */
"/js/services/database/core/engine.js",
"/js/services/database/index.js",


/* compatibility */
"/js/services/database.service.js",


/* boot */
"/js/services/database/init.js",
"/js/services/database/loader.js"

];




/*
 Database script loader
*/


function loadScript(src){


return new Promise(resolve=>{


const script =
document.createElement("script");


script.src =
src;



script.onload=()=>{


console.log(
"DB ✓",
src
);


resolve(true);


};




script.onerror=()=>{


console.warn(
"DB skipped",
src
);


resolve(false);


};




document.head.appendChild(script);



});


}







async function loadDatabase(){



console.time(
"Database load"
);



for(
const file of DB_MODULES
){


await loadScript(
file
);


}




console.timeEnd(
"Database load"
);





console.log(
"✅ Pharmora Database Ready"
);





window.dispatchEvent(

new Event(
"pharmora-database-ready"
)

);



}





window.PharmoraDatabaseReady =
loadDatabase();