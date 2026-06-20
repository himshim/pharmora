/*
 Pharmora Build System

 Combines modular JS files into production bundles
*/


const fs =
require("fs");


const path =
require("path");





function bundle(
files,
output
){


let code =
`
/*
 Generated Pharmora Bundle
 Do not edit directly
*/

`;



files.forEach(file=>{


let p =
path.join(
process.cwd(),
file
);



if(
fs.existsSync(p)
){


code +=

`

/* ===== ${file} ===== */

`;


code +=
fs.readFileSync(
p,
"utf8"
);


}


else{


console.warn(
"Missing:",
file
);


}


});






fs.mkdirSync(

path.dirname(output),

{recursive:true}

);



fs.writeFileSync(

output,

code

);



console.log(
"Built:",
output
);



}









/*
 DATABASE
*/


bundle(
[


"js/services/database/identity/uuid.js",
"js/services/database/core/registry.js",
"js/services/database/identity/reference.js",


"js/services/database/entity/metadata.js",
"js/services/database/entity/ownership.js",
"js/services/database/entity/lifecycle.js",
"js/services/database/seo/slug.js",
"js/services/database/entity/factory.js",


"js/services/database/query/filter.js",
"js/services/database/query/sort.js",
"js/services/database/query/rank.js",
"js/services/database/query/query.js",


"js/services/database/taxonomy/tags.js",
"js/services/database/taxonomy/categories.js",
"js/services/database/taxonomy/relations.js",


"js/services/database/content/revision.js",
"js/services/database/content/moderation.js",


"js/services/database/trust/rating.js",
"js/services/database/trust/verification.js",


"js/services/database/activity/analytics.js",
"js/services/database/activity/audit.js",


"js/services/database/security/permissions.js",
"js/services/database/security/visibility.js",


"js/services/database/storage/files.js",
"js/services/database/storage/versions.js",


"js/services/database/backup/export.js",
"js/services/database/backup/import.js",


"js/services/database/migration/migration.js",


"js/services/database/providers/local.provider.js",
"js/services/database/providers/supabase.provider.js",


"js/services/database/core/config.js",
"js/services/database/core/providers.js",


"js/services/database/core/engine.js",
"js/services/database/index.js",


"js/services/database.service.js",
"js/services/database/init.js",
"js/services/database/loader.js"


],

"dist/pharmora.database.js"

);