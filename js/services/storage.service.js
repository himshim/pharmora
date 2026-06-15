/*
 Storage Adapter Service
*/


let storageConfig=null;






async function loadStorageConfig(){


if(storageConfig){

return storageConfig;

}




storageConfig =
await fetch(
"/config/storage.json"
)
.then(r=>r.json());



return storageConfig;


}











async function uploadFile(
file,
folder
){



const config =
await loadStorageConfig();




console.log(
"Uploading using:",
config.provider
);






if(
config.provider==="demo"
){


return demoUpload(
file,
folder
);


}






/*

Future:

if(config.provider==="supabase"){

return supabaseUpload(file,folder);

}



if(config.provider==="r2"){

return r2Upload(file,folder);

}

*/


}









async function demoUpload(
file,
folder
){



return {


name:file.name,


path:

folder +

file.name,


url:

"",


provider:

"demo"


};



}