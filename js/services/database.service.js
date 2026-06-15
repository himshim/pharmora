/*
 Pharmora Database Adapter
 Demo + Cloud Ready
*/



let databaseConfig=null;






async function loadDatabaseConfig(){


if(databaseConfig){

return databaseConfig;

}



try{


databaseConfig =
await fetch(

appPath(
"config/database.json"
)

)
.then(r=>r.json());



}

catch(error){



console.error(

"Database config loading failed",

error

);



databaseConfig={

provider:"demo"

};



}



return databaseConfig;


}









function resolveCollection(
collection
){



if(

databaseConfig

&&

databaseConfig.collections

&&

databaseConfig.collections[collection]

){


return databaseConfig.collections[collection];


}




return collection;



}









async function createRecord(
collection,
data
){



const config =
await loadDatabaseConfig();



collection =
resolveCollection(
collection
);






if(
config.provider==="demo"
){


return demoCreate(
collection,
data
);


}






if(
config.provider==="supabase"
&&
typeof supabaseCreate==="function"
){



return supabaseCreate(

collection,

data

);



}



}









async function getRecords(
collection
){



const config =
await loadDatabaseConfig();




collection =
resolveCollection(
collection
);







if(
config.provider==="demo"
){



return getLocalCollection(

collection

)

.filter(

item=>item.deleted!==true

);



}







if(

config.provider==="supabase"

&&

typeof supabaseGet==="function"

){



return supabaseGet(

collection

);



}




return [];



}









async function updateRecord(
collection,
id,
updates
){



const config =
await loadDatabaseConfig();




collection =
resolveCollection(
collection
);







if(
config.provider==="demo"
){



let items =
getLocalCollection(
collection
);






items =
items.map(item=>{



if(
item.id===id
){


return {

...item,

...updates,


updatedAt:

new Date()
.toISOString()

};


}



return item;



});







saveLocalCollection(

collection,

items

);








return items.find(

item=>item.id===id

);



}








if(

config.provider==="supabase"

&&

typeof supabaseUpdate==="function"

){



return supabaseUpdate(

collection,

id,

updates

);



}




}









async function deleteRecord(
collection,
id
){





return updateRecord(

collection,

id,

{

deleted:true,


deletedAt:

new Date()
.toISOString()

}

);



}











async function restoreRecord(
collection,
id
){





return updateRecord(

collection,

id,

{

deleted:false,


restoredAt:

new Date()
.toISOString()

}

);



}









/*

DEMO LOCAL STORAGE ENGINE

*/







function getLocalCollection(
collection
){



return JSON.parse(

localStorage.getItem(

"db_" + collection

)

||

"[]"

);



}









function saveLocalCollection(
collection,
items
){



localStorage.setItem(

"db_" + collection,


JSON.stringify(

items

)

);



}











async function demoCreate(
collection,
data
){





let items =
getLocalCollection(
collection
);








let record={



id:

crypto.randomUUID(),




...data,





createdAt:

new Date()
.toISOString()



};









items.push(

record

);







saveLocalCollection(

collection,

items

);








return record;



}