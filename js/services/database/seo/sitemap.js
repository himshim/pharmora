/*
 Pharmora SEO
 Sitemap Builder
*/


const PharmoraSitemap = (()=>{





function url(entity){



let slug =

entity.seo?.slug

||

entity.refId;



return "/" +

entity.type +

"/"

+

slug;



}








function generate(items=[]){



return items.map(

item=>({

url:url(item),

updated:

item.metadata?.updatedAt

})

);



}









return {

generate

};



})();