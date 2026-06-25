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


data:oldData,


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


async function getVersions(
collection,
id
){


let versions =
await getRecords(
"versions"
);



return versions

.filter(x=>

x.collection===collection

&&

x.contentId===id

)

.sort((a,b)=>

new Date(
b.time ||
b.createdAt ||
0
)

-

new Date(
a.time ||
a.createdAt ||
0
)

);


}








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