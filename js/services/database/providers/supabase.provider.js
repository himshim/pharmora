/*
 Pharmora Data Engine
 Supabase Provider

 Cloud database adapter
*/


const PharmoraSupabaseProvider = (()=>{



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









async function create(
collection,
record
){



let {data,error} =

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










async function find(
collection,
options={}
){



let query =

client()

.from(collection)

.select("*");






if(options.id){


query =
query.eq(
"id",
options.id
);


}




if(options.refId){


query =
query.eq(
"refId",
options.refId
);


}





let {data,error} =
await query;





if(error){

throw error;

}




return data || [];



}











async function update(
collection,
id,
updates
){



let {data,error} =

await client()

.from(collection)

.update(updates)

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









async function remove(
collection,
id
){



/*
 Soft delete only
*/


return update(

collection,

id,


{

metadata:{


deleted:true,


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