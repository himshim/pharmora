
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



/* ===== js/services/database/identity/uuid.js ===== */


;
/*
 Pharmora Data Engine
 UUID Identity Module
*/


const PharmoraUUID = (()=>{


function create(){


    if(
        window.crypto &&
        crypto.randomUUID
    ){

        return crypto.randomUUID();

    }



    /*
      fallback for older browsers
    */

    return (

        Date.now().toString(36)

        +

        "-"

        +

        Math.random()
        .toString(36)
        .substring(2,12)

    );


}





return {

    create

};



})();

window.PharmoraUUID = PharmoraUUID;

;


/* ===== js/services/database/core/registry.js ===== */


;
/*
 Pharmora Data Engine
 Entity Registry
*/


const PharmoraRegistry = (()=>{


let types={


user:{
    prefix:"USR"
},


organization:{
    prefix:"ORG"
},


resource:{
    prefix:"RES"
},


file:{
    prefix:"FILE"
},


publication:{
    prefix:"PUB"
},


research_paper:{
    prefix:"PAPER"
},


journal:{
    prefix:"JRNL"
},


job:{
    prefix:"JOB"
},


event:{
    prefix:"EVT"
},


category:{
    prefix:"CAT"
},


tag:{
    prefix:"TAG"
},


revision:{
    prefix:"REV"
},


audit:{
    prefix:"AUD"
}


};







function generatePrefix(type){


return type

.split("_")

.map(part=>part[0])

.join("")

.toUpperCase()

.substring(0,5);


}








function get(type){



if(types[type]){

    return types[type];

}





/*
 automatic future support

 example:

 clinical_trial

 becomes

 CT
*/


types[type]={

prefix:
generatePrefix(type),

dynamic:true

};




return types[type];



}








function register(
type,
options
){


types[type]={

...options

};


}







function all(){


return types;


}







return {

get,

register,

all

};



})();

window.PharmoraRegistry = PharmoraRegistry;

;


/* ===== js/services/database/identity/reference.js ===== */


;
/*
 Pharmora Data Engine
 Adaptive Reference ID Generator
*/


const PharmoraReference = (()=>{



const COUNTER_KEY =
"pharmora_identity_counters";







function getCounters(){


try{


return JSON.parse(

localStorage.getItem(
COUNTER_KEY
)

||

"{}"

);


}

catch(e){

return {};

}


}








function saveCounters(data){


localStorage.setItem(

COUNTER_KEY,

JSON.stringify(data)

);


}









function next(prefix,year){



let counters =
getCounters();




if(!counters[prefix]){

counters[prefix]={};

}



if(!counters[prefix][year]){

counters[prefix][year]=0;

}




counters[prefix][year]++;



let value =
counters[prefix][year];



saveCounters(
counters
);



return value;



}










function create(type){



let registry =
PharmoraRegistry.get(type);




let prefix =
registry.prefix;




let year =
new Date()
.getFullYear();




let sequence =
next(
prefix,
year
);




let readable =
String(sequence)
.padStart(
6,
"0"
);






return {


refId:

`${prefix}-${year}-${readable}`,



identity:{


prefix,

year,

sequence,


engine:

"pharmora-data-v2"


}



};



}








return {

create

};



})();

window.PharmoraReference = PharmoraReference;

;


/* ===== js/services/database/entity/metadata.js ===== */


;
/*
 Pharmora Data Engine
 Metadata Module
*/


const PharmoraMetadata = (()=>{


const SCHEMA_VERSION = 1;



function create(user=null){


let now =
new Date()
.toISOString();



return {


schemaVersion:
SCHEMA_VERSION,


createdAt:
now,


updatedAt:
now,


createdBy:
user,


updatedBy:
user,


deleted:false,


deletedAt:null


};


}







function update(old,user=null){



return {


...old,


updatedAt:

new Date()
.toISOString(),


updatedBy:

user ||

old.updatedBy

};



}






return {

create,

update

};



})();
;


/* ===== js/services/database/entity/ownership.js ===== */


;
/*
 Pharmora Data Engine
 Ownership Module
*/


const PharmoraOwnership = (()=>{



function create(user=null){


let contributors = [];


if(user){

contributors.push({

userId:user,

role:"creator",

date:

new Date()
.toISOString()

});

}



return {


ownerId:

user,


verified:

false,


claimedAt:

null,


claimStatus:

user ? "self" : "unclaimed",



claimHistory:

[],


contributors:

contributors


};



}









function transfer(
ownership,
newOwner,
approvedBy,
reason=""
){



return {


...ownership,


ownerId:

newOwner,


verified:

true,


claimStatus:

"verified",


claimedAt:

new Date()
.toISOString(),



claimHistory:[

...(ownership.claimHistory || []),


{

action:

"ownership_transfer",


previousOwner:

ownership.ownerId,


newOwner,


approvedBy,


reason,


date:

new Date()
.toISOString()


}


]


};



}









function addContributor(
ownership,
user,
role="contributor"
){



return {


...ownership,


contributors:[

...(ownership.contributors || []),

{

userId:user,

role,

date:

new Date()
.toISOString()

}

]


};



}










return {

create,

transfer,

addContributor

};



})();
;


/* ===== js/services/database/entity/lifecycle.js ===== */


;
/*
 Pharmora Data Engine
 Lifecycle Module
*/


const PharmoraLifecycle = (()=>{



function create(){


return {


status:"draft",


version:1,


publishedAt:null,


approvedBy:null,


badges:[],


history:[]


};



}








function publish(
life,
user
){



return {


...life,


status:"published",


publishedAt:

new Date()
.toISOString(),


approvedBy:user,


history:[

...(life.history || []),


{

action:"published",

by:user,

date:

new Date()
.toISOString()

}


]


};



}








return {

create,

publish

};



})();
;


/* ===== js/services/database/seo/slug.js ===== */


;
/*
 Pharmora SEO
 Slug Generator
*/


const PharmoraSlug = (()=>{





function create(text=""){



return text

.toString()

.toLowerCase()

.trim()


.replace(

/[^a-z0-9]+/g,

"-"

)


.replace(

/^-+|-+$/g,

""

);



}










function apply(entity){



let slug =
entity.seo?.slug

||

create(

entity.title ||

entity.refId

);





return {


...entity,


seo:{


...(entity.seo||{}),


slug


}


};



}









return {

create,

apply

};



})();
;


/* ===== js/services/database/entity/factory.js ===== */


;
/*
 Pharmora Data Engine
 Universal Entity Factory v2
*/


const PharmoraEntity = (()=>{


const ENTITY_SCHEMA_VERSION = 2;


/*
 Remove duplicated system fields
 from custom payload
*/
function cleanData(data){


let copy = {

...data

};


[
"subtype",
"title",
"description",
"tags",
"categories",
"relations",
"visibility"
]
.forEach(key=>{

delete copy[key];

});


return copy;


}







function create(
data={},
options={}
){



let type =

data.collection ||

data.entityType ||

data.type ||

"entity";





/*
 Identity
*/


let reference =

PharmoraReference.create(
type
);







let entity = {




/* =====================
   SCHEMA
===================== */


schema:{


version:

ENTITY_SCHEMA_VERSION,


engine:

"PharmoraDB",


createdWith:

"entity-factory-v2"


},







/* =====================
   IDENTITY
===================== */


id:

PharmoraUUID.create(),



...reference,



identity:{


uuid:

null,


externalId:

data.externalId || null,


legacyId:

data.id || null


},








/* =====================
   CLASSIFICATION
===================== */


type,


subtype:

data.subtype || null,








/* =====================
   SEARCHABLE CONTENT
===================== */


title:

data.title || "",



description:

data.description || "",









/* =====================
   CUSTOM ENTITY DATA
===================== */


data:

cleanData(data),









/* =====================
   TAXONOMY
===================== */


taxonomy:{


tags:

data.tags || [],


categories:

data.categories || []


},



/*
old compatibility
*/


tags:

data.tags || [],


categories:

data.categories || [],









/* =====================
   RELATIONS
===================== */


relations:{


parents:[],


children:[],


linked:

Array.isArray(data.relations)

?

data.relations

:

[]


},









/* =====================
   OWNERSHIP
===================== */


ownership:

PharmoraOwnership.create(

options.user || null

),








/* =====================
   LIFECYCLE
===================== */


lifecycle:

PharmoraLifecycle.create(),








/* =====================
   MODERATION
===================== */


moderation:{


status:"pending",


reviewedBy:null,


reviewedAt:null,


reports:[],


flags:[]


},








/* =====================
   TRUST
===================== */


trust:{


score:0,


verified:false,


rating:{


average:0,


count:0


}


},









/* =====================
   ANALYTICS
===================== */


analytics:{



counters:{


views:0,


downloads:0,


likes:0,


shares:0


},



history:[]



},









/* =====================
   ACCESS CONTROL
===================== */


access:{



visibility:

data.visibility ||

"public",



read:[

"*"

],



write:[

"owner"

],



moderate:[

"admin"

],



roles:[]



},









/* =====================
   SEO
===================== */


seo:{


slug:null,


title:

data.title || null,


description:

data.description || null,


keywords:

[]


},









/* =====================
   SYSTEM METADATA
===================== */


metadata:

PharmoraMetadata.create(

options.user || null

)



};








/*
sync identity after UUID creation
*/


entity.identity.uuid =

entity.id;









/*
 Apply SEO module if available
*/


if(

typeof PharmoraSlug !== "undefined"

){



entity =

PharmoraSlug.apply(

entity

);



}








return entity;



}









return {


create


};



})();



/*
 Export Entity Factory
*/

window.PharmoraEntity =
PharmoraEntity;
;


/* ===== js/services/database/query/filter.js ===== */


;
/*
 Pharmora Data Engine
 Filter Engine
*/


const PharmoraFilter = (()=>{



function match(
item,
filters={}
){


for(
let key in filters
){



let expected =
filters[key];



let actual =
getValue(
item,
key
);




if(Array.isArray(actual)){


if(
!actual.includes(expected)
){

return false;

}


}


else{


if(actual !== expected){

return false;

}


}



}



return true;



}








function getValue(
object,
path
){



return path

.split(".")

.reduce(

(obj,key)=>

obj ?

obj[key]

:

undefined,

object

);



}









function apply(
items,
filters={}
){


return items.filter(

item=>

match(
item,
filters
)

);


}









return {

apply,

match

};



})();
;


/* ===== js/services/database/query/sort.js ===== */


;
/*
 Pharmora Data Engine
 Sorting Engine
*/


const PharmoraSort = (()=>{





function apply(
items,
mode="latest"
){



let result =
[...items];




switch(mode){



case "oldest":

return result.sort(

(a,b)=>

new Date(
a.metadata.createdAt
)

-

new Date(
b.metadata.createdAt
)

);





case "most_viewed":

return result.sort(

(a,b)=>

(b.analytics?.views||0)

-

(a.analytics?.views||0)

);





case "most_downloaded":

return result.sort(

(a,b)=>

(b.analytics?.downloads||0)

-

(a.analytics?.downloads||0)

);






case "highest_rated":

return result.sort(

(a,b)=>

(b.trust?.rating?.average||0)

-

(a.trust?.rating?.average||0)

);






case "most_trusted":

return result.sort(

(a,b)=>

(b.trust?.score||0)

-

(a.trust?.score||0)

);






default:

return result.sort(

(a,b)=>

new Date(
b.metadata.createdAt
)

-

new Date(
a.metadata.createdAt
)

);



}



}







return {

apply

};



})();
;


/* ===== js/services/database/query/rank.js ===== */


;
/*
 Pharmora Data Engine
 Ranking Engine
*/


const PharmoraRank = (()=>{



function score(item){



let points=0;



points +=

(item.analytics?.views || 0)

*0.1;




points +=

(item.analytics?.downloads || 0)

*0.5;




points +=

(item.trust?.score || 0)

*2;




points +=

(item.trust?.rating?.average || 0)

*10;





if(
item.trust?.verified
){

points +=100;

}



return points;



}









function apply(items){



return [...items]

.sort(

(a,b)=>

score(b)-score(a)

);



}









return {

apply,

score

};



})();
;


/* ===== js/services/database/query/query.js ===== */


;
/*
 Pharmora Data Engine
 Query Controller
*/


const PharmoraQuery = (()=>{







function execute(
items,
options={}
){





let result =
[...items];






// search text

if(options.search){


let text =
options.search
.toLowerCase();



result =
result.filter(item=>{


return JSON.stringify(item)

.toLowerCase()

.includes(text);


});


}








// filters


if(options.filters){



result =
PharmoraFilter.apply(

result,

options.filters

);



}









// ranking


if(options.sort==="recommended"){



result =
PharmoraRank.apply(

result

);



}



else{



result =
PharmoraSort.apply(

result,

options.sort

);



}









// pagination


if(options.limit){



let page =
options.page || 1;



let start =

(page-1)

*

options.limit;



result =
result.slice(

start,

start+options.limit

);



}








return result;



}









return {

execute

};



})();
;


/* ===== js/services/database/taxonomy/tags.js ===== */


;
/*
 Pharmora Data Engine
 Tag System
*/


const PharmoraTags = (()=>{



function normalize(tag){


return tag

.toString()

.trim()

.toLowerCase()

.replace(/\s+/g,"-");


}







function create(name){



let key =
normalize(name);



return {


id:

"TAG-" + key.toUpperCase(),


name,


key,


createdAt:

new Date()
.toISOString()


};



}









function attach(
entity,
tags=[]
){



let existing =
entity.tags || [];



return {


...entity,


tags:[

...new Set([

...existing,

...tags.map(normalize)

])

]


};



}









return {

create,

attach,

normalize

};



})();
;


/* ===== js/services/database/taxonomy/categories.js ===== */


;
/*
 Pharmora Data Engine
 Category System
*/


const PharmoraCategories = (()=>{



function create({
name,
parent=null,
type="general"
}){



return {


id:

PharmoraReference
.create("category")
.refId,


name,


parent,


type,


createdAt:

new Date()
.toISOString()


};



}









function attach(
entity,
categories=[]
){



return {


...entity,


categories:[


...(entity.categories || []),


...categories


]


};



}








return {

create,

attach

};



})();
;


/* ===== js/services/database/taxonomy/relations.js ===== */


;
/*
 Pharmora Data Engine
 Relationship Engine
*/


const PharmoraRelations = (()=>{






function create(
target,
type,
metadata={}
){



return {


target,


type,


metadata,


createdAt:

new Date()
.toISOString()


};



}









function attach(
entity,
relation
){



return {


...entity,


relations:[

...(entity.relations || []),

relation

]


};



}









function findRelated(
entity,
items=[]
){



let ids =

(entity.relations || [])

.map(r=>r.target);




return items.filter(

item=>

ids.includes(

item.refId

)

||

ids.includes(

item.id

)

);



}









return {

create,

attach,

findRelated

};



})();
;


/* ===== js/services/database/content/revision.js ===== */


;
/*
 Pharmora Data Engine
 Revision System
*/


const PharmoraRevision = (()=>{



function create(
entity,
changes,
user=null,
message=""
){



return {


id:

PharmoraReference
.create("revision")
.refId,


entityId:

entity.id,


entityRef:

entity.refId,


version:

(entity.lifecycle?.version || 1)+1,


changes,


message,


createdBy:

user,


status:

"pending",


createdAt:

new Date()
.toISOString()


};



}









function apply(
entity,
revision,
approvedBy=null
){



return {


...entity,


...revision.changes,



lifecycle:{


...entity.lifecycle,


version:

revision.version,


badges:[

...(entity.lifecycle?.badges || []),

"UPDATED"

],



history:[


...(entity.lifecycle?.history || []),


{

action:"revision_applied",

revision:revision.id,

approvedBy,

date:

new Date()
.toISOString()

}


]


},




metadata:

PharmoraMetadata.update(

entity.metadata,

approvedBy

)



};



}









return {

create,

apply

};



})();
;


/* ===== js/services/database/content/moderation.js ===== */


;
/*
 Pharmora Data Engine
 Moderation System
*/


const PharmoraModeration = (()=>{





function submit(entity,user){



return {


...entity,


lifecycle:{


...entity.lifecycle,


status:

"pending_review",



history:[

...(entity.lifecycle?.history || []),


{

action:"submitted_review",

by:user,

date:

new Date()
.toISOString()

}

]


}


};



}










function approve(entity,moderator){



return {


...entity,


lifecycle:{


...entity.lifecycle,


status:"published",


approvedBy:

moderator,


publishedAt:

new Date()
.toISOString(),



history:[

...(entity.lifecycle?.history || []),


{

action:"approved",

by:moderator,

date:

new Date()
.toISOString()

}

]


}


};



}









function reject(
entity,
moderator,
reason=""
){



return {


...entity,


lifecycle:{


...entity.lifecycle,


status:"rejected",



history:[

...(entity.lifecycle?.history || []),


{

action:"rejected",

reason,

by:moderator,

date:

new Date()
.toISOString()

}

]


}


};



}










return {

submit,

approve,

reject

};



})();
;


/* ===== js/services/database/trust/rating.js ===== */


;
/*
 Pharmora Trust Engine
 Rating System
*/


const PharmoraRating = (()=>{





function add(
entity,
rating
){



let old =

entity.trust?.rating

||

{
average:0,
count:0
};





let count =

old.count + 1;




let average =

(

(old.average * old.count)

+

rating

)

/

count;







return {


...entity,


trust:{


...entity.trust,


rating:{

average,

count

}


}


};



}










return {

add

};



})();
;


/* ===== js/services/database/trust/verification.js ===== */


;
/*
 Pharmora Trust Engine
 Verification System
*/


const PharmoraVerification = (()=>{





function verify(
entity,
user=null
){



return {


...entity,


trust:{


...entity.trust,


verified:true,


verifiedBy:user,


verifiedAt:

new Date()
.toISOString(),


score:

(entity.trust?.score || 0)

+

100


}



};



}










function revoke(
entity,
user=null,
reason=""
){



return {


...entity,


trust:{


...entity.trust,


verified:false,


revokedBy:user,


revokedReason:reason,


revokedAt:

new Date()
.toISOString()


}


};



}









return {

verify,

revoke

};



})();
;


/* ===== js/services/database/activity/analytics.js ===== */


;
/*
 Pharmora Data Engine
 Analytics Module
*/


const PharmoraAnalytics = (()=>{



function increase(
entity,
field,
amount=1
){


let analytics =
entity.analytics || {};



return {


...entity,


analytics:{


...analytics,


[field]:

(analytics[field] || 0)

+

amount


}


};



}







function view(entity){


return increase(
entity,
"views"
);


}






function download(entity){


return increase(
entity,
"downloads"
);


}






function like(entity){


return increase(
entity,
"likes"
);


}







function score(entity){



let a =
entity.analytics || {};



return (

(a.views || 0) * 0.1

+

(a.downloads || 0) * 2

+

(a.likes || 0) * 5

);



}







return {

increase,

view,

download,

like,

score

};



})();
;


/* ===== js/services/database/activity/audit.js ===== */


;
/*
 Pharmora Data Engine
 Audit Logger
*/


const PharmoraAudit = (()=>{





function create({
action,
target,
user=null,
details={}
}){



return {


id:

PharmoraReference
.create("audit")
.refId,


action,


target,


performedBy:

user,


details,


createdAt:

new Date()
.toISOString()


};



}










function attach(
entity,
audit
){



return {


...entity,


audit:[

...(entity.audit || []),

audit

]


};



}









return {

create,

attach

};



})();
;


/* ===== js/services/database/security/permissions.js ===== */


;
/*
 Pharmora Security Engine
 Permission Module
*/


const PharmoraPermission = (()=>{



const LEVELS={


guest:0,

member:10,

contributor:20,

researcher:30,

moderator:50,

admin:80,

owner:100


};






function can(
userRole,
required
){


return (

LEVELS[userRole] || 0

)

>=

(

LEVELS[required] || 0

);


}








function require(
entity,
role
){



return {


...entity,


access:{


...(entity.access || {}),


requiredRole:

role


}


};



}








return {

can,

require

};



})();
;


/* ===== js/services/database/security/visibility.js ===== */


;
/*
 Pharmora Security Engine
 Visibility Module
*/


const PharmoraVisibility = (()=>{





function set(
entity,
visibility="public"
){



return {


...entity,


access:{


...(entity.access || {}),


visibility


}


};



}








function visible(
entity,
userRole="guest"
){



let access =
entity.access || {};



if(
access.visibility==="public"
){

return true;

}




if(
access.visibility==="members"
){


return PharmoraPermission.can(
userRole,
"member"
);


}




if(
access.requiredRole
){


return PharmoraPermission.can(

userRole,

access.requiredRole

);


}



return false;



}









return {

set,

visible

};



})();
;


/* ===== js/services/database/storage/files.js ===== */


;
/*
 Pharmora Storage Engine
 File Manager
*/


const PharmoraFiles = (()=>{



async function hash(file){


let text =
[
file.name,
file.size,
file.type
]
.join("-");


let buffer =
new TextEncoder()
.encode(text);



let digest =
await crypto.subtle.digest(
"SHA-256",
buffer
);



return Array.from(
new Uint8Array(digest)
)

.map(x=>
x.toString(16)
.padStart(2,"0")
)

.join("");



}










async function create(
file,
options={}
){



let ref =
PharmoraReference
.create("file");




return {


id:

PharmoraUUID.create(),


...ref,



name:

file.name,


type:

file.type,


size:

file.size,


extension:

file.name
.split(".")
.pop()
.toLowerCase(),



hash:

await hash(file),



category:

options.category || null,



owner:

options.user || null,



linkedEntity:

options.entity || null,



createdAt:

new Date()
.toISOString()


};



}










return {

create,
hash

};



})();
;


/* ===== js/services/database/storage/versions.js ===== */


;
/*
 Pharmora Storage Engine
 File Versions
*/


const PharmoraFileVersions = (()=>{





function create(
oldFile,
newFile,
user=null
){



return {


id:

PharmoraReference
.create("revision")
.refId,



originalFile:

oldFile.refId,



version:

(oldFile.version || 1)+1,



file:

newFile,



uploadedBy:

user,



createdAt:

new Date()
.toISOString()


};



}








return {

create

};



})();
;


/* ===== js/services/database/backup/export.js ===== */


;
/*
 Pharmora Backup Export
*/


const PharmoraBackupExport = (()=>{



function create(
collections={}
){



return {


backupId:

PharmoraReference
.create("backup")
.refId,


engine:

"pharmora-data-v2",


createdAt:

new Date()
.toISOString(),



collections


};



}









function download(data){



let blob =
new Blob(

[
JSON.stringify(
data,
null,
2
)
],

{
type:"application/json"
}

);



let a =
document.createElement("a");



a.href =
URL.createObjectURL(blob);



a.download =
"pharmora-backup.json";



a.click();



}








return {

create,

download

};



})();
;


/* ===== js/services/database/backup/import.js ===== */


;
/*
 Pharmora Backup Import
*/


const PharmoraBackupImport = (()=>{



function validate(data){


return (

data

&&

data.engine

&&

data.collections

);


}






function restore(data){



if(
!validate(data)
){


throw Error(
"Invalid Pharmora backup"
);


}



return data.collections;



}








return {

validate,

restore

};



})();
;


/* ===== js/services/database/migration/migration.js ===== */


;
/*
 Pharmora Migration Engine
*/


const PharmoraMigration = (()=>{



let migrations={};





function register(
version,
handler
){


migrations[version]=handler;


}








function migrate(entity){



let current =

entity.metadata
?.schemaVersion

||

1;




while(
migrations[current+1]
){



entity =

migrations[current+1](
entity
);



current++;



}




return entity;



}








return {

register,

migrate

};



})();
;


/* ===== js/services/database/migration/seeder.js ===== */


;
/*
 Pharmora Database Seeder

 Converts legacy JSON content
 into Entity v2 records
*/


const PharmoraSeeder = (()=>{


async function seedCollection(
collection,
url
){


let existing =
await getRecords(
collection
);


if(existing.length){

console.warn(
"Skipping existing:",
collection
);


return {
collection,
skipped:true,
count:existing.length
};


}




let response =
await fetch(url);


let items =
await response.json();




let created=[];




for(
let item of items
){


let entity =
await createRecord(
collection,
item
);


created.push(
entity
);


}




return {

collection,

created:created.length

};


}








async function seedAll(){


let results=[];




results.push(

await seedCollection(
"books",
"/data/books.json"
)

);



results.push(

await seedCollection(
"resources",
"/data/resources.json"
)

);



results.push(

await seedCollection(
"events",
"/data/events.json"
)

);




return results;


}








return {


seedCollection,


seedAll


};



})();






window.PharmoraSeeder =
PharmoraSeeder;




console.log(
"✓ PharmoraSeeder ready"
);
;


/* ===== js/services/database/providers/local.provider.js ===== */


;
/*
 Pharmora Data Engine
 Local Storage Provider v2

 Cloud-compatible local adapter
*/


const PharmoraLocalProvider = (()=>{


const PREFIX =
"pharmora_db_";






/* =====================
   STORAGE HELPERS
===================== */


function key(collection){


return PREFIX + collection;


}






function read(collection){


try{


return JSON.parse(

localStorage.getItem(
key(collection)
)

||

"[]"

);


}


catch(e){


console.warn(
"Database read failed",
collection,
e
);


return [];


}


}







function write(
collection,
records
){



localStorage.setItem(

key(collection),

JSON.stringify(records)

);


}









/* =====================
   DEEP MERGE ENGINE

   prevents:
   metadata overwrite
   analytics loss
   nested object loss
===================== */


function isObject(value){


return (

value &&

typeof value === "object" &&

!Array.isArray(value)

);


}







function deepMerge(
target={},
source={}
){


let output = {

...target

};




Object.keys(source)
.forEach(key=>{



if(

isObject(source[key]) &&

isObject(target[key])

){



output[key] =

deepMerge(

target[key],

source[key]

);



}



else{


output[key] =
source[key];


}



});





return output;


}









/* =====================
   CREATE
===================== */


async function create(
collection,
record
){



let items =
read(collection);



items.push(record);



write(

collection,

items

);



return record;



}










/* =====================
   FIND
===================== */


async function find(
collection,
options={}
){



let items =
read(collection);





/*
hide deleted records unless requested
*/

if(!options.includeDeleted){

items =
items.filter(item=>{

return !(

item.metadata?.deleted ||

item.lifecycle?.status==="deleted"

);

});

}







if(options.type){



items =

items.filter(

x=>x.type===options.type

);



}







if(options.subtype){



items =

items.filter(

x=>x.subtype===options.subtype

);



}







if(options.id){


items =

items.filter(

x=>

x.id===options.id ||

x.refId===options.id

);


}






return items;



}










/* =====================
   UPDATE
===================== */


async function update(
collection,
id,
updates={}
){



let items =
read(collection);



let updated=null;






items =

items.map(item=>{





if(

item.id===id ||

item.refId===id

){






updated =

deepMerge(

item,

updates

);








updated.metadata =

PharmoraMetadata.update(

updated.metadata || {}

);








return updated;



}






return item;



});







write(

collection,

items

);





return updated;



}










/* =====================
   SOFT DELETE
===================== */


async function remove(
collection,
id
){



return update(

collection,

id,

{



metadata:{


deleted:true,


deletedAt:

new Date()
.toISOString()


},




lifecycle:{


status:"deleted",


deletedAt:

new Date()
.toISOString()


}



}



);



}









return {


create,

find,

update,

remove


};



})();
;


/* ===== js/services/database/providers/supabase.provider.js ===== */


;
/*
 Pharmora Data Engine
 Supabase Provider v2

 Cloud database adapter
 Mirrors Local Provider behavior
*/


const PharmoraSupabaseProvider = (()=>{





/* =====================
   CLIENT
===================== */


function client(){


if(
typeof supabaseClient === "undefined"
){


throw Error(
"Supabase client not initialized"
);


}



return supabaseClient;


}









/* =====================
   DEEP MERGE

   Same behavior as
   local.provider.js
===================== */


function isObject(value){


return (

value &&

typeof value === "object" &&

!Array.isArray(value)

);


}







function deepMerge(
target={},
source={}
){



let output={

...target

};





Object.keys(source)
.forEach(key=>{



if(

isObject(source[key])

&&

isObject(target[key])

){



output[key]=deepMerge(

target[key],

source[key]

);



}



else{



output[key]=source[key];



}



});





return output;


}









/* =====================
   CREATE
===================== */


async function create(
collection,
record
){



let {data,error}=

await client()

.from(collection)

.insert(record)

.select()

.single();






if(error){

throw error;

}




return data;



}











/* =====================
   FIND
===================== */


async function find(
collection,
options={}
){





let query =

client()

.from(collection)

.select("*");








if(options.id){



query=query.or(

`id.eq.${options.id},refId.eq.${options.id}`

);



}








if(options.type){


query=query.eq(

"type",

options.type

);


}







if(options.subtype){


query=query.eq(

"subtype",

options.subtype

);


}








let {data,error}=

await query;







if(error){

throw error;

}






data = data || [];





/*
 Hide deleted entities
*/


return data.filter(item=>{


return !(

item.metadata?.deleted ||

item.lifecycle?.status==="deleted"

);


});



}












/* =====================
   UPDATE
===================== */


async function update(
collection,
id,
updates={}
){





/*
 Fetch current entity first

 Needed because JSONB update
 replaces objects otherwise
*/


let existing =

await find(

collection,

{
id
}

);





let current =

existing[0];





if(!current){


return null;


}








let merged =

deepMerge(

current,

updates

);







if(

typeof PharmoraMetadata !== "undefined"

){



merged.metadata =

PharmoraMetadata.update(

merged.metadata || {}

);



}








let {data,error}=

await client()

.from(collection)

.update(merged)

.or(

`id.eq.${id},refId.eq.${id}`

)

.select()

.single();








if(error){


throw error;


}







return data;



}









/* =====================
   SOFT DELETE
===================== */


async function remove(
collection,
id
){





return update(

collection,

id,

{



metadata:{


deleted:true,


deletedAt:

new Date()
.toISOString()


},





lifecycle:{


status:"deleted",


deletedAt:

new Date()
.toISOString()


}



}



);



}










return {


create,

find,

update,

remove


};



})();
;


/* ===== js/services/database/core/config.js ===== */


;
/*
 Pharmora Data Engine
 Configuration
*/


const PharmoraConfig = (()=>{


let config = {


engine:

"pharmora-data-v2",



provider:

"local",



features:{


revisions:true,

moderation:true,

seo:true,

analytics:true,

trust:true,

audit:true


},



backup:{


enabled:true,


auto:false


}


};







function get(key=null){


if(!key){

return config;

}


return config[key];


}








function set(
key,
value
){


config[key]=value;


}








function update(
values={}
){



config={

...config,

...values

};



}








return {

get,

set,

update

};



})();
;


/* ===== js/services/database/core/providers.js ===== */


;
/*
 Pharmora Data Engine
 Provider Manager v2

 Safe provider resolver
*/


const PharmoraProviders = (()=>{



let providers={};





/* =====================
   REGISTER PROVIDER
===================== */


function register(
name,
provider
){


if(!name || !provider){

return;

}



providers[name]=provider;



}








/* =====================
   GET ACTIVE PROVIDER
===================== */


function get(){



let selected="local";




try{


if(
typeof PharmoraConfig !== "undefined"
){


selected =

PharmoraConfig.get("provider")

||

"local";


}


}


catch(e){


console.warn(
"Provider config unavailable. Using local."
);


}







let provider =

providers[selected];







/*
Fallback protection

Example:
config = supabase
but supabase failed loading
*/


if(!provider){



console.warn(

"Database provider unavailable:",
selected,
"→ fallback local"

);



provider =

providers.local;



}








if(!provider){



throw Error(

"No database provider available"

);



}







return provider;



}









/* =====================
   LIST PROVIDERS
===================== */


function all(){


return {

...providers

};


}









return {


register,

get,

all


};



})();









/* =====================
   DEFAULT PROVIDERS
===================== */


if(
typeof PharmoraLocalProvider
!== "undefined"
){


PharmoraProviders.register(

"local",

PharmoraLocalProvider

);


}








if(
typeof PharmoraSupabaseProvider
!== "undefined"
){



PharmoraProviders.register(

"supabase",

PharmoraSupabaseProvider

);



}

/*
 Export Provider Manager
*/

window.PharmoraProviders =
PharmoraProviders;
;


/* ===== js/services/database/core/engine.js ===== */


;
/*
 Pharmora Data Engine
 Core Engine v2.1

 Provider controlled persistence
*/


const PharmoraDB = (()=>{






function collectionFor(entity){


return entity.type || "entities";


}



async function resolveCollection(id) {
  if (typeof PharmoraRegistry !== "undefined") {
    let types = Object.keys(PharmoraRegistry.all());
    let additionalTypes = ["notifications", "reputation_logs", "verification-requests", "contributor-applications"];
    let allTypes = Array.from(new Set([...types, ...additionalTypes]));
    
    for (let type of allTypes) {
      try {
        let existing = await PharmoraProviders.get().find(type, { id });
        if (existing && existing.length > 0) {
          return type;
        }
      } catch(e) {
        // Ignore
      }
    }
  }
  return "entities"; // Fallback
}



async function create(
data={},
options={}
){



let entity =

PharmoraEntity.create(

data,

options

);






return PharmoraProviders

.get()

.create(

collectionFor(entity),

entity

);



}










async function find(
query={}
){



  let targetCollection = query.filters && query.filters.type;
  
  if (targetCollection) {
    let records = await PharmoraProviders.get().find(targetCollection, query);
    return PharmoraQuery.execute(records, query);
  }
  
  // If no type specified, scan all collections
  let allRecords = [];
  if (typeof PharmoraRegistry !== "undefined") {
    let types = Object.keys(PharmoraRegistry.all());
    let additionalTypes = ["notifications", "reputation_logs", "verification-requests", "contributor-applications"];
    let allTypes = Array.from(new Set([...types, ...additionalTypes]));
    
    for (let type of allTypes) {
      try {
        let records = await PharmoraProviders.get().find(type, query);
        if (Array.isArray(records)) {
          allRecords.push(...records);
        }
      } catch(e) {
        // Ignore
      }
    }
  }
  
  return PharmoraQuery.execute(
    allRecords,
    query
  );



}










async function update(
id,
updates={},
user=null
){



/*
 Provider owns:
 - merging
 - timestamps
 - persistence

 because provider has existing entity
*/


  let collection = await resolveCollection(id);


return PharmoraProviders

.get()

.update(

collection,

id,

updates,

user

);



}










async function remove(
id,user=null)
{



  let collection = await resolveCollection(id);


return PharmoraProviders

.get()

.remove(

collection,

id,

user

);



}











return {


create,

find,

update,

remove


};



})();



/*
 Export Engine
*/

window.PharmoraDB =
PharmoraDB;
;


/* ===== js/services/database/index.js ===== */


;
/*
 Pharmora Data Engine
 Main Entry Point
*/


const PharmoraDatabase = (()=>{



async function create(
data={},
options={}
){


return PharmoraDB.create(
data,
options
);


}







async function find(
query={}
){


return PharmoraDB.find(
query
);


}








async function update(
id,
updates,
user=null
){


return PharmoraDB.update(
id,
updates,
user
);


}








async function remove(
id,user=null
){


return PharmoraDB.remove(
id,user
);


}









async function publish(
id,
moderator
){



let items =
await find();



let entity =
items.find(

x=>

x.id===id

||

x.refId===id

);



if(!entity){

return null;

}



let updated =
PharmoraModeration.approve(
entity,
moderator
);



return update(
id,
updated,
moderator
);



}











async function rate(
id,
rating
){



let items =
await find();



let entity =
items.find(

x=>

x.id===id

||

x.refId===id

);



if(!entity){

return null;

}



let updated =
PharmoraRating.add(
entity,
rating
);



return update(
id,
updated
);



}











function createBackup(
collections
){


return PharmoraBackupExport.create(
collections
);


}









function restoreBackup(
backup
){


return PharmoraBackupImport.restore(
backup
);


}










return {


create,

find,

update,

remove,


publish,

rate,


backup:createBackup,

restore:restoreBackup


};



})();



/*
 Export Database API
*/

window.PharmoraDatabase =
PharmoraDatabase;
;


/* ===== js/services/database/cache/cache.js ===== */


;
/*
 Pharmora Smart Cache
*/


const PharmoraCache = (()=>{


const memory =
new Map();



const TTL =
5 * 60 * 1000;




function set(
key,
data
){


let record={

data,

time:Date.now()

};



memory.set(
key,
record
);



try{


localStorage.setItem(

"cache_"+key,

JSON.stringify(record)

);


}catch(e){}




}








function get(key){



let item =
memory.get(key);



if(!item){


try{


item =
JSON.parse(

localStorage.getItem(
"cache_"+key
)

);


}catch(e){}


}




if(!item){

return null;

}




if(
Date.now()-item.time
>
TTL
){


remove(key);


return null;


}



return item.data;



}








function remove(key){


memory.delete(key);


localStorage.removeItem(
"cache_"+key
);


}








function clear(){


memory.clear();


Object.keys(localStorage)

.filter(x=>

x.startsWith("cache_")

)

.forEach(x=>

localStorage.removeItem(x)

);



}






return{


get,

set,

remove,

clear


};



})();
;


/* ===== js/services/database.service.js ===== */


;
/*
 Pharmora Database Service Bridge
 v2 Compatibility Layer
*/


/* ======================
 NORMALIZER
====================== */

function normalizeRecord(item){

return {

...item,

...(item.data || {}),

id:item.id,

type:item.type,

createdAt:
item.metadata?.createdAt,

updatedAt:
item.metadata?.updatedAt,

status:
item.data?.status ||
item.lifecycle?.status

};

}







/* ======================
 CREATE
====================== */

async function createRecord(
collection,
data={}
){


let user = null;


if(
typeof currentUser === "function"
){


let session =
currentUser();


user =
session?.id || null;


}




return PharmoraDatabase.create(

{

...data,


collection,


type:
data.type ||
collection


},


{

user:user

}


);


}







/* ======================
 READ
====================== */

async function getRecords(
collection,
filters={}
){


let query={

filters:{
type:collection
}

};


if(filters.includeDeleted){

query.includeDeleted=true;

}


let records =
await PharmoraDatabase.find(
query
);



records =
records.filter(item=>{


let flat =
normalizeRecord(item);


for(let key in filters){


if(key==="includeDeleted"){
continue;
}


if(
flat[key] !== filters[key]
){

return false;

}


}


return true;


});



return records.map(
normalizeRecord
);


}








/* ======================
 UPDATE
====================== */

async function updateRecord(
a,
b,
c
){


/*
 Supports:

 OLD:
 updateRecord(collection,id,data)

 NEW:
 updateRecord(id,data)
*/


let id;

let updates;



if(c !== undefined){


id = b;

updates = c;


}


else{


id = a;

updates = b;


}



return PharmoraDatabase.update(

id,

updates || {}

);



}








/* ======================
 DELETE
====================== */

async function deleteRecord(
a,
b
){


let id =

b || a;



return PharmoraDatabase.remove(

id

);


}







/* ======================
 RESTORE
====================== */

async function restoreRecord(
collection,
id
){


return PharmoraDatabase.update(

id,

{

metadata:{

deleted:false,

deletedAt:null

},

lifecycle:{

status:"draft",

deletedAt:null

}

}

);


}








/* ======================
 EXPORT
====================== */

async function exportDatabase(){
  let collections = {};
  if (typeof PharmoraRegistry !== "undefined") {
    let types = Object.keys(PharmoraRegistry.all());
    let additionalTypes = ["notifications", "reputation_logs", "verification-requests", "contributor-applications"];
    let allTypes = Array.from(new Set([...types, ...additionalTypes]));
    
    for (let type of allTypes) {
      let records = await getRecords(type);
      if (records.length > 0) {
        collections[type] = records;
      }
    }
  } else {
    let data = await PharmoraDatabase.find();
    collections.entities = data;
  }
  
  return PharmoraDatabase.backup(collections);
}




/* ======================
 IMPORT
===================== */

async function importDatabase(
  backup
){
  if(
    !backup ||
    backup.engine!=="pharmora-data-v2" ||
    !backup.collections
  ){
    throw new Error(
      "Invalid Pharmora backup"
    );
  }

  let totalRestored = 0;

  if (Array.isArray(backup.collections.entities)) {
    // Legacy migration import format
    let oldEntities = backup.collections.entities;
    totalRestored = oldEntities.length;
    let collections = {};
    oldEntities.forEach(entity => {
      let type = entity.type || "entities";
      if (!collections[type]) collections[type] = [];
      collections[type].push(entity);
    });
    
    Object.keys(collections).forEach(type => {
      localStorage.setItem("pharmora_db_" + type, JSON.stringify(collections[type]));
    });
    
    localStorage.removeItem("pharmora_db_entities");
  } else {
    // Multi-collection split format
    Object.keys(backup.collections).forEach(type => {
      let records = backup.collections[type];
      if (Array.isArray(records)) {
        localStorage.setItem("pharmora_db_" + type, JSON.stringify(records));
        totalRestored += records.length;
      }
    });
  }

  return {
    success:true,
    restored:totalRestored,
    importedAt:
    new Date().toISOString()
  };
}



/* ======================
 GLOBAL EXPORT
====================== */

window.DatabaseService={

createRecord,
getRecords,
updateRecord,
deleteRecord,
restoreRecord,
exportDatabase,
importDatabase

};


window.createRecord=createRecord;

window.getRecords=getRecords;

window.updateRecord=updateRecord;

window.deleteRecord=deleteRecord;

window.restoreRecord=restoreRecord;

window.exportDatabase=exportDatabase;

window.importDatabase=importDatabase;
;


/* ===== js/services/database/init.js ===== */


;
/*
 Pharmora Data Engine
 Initialization Manager
*/


const PharmoraInit = (()=>{



let ready = false;



const required = [


"PharmoraUUID",

"PharmoraReference",

"PharmoraRegistry",


"PharmoraEntity",

"PharmoraDB",

"PharmoraDatabase",


"PharmoraProviders"


];








function check(){



let missing = [];



required.forEach(name=>{


if(
typeof window[name] === "undefined"
){


missing.push(name);


}


});






if(missing.length){



console.error(

"Pharmora Database missing modules:",

missing

);



ready=false;



return false;


}




ready=true;



  // Self-healing database migration path:
  if (localStorage.getItem("pharmora_db_entities")) {
    try {
      let oldEntities = JSON.parse(localStorage.getItem("pharmora_db_entities") || "[]");
      if (Array.isArray(oldEntities) && oldEntities.length > 0) {
        console.info("Migrating legacy entities database to separate collections...");
        let collections = {};
        oldEntities.forEach(entity => {
          let type = entity.type || "entities";
          if (!collections[type]) {
            collections[type] = [];
          }
          collections[type].push(entity);
        });
        
        Object.keys(collections).forEach(type => {
          let collectionKey = "pharmora_db_" + type;
          let existing = JSON.parse(localStorage.getItem(collectionKey) || "[]");
          let merged = [...existing];
          collections[type].forEach(item => {
            if (!merged.find(x => x.id === item.id)) {
              merged.push(item);
            }
          });
          localStorage.setItem(collectionKey, JSON.stringify(merged));
        });
        
        console.info("Migration successful! Cleaning up legacy database reference...");
        localStorage.removeItem("pharmora_db_entities");
      }
    } catch(e) {
      console.error("Database migration failed:", e);
    }
  }


  if(typeof PharmoraSeeder !== "undefined"){
    PharmoraSeeder.seedAll().then(res=>{
      console.info("Database seeded:", res);
    }).catch(err=>{
      console.warn("Seeding failed:", err);
    });
  }

  return true;



}










function isReady(){


return ready;


}









return {


check,

isReady


};



})();

window.PharmoraInit = PharmoraInit;
;


/* ===== js/services/database/loader.js ===== */


;
/*
 Pharmora Data Engine Loader
*/


window.addEventListener(

"DOMContentLoaded",

()=>{


if(
typeof PharmoraInit !== "undefined"
){



PharmoraInit.check();



}


}

);
;
