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


async function getVersions(
collection,
id
){


let versions =
await getRecords(
"versions"
);



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


.sort((a,b)=>{


let bt =
b.data?.time ||
b.data?.data?.time ||
b.time ||
b.createdAt ||
0;


let at =
a.data?.time ||
a.data?.data?.time ||
a.time ||
a.createdAt ||
0;



return (

new Date(bt)

-

new Date(at)

);


});


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