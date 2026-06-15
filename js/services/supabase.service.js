/*
 Supabase Adapter
 Future Production Database
*/





let supabaseClient=null;






async function initSupabase(){



let config =
await loadDatabaseConfig();




if(

config.provider!=="supabase"

){

return null;

}






supabaseClient =
supabase.createClient(

config.supabase.url,

config.supabase.key

);






return supabaseClient;



}









async function supabaseCreate(
collection,
data
){



let db =
await initSupabase();





let result =
await db

.from(collection)

.insert(data)

.select();






return result.data[0];



}









async function supabaseGet(
collection
){



let db =
await initSupabase();





let result =
await db

.from(collection)

.select("*");






return result.data;



}










async function supabaseUpdate(
collection,
id,
data
){



let db =
await initSupabase();





let result =
await db

.from(collection)

.update(data)

.eq(
"id",
id
)

.select();






return result.data[0];



}