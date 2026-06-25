/*
 Pharmora Version Service v2
 Database Provider Based
*/



/* ======================
 SAVE VERSION
====================== */


async function saveVersion(
collection,
id,
oldData
){


return await createRecord(

"versions",

{

collection,

contentId:id,

snapshot:oldData,


user:

typeof currentUser==="function"
?
currentUser()
:
null,


time:

new Date()
.toISOString()


}


);


}








/* ======================
 GET VERSIONS
====================== */


return versions

.filter(x=>{


let possible=[

x,

x.data,

x.data?.data,

x.metadata,

x.payload

];


return possible.some(v=>

v &&

v.collection===collection

&&

v.contentId===id

);


})








/* ======================
 CLEAR VERSIONS
====================== */


async function clearVersions(){


let versions =
await getRecords(
"versions"
);



for(let v of versions){


await deleteRecord(

"versions",

v.id

);


}



return true;


}








/*
 EXPORT
*/


window.saveVersion =
saveVersion;


window.getVersions =
getVersions;


window.clearVersions =
clearVersions;



console.log(
"✓ PharmoraVersion service ready"
);