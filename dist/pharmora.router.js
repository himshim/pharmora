
/*
 Generated Pharmora Bundle
 Do not edit directly
*/



/* ===== js/services/router/routes.js ===== */


;
/*
 Pharmora Route Map
*/


const PharmoraRoutes={


library:{


books:

"/library/books/",


resources:

"/library/resources/"


},



learn:{


subject:

"/learn/"


},



events:

"/events/",



tools:

"/tools/"


};

window.PharmoraRoutes = PharmoraRoutes;
;


/* ===== js/services/router/router.js ===== */


;
/*
 Pharmora Router
*/


const PharmoraRouter=(()=>{



function slug(text=""){


return text

.toLowerCase()

.replace(/[^a-z0-9]+/g,"-")

.replace(/^-|-$/g,"");


}






function createURL(item,type){



let title =

item.title ||

item.data?.name ||

item.name ||

item.refId ||

item.id;





if(type==="books"){


return (

"/library/books/" +

slug(title)

);


}





if(type==="resources"){


return (

"/library/resources/" +

slug(title)

);


}






if(type==="events"){


return (

"/events/" +

slug(title)

);


}






if(type==="tools"){


return (

"/tools/" +

slug(title)

);


}







if(

type==="users" ||

type==="profiles"

){


return (

"/profile/" +

slug(title)

);


}







return (

"/view/" +

item.id

);


}




return{

slug,

createURL

};



})();

window.PharmoraRouter = PharmoraRouter;
;


/* ===== js/services/router/resolver.js ===== */


;
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

window.RouteResolver = RouteResolver;
;
