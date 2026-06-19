/*
 Pharmora Data Engine
 Universal Entity Factory
*/


const PharmoraEntity = (()=>{



function create(
data={},
options={}
){



let type =

data.type

||

"entity";





let reference =

PharmoraReference.create(
type
);





let entity = {



// identities

id:

PharmoraUUID.create(),


...reference,




// classification


type,


subtype:

data.subtype || null,




// basic content


title:

data.title || "",


description:

data.description || "",






// relationships


relations:

data.relations || [],


tags:

data.tags || [],


categories:

data.categories || [],






// ownership


ownership:

PharmoraOwnership.create(

options.user || null

),






// lifecycle


lifecycle:

PharmoraLifecycle.create(),






// trust / reputation


trust:{


score:0,


rating:{

average:0,

count:0

},


verified:false


},







// analytics


analytics:{


views:0,


downloads:0,


likes:0,


shares:0


},






// permissions


access:{


visibility:

data.visibility

||

"public",


roles:[]

},






// SEO placeholder


seo:{


slug:null,


title:

data.title || null,


description:

data.description || null


},






// metadata


metadata:

PharmoraMetadata.create(

options.user || null

),






// original custom data


data:{


...data


}



};






/*
 apply SEO engine if loaded
*/


if(
typeof PharmoraSlug !== "undefined"
){


entity =

PharmoraSlug.apply(
entity
);


}





return entity;



}









return {

create

};



})();