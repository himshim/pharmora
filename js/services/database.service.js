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


return PharmoraDatabase.create({

...data,

collection,

type:
data.type ||
collection


});


}







/* ======================
 READ
====================== */

async function getRecords(
collection,
filters={}
){


let records =
await PharmoraDatabase.find({

filters:{
type:collection
}

});


records =
records.filter(item=>{


let flat =
normalizeRecord(item);


for(let key in filters){


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
collection,
id,
updates
){


return PharmoraDatabase.update(

id,

updates

);


}








/* ======================
 DELETE
====================== */

async function deleteRecord(
collection,
id
){


return PharmoraDatabase.remove(id);


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