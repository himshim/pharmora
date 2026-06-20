/*
 Pharmora Content Service
 Data Access Layer
*/

const contentNameCache = {};

async function getPublished(collection){


let records =
await getRecords(collection);



return records.filter(item=>{


let published =

item.lifecycle?.status === "published";


let approved =

item.moderation?.status === "approved";



let active =

item.deleted !== true;



return (

published

&&

approved

&&

active

);


});


}









async function resolveName(
collection,
id
){



if(!id){

return "";

}



let key =
collection + ":" + id;




if(

key in contentNameCache

){


return contentNameCache[key];


}




try{



let data =
await getRecords(
collection
);



let item =
data.find(

x=>x.id===id

);



let name =
item

?

(

item.name ||

item.title ||

item.code ||

""

)

:

"";




contentNameCache[key]=name;




return name;



}


catch(e){



return "";



}



}



