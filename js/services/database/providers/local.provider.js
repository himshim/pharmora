/*
 Pharmora Data Engine
 Local Storage Provider v2

 Cloud-compatible local adapter
*/


const PharmoraLocalProvider = (()=>{


const PREFIX =
"pharmora_db_";






/* =====================
   STORAGE HELPERS
===================== */


function key(collection){


return PREFIX + collection;


}






function read(collection){


try{


return JSON.parse(

localStorage.getItem(
key(collection)
)

||

"[]"

);


}


catch(e){


console.warn(
"Database read failed",
collection,
e
);


return [];


}


}







function write(
collection,
records
){



localStorage.setItem(

key(collection),

JSON.stringify(records)

);


}









/* =====================
   DEEP MERGE ENGINE

   prevents:
   metadata overwrite
   analytics loss
   nested object loss
===================== */


function isObject(value){


return (

value &&

typeof value === "object" &&

!Array.isArray(value)

);


}







function deepMerge(
target={},
source={}
){


let output = {

...target

};




Object.keys(source)
.forEach(key=>{



if(

isObject(source[key]) &&

isObject(target[key])

){



output[key] =

deepMerge(

target[key],

source[key]

);



}



else{


output[key] =
source[key];


}



});





return output;


}









/* =====================
   CREATE
===================== */


async function create(
collection,
record
){



let items =
read(collection);



items.push(record);



write(

collection,

items

);



return record;



}










/* =====================
   FIND
===================== */


async function find(
collection,
options={}
){



let items =
read(collection);





/*
hide deleted records unless requested
*/

if(!options.includeDeleted){

items =
items.filter(item=>{

return !(

item.metadata?.deleted ||

item.lifecycle?.status==="deleted"

);

});

}







if(options.type){



items =

items.filter(

x=>x.type===options.type

);



}







if(options.subtype){



items =

items.filter(

x=>x.subtype===options.subtype

);



}







if(options.id){


items =

items.filter(

x=>

x.id===options.id ||

x.refId===options.id

);


}






return items;



}










/* =====================
   UPDATE
===================== */


async function update(
collection,
id,
updates={}
){



let items =
read(collection);



let updated=null;






items =

items.map(item=>{





if(

item.id===id ||

item.refId===id

){






updated =

deepMerge(

item,

updates

);








updated.metadata =

PharmoraMetadata.update(

updated.metadata || {}

);








return updated;



}






return item;



});







write(

collection,

items

);





return updated;



}










/* =====================
   SOFT DELETE
===================== */


async function remove(
collection,
id
){



return update(

collection,

id,

{



metadata:{


deleted:true,


deletedAt:

new Date()
.toISOString()


},




lifecycle:{


status:"deleted",


deletedAt:

new Date()
.toISOString()


}



}



);



}









return {


create,

find,

update,

remove


};



})();