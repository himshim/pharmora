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