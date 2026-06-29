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

    "\n;\n" +

    fs.readFileSync(
    p,
    "utf8"
    )

    +

    "\n;\n";


    }


    else{


    console.error(
    "Error: Missing required bundle file:",
    file
    );
    process.exit(1);


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

"js/services/database/migration/seeder.js",


"js/services/database/providers/local.provider.js",
"js/services/database/providers/supabase.provider.js",


"js/services/database/core/config.js",
"js/services/database/core/providers.js",


"js/services/database/core/engine.js",
"js/services/database/index.js",

"js/services/database/cache/cache.js",
"js/services/database.service.js",
"js/services/database/init.js",
"js/services/database/loader.js"


],

"dist/pharmora.database.js"

);

/*
 SEARCH ENGINE
*/


bundle(
[

"js/services/search/config.js",

"js/services/search/relations.js",

"js/services/search/indexer.js",

"js/services/search/ranking.js",

"js/services/search/engine.js",

"js/search.js"


],

"dist/pharmora.search.js"

);


/*
 USER SYSTEM
*/


bundle(
[

"js/services/user-notification.service.js",

"js/services/wizard.core.js",

"js/services/profile.wizard.js"

],

"dist/pharmora.user.js"

);






/*
 PLATFORM SYSTEM
*/


bundle(
[

"js/services/features.service.js",

"js/services/analytics.service.js",

"js/services/activity.service.js"

],

"dist/pharmora.platform.js"

);






/*
 ADMIN SYSTEM
*/


bundle([
  // ── Wizard Core ──
  "js/services/wizard.core.js",

  // ── Workbench Core & Plugins ──
  "js/services/workbench/workbench.form.js",
  "js/services/workbench/workbench.relations.js",
  "js/services/workbench/workbench.drawer.js",
  "js/services/workbench/workbench.core.js",

  // ── Entity Manager UI (extended API) ──
  "components/entity/entity.manager.js",

  // ── Legacy admin services (kept for bridge functions) ──
  "js/services/verification.service.js",
  "js/services/admin-crud.service.js",
  "js/services/admin.service.js",
  "js/services/admin.review.js",
  "js/services/admin.users.js",
  "js/services/admin.audit.js",
  "js/services/admin.reports.js",
  "js/services/admin.trash.js",
  "js/services/admin.verification.js",
  "js/services/admin.contributor.service.js",

  // ── Workbench Modules ──
  "js/services/admin/admin.utils.js",
  "js/services/admin/modules/overview.js",
  "js/services/admin/modules/review.js",
  "js/services/admin/modules/manager.js",
  "js/services/admin/modules/verification.js",
  "js/services/admin/modules/users.js",
  "js/services/admin/modules/reports.js",
  "js/services/admin/modules/audit.js",
  "js/services/admin/modules/analytics.js",
  "js/services/admin/modules/settings.js",
  "js/services/admin/modules/extensions.js",
  "js/services/admin.modules.js"
], "dist/pharmora.admin.js");

/*
 ROUTER
*/


bundle(
[

"js/services/router/routes.js",

"js/services/router/router.js",

"js/services/router/resolver.js"


],

"dist/pharmora.router.js"

);