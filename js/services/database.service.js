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


let data =
await PharmoraDatabase.find();


return PharmoraDatabase.backup({

entities:data

});


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
exportDatabase

};


window.createRecord=createRecord;

window.getRecords=getRecords;

window.updateRecord=updateRecord;

window.deleteRecord=deleteRecord;

window.restoreRecord=restoreRecord;

window.exportDatabase=exportDatabase;