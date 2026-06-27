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