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







/*

Future:

if(config.provider==="supabase"){


return supabaseCreate(
collection,
data
);


}


*/



}










async function demoCreate(
collection,
data
){



let record = {


id:

crypto.randomUUID(),


...data,


createdAt:

new Date()
.toISOString()


};






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



return fetch(

"/data/" +

collection +

".json"

)

.then(r=>r.json());



}



}