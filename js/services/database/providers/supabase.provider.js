/*
 Pharmora Data Engine
 Supabase Provider v2

 Cloud database adapter
 Mirrors Local Provider behavior
*/


const PharmoraSupabaseProvider = (()=>{





/* =====================
   CLIENT
===================== */


function client(){


if(
typeof supabaseClient === "undefined"
){


throw Error(
"Supabase client not initialized"
);


}



return supabaseClient;


}









/* =====================
   DEEP MERGE

   Same behavior as
   local.provider.js
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



let output={

...target

};





Object.keys(source)
.forEach(key=>{



if(

isObject(source[key])

&&

isObject(target[key])

){



output[key]=deepMerge(

target[key],

source[key]

);



}



else{



output[key]=source[key];



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



let {data,error}=

await client()

.from(collection)

.insert(record)

.select()

.single();






if(error){

throw error;

}




return data;



}











/* =====================
   FIND
===================== */


async function find(
collection,
options={}
){





let query =

client()

.from(collection)

.select("*");








if(options.id){



query=query.or(

`id.eq.${options.id},refId.eq.${options.id}`

);



}








if(options.type){


query=query.eq(

"type",

options.type

);


}







if(options.subtype){


query=query.eq(

"subtype",

options.subtype

);


}








let {data,error}=

await query;







if(error){

throw error;

}






data = data || [];





/*
 Hide deleted entities
*/


return data.filter(item=>{


return !(

item.metadata?.deleted ||

item.lifecycle?.status==="deleted"

);


});



}












/* =====================
   UPDATE
===================== */


async function update(
collection,
id,
updates={}
){





/*
 Fetch current entity first

 Needed because JSONB update
 replaces objects otherwise
*/


let existing =

await find(

collection,

{
id
}

);





let current =

existing[0];





if(!current){


return null;


}








let merged =

deepMerge(

current,

updates

);







if(

typeof PharmoraMetadata !== "undefined"

){



merged.metadata =

PharmoraMetadata.update(

merged.metadata || {}

);



}








let {data,error}=

await client()

.from(collection)

.update(merged)

.or(

`id.eq.${id},refId.eq.${id}`

)

.select()

.single();








if(error){


throw error;


}







return data;



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