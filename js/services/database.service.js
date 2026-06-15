/*
 Database Adapter Service
*/


let databaseConfig=null;





async function loadDatabaseConfig(){


if(databaseConfig){

return databaseConfig;

}



databaseConfig =
await fetch(
"/config/database.json"
)
.then(r=>r.json());



return databaseConfig;


}









async function createRecord(
collection,
data
){



const config =
await loadDatabaseConfig();




console.log(

"Database provider:",

config.provider

);





if(
config.provider==="demo"
){


return demoCreate(
collection,
data
);


}



}









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

JSON.stringify(items)

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







console.log(

"Created:",

collection,

record

);





return record;



}










async function getRecords(
collection
){



const config =
await loadDatabaseConfig();






if(
config.provider==="demo"
){





let local =
getLocalCollection(
collection
);







return local;



}



}