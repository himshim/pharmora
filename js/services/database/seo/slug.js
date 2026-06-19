/*
 Pharmora SEO
 Slug Generator
*/


const PharmoraSlug = (()=>{





function create(text=""){



return text

.toString()

.toLowerCase()

.trim()


.replace(

/[^a-z0-9]+/g,

"-"

)


.replace(

/^-+|-+$/g,

""

);



}










function apply(entity){



let slug =
entity.seo?.slug

||

create(

entity.title ||

entity.refId

);





return {


...entity,


seo:{


...(entity.seo||{}),


slug


}


};



}









return {

create,

apply

};



})();