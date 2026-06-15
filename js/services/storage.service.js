/*
 Pharmora Storage Adapter
 Demo + Cloud Ready
*/



let storageConfig=null;






async function loadStorageConfig(){



if(storageConfig){

return storageConfig;

}




try{



storageConfig =
await fetch(

appPath(
"config/storage.json"
)

)
.then(r=>r.json());



}

catch(error){



console.error(

"Storage config loading failed",

error

);



storageConfig={

provider:"demo"

};



}




return storageConfig;



}









async function uploadFile(
file,
folder="uploads/"
){



const config =
await loadStorageConfig();







if(
config.provider==="demo"
){



return demoUpload(

file,

folder

);



}







if(

config.provider==="supabase"

&&

typeof supabaseUpload==="function"

){



return supabaseUpload(

file,

folder

);



}







return null;



}









async function deleteFile(
file
){



const config =
await loadStorageConfig();







if(
config.provider==="demo"
){


console.log(

"Demo delete:",

file

);


return true;


}







if(

config.provider==="supabase"

&&

typeof supabaseDelete==="function"

){



return supabaseDelete(
file
);



}



}









function getFileUrl(
file
){





if(!file){

return "";

}





return file.url || "";



}









/*

DEMO STORAGE ENGINE

*/









async function demoUpload(
file,
folder
){






let record={



id:

crypto.randomUUID(),



name:

file.name,



type:

file.type,



size:

file.size,



path:

folder +

file.name,



url:

"",



provider:

"demo",



uploadedAt:

new Date()
.toISOString()



};







console.log(

"Demo uploaded:",

record

);






return record;



}