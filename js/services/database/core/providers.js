/*
 Pharmora Data Engine
 Provider Manager
*/


const PharmoraProviders = (()=>{



let providers={};






function register(
name,
provider
){



providers[name]=provider;



}









function get(){



let selected =

PharmoraConfig.get(
"provider"
);



let provider =

providers[selected];




if(!provider){


throw Error(

"Database provider missing: "

+

selected

);


}




return provider;



}








function all(){


return providers;


}









return {

register,

get,

all

};



})();







/*
 Register default providers
*/


PharmoraProviders.register(

"local",

PharmoraLocalProvider

);



/*
 Register Supabase if available
*/


if(
typeof PharmoraSupabaseProvider
!== 
"undefined"
){


PharmoraProviders.register(

"supabase",

PharmoraSupabaseProvider

);


}