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






if(!file){

return null;

}






const config =
await loadStorageConfig();








if(config.provider==="demo"){



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












async function deleteFile(file){






if(!file){

return false;

}








const config =
await loadStorageConfig();








if(config.provider==="demo"){



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








return false;



}













function getFileUrl(file){






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








let safeName =

Date.now()

+

"-"

+

file.name.replace(

/\s+/g,

"_"

);









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

folder + safeName,








url:

URL.createObjectURL(

file

),









provider:

"demo",








uploadedAt:

new Date()
.toISOString()








};









return record;






}