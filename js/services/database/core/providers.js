/*
 Pharmora Data Engine
 Provider Manager v2

 Safe provider resolver
*/


const PharmoraProviders = (()=>{



let providers={};





/* =====================
   REGISTER PROVIDER
===================== */


function register(
name,
provider
){


if(!name || !provider){

return;

}



providers[name]=provider;



}








/* =====================
   GET ACTIVE PROVIDER
===================== */


function get(){



let selected="local";




try{


if(
typeof PharmoraConfig !== "undefined"
){


selected =

PharmoraConfig.get("provider")

||

"local";


}


}


catch(e){


console.warn(
"Provider config unavailable. Using local."
);


}







let provider =

providers[selected];







/*
Fallback protection

Example:
config = supabase
but supabase failed loading
*/


if(!provider){



console.warn(

"Database provider unavailable:",
selected,
"→ fallback local"

);



provider =

providers.local;



}








if(!provider){



throw Error(

"No database provider available"

);



}







return provider;



}









/* =====================
   LIST PROVIDERS
===================== */


function all(){


return {

...providers

};


}









return {


register,

get,

all


};



})();









/* =====================
   DEFAULT PROVIDERS
===================== */


if(
typeof PharmoraLocalProvider
!== "undefined"
){


PharmoraProviders.register(

"local",

PharmoraLocalProvider

);


}








if(
typeof PharmoraSupabaseProvider
!== "undefined"
){



PharmoraProviders.register(

"supabase",

PharmoraSupabaseProvider

);



}