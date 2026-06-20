/*
 URL Resolver
*/


const RouteResolver=(()=>{



async function resolve(){



let path =
location.pathname;




let slug =

path

.split("/")

.pop();





let collections=[

"books",

"resources",

"tools",

"events"

];





for(
let c of collections
){


let data =
await getRecords(c);



let found =
data.find(x=>

PharmoraRouter.slug(

x.title || x.name

)

===slug

);




if(found){


return {

type:c,

data:found

};


}


}




return null;



}




return{

resolve

};



})();