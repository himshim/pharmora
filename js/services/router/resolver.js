/*
 URL Resolver
*/


const RouteResolver=(()=>{



async function resolve(
path = location.pathname
){



let slug =

path

.split("/")

.filter(Boolean)

.pop();





let collections=[

"books",

"resources",

"tools",

"events",

"profiles",

"users"

];







for(
let c of collections
){



let data =
await getRecords(c);




let found =
data.find(x=>{


let name =

x.title ||

x.name ||

x.data?.name ||

x.displayName ||

x.refId ||

"";



return (

PharmoraRouter.slug(name)

===

slug

);


});






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