/*
 Pharmora Content Service
 Data Access Layer
*/

const contentNameCache = {};

async function getPublished(collection){



let data =
await getRecords(
collection
);




return data.filter(item=>{



/*
Entity v2 lifecycle
*/


if(
item.lifecycle
){


return (

item.lifecycle.status==="published"

||

item.lifecycle.status==="draft"

);


}







/*
Legacy approval system
*/


return (

item.status==="approved"

||

item.status===undefined

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



